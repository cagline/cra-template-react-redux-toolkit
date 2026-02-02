import React, { useMemo, useState } from 'react';
import { PageTitleContext } from './pageTitleContext';

export const PageTitleProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [title, setTitle] = useState<React.ReactNode | null>(null);

  const value = useMemo(() => ({ title, setTitle }), [title]);

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
};

