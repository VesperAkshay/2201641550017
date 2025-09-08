import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Refresh, ContentCopy, Launch, ExpandMore } from '@mui/icons-material';
import axios from 'axios';
import { Log } from '../utils/logger';

function URLStatistics() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError('');
      
      Log('frontend', 'info', 'statistics', 'Fetching URL statistics');
      
      const response = await axios.get('/api/urls');
      setUrls(response.data);
      
      Log('frontend', 'info', 'statistics', `Retrieved ${response.data.length} URLs`);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch URLs';
      setError(errorMessage);
      Log('frontend', 'error', 'statistics', `Error fetching URLs: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedStats = async (shortcode) => {
    try {
      Log('frontend', 'info', 'statistics', `Fetching detailed stats for ${shortcode}`);
      
      const response = await axios.get(`/shorturls/${shortcode}`);
      return response.data;
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      Log('frontend', 'error', 'statistics', `Error fetching detailed stats for ${shortcode}: ${errorMessage}`);
      throw error;
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Log('frontend', 'info', 'statistics', 'Link copied to clipboard');
  };

  const openLink = (url) => {
    window.open(url, '_blank');
    Log('frontend', 'info', 'statistics', `Opened link: ${url}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (url) => {
    if (url.isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading URL statistics...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            mb: 2,
          }}
        >
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: '1.1rem' }}
          >
            Track your URL performance and engagement
          </Typography>
          <IconButton 
            onClick={fetchUrls} 
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              },
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No URLs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create some short URLs first to see statistics here.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              color: 'white',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  Total URLs
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {urls.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: 'white',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  Total Clicks
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {urls.reduce((sum, url) => sum + url.totalClicks, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              color: 'white',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  Active URLs
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {urls.filter(url => !url.isExpired).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* URL List */}
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box sx={{ p: 4 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  📊 All URLs
                </Typography>
                
                {urls.map((url, index) => (
                  <URLStatCard
                    key={url.shortcode}
                    url={url}
                    onCopy={copyToClipboard}
                    onOpen={openLink}
                    onFetchDetails={fetchDetailedStats}
                    formatDate={formatDate}
                    getStatusChip={getStatusChip}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

function URLStatCard({ url, onCopy, onOpen, onFetchDetails, formatDate, getStatusChip }) {
  const [detailedStats, setDetailedStats] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = async () => {
    if (!expanded && !detailedStats && !url.isExpired) {
      setLoadingDetails(true);
      try {
        const stats = await onFetchDetails(url.shortcode);
        setDetailedStats(stats);
      } catch (error) {
        // Error already logged in parent
      } finally {
        setLoadingDetails(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleExpandClick} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mr: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              {getStatusChip(url)}
              <Typography variant="body2" color="text.secondary">
                {url.totalClicks} clicks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(url.createdAt)}
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {url.shortLink}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" noWrap>
              {url.originalUrl}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onCopy(url.shortLink);
              }}
              title="Copy to clipboard"
            >
              <ContentCopy />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(url.shortLink);
              }}
              title="Open link"
              disabled={url.isExpired}
            >
              <Launch />
            </IconButton>
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails>
        {loadingDetails ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading click history...
            </Typography>
          </Box>
        ) : detailedStats ? (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Click History
            </Typography>
            
            {detailedStats.clickHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No clicks yet
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Referrer</TableCell>
                      <TableCell>User Agent</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailedStats.clickHistory.slice(0, 10).map((click, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(click.timestamp)}</TableCell>
                        <TableCell>{click.referrer}</TableCell>
                        <TableCell title={click.userAgent}>
                          {click.userAgent.length > 30 
                            ? `${click.userAgent.substring(0, 30)}...` 
                            : click.userAgent}
                        </TableCell>
                        <TableCell>{click.ip}</TableCell>
                        <TableCell>{click.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {detailedStats.clickHistory.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Showing latest 10 clicks out of {detailedStats.clickHistory.length} total
              </Typography>
            )}
          </Box>
        ) : url.isExpired ? (
          <Typography variant="body2" color="text.secondary">
            This URL has expired. Click history is not available.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click to expand and view detailed statistics
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default URLStatistics;