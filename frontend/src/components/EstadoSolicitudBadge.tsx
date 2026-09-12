import { Chip } from '@mui/material';
import { CheckCircle, DoNotDisturb, Schedule, Cancel } from '@mui/icons-material';
import type { SolicitudEstado } from '../types';

const CONFIG: Record<SolicitudEstado, { color: string; bg: string; icon: typeof Schedule; label: string }> = {
  PENDIENTE: { color: '#b45309', bg: '#fef3c7', icon: Schedule, label: 'Pendiente' },
  APROBADA: { color: '#15803d', bg: '#dcfce7', icon: CheckCircle, label: 'Aprobada' },
  RECHAZADA: { color: '#b91c1c', bg: '#fee2e2', icon: Cancel, label: 'Rechazada' },
  CANCELADA: { color: '#475569', bg: '#e2e8f0', icon: DoNotDisturb, label: 'Cancelada' },
};

export function EstadoSolicitudBadge({ estado }: { estado: SolicitudEstado }) {
  const config = CONFIG[estado];
  const Icon = config.icon;
  return (
    <Chip
      size="small"
      icon={<Icon sx={{ color: `${config.color} !important` }} />}
      label={config.label}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 700,
        '& .MuiChip-icon': { color: config.color },
      }}
    />
  );
}