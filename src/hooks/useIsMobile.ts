'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export function useIsMobile() {
  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {};
    const mql = window.matchMedia('(max-width: 768px)');
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  };

  const getServerSnapshot = () => false;

  const isMobile = useSyncExternalStore(
    typeof window !== 'undefined' ? subscribe : emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  return isMobile;
}
