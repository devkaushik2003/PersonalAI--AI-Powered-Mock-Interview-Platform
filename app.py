import streamlit as st
import cv2
import numpy as np
from transcriber import transcribe_audio
from question_gen import get_interview_questions
from feedback import evaluate_answer
import tempfile
import os
import time
import io

# Set page config - must be first Streamlit command
st.set_page_config(page_title="Mock Interview App", layout="wide", page_icon="🎤", menu_items=None)

# Hide the sidebar
st.markdown(
    """
    <style>
    .css-1vencpc {display: none;}
    </style>
    """, 
    unsafe_allow_html=True
)

# Initialize session state
if 'page' not in st.session_state:
    st.session_state.page = 'home'
if 'current_question_index' not in st.session_state:
    st.session_state.current_question_index = 0
if 'questions' not in st.session_state:
    st.session_state.questions = []
if 'answers' not in st.session_state:
    st.session_state.answers = []
if 'feedback' not in st.session_state:
    st.session_state.feedback = []
if 'recording' not in st.session_state:
    st.session_state.recording = False
if 'audio_data' not in st.session_state:
    st.session_state.audio_data = None
if 'interview_complete' not in st.session_state:
    st.session_state.interview_complete = False

def show_home():
    st.title("🎤 AI Mock Interview")
    st.subheader("Prepare for your next job interview with AI feedback")

    with st.form("interview_form"):
        company = st.text_input("🏢 Company Name", placeholder="e.g., Google")
        role = st.text_input("💼 Role", placeholder="e.g., Software Engineer")
        job_desc = st.text_area("📝 Job Description", height=150, placeholder="Paste the job description here...")
        skills = st.text_input("🛠️ Required Skills", placeholder="e.g., Python, Machine Learning, Communication")

        submitted = st.form_submit_button("Start Interview")

    if submitted:
        if not all([company, role, job_desc, skills]):
            st.warning("Please fill in all fields before starting.")
        else:
            st.session_state['company'] = company
            st.session_state['role'] = role
            st.session_state['job_desc'] = job_desc
            st.session_state['skills'] = skills
            st.session_state.page = 'interview'
            st.experimental_rerun()

def show_interview():
    # Get interview details from session state
    company = st.session_state.get('company', '')
    role = st.session_state.get('role', '')
    job_desc = st.session_state.get('job_desc', '')
    skills = st.session_state.get('skills', '')

    # Generate questions if not already done
    if not st.session_state.questions:
        st.session_state.questions = get_interview_questions(company, role, job_desc, skills)

    st.title("🎤 Interview Session")
    st.write(f"**Company:** {company} | **Role:** {role}")
    
    # Layout
    camera_col, question_col = st.columns([1, 1])
    
    with camera_col:
        # Camera feed - continuous
        st.header("📹 Camera Feed")
        camera_placeholder = st.empty()
    
    with question_col:
        st.header("📝 Questions & Responses")
        
        if not st.session_state.interview_complete and st.session_state.current_question_index < len(st.session_state.questions):
            current_question = st.session_state.questions[st.session_state.current_question_index]
            
            question_display = st.empty()
            question_display.subheader(f"Question {st.session_state.current_question_index + 1}/5")
            question_display.write(current_question)
            
            # Audio recording section
            if not st.session_state.recording:
                if st.button("🎤 Record My Answer"):
                    st.session_state.recording = True
                    st.experimental_rerun()
            else:
                # During recording
                st.warning("🔴 Recording... Speak your answer clearly.")
                if st.button("⏹️ Stop Recording"):
                    # Here is where we would normally get audio data
                    # For demo, just simulate some audio data
                    st.session_state.recording = False
                    
                    # Using a placeholder for audio_data
                    st.session_state.audio_data = b"dummy audio data"
                    st.experimental_rerun()
            
            # Process audio after recording is stopped
            if not st.session_state.recording and st.session_state.audio_data is not None:
                st.info("Processing your answer...")
                
                try:
                    # Create a BytesIO object to simulate a file
                    audio_file = io.BytesIO(st.session_state.audio_data)
                    
                    # For simulation, we'll use a simple text instead of actual transcription
                    # In real app, you'd use: transcribed_text = transcribe_audio(audio_file)
                    transcribed_text = "This is a simulated response to the interview question."
                    
                    st.write("**Your Answer:**")
                    st.write(transcribed_text)
                    
                    st.session_state.answers.append(transcribed_text)
                    
                    # Get feedback
                    st.write("**Generating feedback...**")
                    feedback = evaluate_answer(
                        current_question,
                        transcribed_text,
                        role,
                        skills
                    )
                    st.session_state.feedback.append(feedback)
                    
                    st.write("**Feedback:**")
                    st.write(feedback)
                    
                    # Clear audio data and move to next question
                    st.session_state.audio_data = None
                    
                    # Next question button
                    if st.button("Next Question"):
                        st.session_state.current_question_index += 1
                        if st.session_state.current_question_index >= len(st.session_state.questions):
                            st.session_state.interview_complete = True
                        st.experimental_rerun()
                        
                except Exception as e:
                    st.error(f"Error processing your answer: {str(e)}")
                    st.session_state.audio_data = None
        
        # Show summary at the end
        elif st.session_state.interview_complete or st.session_state.current_question_index >= len(st.session_state.questions):
            st.session_state.interview_complete = True
            st.success("🎉 Interview Completed!")
            st.subheader("Interview Summary")
            
            for i, (question, answer, feedback) in enumerate(zip(
                st.session_state.questions,
                st.session_state.answers,
                st.session_state.feedback
            )):
                with st.expander(f"Question {i+1}", expanded=False):
                    st.write(f"**Question:** {question}")
                    st.write(f"**Your Answer:** {answer}")
                    st.write(f"**Feedback:** {feedback}")
            
            if st.button("Start New Interview"):
                # Reset session state
                st.session_state.page = 'home'
                st.session_state.current_question_index = 0
                st.session_state.questions = []
                st.session_state.answers = []
                st.session_state.feedback = []
                st.session_state.recording = False
                st.session_state.audio_data = None
                st.session_state.interview_complete = False
                st.experimental_rerun()
    
    # Continuous camera feed
    if not st.session_state.interview_complete:
        cap = cv2.VideoCapture(0)
        
        # Run the camera in a loop
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                camera_placeholder.image(frame, channels="RGB", use_column_width=True)
            cap.release()

# Main app logic
if st.session_state.page == 'home':
    show_home()
else:
    show_interview()
