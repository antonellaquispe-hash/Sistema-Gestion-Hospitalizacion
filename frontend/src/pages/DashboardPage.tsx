import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import {
  AssignmentOutlined,
  CheckCircleOutlined,
  HotelOutlined,
  LocalHospitalOutlined,
  ScheduleOutlined,
  SwapHorizOutlined,
} from '@mui/icons-material';
import type { Cama, IngresoHospitalario, Movimiento, SolicitudHospitalizacion } from '../types';
import { solicitudesApi } from '../api/solicitudes';
import { ingresosApi } from '../api/ingresos';
import { camasApi } from '../api/camas';
import { movimientosApi } from '../api/movimientos';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { EstadoSolicitudBadge } from '../components/EstadoSolicitudBadge';
import { EstadoIngresoBadge } from '../components/EstadoIngresoBadge';
import { formatDateTime } from '../utils/format';

interface DashboardData {
  solicitudes: SolicitudHospitalizacion[];
  ingresos: IngresoHospitalario[];
  camas: Cama[];
  movimientos: Movimiento[];
}

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <Typography variant="h6" sx={{ px: 2.5, pt: 2.5, pb: 1 }}>
    {children}
  </Typography>
);

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [solicitudes, ingresos, camas, movimientos] = await Promise.all([
        solicitudesApi.listar(),
        ingresosApi.listar(),
        camasApi.listar(),
        movimientosApi.listar(),
      ]);
      setData({ solicitudes, ingresos, camas, movimientos });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  const pendientes = data?.solicitudes.filter((s) => s.estado === 'PENDIENTE').length ?? 0;
  const aprobadas = data?.solicitudes.filter((s) => s.estado === 'APROBADA').length ?? 0;
  const activos = data?.ingresos.filter((i) => i.estado === 'ACTIVO').length ?? 0;
  const finalizados = data?.ingresos.filter((i) => i.estado === 'FINALIZADO').length ?? 0;
  const disponibles = data?.camas.filter((c) => c.estado === 'DISPONIBLE').length ?? 0;
  const ocupadas = data?.camas.filter((c) => c.estado === 'OCUPADA').length ?? 0;

  const ultimasSolicitudes = [...(data?.solicitudes ?? [])]
    .sort((a, b) => (b.fechaSolicitud ?? '').localeCompare(a.fechaSolicitud ?? ''))
    .slice(0, 5);

  const ingresosActivos = [...(data?.ingresos ?? [])]
    .filter((i) => i.estado === 'ACTIVO')
    .sort((a, b) => (b.fechaIngreso ?? '').localeCompare(a.fechaIngreso ?? ''))
    .slice(0, 5);

  const actividadReciente = [...(data?.movimientos ?? [])]
    .sort((a, b) => (b.fechaTraslado ?? '').localeCompare(a.fechaTraslado ?? ''))
    .slice(0, 6);

  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ letterSpacing: -0.5 }}>
          Bienvenido 👋
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Resumen general de la actividad hospitalaria en tiempo real.
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <StatCard title="Solicitudes pendientes" value={pendientes} accent="amber" icon={<ScheduleOutlined />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <StatCard title="Solicitudes aprobadas" value={aprobadas} accent="green" icon={<CheckCircleOutlined />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <StatCard title="Ingresos activos" value={activos} accent="sky" icon={<LocalHospitalOutlined />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <StatCard title="Ingresos finalizados" value={finalizados} accent="slate" icon={<AssignmentOutlined />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <StatCard title="Camas disponibles" value={disponibles} accent="teal" icon={<HotelOutlined />} loading={loading} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} xl={2}>
          <StatCard title="Camas ocupadas" value={ocupadas} accent="rose" icon={<HotelOutlined />} loading={loading} />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={2.5}>
            <Card>
              <SectionTitle>Últimas solicitudes</SectionTitle>
              {loading ? (
                <Box sx={{ p: 2.5 }}>
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                </Box>
              ) : ultimasSolicitudes.length === 0 ? (
                <EmptyState
                  title="Sin solicitudes registradas"
                  description="Las solicitudes de hospitalización aparecerán aquí."
                />
              ) : (
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: '0 12px 16px' }}>
                  {ultimasSolicitudes.map((s) => (
                    <Box
                      component="li"
                      key={s.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 1.5,
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} noWrap>
                          Paciente DNI {s.documentoPaciente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {s.motivo} · {formatDateTime(s.fechaSolicitud)}
                        </Typography>
                      </Box>
                      <EstadoSolicitudBadge estado={s.estado} />
                    </Box>
                  ))}
                </Box>
              )}
              <Divider />
              <Box sx={{ p: 1.5, textAlign: 'right' }}>
                <Link to="/solicitudes" style={{ textDecoration: 'none', fontWeight: 700, color: '#0d9488' }}>
                  Ver todas →
                </Link>
              </Box>
            </Card>

            <Card>
              <SectionTitle>Ingresos activos</SectionTitle>
              {loading ? (
                <Box sx={{ p: 2.5 }}>
                  <Skeleton height={40} />
                  <Skeleton height={40} />
                </Box>
              ) : ingresosActivos.length === 0 ? (
                <EmptyState
                  title="No hay ingresos activos"
                  description="Los pacientes hospitalizados actualmente aparecerán aquí."
                />
              ) : (
                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: '0 12px 16px' }}>
                  {ingresosActivos.map((i) => (
                    <Box
                      component="li"
                      key={i.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        px: 1.5,
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography fontWeight={600} noWrap>
                          {i.paciente?.nombre ?? `Paciente #${i.paciente?.id ?? '?'}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          Cama {i.cama ? `#${i.cama.id}` : 'sin asignar'} · {i.motivoIngreso}
                        </Typography>
                      </Box>
                      <EstadoIngresoBadge estado={i.estado} />
                    </Box>
                  ))}
                </Box>
              )}
              <Divider />
              <Box sx={{ p: 1.5, textAlign: 'right' }}>
                <Link to="/ingresos" style={{ textDecoration: 'none', fontWeight: 700, color: '#0d9488' }}>
                  Ver todos →
                </Link>
              </Box>
            </Card>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Card>
              <SectionTitle>Estado de camas</SectionTitle>
              {loading ? (
                <Box sx={{ p: 2.5 }}>
                  <Skeleton height={70} />
                </Box>
              ) : (
                <Box sx={{ px: 2.5, pb: 2.5 }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={<HotelOutlined />}
                      label={`${disponibles} disponibles`}
                      sx={{ bgcolor: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}
                    />
                    <Chip
                      icon={<HotelOutlined />}
                      label={`${ocupadas} ocupadas`}
                      sx={{ bgcolor: '#ffe4e6', color: '#be123c', fontWeight: 700 }}
                    />
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(data?.camas ?? []).map((c) => (
                      <Box
                        key={c.id}
                        sx={{
                          width: 44,
                          height: 36,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 13,
                          bgcolor: c.estado === 'DISPONIBLE' ? '#ccfbf1' : '#ffe4e6',
                          color: c.estado === 'DISPONIBLE' ? '#0f766e' : '#be123c',
                          border: '1px solid',
                          borderColor: c.estado === 'DISPONIBLE' ? '#99f6e4' : '#fecdd3',
                        }}
                      >
                        {c.id}
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1.5 }}>
                    Vista rápida de ocupación por cama.
                  </Typography>
                </Box>
              )}
            </Card>

            <Card>
              <SectionTitle>Actividad reciente</SectionTitle>
              {loading ? (
                <Box sx={{ p: 2.5 }}>
                  <Skeleton height={50} />
                  <Skeleton height={50} />
                  <Skeleton height={50} />
                </Box>
              ) : actividadReciente.length === 0 ? (
                <EmptyState
                  title="Sin movimientos"
                  description="Los traslados recientes aparecerán aquí."
                />
              ) : (
                <List dense disablePadding sx={{ px: 1.5, py: 1 }}>
                  {actividadReciente.map((m) => (
                    <ListItem key={m.id} alignItems="flex-start" sx={{ borderRadius: 3, px: 1.5 }}>
                      <ListItemIcon sx={{ minWidth: 40, color: '#0284c7' }}>
                        <SwapHorizOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography fontWeight={600} fontSize={13.5}>
                            {m.ingreso.paciente?.nombre ?? 'Paciente'} entre camas
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" component="span">
                              Cama {m.camaOrigen.id} → Cama {m.camaDestino.id} · {formatDateTime(m.fechaTraslado)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Card>

            {!loading && (data?.camas.length ?? 0) > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: 'linear-gradient(120deg, #0f766e 0%, #0d9488 100%)',
                  color: 'white',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LocalHospitalOutlined sx={{ fontSize: 36 }} />
                  <Box>
                    <Typography fontWeight={800}>Hospital operativo</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>
                      {activos} pacientes en hospitalización activa
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}