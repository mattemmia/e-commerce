import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export default function ProductReviews({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // REMOVED orderBy - this was causing the hang
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId)
        );

        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Sort manually instead of orderBy
        const sorted = data.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setReviews(Array.isArray(sorted) ? sorted : []);
      } catch (err) {
        console.error('Reviews error:', err);
        setReviews([]);
      } finally {
        setLoading(false); // <-- always stops loading
      }
    };

    if (productId) fetchReviews();
  }, [productId]);

  const submitReview = async () => {
    if (!user) return alert('Login to review');
    if (!text.trim()) return alert('Write a review');

    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: user.uid,
        userName: user.displayName || 'User',
        rating,
        text,
        createdAt: new Date()
      });
      setText('');
      alert('Review posted!');
      window.location.reload();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  if (loading) return <p style={{ padding: '20px', color: '#666' }}>Loading reviews...</p>;

  return (
    <div>
      {/* Review form */}
      {user && (
        <div style={{ marginBottom: 20, padding: 15, background: '#f8f9fa', borderRadius: 10 }}>
          <h4 style={{ marginTop: 0 }}>Add Review</h4>
          <select
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            style={{ marginBottom: 10, padding: '8px', borderRadius: 6 }}
          >
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
          </select>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write review..."
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', boxSizing: 'border-box' }}
            rows={3}
          />
          <button
            onClick={submitReview}
            style={{ marginTop: 10, padding: '10px 20px', background: '#25D366', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: '600' }}
          >
            Submit
          </button>
        </div>
      )}

      {/* Reviews list - crash proof */}
      {!Array.isArray(reviews) || reviews.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No reviews yet. Be the first!</p>
      ) : (
        reviews.map(r => (
          <div key={r.id} style={{ borderBottom: '1px solid #eee', padding: '12px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <b>{r.userName || 'Anonymous'}</b>
              <span>{'⭐'.repeat(r.rating || 5)}</span>
            </div>
            <p style={{ margin: '5px 0 0 0', color: '#555', lineHeight: '1.5' }}>{r.text}</p>
          </div>
        ))
      )}
    </div>
  );
}