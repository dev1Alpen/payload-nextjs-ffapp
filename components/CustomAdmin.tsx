'use client';

import React, { useEffect } from 'react';

const CustomAdmin = ({ children }: { children: React.ReactNode }) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    const pageTitle = document.title.split(' | ')[0];
    document.title = `${pageTitle} | My Site Title`;
  }, [pathname]);

  return <>{children}</>;
};

export default CustomAdmin;
