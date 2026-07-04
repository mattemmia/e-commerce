import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useEffect, useState } from 'react';

export function useProductRating(productId) {
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!productId) return;
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const unsub = onSnapshot(q, (snap) => {
      const reviews = snap.docs.map(d => d.data());
      const total = reviews.length;
      setCount(reviews.length);
      if (total === 0) {
        setAvg(0);
        setCount(0);
      } else {
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        setAvg((sum / total).toFixed(1));
      }
    });
    return unsub;
  }, [productId]);

  return { avg, count };
}