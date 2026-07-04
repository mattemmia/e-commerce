import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../firebase'; // note: ../ not ./ because it's inside utils folder

export const reduceStockOnOrder = async (cartItems) => {
  try {
    await runTransaction(db, async (transaction) => {
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) throw new Error('Product not found');

        const currentStock = productSnap.data().stock;
        if (currentStock < item.qty) throw new Error(`${productSnap.data().name} only has ${currentStock} left  `);

        const newStock = currentStock - item.qty;
        const status = newStock > 0 ? 'In Stock' : 'Out of Stock';

        transaction.update(productRef, { stock: newStock, status });
      }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};