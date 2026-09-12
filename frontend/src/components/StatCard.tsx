import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value?: number | string;
  icon: ReactNode;
  accent?: 'teal' | 'sky' | 'amber' | 'green' | 'rose' | 'slate';
  hint?: string;
  loading?: boolean;
}

const ACCENTS: Record<
  string,
  { bg: string; fg: string; soft: string }
> = {
  teal: { bg: '#0d9488', fg: '#0d9488', soft: '#ccfbf1' },
  sky: { bg: '#0284c7', fg: '#0284c7', soft: '#e0f2fe' },
  amber: { bg: '#f59e0b', fg: '#b45309', soft: '#fef3c7' },
  green: { bg: '#16a34a', fg: '#15803d', soft: '#dcfce7' },
  rose: { bg: '#e11d48', fg: '#be123c', soft: '#ffe4e6' },
  slate: { bg: '#475569', fg: '#334155', soft: '#e2e8f0' },
};

const CARD_STYLE: SxProps<Theme> = {
  height: '100%',
  background:
    'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.6) 100%)',
  backdropFilter: 'blur(4px)',
};

export function StatCard({ title, value, icon, accent = 'teal', hint, loading }: StatCardProps) {
  const a = ACCENTS[accent];
  return (
    <Card sx={CARD_STYLE} className="hover-lift">
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: a.soft,
            color: a.fg,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={36} />
          ) : (
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              {value ?? '—'}
            </Typography>
          )}
          {hint && (
            <Typography variant="caption" color="text.secondary">
              {hint}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}