import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

export const onReviewCreated = onDocumentCreated("reviews/{reviewId}", async (event) => {
  const reviewData = event.data().data();
  console.log("1. NEW REVIEW:", reviewData);

  const productId = reviewData.productId; // <-- we are using productId
  console.log("2. PRODUCT ID FROM REVIEW:", productId);

  if (!productId) {
    console.log("ERROR: productId is missing in review!");
    return;
  }

  const productRef = db.collection('products').doc(productId);
  const productSnap = await productRef.get();
  console.log("3. DOES PRODUCT EXIST?", productSnap.exists); // <-- important

  if (!productSnap.exists) {
    console.log("ERROR: Product doc not found with ID:", productId);
    return;
  }

  const reviewsSnap = await db.collection('reviews').where('productId', '==', productId).get();
  const count = reviewsSnap.size;
  const avg = count === 0 ? 0 : reviewsSnap.docs.reduce((acc, d) => acc + d.data().rating, 0) / count;

  console.log("4. CALCULATED:", avg, count);

  try {
    await productRef.update({
      avgRating: Number(avg.toFixed(1)),
      reviewCount: count
    });
    console.log(`5. SUCCESS: Updated ${productId}`);
  } catch (error) {
    console.log("5. ERROR UPDATING PRODUCT:", error.message); // <-- permission error shows here
  }
});