const { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

const updateProductRating = async (productId) => {
  const snap = await db.collection('reviews').where('productId', '==', productId).get();
  const count = snap.size;
  const avg = count === 0 ? 0 : Number((snap.docs.reduce((acc, d) => acc + d.data().rating, 0) / count).toFixed(1));
  await db.collection('products').doc(productId).set({
    avgRating: avg,
    reviewCount: count,
    lastReviewAt: FieldValue.serverTimestamp(),
  }, { merge: true });
};

exports.onReviewCreated = onDocumentCreated("reviews/{reviewId}", async (event) => {
  await updateProductRating(event.data().productId);
});
exports.onReviewDeleted = onDocumentDeleted("reviews/{reviewId}", async (event) => {
  await updateProductRating(event.data().productId);
});
exports.onReviewUpdated = onDocumentUpdated("reviews/{reviewId}", async (event) => {
  if (event.data.before.data().rating !== event.data.after.data().rating) {
    await updateProductRating(event.data.after.data().productId);
  }
});