import React from 'react';
import { Button, Box, Chip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { CompressOutlined, BarChartOutlined } from '@mui/icons-material';
import { Log } from '../utils/logger';

function Navigation() {
  const location = useLocation();

  const handleNavigation = (path) => {
    Log('frontend', 'info', 'navigation', `Navigating to ${path}`);
  };

  const navItems = [
    {
      path: '/',
      label: 'Shorten',
      icon: <CompressOutlined sx={{ fontSize: 18 }} />,
    },
    {
      path: '/statistics',
      label: 'Analytics',
      icon: <BarChartOutlined sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {navItems.map((item) => (
        <Button
          key={item.path}
          color="inherit"
          component={Link}
          to={item.path}
          onClick={() => handleNavigation(item.path)}
          startIcon={item.icon}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            background: location.pathname === item.path 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'transparent',
            backdropFilter: location.pathname === item.path ? 'blur(10px)' : 'none',
            border: location.pathname === item.path 
              ? '1px solid rgba(255, 255, 255, 0.2)' 
              : '1px solid transparent',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
}

export default Navigation;