import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ProductCard from './ProductCard';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { HomeIcon, ShoppingBagIcon, ClipboardDocumentCheckIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ProductSkeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-sm animate-pulse">
    <div className="aspect-square rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
    <div className="mt-4 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800"></div>
    <div className="mt-2 h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800"></div>
  </div>
);

export default function Homepage() {
  const { itemCount } = useCart();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcat, setSelectedSubcat] = useState('');
  const [openDropdown, setOpenDropdown] = useState('');
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const categories = {
    'All': [],
    'Snacks': ['Biscuits', 'Chips', 'Nuts', 'Chocolates', 'Candy'],
    'Milks': ['Milk', 'Yogurt', 'Milo'],
    'Sweets': ['Candies', 'Cookies', 'Cakes'],
    'Household': ['Soap', 'Detergent', 'Tissue'],
  };
  const categoryIcons = { 'All': '🔍', 'Snacks': '🍪', 'Milks': '🥛', 'Sweets': '🍬', 'Household': '🧽' };
  const subcatIcons = { 'Biscuits': '🍪', 'Chips': '🥔', 'Nuts': '🥜', 'Chocolates': '🍫', 'Candy': '🍬', 'Milk': '🥛', 'Yogurt': '🥄', 'Milo': '☕', 'Candies': '🍬', 'Cookies': '🍪', 'Cakes': '🎂', 'Soap': '🧼', 'Detergent': '🧴', 'Tissue': '🧻' };

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSubcat = !selectedSubcat || p.subcategory === selectedSubcat;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubcat && matchesSearch && p.inStock !== false;
  });

  const clearAllFilters = () => {
    setSearchTerm(''); setSelectedCategory('All'); setSelectedSubcat(''); setOpenDropdown('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

      {/* FIX 1: TOP BAR - flex instead of flex-col */}
      <div className="mb-8 flex items-center justify-between gap-4"> {/* justify-between pushes cart right */}
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Shop</h1>
        <div className="flex items-center gap-3"> {/* Cart + Orders stay right */}
          <Link to="/orders" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
            <span className="hidden sm:inline">My Orders</span> {/* Hide text on mobile */}
          </Link>
          <Link to="/cart" className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5">
            <ShoppingBagIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-600">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search - Centered */}
      <div className="relative mx-auto mb-6 max-w-xl">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search biscuits, drinks, cereals..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border-zinc-300 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400
                     shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                     dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      {/*  FILTERS - Added 'flex' so they go in a row */}
      <div ref={dropdownRef} className="mb-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
        {/* Added flex + items-center */}
        {Object.keys(categories).map(cat => (
          <div key={cat} className="relative">
            <button
              onClick={() => { setSelectedCategory(cat); setSelectedSubcat(''); setOpenDropdown(openDropdown === cat ? '' : cat); }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition
                          ${selectedCategory === cat
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'}`}
            >
              <span>{categoryIcons[cat]}</span> {cat} {categories[cat].length > 0 && <span className="text-xs">▼</span>}
            </button>

            {openDropdown === cat && categories[cat].length > 0 && (
              <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border-zinc-200 bg-white/80 p-1.5
                              shadow-2xl backdrop-blur-lg dark:border-zinc-700 dark:bg-zinc-900/80">
                {categories[cat].map(sub => (
                  <button
                    key={sub}
                    onClick={() => { setSelectedSubcat(sub); setOpenDropdown(''); }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition hover:bg-zinc-100
                               dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    {subcatIcons[sub]} {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Filters */}
      {(selectedSubcat || searchTerm || selectedCategory !== 'All') && (
        <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span>Showing:</span>
          {selectedCategory !== 'All' && <span className="font-semibold text-zinc-900 dark:text-white">{selectedCategory}</span>}
          {selectedSubcat && <span className="font-semibold text-zinc-900 dark:text-white">→ {selectedSubcat}</span>}
          {searchTerm && <span className="font-semibold text-zinc-900 dark:text-white">"{searchTerm}"</span>}
          <button onClick={clearAllFilters} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600">
            Clear All <XMarkIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Product Count */}
      {!loading && (
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-zinc-500 dark:text-zinc-400">
          <ShoppingBagIcon className="mx-auto mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
          <p className="text-lg font-semibold">No products found 😕</p>
          <button onClick={clearAllFilters} className="mt-3 text-sm font-semibold text-emerald-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}