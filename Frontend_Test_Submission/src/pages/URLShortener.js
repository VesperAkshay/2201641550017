import React, { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip
} from '@mui/material';
import { Add, Remove, ContentCopy, Launch } from '@mui/icons-material';
import axios from 'axios';
import { Log } from '../utils/logger';

function URLShortener() {
  const [urls, setUrls] = useState([{ url: '', validity: '', shortcode: '' }]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addUrlField = () => {
    if (urls.length < 5) {
      setUrls([...urls, { url: '', validity: '', shortcode: '' }]);
      Log('frontend', 'info', 'urlshortener', 'Added new URL field');
    }
  };

  const removeUrlField = (index) => {
    if (urls.length > 1) {
      const newUrls = urls.filter((_, i) => i !== index);
      setUrls(newUrls);
      Log('frontend', 'info', 'urlshortener', `Removed URL field at index ${index}`);
    }
  };

  const updateUrl = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const errors = [];
    
    urls.forEach((urlData, index) => {
      if (!urlData.url.trim()) {
        errors.push(`URL ${index + 1} is required`);
      } else if (!validateUrl(urlData.url)) {
        errors.push(`URL ${index + 1} is invalid`);
      }
      
      if (urlData.validity && (!Number.isInteger(Number(urlData.validity)) || Number(urlData.validity) < 1)) {
        errors.push(`Validity for URL ${index + 1} must be a positive integer`);
      }
      
      if (urlData.shortcode && (urlData.shortcode.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(urlData.shortcode))) {
        errors.push(`Shortcode for URL ${index + 1} must be at least 3 characters and contain only letters, numbers, underscore, or dash`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      Log('frontend', 'warning', 'urlshortener', `Validation failed: ${validationErrors.join(', ')}`);
      return;
    }

    setLoading(true);
    Log('frontend', 'info', 'urlshortener', `Starting to shorten ${urls.length} URLs`);

    try {
      const promises = urls.map(async (urlData) => {
        const payload = {
          url: urlData.url.trim(),
          ...(urlData.validity && { validity: parseInt(urlData.validity) }),
          ...(urlData.shortcode && { shortcode: urlData.shortcode.trim() })
        };

        const response = await axios.post('/shorturls', payload);
        return {
          success: true,
          originalUrl: urlData.url,
          ...response.data
        };
      });

      const results = await Promise.allSettled(promises);
      const processedResults = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          Log('frontend', 'error', 'urlshortener', `Failed to shorten URL ${index + 1}: ${result.reason.message}`);
          return {
            success: false,
            originalUrl: urls[index].url,
            error: result.reason.response?.data?.message || result.reason.message || 'Unknown error'
          };
        }
      });

      setResults(processedResults);
      
      const successCount = processedResults.filter(r => r.success).length;
      Log('frontend', 'info', 'urlshortener', `Successfully shortened ${successCount}/${urls.length} URLs`);

    } catch (error) {
      setError('Failed to process URLs. Please try again.');
      Log('frontend', 'error', 'urlshortener', `Error processing URLs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Log('frontend', 'info', 'urlshortener', 'Short link copied to clipboard');
  };

  const openLink = (url) => {
    window.open(url, '_blank');
    Log('frontend', 'info', 'urlshortener', `Opened link: ${url}`);
  };

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
          Shorten Your URLs
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}
        >
          Transform long URLs into short, shareable links. Track clicks and manage your links with ease.
        </Typography>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 4,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: 'text.primary',
              fontWeight: 600,
              mb: 3,
            }}
          >
            Enter URLs to Shorten (up to 5)
          </Typography>
          
          {urls.map((urlData, index) => (
            <Card 
              key={index} 
              sx={{ 
                mb: 3, 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(37, 99, 235, 0.1)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Chip 
                    label={`URL ${index + 1}`}
                    size="small"
                    sx={{ 
                      mr: 2,
                      background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  {urls.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => removeUrlField(index)}
                      color="error"
                    >
                      <Remove />
                    </IconButton>
                  )}
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="URL *"
                      placeholder="https://example.com"
                      value={urlData.url}
                      onChange={(e) => updateUrl(index, 'url', e.target.value)}
                      error={urlData.url && !validateUrl(urlData.url)}
                      helperText={urlData.url && !validateUrl(urlData.url) ? 'Please enter a valid URL with http:// or https://' : ''}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      placeholder="30"
                      type="number"
                      value={urlData.validity}
                      onChange={(e) => updateUrl(index, 'validity', e.target.value)}
                      inputProps={{ min: 1, max: 525600 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Custom Shortcode"
                      placeholder="mycode"
                      value={urlData.shortcode}
                      onChange={(e) => updateUrl(index, 'shortcode', e.target.value)}
                      helperText="3+ chars, letters, numbers, _, -"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            {urls.length < 5 && (
              <Button
                startIcon={<Add />}
                onClick={addUrlField}
                variant="outlined"
              >
                Add URL
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ ml: 'auto' }}
            >
              {loading ? 'Shortening...' : 'Shorten URLs'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: 'text.primary',
              fontWeight: 600,
              mb: 3,
            }}
          >
            ✨ Your Shortened URLs
          </Typography>
          
          {results.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                {result.success ? (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip label="Success" color="success" size="small" sx={{ mr: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Expires: {new Date(result.expiry).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Original: {result.originalUrl}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        <strong>{result.shortLink}</strong>
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(result.shortLink)}
                        title="Copy to clipboard"
                      >
                        <ContentCopy />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openLink(result.shortLink)}
                        title="Open link"
                      >
                        <Launch />
                      </IconButton>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip label="Error" color="error" size="small" sx={{ mr: 2 }} />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Original: {result.originalUrl}
                    </Typography>
                    
                    <Typography variant="body2" color="error">
                      Error: {result.error}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Paper>
      )}
    </Box>
  );
}

export default URLShortener;