import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: Palette['primary'];
  }
  interface PaletteOptions {
    sidebar?: PaletteOptions['primary'];
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0d9488',
      light: '#14b8a6',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0284c7',
      light: '#38bdf8',
      dark: '#0369a1',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f3f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    success: { main: '#16a34a', light: '#dcfce7', dark: '#15803d' },
    warning: { main: '#f59e0b', light: '#fef3c7', dark: '#b45309' },
    error: { main: '#dc2626', light: '#fee2e2', dark: '#b91c1c' },
    info: { main: '#0284c7', light: '#e0f2fe', dark: '#075985' },
    sidebar: {
      main: '#0f172a',
      contrastText: '#e2e8f0',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: '#475569',
          backgroundColor: '#f8fafc',
        },
        root: {
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});