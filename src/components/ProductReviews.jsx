import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { Loader2, MessageSquareOff } from 'lucide-react';
import StarRating from '../components/Rating';

export default function ProductReviews({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [productData, setProductData] = useState({ avgRating: 0, reviewCount: 0 }); // <-- NEW: listen to product
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('loading');
  const [hasReviewed, setHasReviewed] = useState(false);

  // 1. Check if user already reviewed
  useEffect(() => {
    if (!user || !productId) return;
    const checkReview = async () => {
      const reviewId = `${user.uid}_${productId}`;
      const snap = await getDoc(doc(db, 'reviews', reviewId));
      setHasReviewed(snap.exists());
    };
    checkReview();
  }, [user, productId]);

  // 2. Fetch reviews IN REALTIME
  useEffect(() => {
    if (!productId) return setStatus('idle');
    setStatus('loading');

    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(data);
      setStatus('idle');
    }, (error) => {
      console.error('Error listening to reviews:', error);
      setStatus('idle');
    });

    return () => unsub();
  }, [productId]);

  // 3. NEW: Listen to product doc for REAL avgRating from Cloud Function
  useEffect(() => {
    if (!productId) return;
    const unsubProduct = onSnapshot(doc(db, 'products', productId), (snap) => {
      if (snap.exists()) {
        setProductData(snap.data());
      }
    });
    return () => unsubProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setStatus('error');
    if (!comment.trim() || comment.trim().length < 10) return alert('Comment must be 10+ characters');
    if (hasReviewed) return alert('You already reviewed this product');

    setStatus('submitting');
    const reviewId = `${user.uid}_${productId}`;
    const newReview = {
      productId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userPhoto: user.photoURL || null,
      rating,
      comment: comment.trim(),
      createdAt: serverTimestamp()
    };

    try {
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      // Cloud Function will now fire and update products doc automatically
      setComment('');
      setRating(5);
      setHasReviewed(true);
      setStatus('idle');
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review: ' + error.message);
      setStatus('idle');
    }
  };

  const inputBase = "w-full p-3 rounded-lg border-2 bg-white text-black focus:outline-none focus:ring-4 focus:border-brand-green focus:ring-green-100";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold text-black">Reviews</h3>
        {productData.reviewCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <StarRating rating={Number(productData.avgRating)} readOnly size={18} />
            <span className="font-semibold">{productData.avgRating?.toFixed(1) || 0} / 5 ({productData.reviewCount})</span>
          </div>
        )}
      </div>

      {user && !hasReviewed && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border space-y-3">
          <h4 className="font-semibold">Add Your Review</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rating:</span>
            <StarRating rating={rating} setRating={setRating} size={24} />
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="What did you like or dislike?" className={inputBase + ' min-h-24'} required minLength={10} />
          <button type="submit" disabled={status === 'submitting'} className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-2">
            {status === 'submitting' ? <Loader2 className="animate-spin" size={18} /> : null}
            {status === 'submitting' ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
      {user && hasReviewed && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">✅ You already reviewed this product</p>}
      {!user && <p className="text-sm text-gray-500">Login to add a review</p>}

      {status === 'loading' ? <p>Loading reviews...</p> : reviews.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-xl">
          <MessageSquareOff size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white p-4 rounded-xl border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <strong className="text-black">{r.userName}</strong>
                  <p className="text-xs text-gray-400">{r.createdAt?.toDate?.().toLocaleDateString() || 'Just now'}</p>
                </div>
                <StarRating rating={r.rating} readOnly size={16} />
              </div>
              <p className="text-gray-700">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}