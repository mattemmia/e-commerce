const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // download from Firebase > Project settings > Service accounts

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
  const products = await db.collection('products').get();
  for (const p of products.docs) {
    const reviews = await db.collection('reviews').where('productId', '==', p.id).get();
    const count = reviews.size;
    const avg = count === 0 ? 0 : Number((reviews.docs.reduce((a, d) => a + d.data().rating, 0) / count).toFixed(1));
    await p.ref.set({ avgRating: avg, reviewCount: count }, { merge: true });
    console.log(p.id, '->', avg, count);
  }
  console.log('Done');
  process.exit();
})();