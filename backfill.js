import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function backfillRatings() {
  console.log('Starting backfill...');
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products`);

  let updated = 0;
  for (const pDoc of productsSnap.docs) {
    const productId = pDoc.id;
    const productName = pDoc.data().name || 'No Name';
    const reviewsSnap = await db.collection('reviews').where('productId', '==', productId).get();

    const count = reviewsSnap.size;
    const avg = count === 0 ? 0 : reviewsSnap.docs.reduce((acc, d) => acc + d.data().rating, 0) / count;

    await pDoc.ref.update({
      avgRating: Number(avg.toFixed(1)),
      reviewCount: count
    });

    updated++;
    console.log(`[${updated}/${productsSnap.size}] Updated ${productName}: avg=${avg.toFixed(1)}, count=${count}`);
  }
  console.log('Backfill complete!');
  process.exit();
}

backfillRatings().catch(console.error);