import { useEffect } from 'react';
import { useKakeibo } from '../context/KakeiboContext';

export function useLocalStorage() {
  const { state, dispatch } = useKakeibo();

  useEffect(() => {
    const savedState = localStorage.getItem('kakeiboState');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      Object.entries(parsedState).forEach(([key, value]) => {
        dispatch({ type: `SET_${key.toUpperCase()}`, payload: value });
      });
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('kakeiboState', JSON.stringify(state));
  }, [state]);
} 