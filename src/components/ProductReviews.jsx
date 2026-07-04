import { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Star, Loader2, MessageSquareOff } from 'lucide-react';

export default function ProductReviews({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('loading'); // 'loading' | 'idle' | 'submitting'
  const [hasReviewed, setHasReviewed] = useState(false);

  // 1. Check if user already reviewed = prevent spam
  useEffect(() => {
    if (!user ||!productId) return;
    const checkReview = async () => {
      const reviewId = `${user.uid}_${productId}`; // compound doc id
      const snap = await getDoc(doc(db, 'reviews', reviewId));
      setHasReviewed(snap.exists());
    };
    checkReview();
  }, [user, productId]);

  // 2. Fetch reviews
  useEffect(() => {
    if (!productId) return setStatus('idle');

    const fetchReviews = async () => {
      setStatus('loading');
      try {
        // NOTE: This query needs a composite index: reviews: productId Asc, createdAt Desc
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id,...doc.data() }));
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setStatus('idle');
      }
    };
    fetchReviews();
  }, [productId]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setStatus('error');
    if (!comment.trim() || comment.trim().length < 10) return alert('Comment must be 10+ characters');
    if (hasReviewed) return alert('You already reviewed this product');

    setStatus('submitting');
    const reviewId = `${user.uid}_${productId}`; // 3. Idempotent: 1 review per user per product
    const newReview = {
      productId,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      rating,
      comment: comment.trim(),
      createdAt: serverTimestamp()
    };

    try {
      // Use setDoc with compound ID instead of addDoc
      await addDoc(doc(db, 'reviews', reviewId), newReview);

      // 4. Optimistic UI: No reload
      setReviews(prev => [{ id: reviewId,...newReview, createdAt: new Date() },...prev]);
      setComment('');
      setRating(5);
      setHasReviewed(true);
      setStatus('idle');
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review');
      setStatus('idle');
    }
  };

  const Stars = ({ count, size = 16 }) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={size} className={i < count? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </div>
  );

  const inputBase = "w-full p-3 rounded-lg border-2 bg-white text-black focus:outline-none focus:ring-4 focus:border-brand-green focus:ring-green-100";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-2xl font-bold text-black">Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Stars count={Math.round(avgRating)} />
            <span className="font-semibold">{avgRating} / 5 ({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {user &&!hasReviewed && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border space-y-3">
          <h4 className="font-semibold">Add Your Review</h4>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Rating:</span>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className={inputBase + ' w-auto'}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n>1?'s':''}</option>)}
            </select>
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="What did you like or dislike?" className={inputBase + ' min-h-24'} required minLength={10} />
          <button type="submit" disabled={status === 'submitting'} className="px-6 py-2.5 bg-brand-green text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-2">
            {status === 'submitting'? <Loader2 className="animate-spin" size={18} /> : null}
            {status === 'submitting'? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
      {user && hasReviewed && <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">✅ You already reviewed this product</p>}
      {!user && <p className="text-sm text-gray-500">Login to add a review</p>}

      {/* Reviews List */}
      {status === 'loading'? <p>Loading reviews...</p> : reviews.length === 0? (
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
                <Stars count={r.rating} />
              </div>
              <p className="text-gray-700">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}