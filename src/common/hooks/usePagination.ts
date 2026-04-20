import { useState } from 'react';

export const usePagination = (initialPage = 1) => {
  const [page, setPage] = useState(initialPage);
  return { page, next: () => setPage((p) => p + 1), reset: () => setPage(initialPage) };
};
