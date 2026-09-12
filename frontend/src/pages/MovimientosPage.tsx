import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowForward, Search } from '@mui/icons-material';
import { movimientosApi } from '../api/movimientos';
import { useApi } from '../hooks/useApi';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { formatDateTime } from '../utils/format';

export function MovimientosPage() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useApi(() => movimientosApi.listar(), []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter(
      (m) =>
        (m.ingreso?.paciente?.nombre.toLowerCase().includes(term) ?? false) ||
        (m.ingreso?.paciente?.dni.includes(term) ?? false) ||
        m.motivo.toLowerCase().includes(term) ||
        m.medicoResponsable.toLowerCase().includes(term) ||
        m.usuarioTraslado.toLowerCase().includes(term),
    );
  }, [data, search]);

  return (
    <Box>
      <PageHeader
        title="Movimientos de traslado"
        subtitle="Historial de todos los traslados de cama del hospital."
        breadcrumb="Movimientos"
        onRefresh={() => void refetch()}
        loading={loading}
      />

      {error ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 4 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              size="small"
              placeholder="Buscar por paciente, DNI, motivo, médico o usuario…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', sm: 380 } }}
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
          <TableContainer>
            <Table sx={{ minWidth: 980 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Paciente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Traslado</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Médico responsable</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.id}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{m.ingreso?.paciente?.nombre ?? '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        DNI {m.ingreso?.paciente?.dni ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(m.fechaTraslado)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`#${m.camaOrigen.id}`} size="small" variant="outlined" />
                        <ArrowForward sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Chip
                          label={`#${m.camaDestino.id}`}
                          size="small"
                          sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography noWrap title={m.motivo}>
                        {m.motivo}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.medicoResponsable}</TableCell>
                    <TableCell>{m.usuarioTraslado}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography
                        noWrap
                        variant="body2"
                        color="text.secondary"
                        title={m.observaciones ?? ''}
                      >
                        {m.observaciones ?? '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!loading && filtered.length === 0 && (
            <EmptyState
              title={search ? 'Sin coincidencias' : 'No hay movimientos registrados'}
              description={
                search
                  ? 'Prueba con otro término de búsqueda.'
                  : 'Los traslados de cama aparecerán aquí cuando se realicen.'
              }
            />
          )}
        </Paper>
      )}
    </Box>
  );
}