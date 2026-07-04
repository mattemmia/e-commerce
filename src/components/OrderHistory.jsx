import { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Package, Loader2, Frown } from 'lucide-react';

const formatPhone = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`; // 0803 -> +234803
  if (digits.startsWith('234')) return `+${digits}`; // 234803 -> +234803
  if (digits.startsWith('+234')) return digits;
  return `+234${digits}`; // fallback
};

export default function OrderHistory() {
  const { user } = useAuth(); // 1. SECURE: Only logged-in users
  const [phoneInput, setPhoneInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' }); // 'loading' | 'error' | 'success'

  const fetchOrders = async (e) => {
    e.preventDefault();
    if (!user) return setStatus({ type: 'error', message: 'Login required to view orders' });

    const phone = formatPhone(phoneInput);
    if (phone.length < 13) return setStatus({ type: 'error', message: 'Enter a valid 11-digit number' });

    setStatus({ type: 'loading', message: '' });
    setOrders([]);

    try {
      // 2. FIX: Add limit. If you need orderBy, create composite index in Firebase console link from error
      const q = query(
        collection(db, 'orders'),
        where('customerPhone', '==', phone),
        where('userId', '==', user.uid), // 3. SECURITY: Scope to logged-in user
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      setOrders(orderList);
      setStatus({ type: 'success', message: '' });
    } catch (err) {
      console.error(err);
      if (err.code === 'failed-precondition') {
        setStatus({ type: 'error', message: 'Creating Firestore index... try again in 2 mins' });
      } else {
        setStatus({ type: 'error', message: 'Failed to load orders' });
      }
    }
  };

  const StatusBadge = ({ status }) => {
    const map = {
      delivered: 'bg-green-100 text-green-800',
      new: 'bg-amber-100 text-amber-800',
      cancelled: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${map[status] || 'bg-gray-200 text-gray-700'}`}>{status}</span>;
  };

  const inputBase = "w-full p-3.5 rounded-xl border-2 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-4 focus:border-brand-green focus:ring-green-100";

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-gray-500 hover:text-black mb-4 inline-block">← Back to Shop</Link>
        <h1 className="text-3xl font-bold text-black mb-6">My Order History</h1>

        <form onSubmit={fetchOrders} className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="tel"
            placeholder="0803 123 4567"
            value={phoneInput}
            onChange={e => setPhoneInput(e.target.value)}
            className={inputBase}
            required
          />
          <button type="submit" disabled={status.type === 'loading'} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-green text-white font-bold rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
            {status.type === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
            {status.type === 'loading' ? 'Loading...' : 'View Orders'}
          </button>
        </form>

        {status.type === 'error' && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-5 text-sm">{status.message}</div>}

        {/* Empty State */}
        {status.type === 'success' && orders.length === 0 && (
          <div className="text-center p-12 bg-white rounded-2xl border">
            <Frown size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No orders found for {formatPhone(phoneInput)} 😕</p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="font-bold text-lg text-black">{order.productName}</h3>
                <StatusBadge status={order.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <p><strong>Price:</strong> ₦{Number(order.price).toLocaleString()}/{order.unit}</p>
                <p><strong>Qty:</strong> {order.qty || 1}</p>
                <p className="col-span-2"><strong>Date:</strong> {order.createdAt?.toLocaleString()}</p>
                <p className="col-span-2"><strong>Delivery:</strong> {order.location}</p>
              </div>
            </div>
          ))}
        </div>

        {orders.length > 0 && <p className="text-center mt-6 text-gray-500 text-sm">Showing {orders.length} order{orders.length !== 1 ? 's' : ''}</p>}
      </div>
    </div>
  );
}