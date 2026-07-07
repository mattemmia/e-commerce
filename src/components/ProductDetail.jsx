import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, addDoc, collection } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { useState } from 'react';

// Reusable Star component
const StarRating = ({ rating = 0, readOnly = true, size = 20, onChange }) => {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-1">
      {stars.map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-transform ${!readOnly && 'hover:scale-125'}`}
        >
          {star <= (hover || rating) ?
            <StarIcon className={`text-yellow-400`} style={{ width: size, height: size }} /> :
            <StarOutline className="text-zinc-300 dark:text-zinc-600" style={{ width: size, height: size }} />
          }
        </button>
      ))}
    </div>
  );
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // V2: 1 read only. Live updates via onSnapshot under the hood
  const [product, loading] = useDocumentData(doc(db, 'products', id));

  // Form state only
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try { await signInWithPopup(auth, provider); }
    catch (err) { alert('Login failed: ' + err.message); }
  };

  const submitReview = async () => {
    if (!auth.currentUser) return alert('Please login to review');
    if (rating === 0) return alert('Please select star rating');

    const username = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous';

    // V2: Only write. Do NOT update product doc here. Cloud Function does it.
    await addDoc(collection(db, 'reviews'), {
      productId: id,
      userId: auth.currentUser.uid,
      userName: username,
      userPhoto: auth.currentUser.photoURL || null,
      rating,
      comment,
      createdAt: new Date()
    });

    setRating(0);
    setComment('');
    alert('✅ Review submitted! Stars will update in 1-2 secs.');
  };

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 mx-auto"></div>
    </div>
  );
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const avgRating = Number(product.avgRating || 0);
  const reviewCount = Number(product.reviewCount || 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold
                     bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
                     shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5
                     text-zinc-700 dark:text-zinc-200">
          <ArrowLeftIcon className="h-4 w-4" /> Back to Products
        </button>

        <div className="grid gap-10 lg:grid-cols-2 mb-12 rounded-3xl bg-white dark:bg-zinc-900 p-6 lg:p-10
                        shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="lg:sticky lg:top-24 self-start">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-square w-full rounded-2xl object-cover shadow-lg"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {product.name}
            </h1>

            {/* V2: Stars from product doc only. No reviews.length */}
            <div className="mt-4 flex items-center gap-3">
              <StarRating rating={avgRating} readOnly size={20} />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {avgRating > 0 ? `${avgRating.toFixed(1)} out of 5` : 'No ratings yet'}
              </span>
              {reviewCount > 0 && (
                <span className="text-sm text-zinc-400">• {reviewCount} review{reviewCount > 1 ? 's' : ''}</span>
              )}
            </div>

            <p className="mt-6 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              ₦{product.price.toLocaleString()}<span className="text-base font-medium text-zinc-500">/{product.unit}</span>
            </p>

            <p className="mt-6 text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
              {product.description}
            </p>

            {product.subcategory && (
              <span className="mt-4 inline-flex w-fit rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300">
                {product.subcategory}
              </span>
            )}

            <button className="mt-8 w-full lg:w-auto rounded-xl px-8 py-3.5 text-base font-semibold
                               bg-gradient-to-r from-emerald-500 to-green-600 text-white
                               shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
                               transition-all hover:-translate-y-0.5 active:scale-[0.98]">
              🛒 Add to Cart
            </button>
          </div>
        </div>

        {/* Reviews Section - Form Only, No List */}
        <div className="rounded-3xl bg-white dark:bg-zinc-900 p-6 lg:p-10
                        shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Rate this product</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Based on {reviewCount} customer rating{reviewCount !== 1 && 's'}
          </p>

          {auth.currentUser ? (
            <div className="mt-6 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6">
              <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                Posting as: <b>{auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]}</b>
              </p>

              <StarRating rating={rating} readOnly={false} size={36} onChange={setRating} />

              <textarea
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="mt-4 w-full min-h-28 rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm
                           text-zinc-900 dark:text-white placeholder:text-zinc-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <button
                onClick={submitReview}
                className="mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white
                           shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
                Submit Review
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 p-8 text-center">
              <p className="mb-4 text-zinc-600 dark:text-zinc-300">🔒 Login to write a review</p>
              <button
                onClick={loginWithGoogle}
                className="rounded-xl bg-[#4285F4] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#357ae8]">
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}