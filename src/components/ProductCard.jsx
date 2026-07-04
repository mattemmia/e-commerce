import { useState } from 'react';
import { useCart } from './CartContext';
import { db } from '../firebase';
import { addDoc, collection, updateDoc, doc, increment } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useProductRating } from '../hooks/useProductRating';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

export default function ProductCard({ product }) {
  const { avg, count } = useProductRating(product.id);
  const { addToCart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);

  const isOutOfStock = product.status === 'Out of Stock';
  const rating = Math.round(Number(avg) || 0);

  const handleOrder = async () => {
    if (!customer.name || !customer.phone || !customer.location) {
      return alert('Please fill Name, Phone & Location');
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        productId: product.id,
        productName: product.name,
        price: product.price,
        unit: product.unit,
        customerName: customer.name,
        customerPhone: customer.phone,
        location: customer.location,
        status: 'new',
        createdAt: new Date()
      });

      await updateDoc(doc(db, 'products', product.id), {
        orderCount: increment(1)
      });

      const sisterNumber = '2347069573953';
      const msg = `New Order!%0A%0AProduct: ${product.name} - ₦${product.price}/${product.unit}%0AName: ${customer.name}%0APhone: ${customer.phone}%0ALocation: ${customer.location}`;
      window.open(`https://wa.me/${sisterNumber}?text=${encodeURIComponent(msg)}`, '_blank');

      alert('Order sent! I will contact you on WhatsApp');
      setShowModal(false);
      setCustomer({ name: '', phone: '', location: '' });
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <>
      {/* CARD */}
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl
                      bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800
                      shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                      transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]">

        {/* IMAGE + LINK */}
        <Link to={`/product/${product.id}`} className="block overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="line-clamp-2 min-h-[44px] text-base font-semibold leading-snug text-zinc-900 dark:text-white">
              {product.name}
            </h3>
          </Link>

          {product.subcategory && (
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {product.subcategory}
            </p>
          )}

          <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            ₦{product.price.toLocaleString()}<span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">/{product.unit}</span>
          </p>

          {/* RATING */}
          <div className="mt-3 flex items-center gap-2">
            {count > 0 ? (
              <>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) =>
                    i < rating ?
                      <StarIcon key={i} className="h-4 w-4 text-yellow-400" /> :
                      <StarOutline key={i} className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
                  )}
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {Number(avg).toFixed(1)} ({count})
                </span>
              </>
            ) : (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">No reviews yet</span>
            )}
          </div>

          {/* STOCK */}
          {isOutOfStock && (
            <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">Out of Stock</p>
          )}

          {/* BUTTONS */}
          <div className="mt-auto flex-col gap-2 pt-4">
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
                         bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]
                         dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200
                         disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:text-zinc-500"
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>

            <button
              onClick={() => setShowModal(true)}
              disabled={isOutOfStock}
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all
                         bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20
                         hover:from-emerald-600 hover:to-green-700 hover:shadow-emerald-500/30 active:scale-[0.98]
                         disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:shadow-none"
            >
              {isOutOfStock ? 'Sold Out' : 'Order on WhatsApp'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border-zinc-200 dark:border-zinc-800">
            <h3 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">Order {product.name}</h3>

            <div className="space-y-3">
              <input
                placeholder="Your Full Name"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm
                           text-zinc-900 dark:text-white placeholder:text-zinc-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Phone Number"
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm
                           text-zinc-900 dark:text-white placeholder:text-zinc-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Delivery Location - Area, Street"
                value={customer.location}
                onChange={e => setCustomer({ ...customer, location: e.target.value })}
                className="w-full rounded-xl border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm
                           text-zinc-900 dark:text-white placeholder:text-zinc-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleOrder}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 text-sm font-semibold text-white
                         shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-green-700
                         disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Order'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="mt-2 w-full rounded-xl border-zinc-300 dark:border-zinc-700 py-3 text-sm font-medium
                         text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}