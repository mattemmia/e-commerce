import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminUpload from './components/AdminUpload';
import Homepage from './components/Homepage';
import Cart from './components/Cart';
import { CartProvider } from './components/CartContext';
import ProductDetail from './components/ProductDetail'
import OrderHistory from './components/OrderHistory';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ProtectRoute from './components/ProtectRout';
import StockManagement from './components/admin/stockManagement';
import ProductForm from './components/admin/productForm';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
          <Navbar />
          <main>
            <Routes>
              <Route path="/admin/stock" element={<StockManagement />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Homepage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<ProtectRoute><AdminDashboard /></ProtectRoute>} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/admin/upload" element={<ProtectRoute><AdminUpload /></ProtectRoute>} />
              <Route path="/admin/products" element={<ProtectRoute><ProductForm /></ProtectRoute>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </CartProvider>



  );
}
export default App;