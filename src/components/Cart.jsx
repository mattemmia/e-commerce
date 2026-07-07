import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from './CartContext';
import { ShoppingBagIcon, TrashIcon, PlusIcon, MinusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { db } from '../firebase'; // MAKE SURE PATH IS CORRECT
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, subtotal, itemCount } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const storeNumber = "2348001234567"; // CHANGE TO YOUR WHATSAPP NUMBER

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Cart is empty");
    setShowModal(true);
  };

  const sendToWhatsApp = async () => {
    if (!form.name || !form.phone || !form.address) {
      return alert("Please fill all fields");
    }
    setLoading(true);

    // THIS MATCHES YOUR ADMIN.JSX EXACTLY + PING
    const orderData = {
      customerName: form.name,
      customerPhone: form.phone,
      customerAddress: form.address,
      productName: cart.map(item => `${item.name} x${item.qty}`).join(', '),
      price: subtotal,
      items: cart,
      total: subtotal,
      status: 'processing',
      read: false, // NEW: for favicon notification
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      console.log("Order saved to Firebase with read:false");
    } catch (error) {
      console.error("Error saving order: ", error);
      setLoading(false);
      return alert("Failed to save order. Check firebase config");
    }

    // WHATSAPP MESSAGE
    let message = `*New Order - Singular Store* %0A%0A`;
    message += `*Customer Details:* %0A`;
    message += `*Name:* ${form.name} %0A`;
    message += `*Phone:* ${form.phone} %0A`;
    message += `*Address:* ${form.address} %0A%0A`;
    message += `*Order Items:* %0A${orderData.productName} %0A%0A`;
    message += `*Total:* ₦${subtotal.toLocaleString()} %0A%0A`;
    message += `Please confirm my order. Thank you!`;

    const url = `https://wa.me/${storeNumber}?text=${message}`;
    window.open(url, '_blank');

    clearCart();
    setShowModal(false);
    setForm({ name: '', phone: '', address: '' });
    setLoading(false);
    alert("Order sent! We will contact you on WhatsApp");
  };
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Shopping Cart ({itemCount})</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 rounded-2xl border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />

                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">₦{item.price?.toLocaleString()}</p>

                  {/* Qty Controls */}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="rounded-lg border-zinc-300 p-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="rounded-lg border-zinc-300 p-1 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-zinc-900 dark:text-white">₦{(item.price * item.qty).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item.id)} className="mt-2 text-red-500 hover:text-red-600">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="text-sm font-semibold text-red-500 hover:underline">
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 h-fit">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Delivery</span>
                <span className="font-semibold">₦0</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full rounded-xl bg-zinc-900 py-3 font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {/* WHATSAPP MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Complete Your Order</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Fill details to send order via WhatsApp</p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Your Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number e.g 08012345678"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border-zinc-300 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
                required
              />
              <textarea
                placeholder="Delivery Address - Area, Street, Landmark"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                rows="3"
                className="w-full rounded-xl border-zinc-300 bg-zinc-50 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800"
                required
              />
            </div>

            <button
              onClick={sendToWhatsApp}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-green-600 py-3 font-bold text-white shadow-lg shadow-green-500/30 hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Order to WhatsApp"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}