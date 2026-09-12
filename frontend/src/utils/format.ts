import dayjs from 'dayjs';

export const formatDateTime = (value?: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

export const formatDate = (value?: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY') : '—';