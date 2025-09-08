import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import Navigation from './components/Navigation';
import URLShortener from './pages/URLShortener';
import URLStatistics from './pages/URLStatistics';
import { Log } from './utils/logger';

function App() {
  React.useEffect(() => {
    Log('frontend', 'info', 'app', 'URL Shortener app initialized');
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton 
            edge="start" 
            color="inherit" 
            sx={{ 
              mr: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            <LinkIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #ffffff 30%, #e2e8f0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            URL Shortener
          </Typography>
          <Navigation />
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Routes>
          <Route path="/" element={<URLShortener />} />
          <Route path="/statistics" element={<URLStatistics />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default App;