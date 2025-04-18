import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Box, 
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grow,
  Skeleton
} from '@mui/material';
import Webcam from 'react-webcam';
import { useReactMediaRecorder } from 'react-media-recorder';
import { 
  Mic, 
  Stop, 
  ArrowForward, 
  Check, 
  Home as HomeIcon,
  Refresh
} from '@mui/icons-material';
import { useInterview } from '../context/InterviewContext';
import ReactMarkdown from 'react-markdown';

const Interview = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [transcription, setTranscription] = useState('');
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [canProceed, setCanProceed] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { 
    company,
    role,
    questions,
    currentQuestionIndex,
    answers,
    feedback,
    isComplete,
    error: contextError,
    apiWarning,
    processAnswer,
    nextQuestion,
    resetInterview
  } = useInterview();

  const { 
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl
  } = useReactMediaRecorder({
    audio: true,
    video: false,
    onStop: (blobUrl, blob) => handleRecordingStop(blob)
  });

  // Redirect to home if no questions available
  useEffect(() => {
    if (!questions.length) {
      navigate('/');
    }
  }, [questions, navigate]);

  // Update transcription and feedback when current question changes
  useEffect(() => {
    if (answers[currentQuestionIndex]) {
      setTranscription(answers[currentQuestionIndex]);
    } else {
      setTranscription('');
    }
    
    if (feedback[currentQuestionIndex]) {
      setCurrentFeedback(feedback[currentQuestionIndex]);
    } else {
      setCurrentFeedback('');
    }
    
    setCanProceed(!!feedback[currentQuestionIndex]);
    setActiveStep(feedback[currentQuestionIndex] ? 2 : 0);
  }, [currentQuestionIndex, answers, feedback]);

  // Handle recording stop and process the audio
  const handleRecordingStop = async (blob) => {
    setIsLoading(true);
    setError('');
    
    try {
      // Process the recorded audio
      const result = await processAnswer(blob);
      console.log("Result from processAnswer:", result);
      
      // Set transcription and feedback for current question
      setTranscription(answers[currentQuestionIndex] || '');
      setCurrentFeedback(feedback[currentQuestionIndex] || '');
      
      setCanProceed(true);
      setActiveStep(2); // Move to feedback step
    } catch (error) {
      console.error('Error processing recording:', error);
      setError('An error occurred while processing your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clicking "Next Question" button
  const handleNextQuestion = () => {
    console.log("Handling next question click");
    nextQuestion();
    setActiveStep(0); // Reset to question step
  };

  // Handle starting over
  const handleStartOver = () => {
    resetInterview();
    navigate('/');
  };

  // Steps for the interview process
  const steps = ['Question', 'Recording', 'Feedback'];

  // For debugging
  console.log("Current state:", {
    questions,
    currentQuestionIndex,
    answers,
    feedback,
    isComplete,
    activeStep,
    canProceed
  });

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Header */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4">
                <span role="img" aria-label="interview">🎤</span> {company} Interview: {role}
              </Typography>
              
              <Box>
                <Button 
                  startIcon={<HomeIcon />} 
                  onClick={handleStartOver}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Start Over
                </Button>
                
                <Chip 
                  label={`Question ${currentQuestionIndex + 1} of ${questions.length}`}
                  color="primary"
                  variant="filled"
                />
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
          </Grid>
          
          {/* Left side - Camera */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: 2, 
                height: '100%',
                background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Typography variant="h6" gutterBottom>
                <span role="img" aria-label="camera">📹</span> Camera Feed
              </Typography>
              
              <Box
                className={`webcam-container ${status === 'recording' ? 'pulse-recording' : ''}`}
                sx={{ 
                  width: '100%',
                  height: 'calc(100% - 50px)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  mb: 2,
                  border: status === 'recording' ? '2px solid #f44336' : 'none'
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  width="100%"
                  height="100%"
                  videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  }}
                  style={{ 
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px'
                  }}
                />
                
                {status === 'recording' && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      right: 10,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#f44336',
                      borderRadius: 5,
                      px: 2,
                      py: 0.5
                    }}
                  >
                    <Box
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: '#fff',
                        mr: 1,
                        animation: 'pulse 1s infinite' 
                      }}
                    />
                    <Typography variant="caption" color="white">
                      RECORDING
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Right side - Questions and Answers */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={8} 
              sx={{ 
                p: 3, 
                minHeight: '600px',
                background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Show API warnings if any */}
              {apiWarning && (
                <Alert severity="warning" sx={{ mb: 3 }} onClose={() => {}}>
                  {apiWarning}
                </Alert>
              )}
              
              {/* Show API error if any */}
              {contextError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => {}}>
                  {contextError}
                </Alert>
              )}
              
              {/* Show local error if any */}
              {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              
              {/* Stepper */}
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              {/* Current Question */}
              {!isComplete && questions.length > currentQuestionIndex && (
                <Box>
                  <Typography variant="h5" gutterBottom>
                    Question:
                  </Typography>
                  <Card sx={{ mb: 3, backgroundColor: '#2a2a2a' }}>
                    <CardContent>
                      <Typography variant="body1">
                        {questions[currentQuestionIndex]}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  {/* Recording controls */}
                  {activeStep === 0 && (
                    <Grow in={activeStep === 0} timeout={500}>
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={<Mic />}
                          onClick={() => {
                            startRecording();
                            setActiveStep(1);
                          }}
                          disabled={status === 'recording'}
                          sx={{ 
                            py: 1.5,
                            px: 4,
                            borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)'
                          }}
                        >
                          Start Recording
                        </Button>
                      </Box>
                    </Grow>
                  )}
                  
                  {activeStep === 1 && (
                    <Grow in={activeStep === 1} timeout={500}>
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Recording in progress... Speak clearly into your microphone.
                        </Typography>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          startIcon={<Stop />}
                          onClick={() => {
                            stopRecording();
                            setIsLoading(true);
                          }}
                          sx={{ 
                            py: 1.5,
                            px: 4,
                            borderRadius: 8,
                            boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)'
                          }}
                        >
                          Stop Recording
                        </Button>
                      </Box>
                    </Grow>
                  )}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                      <CircularProgress />
                    </Box>
                  )}
                  
                  {/* Transcription */}
                  {activeStep === 2 && transcription && (
                    <Fade in={!!transcription} timeout={1000}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Your Answer:
                        </Typography>
                        <Card sx={{ backgroundColor: '#2a2a2a', mb: 3 }}>
                          <CardContent>
                            <Typography variant="body1">
                              {transcription}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    </Fade>
                  )}
                  
                  {/* Feedback */}
                  {activeStep === 2 && currentFeedback && (
                    <Fade in={!!currentFeedback} timeout={1500}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          AI Feedback:
                        </Typography>
                        <Card sx={{ backgroundColor: '#263238', mb: 3 }}>
                          <CardContent>
                            <ReactMarkdown>
                              {currentFeedback}
                            </ReactMarkdown>
                          </CardContent>
                        </Card>
                        
                        {/* Next question button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                          {currentQuestionIndex < questions.length - 1 ? (
                            <Button
                              variant="contained"
                              color="primary"
                              endIcon={<ArrowForward />}
                              onClick={handleNextQuestion}
                              disabled={!canProceed}
                            >
                              Next Question
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="primary"
                              endIcon={<Check />}
                              onClick={() => nextQuestion()}
                              disabled={!canProceed}
                            >
                              Complete Interview
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Fade>
                  )}
                </Box>
              )}
              
              {/* Interview Complete */}
              {isComplete && (
                <Grow in={isComplete} timeout={800}>
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography variant="h4" gutterBottom>
                        <span role="img" aria-label="celebration">🎉</span> Interview Complete!
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        Here's a summary of your interview performance
                      </Typography>
                    </Box>
                    
                    {/* Summary of questions and answers */}
                    {questions.map((question, index) => (
                      <Card key={index} sx={{ mb: 3, backgroundColor: '#2a2a2a' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Question {index + 1}:
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 2 }}>
                            {question}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="subtitle1" gutterBottom>
                            Your Answer:
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {answers[index] || "No answer recorded"}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Typography variant="subtitle1" gutterBottom>
                            Feedback:
                          </Typography>
                          <Box sx={{ backgroundColor: '#263238', p: 2, borderRadius: 1 }}>
                            <ReactMarkdown>
                              {feedback[index] || "No feedback available"}
                            </ReactMarkdown>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Refresh />}
                        onClick={handleStartOver}
                        size="large"
                        sx={{ 
                          py: 1.5,
                          px: 4,
                          borderRadius: 8,
                          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)'
                        }}
                      >
                        Start New Interview
                      </Button>
                    </Box>
                  </Box>
                </Grow>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Interview; 