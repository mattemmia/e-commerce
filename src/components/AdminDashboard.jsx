import React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, CurrencyDollarIcon, ClockIcon, CheckCircleIcon, ShoppingBagIcon, CubeIcon } from '@heroicons/react/24/outline';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="rounded-2xl border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</p>
      </div>
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    new: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status] || styles.new}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ADDED

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    try { await updateDoc(doc(db, 'orders', orderId), { status: newStatus }); }
    catch (err) { alert('Error updating: ' + err.message); }
  };

  const totalSales = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.price || 0), 0);
  const stats = {
    total: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 mx-auto"></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> {/* FIXED: added flex */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage orders and track sales</p>
        </div>

        {/* BUTTONS GROUP */}
        <div className="flex gap-3">
          {/* Inventory Button - NEW */}
          <button
            onClick={() => navigate('/admin/stock')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/10 transition hover:bg-indigo-700"
          >
            <CubeIcon className="h-5 w-5" /> Inventory
          </button>

          {/* Add Product Button */}
          <Link
            to="/admin/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <PlusIcon className="h-5 w-5" /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"> {/* FIXED: added grid */}
        <StatCard icon={ShoppingBagIcon} label="Total Orders" value={stats.total} color="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" />
        <StatCard icon={ClockIcon} label="New Orders" value={stats.new} color="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300" />
        <StatCard icon={CheckCircleIcon} label="Delivered" value={stats.delivered} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300" />
        <StatCard icon={CurrencyDollarIcon} label="Total Sales" value={`₦${totalSales.toLocaleString()}`} color="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300" />
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">All Orders</h2>
        </div>

        {orders.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
            <ShoppingBagIcon className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p>No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Phone</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {orders.map(order => (
                  <tr key={order.id} className="transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{order.createdAt?.toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{order.productName}</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{order.customerName}</td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{order.customerPhone}</td>
                    <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">₦{order.price?.toLocaleString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="rounded-lg border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                                   dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <option value="new">New</option>
                        <option value="processing">Processing</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}