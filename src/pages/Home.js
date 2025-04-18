import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Box, 
  Grid,
  Alert,
  Fade,
  Grow
} from '@mui/material';
import { WorkOutline, Person, Description, Code } from '@mui/icons-material';
import { useInterview } from '../context/InterviewContext';

const Home = () => {
  const navigate = useNavigate();
  const { 
    company, setCompany,
    role, setRole,
    jobDescription, setJobDescription,
    skills, setSkills,
    generateQuestions,
    resetInterview
  } = useInterview();

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!company || !role || !jobDescription || !skills) {
      setError('Please fill in all fields before starting the interview.');
      return;
    }
    
    // Reset any previous interview data
    resetInterview();
    
    // Generate interview questions
    await generateQuestions();
    
    // Navigate to interview page
    navigate('/interview');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6 }}>
        <Grow in={true} timeout={800}>
          <Box textAlign="center" mb={5}>
            <Typography variant="h2" component="h1" gutterBottom>
              <span role="img" aria-label="microphone">🎤</span> AI Mock Interview
            </Typography>
            <Typography variant="h5" color="textSecondary">
              Prepare for your next job interview with AI-powered feedback
            </Typography>
          </Box>
        </Grow>

        <Paper 
          elevation={8} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
        >
          <Fade in={!!error}>
            <Box mb={3}>
              {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            </Box>
          </Fade>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="flex-end" mb={1}>
                  <WorkOutline sx={{ mr: 1, mb: 0.5 }} />
                  <Typography variant="h6">Company Details</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Company Name"
                  placeholder="e.g., Google"
                  variant="outlined"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Role"
                  placeholder="e.g., Software Engineer"
                  variant="outlined"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="flex-end" mb={1}>
                  <Code sx={{ mr: 1, mb: 0.5 }} />
                  <Typography variant="h6">Skills & Requirements</Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Required Skills"
                  placeholder="e.g., Python, React, Communication"
                  variant="outlined"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Job Description"
                  placeholder="Paste the job description here..."
                  variant="outlined"
                  multiline
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  type="submit"
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)'
                  }}
                >
                  Start Interview
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
        
        <Box mt={6} textAlign="center">
          <Typography variant="body2" color="textSecondary">
            <span role="img" aria-label="AI">🤖</span> Powered by AI to help you ace your next interview
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 