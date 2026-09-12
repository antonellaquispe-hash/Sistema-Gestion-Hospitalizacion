import { useMemo } from 'react';
import { Box, Chip, Grid, Paper, Typography } from '@mui/material';
import { HotelOutlined } from '@mui/icons-material';
import type { IngresoHospitalario } from '../types';
import { camasApi } from '../api/camas';
import { ingresosApi } from '../api/ingresos';
import { useApi } from '../hooks/useApi';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';

const ESTADO_COLOR: Record<string, string> = {
  DISPONIBLE: '#0f766e',
  OCUPADA: '#b91c1c',
  LIMPIEZA: '#b45309',
};

const ESTADO_LABEL: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  LIMPIEZA: 'En limpieza',
};

export function CamasPage() {
  const camas = useApi(() => camasApi.listar(), []);
  const ingresos = useApi(() => ingresosApi.listar(), []);

  const ocupantes = useMemo(() => {
    const map = new Map<number, IngresoHospitalario>();
    for (const i of ingresos.data ?? []) {
      if (i.cama && i.estado === 'ACTIVO') map.set(i.cama.id, i);
    }
    return map;
  }, [ingresos.data]);

  const disponibles = (camas.data ?? []).filter((c) => c.estado === 'DISPONIBLE').length;

  return (
    <Box>
      <PageHeader
        title="Camas hospitalarias"
        subtitle="Vista general del estado de las camas del hospital."
        breadcrumb="Camas"
        onRefresh={() => {
          void camas.refetch();
          void ingresos.refetch();
        }}
        loading={camas.loading || ingresos.loading}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {['DISPONIBLE', 'OCUPADA', 'LIMPIEZA'].map((estado) => (
          <Grid item xs={12} sm={4} key={estado}>
            <Paper elevation={0} sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ESTADO_COLOR[estado] }} />
                <Typography fontWeight={700}>{ESTADO_LABEL[estado]}</Typography>
                <Typography fontWeight={800} color={ESTADO_COLOR[estado]}>
                  {(camas.data ?? []).filter((c) => c.estado === estado).length}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {camas.error ? (
        <ErrorState message={camas.error} onRetry={() => void camas.refetch()} />
      ) : camas.loading ? (
        <Typography color="text.secondary">Cargando camas…</Typography>
      ) : (camas.data ?? []).length === 0 ? (
        <Paper elevation={0} sx={{ borderRadius: 4, p: 6, textAlign: 'center' }}>
          <HotelOutlined sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" sx={{ mt: 1 }}>
            No hay camas registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registra camas en el sistema para gestionar la hospitalización.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {(camas.data ?? [])
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((cama) => {
              const ocupante = ocupantes.get(cama.id);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cama.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      p: 2,
                      border: '1px solid',
                      borderColor: cama.estado === 'OCUPADA' ? '#fecaca' : 'divider',
                      transition: 'transform .15s ease, box-shadow .15s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HotelOutlined sx={{ color: 'primary.main' }} />
                        <Typography fontWeight={800}>Cama #{cama.id}</Typography>
                      </Box>
                      <Chip
                        label={ESTADO_LABEL[cama.estado] ?? cama.estado}
                        size="small"
                        sx={{
                          bgcolor: `${ESTADO_COLOR[cama.estado] ?? '#475569'}1a`,
                          color: ESTADO_COLOR[cama.estado] ?? '#475569',
                          fontWeight: 700,
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 1.5 }}>
                      {ocupante ? (
                        <>
                          <Typography fontWeight={600}>{ocupante.paciente?.nombre ?? 'Paciente'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            DNI {ocupante.paciente?.dni ?? '—'} · Ingreso #{ocupante.id}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {cama.estado === 'DISPONIBLE' ? 'Cama libre para asignar' : 'Sin asignación activa'}
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
        </Grid>
      )}

      <Paper elevation={0} sx={{ borderRadius: 3, p: 2, mt: 3, bgcolor: '#f0fdfa' }}>
        <Typography variant="body2" color="#0f766e">
          <strong>{disponibles}</strong> cama{disponibles !== 1 ? 's' : ''} disponible
          {disponibles !== 1 ? 's' : ''} para nuevos ingresos en este momento.
        </Typography>
      </Paper>
    </Box>
  );
}