import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

// API URL - change this to your Flask server URL
const API_BASE_URL = 'http://localhost:5000/api';

const InterviewContext = createContext();

export const useInterview = () => useContext(InterviewContext);

export const InterviewProvider = ({ children }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  const [apiWarning, setApiWarning] = useState(null);

  // Check if the API is running
  const checkApiStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/');
      console.log("API Status Check:", response.data);
      return true;
    } catch (error) {
      console.error("API Status Check Failed:", error);
      setError("Could not connect to the API server. Please make sure the backend is running.");
      return false;
    }
  };

  // Generate questions from Gemini API
  const generateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    setApiWarning(null);
    
    try {
      // First, check if the API is running
      const isApiRunning = await checkApiStatus();
      if (!isApiRunning) {
        throw new Error("Backend API is not running. Please start the Flask server.");
      }
      
      console.log("Sending request to API with data:", {
        company,
        role,
        jobDescription,
        skills
      });
      
      const response = await axios.post(`${API_BASE_URL}/questions`, {
        company,
        role,
        jobDescription,
        skills
      });
      
      console.log("API Response:", response.data);
      
      // Check for warnings
      if (response.data.warning) {
        setApiWarning(response.data.warning);
        console.warn("API Warning:", response.data.warning);
      }
      
      if (response.data.questions && response.data.questions.length > 0) {
        setQuestions(response.data.questions);
      } else {
        throw new Error("No questions received from API");
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      let errorMsg = error.message;
      
      // If it's an axios error, include more details
      if (error.response) {
        // Server responded with non-2xx status
        errorMsg = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = "No response from server. Is the backend running?";
      }
      
      setError(`Failed to generate questions: ${errorMsg}`);
      
      // Fallback to default questions
      const defaultQuestions = [
        'Tell me about yourself and your experience related to this role.',
        'What specific skills do you have that make you a good fit for this position?',
        'Describe a challenging project you worked on and how you overcame obstacles.',
        'How do you stay updated with the latest trends and technologies in your field?',
        'Do you have any questions about the company or the role?'
      ];
      setQuestions(defaultQuestions);
      console.log("Using default questions due to error");
    } finally {
      setIsLoading(false);
    }
  };

  // Transcribe audio to text
  const transcribeAudio = async (audioBlob) => {
    setIsLoading(true);
    
    try {
      // Check if the API is running
      const isApiRunning = await checkApiStatus();
      if (!isApiRunning) {
        throw new Error("Backend API is not running. Please start the Flask server.");
      }
      
      // Create FormData object to send audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      console.log("Sending audio for transcription...");
      
      const response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Transcription API Response:", response.data);
      
      if (response.data.transcription) {
        return response.data.transcription;
      } else {
        throw new Error("No transcription received from API");
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      let errorMsg = error.message;
      
      if (error.response) {
        errorMsg = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMsg = "No response from server. Is the backend running?";
      }
      
      setError(`Failed to transcribe audio: ${errorMsg}`);
      return "Error transcribing audio. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  // Get feedback from Gemini API
  const getFeedback = async (question, answer) => {
    setIsLoading(true);
    setError(null);
    setApiWarning(null);
    
    try {
      console.log("Sending feedback request with data:", {
        question,
        answer,
        role,
        skills
      });
      
      const response = await axios.post(`${API_BASE_URL}/feedback`, {
        question,
        answer,
        role,
        skills
      });
      
      console.log("Feedback API Response:", response.data);
      
      // Check for warnings
      if (response.data.warning) {
        setApiWarning(response.data.warning);
        console.warn("API Warning:", response.data.warning);
      }
      
      if (response.data.feedback) {
        return response.data.feedback;
      } else {
        throw new Error("No feedback received from API");
      }
    } catch (error) {
      console.error('Error getting feedback:', error);
      let errorMsg = error.message;
      
      // If it's an axios error, include more details
      if (error.response) {
        // Server responded with non-2xx status
        errorMsg = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMsg = "No response from server. Is the backend running?";
      }
      
      setError(`Failed to get feedback: ${errorMsg}`);
      
      // Return a fallback feedback message
      return `
## Feedback Error

We apologize, but we couldn't generate feedback for your answer at this time.

Error details: ${errorMsg}

Please try again later or continue with the next question.
      `;
    } finally {
      setIsLoading(false);
    }
  };

  // Process the answer and get feedback
  const processAnswer = async (audioBlob) => {
    if (!questions.length || currentQuestionIndex >= questions.length) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    console.log("Processing answer for question:", currentQuestion);
    
    // Transcribe audio
    const transcription = await transcribeAudio(audioBlob);
    console.log("Transcription:", transcription);
    
    // Get feedback
    const answerFeedback = await getFeedback(currentQuestion, transcription);
    console.log("Feedback:", answerFeedback);
    
    // Update state
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = transcription;
    setAnswers(newAnswers);
    
    const newFeedback = [...feedback];
    newFeedback[currentQuestionIndex] = answerFeedback;
    setFeedback(newFeedback);
    
    return { transcription, feedback: answerFeedback };
  };

  // Move to next question
  const nextQuestion = () => {
    console.log("Moving to next question. Current index:", currentQuestionIndex);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => {
        console.log("New question index:", prev + 1);
        return prev + 1;
      });
    } else {
      console.log("Interview complete");
      setIsComplete(true);
    }
  };

  // Reset interview
  const resetInterview = () => {
    console.log("Resetting interview");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setFeedback([]);
    setIsComplete(false);
    setError(null);
    setApiWarning(null);
  };

  const value = {
    company,
    setCompany,
    role,
    setRole,
    jobDescription,
    setJobDescription,
    skills,
    setSkills,
    questions,
    currentQuestionIndex,
    answers,
    feedback,
    isLoading,
    isComplete,
    error,
    apiWarning,
    generateQuestions,
    processAnswer,
    nextQuestion,
    resetInterview
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};

export default InterviewContext; 