import { Alert, Box, Button } from '@mui/material';
import { RestartAlt } from '@mui/icons-material';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Box sx={{ py: 5 }}>
      <Alert severity="error" variant="outlined" sx={{ borderRadius: 3 }}>
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <span>{message}</span>
          {onRetry && (
            <Button size="small" startIcon={<RestartAlt />} onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </Box>
      </Alert>
    </Box>
  );
}