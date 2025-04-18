# 🎤 PersonalAI: AI-Powered Mock Interview Platform

This project implements an AI-powered mock interview platform to help users prepare for job interviews with AI-generated questions, real-time transcription, and personalized feedback. The project consists of both a React frontend and a Flask backend.

- **frontend/**: React-based user interface with interview management
- **backend/app.py**: Flask API server connecting to Gemini and AssemblyAI
- **transcriber.py**: Handles speech-to-text conversion using AssemblyAI

## 🎬 DEMO VIDEO

[Demo video coming soon]

## ✨ Features

- 🎙️ Real-time audio recording and speech-to-text conversion
- 🤖 AI-generated interview questions tailored to specific job descriptions
- 📝 Personalized feedback on responses using Google's Gemini API
- 📹 Live webcam feed during the interview session
- 📊 Comprehensive interview summary with feedback for review

## 📥 Installation

Ensure you have Python and Node.js installed, then install the required dependencies:

```bash
# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
npm install
```

## ▶️ Usage

You need to run both the backend and frontend separately:

```bash
# Start the Flask backend
py -m backend.app

# In a separate terminal, start the React frontend
npm start
```

The frontend will be available at http://localhost:3000 and the backend at http://localhost:5000.

## 📝 Note:

- The backend must be running for the React frontend to function properly
- Make sure your microphone is enabled for audio recording
- A stable internet connection is required for API calls

This is a functional prototype that demonstrates the core functionality of an AI-powered interview system.

## 🎮 Interview Process

### 1. Setup Phase:

- Enter the company name you're applying to
- Specify the role you're interviewing for
- Paste the job description
- List the required skills

### 2. Interview Phase:

- Answer AI-generated questions relevant to your job application
- Record your responses which are automatically transcribed
- Receive detailed feedback on your answers
- Progress through multiple questions

### 3. Review Phase:

- Get a comprehensive summary of your performance
- Review all questions, answers, and feedback
- Identify areas for improvement

## 📦 Technologies Used

The project utilizes several key technologies:

- **React**: Frontend UI framework
- **Flask**: Python backend framework
- **AssemblyAI**: Speech-to-text API for transcription
- **Google Gemini**: AI model for question generation and feedback
- **OpenCV**: For camera integration
- **Streamlit**: Alternative UI implementation

## 🚀 Future Improvements

- 🔍 Add user authentication and saved interview history
- ✋ Implement facial expression analysis for non-verbal feedback
- 🎨 Expand question types and interview scenarios
- 🌐 Add support for multiple languages
- 📊 Include detailed analytics on interview performance

## 🙌 Acknowledgments

- 🎯 AssemblyAI for speech-to-text capabilities
- 🖥️ Google's Gemini API for AI-powered question generation and feedback
