import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { ArrowPathIcon, CheckCircleIcon, TruckIcon, InboxIcon } from '@heroicons/react/24/outline';

const STATUS_FLOW = {
  new: { label: 'New', color: 'amber', next: 'processing' },
  processing: { label: 'Processing', color: 'blue', next: 'delivered' },
  delivered: { label: 'Delivered', color: 'emerald', next: null }
};

const StatusPill = ({ status }) => {
  const key = status?.toLowerCase(); // fix case issue
  const c = STATUS_FLOW[key]?.color || 'zinc';
  
  // FIX: Tailwind can't do bg-${c}-100. Use full classes
  const colors = {
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    zinc: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-500/20 dark:text-zinc-300'
  };
  
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${colors[c]}`}>
      {STATUS_FLOW[key]?.label || status}
    </span>
  );
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const q = query(collection(db, 'orders'), where('createdAt', '>=', todayTimestamp));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ 
        id: d.id, 
        status: d.data().status || 'new', 
       ...d.data() 
      }));

      setOrders(data);
      // FIX: sum "total" not "price"
      setTodayTotal(data.reduce((sum, o) => sum + (o.total || 0), 0));
    } catch (err) { console.log('Error fetching orders:', err); }
    setLoading(false);
  };

  const updateStatus = async (id, next) => {
    await updateDoc(doc(db, 'orders', id), { status: next });
    fetchOrders();
  };

  const filters = ['all', 'new', 'processing', 'delivered'];

  if (loading) return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-zinc-400" />
    </div>
  );

  const filtered = filter === 'all'? orders : orders.filter(o => o.status?.toLowerCase() === filter);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats - FIX: added grid */}
      <div className="mb-8 grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Today's Sales</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">₦{todayTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders Today</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">{orders.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex-wrap gap-2">
        {filters.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition
              ${filter === s
               ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0? (
          <div className="rounded-2xl border-zinc-200 bg-white py-20 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <InboxIcon className="mx-auto mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="font-semibold text-zinc-600 dark:text-zinc-300">No orders for this filter</p>
          </div>
        ) : filtered.map(order => (
          <div key={order.id} className="rounded-2xl border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {/* FIX: Show first item name + count */}
                  <h3 className="font-bold text-zinc-900 dark:text-white">
                    {order.items?.[0]?.name} {order.items?.length > 1 && `+ ${order.items.length - 1} more`}
                  </h3>
                  <StatusPill status={order.status} />
                </div>
                {/* FIX: use "total" */}
                <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400">₦{order.total?.toLocaleString()}</p>
                <div className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  <p><span className="font-medium">Customer:</span> {order.shipping?.name || order.email}</p>
                  <p><span className="font-medium">Location:</span> {order.shipping?.address}</p>
                </div>
              </div>

              {STATUS_FLOW[order.status?.toLowerCase()]?.next && (
                <button onClick={() => updateStatus(order.id, STATUS_FLOW[order.status.toLowerCase()].next)}
                  className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:self-auto">
                  {order.status.toLowerCase() === 'new'? <InboxIcon className="h-4 w-4" /> : <TruckIcon className="h-4 w-4" />}
                  Mark as {STATUS_FLOW[order.status.toLowerCase()].next}
                </button>
              )}
              {order.status?.toLowerCase() === 'delivered' && (
                <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 sm:self-auto">
                  <CheckCircleIcon className="h-4 w-4" /> Done
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}