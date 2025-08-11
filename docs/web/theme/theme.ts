/**
 * ProManage SaaS Minimal Theme
 * Multi-tenant aware + RTL + Light/Dark
 */
import { createTheme, Theme } from '@mui/material/styles';

export type BrandTokens = {
  primary?: string;
  secondary?: string;
  logoUrl?: string;
  fontFamily?: string;
};

export type ThemeOptionsExt = {
  mode?: 'light' | 'dark';
  rtl?: boolean;
  brand?: BrandTokens;
  density?: 'comfortable' | 'compact';
};

export const makeTheme = (opts: ThemeOptionsExt = {}): Theme => {
  const mode = opts.mode ?? 'light';
  const rtl = !!opts.rtl;
  const density = opts.density ?? 'comfortable';
  const brand = opts.brand ?? {};

  const backgroundDefault = mode === 'dark' ? '#0B0F14' : '#F7F9FB';
  const backgroundPaper   = mode === 'dark' ? '#11161B' : '#FFFFFF';

  const theme = createTheme({
    direction: rtl ? 'rtl' : 'ltr',
    palette: {
      mode,
      primary: { main: brand.primary ?? '#3B82F6' },
      secondary: { main: brand.secondary ?? '#22C55E' },
      background: { default: backgroundDefault, paper: backgroundPaper },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(2,6,12,0.08)',
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: `${brand.fontFamily ?? 'Inter'}, "IBM Plex Sans Arabic", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          'html, body, #__next': { height: '100%' }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', borderRadius: 8, boxShadow: 'none' }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: { border: '1px solid', borderColor: 'divider' }
        }
      },
      MuiTableRow: {
        styleOverrides: {
          root: { height: density === 'compact' ? 40 : 48 }
        }
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 6 } }
      },
      MuiTextField: {
        defaultProps: { size: density === 'compact' ? 'small' : 'medium' }
      }
    }
  });

  return theme;
};
