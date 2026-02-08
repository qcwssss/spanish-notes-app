'use client';

import { useEffect } from 'react';

interface ScrollToSectionOnLoadProps {
  sectionId: string;
}

export default function ScrollToSectionOnLoad({ sectionId }: ScrollToSectionOnLoadProps) {
  useEffect(() => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    element.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [sectionId]);

  return null;
}
