import { useEffect, useState } from 'react';
import { auth, } from '../firebase';

const ADMIN_UIDS = ['ngTiwoD0ZpiEI6cUr6Uw'];

export const useUserRole = () => {
  const [role, setRole] = useState('customer'); // default = customer
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (user && ADMIN_UIDS.includes(user.uid)) {
        setRole('admin');
      } else {
        setRole('customer');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return { role, loading };
};