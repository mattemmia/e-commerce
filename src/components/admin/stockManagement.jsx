import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import AdminUpload from '../AdminUpload'; 
import StarRating from '../../components/Rating';
import { Plus, Trash2, Edit, Package } from 'lucide-react';

export default function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Real-time updates
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setProducts(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const deleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  if (loading) return <p className="p-6">Loading inventory...</p>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Package/> Stock Management</h2>
          <p className="text-sm text-gray-500">Add new products or delete existing ones</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-5 w-5" /> {showForm ? 'Close Form' : 'Add Product'}
        </button>
      </div>

      {/* REUSE YOUR UPLOAD COMPONENT HERE */}
      {showForm && (
        <div className="mb-6">
          <AdminUpload />
        </div>
      )}

      {/* PRODUCTS TABLE */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={p.image} className="h-12 w-12 rounded-lg object-cover"/>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} / {p.subcategory}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">₦{p.price?.toLocaleString()}</td>
                <td className="px-6 py-4 font-bold">{p.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StarRating rating={p.avgRating ?? 0} readOnly size={16} />
                  <span className="text-xs ml-1 text-gray-500">({p.reviewCount ?? 0})</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => deleteProduct(p.id)} 
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}