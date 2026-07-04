
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';


export default function AdminUpload() {
  const categories = {
    'Snacks': ['Biscuits', 'Chips', 'Nuts', 'Chocolates', 'Candy'],
    'Drinks': ['Soft Drinks', 'Water', 'Juice', 'Energy Drinks'],
    'Cereals': ['Cornflakes', 'Oats', 'Granola'],
    'Household': ['Soap', 'Detergent', 'Tissue'],
    'Baby Items': ['Diapers', 'Baby Food', 'Wipes']
  };

const [product, setProduct] = useState({
    name: '', price: '', category: 'Snacks', subcategory: '', unit: 'pack', stock: 1, description: '', image: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!product.image || !product.name || !product.price) {
      return alert('Please add image URL, name and price');
    }

    setUploading(true);
    try {
      // Auto status based on stock
      const stockNum = Number(product.stock);
      const status = stockNum > 0 ? 'In Stock' : 'Out of Stock';

      // Save to Firestore - no Storage upload
      await addDoc(collection(db, 'products'), {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        unit: product.unit,
        stock: stockNum,
        status: status,
        image: product.image, // <-- Direct URL
        orderCount: 0,
        createdAt: new Date()
      });

      alert('✅ Product saved successfully!');
      setProduct({ name: '', price: '', category: 'Snacks', subcategory: '', unit: 'pack', stock: 1, description: '', image: '' });
    } catch (err) {
      console.error('Save error:', err);
      alert('Save failed: ' + err.message);
    }
    setUploading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Add New Product - URL Test Mode</h2>
        <p style={styles.subtitle}>Paste image URL from Google/imgur/cloudinary</p>

        {/* Image URL instead of upload */}
        <input
          placeholder="Image URL - right click image > Copy image address"
          value={product.image}
          onChange={e => setProduct({ ...product, image: e.target.value })}
          style={styles.input}
        />

        {product.image && (
          <img src={product.image} alt="preview" style={styles.preview} onError={(e) => e.target.style.display = 'none'} />
        )}

        <input
          placeholder="Product Name"
          value={product.name}
          onChange={e => setProduct({ ...product, name: e.target.value })}
          style={styles.input}
        />

        <div style={styles.row}>
          <input
            type="number"
            placeholder="Price ₦"
            value={product.price}
            onChange={e => setProduct({ ...product, price: e.target.value })}
            style={{ ...styles.input, flex: 1 }}
          />
          <input
            type="number"
            placeholder="Stock Qty"
            value={product.stock}
            onChange={e => setProduct({ ...product, stock: e.target.value })}
            style={{ ...styles.input, flex: 1 }}
          />
        </div>

        <select
          value={product.category}
          onChange={e => setProduct({ ...product, category: e.target.value, subcategory: '' })}
          style={styles.input}
        >
          {Object.keys(categories).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={product.subcategory}
          onChange={e => setProduct({ ...product, subcategory: e.target.value })}
          style={styles.input}
        >
          <option value="">Select Subcategory</option>
          {categories[product.category].map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <input
          placeholder="Unit e.g pack, bottle, 50g"
          value={product.unit}
          onChange={e => setProduct({ ...product, unit: e.target.value })}
          style={styles.input}
        />

        <textarea
          placeholder="Description"
          value={product.description}
          onChange={e => setProduct({ ...product, description: e.target.value })}
          style={styles.textarea}
        />

        <button onClick={handleUpload} disabled={uploading} style={styles.button}>
          {uploading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '550px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '5px'
  },
  subtitle: {
    margin: 0,
    color: '#666',
    marginBottom: '25px',
    fontSize: '14px'
  },
  preview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '12px',
    border: '2px solid #667eea',
    marginBottom: '15px'
  },
  input: {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    gap: '12px'
  },
  textarea: {
    width: '100%',
    padding: '14px',
    marginBottom: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    minHeight: '100px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600'
  }
};