import { doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';

export function useProductRating(productId) {
  const [product, loading, error] = useDocumentData(
    productId ? doc(db, 'products', productId) : null
  );
  return {
    avg: product?.avgRating ?? 0,
    count: product?.reviewCount ?? 0,
    loading,
    error,
  };
}