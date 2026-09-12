import { Box, Breadcrumbs, Button, Typography } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  actionLabel?: string;
  onAction?: () => void;
  onRefresh?: () => void;
  actionIcon?: ReactNode;
  loading?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actionLabel,
  onAction,
  onRefresh,
  actionIcon,
  loading = false,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        {breadcrumb && (
          <Breadcrumbs sx={{ mb: 0.5, fontSize: 13 }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#64748b' }}>
              Inicio
            </Link>
            <Typography color="text.primary" fontSize={13} fontWeight={600}>
              {breadcrumb}
            </Typography>
          </Breadcrumbs>
        )}
        <Typography variant="h4" sx={{ letterSpacing: -0.5 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            disabled={loading}
            color="inherit"
          >
            Actualizar
          </Button>
        )}
        {actionLabel && onAction && (
          <Button variant="contained" startIcon={actionIcon ?? <Add />} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}