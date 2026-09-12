import { Alert, Snackbar } from '@mui/material';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface ToastValue {
  message: string;
  kind: ToastKind;
  key: number;
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastValue | null>(null);

  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    setToast({ message, kind, key: Date.now() });
  }, []);

  const handleClose = useCallback((_e?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={toast?.kind ?? 'info'}
          variant="filled"
          onClose={() => setToast(null)}
          sx={{ borderRadius: 10, fontWeight: 600 }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}