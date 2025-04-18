import streamlit as st
import cv2
import numpy as np
from transcriber import transcribe_audio
from question_gen import get_interview_questions
from feedback import evaluate_answer
import tempfile
import os

def show_interview():
    # Initialize session state variables if they don't exist
    if 'current_question_index' not in st.session_state:
        st.session_state.current_question_index = 0
    if 'questions' not in st.session_state:
        st.session_state.questions = []
    if 'answers' not in st.session_state:
        st.session_state.answers = []
    if 'feedback' not in st.session_state:
        st.session_state.feedback = []

    # Get interview details from session state
    company = st.session_state.get('company', '')
    role = st.session_state.get('role', '')
    job_desc = st.session_state.get('job_desc', '')
    skills = st.session_state.get('skills', '')

    # Generate questions if not already done
    if not st.session_state.questions:
        st.session_state.questions = get_interview_questions(company, role, job_desc, skills)

    # Layout
    col1, col2 = st.columns([2, 1])

    with col1:
        st.header("🎥 Interview Session")
        st.write(f"**Company:** {company}")
        st.write(f"**Role:** {role}")
        
        # Camera feed
        stframe = st.empty()
        cap = cv2.VideoCapture(0)
        
        # Audio recording
        audio_bytes = st.audio_input("Record your answer", key=f"audio_{st.session_state.current_question_index}")

    with col2:
        st.header("📝 Questions & Feedback")
        
        if st.session_state.current_question_index < len(st.session_state.questions):
            current_question = st.session_state.questions[st.session_state.current_question_index]
            st.subheader(f"Question {st.session_state.current_question_index + 1}/5")
            st.write(current_question)
            
            if audio_bytes:
                # Transcribe audio
                with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                    tmp.write(audio_bytes)
                    tmp_path = tmp.name
                
                transcribed_text = transcribe_audio(open(tmp_path, 'rb'))
                os.unlink(tmp_path)
                
                st.session_state.answers.append(transcribed_text)
                
                # Get feedback
                feedback = evaluate_answer(
                    current_question,
                    transcribed_text,
                    role,
                    skills
                )
                st.session_state.feedback.append(feedback)
                
                # Move to next question
                st.session_state.current_question_index += 1
                st.rerun()
        else:
            st.success("🎉 Interview Completed!")
            st.subheader("Your Answers and Feedback")
            
            for i, (question, answer, feedback) in enumerate(zip(
                st.session_state.questions,
                st.session_state.answers,
                st.session_state.feedback
            )):
                with st.expander(f"Question {i+1}"):
                    st.write(f"**Question:** {question}")
                    st.write(f"**Your Answer:** {answer}")
                    st.write(f"**Feedback:** {feedback}")

    # Display camera feed
    if cap.isOpened():
        ret, frame = cap.read()
        if ret:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            stframe.image(frame, channels="RGB")
        cap.release() 