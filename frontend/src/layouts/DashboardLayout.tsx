import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AssignmentOutlined,
  DashboardOutlined,
  GroupOutlined,
  HotelOutlined,
  LocalHospitalOutlined,
  Menu as MenuIcon,
  SwapHorizOutlined,
} from '@mui/icons-material';
import dayjs from 'dayjs';

const DRAWER_WIDTH = 256;

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlined /> },
  { label: 'Solicitudes', path: '/solicitudes', icon: <AssignmentOutlined /> },
  { label: 'Pacientes', path: '/pacientes', icon: <GroupOutlined /> },
  { label: 'Ingresos', path: '/ingresos', icon: <LocalHospitalOutlined /> },
  { label: 'Camas', path: '/camas', icon: <HotelOutlined /> },
  { label: 'Movimientos', path: '/movimientos', icon: <SwapHorizOutlined /> },
];

const TITLES: Array<[string, string]> = [
  ['/', 'Dashboard'],
  ['/solicitudes', 'Solicitudes'],
  ['/pacientes', 'Pacientes'],
  ['/ingresos', 'Ingresos hospitalarios'],
  ['/camas', 'Camas'],
  ['/movimientos', 'Movimientos'],
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const pageTitle = TITLES.find(([path]) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)))?.[1] ?? '';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2.5, py: 2.2, borderBottom: '1px solid rgba(148,163,184,0.15)' }}
      >
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: 'primary.main',
            width: 40,
            height: 40,
            boxShadow: '0 8px 20px -6px rgba(13,148,136,0.6)',
          }}
        >
          <LocalHospitalOutlined />
        </Avatar>
        <Box>
          <Typography fontWeight={800} fontSize={15} color="#f8fafc" lineHeight={1.2}>
            Hospitalización
          </Typography>
          <Typography fontSize={12} color="#94a3b8">
            Gestión hospitalaria
          </Typography>
        </Box>
      </Stack>

      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          return (
            <Tooltip key={item.path} title={item.label} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onNavigate}
                sx={{
                  borderRadius: 3,
                  mb: 0.75,
                  color: active ? '#ffffff' : '#94a3b8',
                  bgcolor: active ? 'rgba(13,148,136,0.9)' : 'transparent',
                  boxShadow: active ? '0 8px 20px -8px rgba(13,148,136,0.7)' : 'none',
                  '&:hover': {
                    bgcolor: active ? 'rgba(13,148,136,0.9)' : 'rgba(148,163,184,0.12)',
                    color: active ? '#ffffff' : '#e2e8f0',
                  },
                  transition: 'all .18s ease',
                }}
              >
                <ListItemIcon
                  sx={{ color: 'inherit', minWidth: 40, '& .MuiSvgIcon-root': { fontSize: 22 } }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ borderRadius: 3, p: 1.5, bgcolor: 'rgba(148,163,184,0.1)' }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#334155', fontSize: 14, fontWeight: 700 }}>
            H
          </Avatar>
          <Box>
            <Typography fontSize={13} fontWeight={700} color="#e2e8f0">
              Sala de hospitalización
            </Typography>
            <Typography fontSize={11.5} color="#64748b">
              v1.0.0 · {pageTitle || 'Panel'}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [today] = useState(dayjs());
  const location = useLocation();

  const pageTitle = useMemo(
    () =>
      TITLES.find(([path]) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
      )?.[1] ?? 'Panel',
    [location.pathname],
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'sidebar.main',
            backgroundImage: 'linear-gradient(180deg, #111c2e 0%, #0b1524 100%)',
          },
        }}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: 'sidebar.main',
            backgroundImage: 'linear-gradient(180deg, #111c2e 0%, #0b1524 100%)',
            border: 'none',
          },
        }}
      >
        <SidebarContent />
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            backdropFilter: 'blur(10px)',
            bgcolor: 'rgba(243,245,249,0.85)',
            borderBottom: '1px solid rgba(226,232,240,0.9)',
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { lg: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {pageTitle}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              {today.format('dddd, D [de] MMMM [de] YYYY')}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Box className="fade-in">
            <Outlet />
          </Box>
          <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Sistema de Gestión de Hospitalización · React + Spring Boot
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}