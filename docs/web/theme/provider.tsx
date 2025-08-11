/**
 * ProManage SaaS Theme Provider
 * Wrap your Next.js _app with this provider.
 */
'use client';
import * as React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { makeTheme, ThemeOptionsExt } from './theme';

type Props = React.PropsWithChildren<{
  initial?: ThemeOptionsExt;
}>;

export const ProManageThemeProvider: React.FC<Props> = ({ initial, children }) => {
  const [options, setOptions] = React.useState<ThemeOptionsExt>(initial ?? { mode: 'light', rtl: false, density: 'comfortable' });

  // Example: hydrate from tenant config fetched at runtime
  React.useEffect(() => {
    // fetch('/api/tenant/theme').then(r => r.json()).then(cfg => setOptions(prev => ({ ...prev, ...cfg })));
  }, []);

  const theme = React.useMemo(() => makeTheme(options), [options]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
