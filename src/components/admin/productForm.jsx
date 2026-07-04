import { useState } from 'react';
import { addDoc, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ProductForm({ onClose, product, refreshProducts }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || '',
    stock: product?.stock || '',
    category: product?.category || '',
    image: product?.image || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const status = Number(form.stock) > 0 ? 'In Stock' : 'Out of Stock';
    const data = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      status
    };

    if (product) {
      // FIX 1: Use merge so we don't delete avgRating, reviewCount
      await updateDoc(doc(db, 'products', product.id), data);
    } else {
      // FIX 2: Set default rating fields for new products
      await addDoc(collection(db, 'products'), {
        ...data,
        avgRating: 0,
        reviewCount: 0,
      });
    }
    refreshProducts();
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 20, borderRadius: 8, width: 400 }}>
        <h3>{product ? 'Edit' : 'Add'} Product</h3>
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ width: '100%', margin: '8px 0', padding: 8 }} />
        <input type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required style={{ width: '100%', margin: '8px 0', padding: 8 }} />
        <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required style={{ width: '100%', margin: '8px 0', padding: 8 }} />
        <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', margin: '8px 0', padding: 8 }} />
        <input placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ width: '100%', margin: '8px 0', padding: 8 }} />

        <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
          <button type="submit" style={{ flex: 1, padding: 10, background: 'blue', color: 'white', border: 'none' }}>Save</button>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 10 }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}