import { Box, Button, Typography } from '@mui/material';
import { HomeOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h2" fontWeight={800} color="primary.main">
        404
      </Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>
        Página no encontrada
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        La ruta solicitada no existe en el sistema de hospitalización.
      </Typography>
      <Button variant="contained" startIcon={<HomeOutlined />} sx={{ mt: 3 }} onClick={() => navigate('/')}>
        Volver al inicio
      </Button>
    </Box>
  );
}