import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(fetcher: () => Promise<T>, _deps: unknown[] = []) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current();
      setState({ data, loading: false, error: null });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
      setState({ data: null, loading: false, error: message });
    }
  }, [fetcherRef]);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcherRef.current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
        if (active) setState({ data: null, loading: false, error: message });
      });
    return () => {
      active = false;
    };
  }, [fetcherRef]);

  return { ...state, refetch: load };
}