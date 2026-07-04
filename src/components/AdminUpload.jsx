import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UploadCloud, X, Loader2, CheckCircle2 } from 'lucide-react'; // lucide-react is already in your package.json

const CLOUDINARY_CLOUD_NAME = 'djicibnia';
const CLOUDINARY_UPLOAD_PRESET = 'my_image';

const CATEGORIES = {
  Snacks: ['Biscuits', 'Chips', 'Nuts', 'Chocolates', 'Candy'],
  Milks: ['Milk', 'Yogurt', 'Milo'],
  Sweets: ['Candies', 'Cookies', 'Cakes'],
  Household: ['Soap', 'Detergent', 'Tissue'],
};

const INITIAL_PRODUCT = {
  name: '', price: '', category: 'Snacks', subcategory: '', unit: 'pack', stock: 1, description: ''
};

export default function AdminUpload() {
  const [product, setProduct] = useState(INITIAL_PRODUCT);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' }); // 'loading' | 'success' | 'error'
  const [errors, setErrors] = useState({});

  // Cleanup object URL to prevent memory leaks = Senior Dev detail
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      return setStatus({ type: 'error', message: 'Image must be < 5MB' });
    }
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({...prev, image: '' }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setErrors(prev => ({...prev, image: 'Image is required' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Product name is required';
    if (!product.price || Number(product.price) <= 0) newErrors.price = 'Valid price required';
    if (!imageFile) newErrors.image = 'Image is required';
    if (!product.subcategory) newErrors.subcategory = 'Subcategory required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'products');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) throw new Error('Cloudinary upload failed');
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus({ type: 'loading', message: 'Uploading...' });
    try {
      const imageUrl = await uploadImage(imageFile);
      const stockNum = Number(product.stock);

      await addDoc(collection(db, 'products'), {
       ...product,
        price: Number(product.price),
        stock: stockNum,
        status: stockNum > 0? 'In Stock' : 'Out of Stock',
        image: imageUrl,
        avgRating: 0,
        reviewCount: 0,
        orderCount: 0,
        createdAt: serverTimestamp(), // Use Firestore timestamp, not new Date()
      });

      setStatus({ type: 'success', message: '✅ Product saved successfully!' });
      setProduct(INITIAL_PRODUCT);
      removeImage();
    } catch (err) {
      console.error('Save error:', err);
      setStatus({ type: 'error', message: `Save failed: ${err.message}` });
    }
  };

  const inputBase = "w-full p-3 rounded-xl border-2 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green transition";
  const errorInput = "border-red-500 focus:ring-red-500";
  const labelBase = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-start justify-center p-6 md:p-10">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 space-y-4">

        <div>
          <h2 className="text-3xl font-bold text-black">Add New Product</h2>
          <p className="text-gray-500 text-sm">Fill details and upload to Cloudinary</p>
        </div>

        {/* Status Banner */}
        {status.type && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            status.type === 'success'? 'bg-green-100 text-green-800' :
            status.type === 'error'? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status.message}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className={labelBase}>Product Image *</label>
          {!imagePreview? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-green bg-gray-50 hover:bg-gray-100 transition">
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-gray-500 text-sm">Click to upload or drag</span>
              <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          ) : (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full h-56 object-cover rounded-xl border-2 border-brand-green" />
              <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                <X size={16} />
              </button>
            </div>
          )}
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
        </div>

        {/* Name */}
        <div>
          <label className={labelBase}>Product Name *</label>
          <input
            value={product.name}
            onChange={e => setProduct({...product, name: e.target.value })}
            className={`${inputBase} ${errors.name? errorInput : 'border-gray-200'}`}
            placeholder="e.g. Indomie Chicken"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Price ₦ *</label>
            <input type="number" value={product.price} onChange={e => setProduct({...product, price: e.target.value })} className={`${inputBase} ${errors.price? errorInput : 'border-gray-200'}`} placeholder="500" />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className={labelBase}>Stock Qty</label>
            <input type="number" value={product.stock} onChange={e => setProduct({...product, stock: e.target.value })} className={`${inputBase} border-gray-200`} placeholder="10" />
          </div>
        </div>

        {/* Category + Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelBase}>Category</label>
            <select value={product.category} onChange={e => setProduct({...product, category: e.target.value, subcategory: '' })} className={`${inputBase} border-gray-200`}>
              {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className={labelBase}>Subcategory *</label>
            <select value={product.subcategory} onChange={e => setProduct({...product, subcategory: e.target.value })} className={`${inputBase} ${errors.subcategory? errorInput : 'border-gray-200'}`}>
              <option value="">Select Subcategory</option>
              {CATEGORIES[product.category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            {errors.subcategory && <p className="text-red-500 text-xs mt-1">{errors.subcategory}</p>}
          </div>
        </div>

        <div>
          <label className={labelBase}>Unit</label>
          <input value={product.unit} onChange={e => setProduct({...product, unit: e.target.value })} className={`${inputBase} border-gray-200`} placeholder="pack, bottle, 50g" />
        </div>

        <div>
          <label className={labelBase}>Description</label>
          <textarea value={product.description} onChange={e => setProduct({...product, description: e.target.value })} className={`${inputBase} border-gray-200 min-h-24 resize-y`} placeholder="Product details..." />
        </div>

        <button type="submit" disabled={status.type === 'loading'} className="w-full flex items-center justify-center gap-2 p-4 bg-brand-green text-white font-bold rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition">
          {status.type === 'loading'? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
          {status.type === 'loading'? 'Uploading...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}