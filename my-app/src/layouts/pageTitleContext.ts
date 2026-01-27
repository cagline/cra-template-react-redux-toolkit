import React, { createContext } from 'react';

export type PageTitleContextValue = {
  title: React.ReactNode | null;
  setTitle: (title: React.ReactNode | null) => void;
};

export const PageTitleContext = createContext<PageTitleContextValue | undefined>(undefined);

