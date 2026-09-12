import { Chip } from '@mui/material';
import { Favorite, CheckCircle } from '@mui/icons-material';

const ACTIVO = { color: '#0369a1', bg: '#e0f2fe', icon: Favorite, label: 'Activo' };
const FINALIZADO = { color: '#475569', bg: '#e2e8f0', icon: CheckCircle, label: 'Finalizado' };

export function EstadoIngresoBadge({ estado }: { estado: string }) {
  const config = estado === 'ACTIVO' ? ACTIVO : FINALIZADO;
  const Icon = config.icon;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ color: `${config.color} !important` }} />}
      label={estado === 'ACTIVO' ? config.label : 'Finalizado'}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 700,
      }}
    />
  );
}