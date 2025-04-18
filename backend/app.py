from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import json
import logging
import sys
import tempfile
import io

# Add the parent directory to sys.path to import the transcriber module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from transcriber import transcribe_audio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure API key
api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyAmHi2CiA4Z-K5-phmyKpd0vzgljrLNUkY")
logger.info(f"Using API key: {api_key[:5]}...{api_key[-3:]}")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    logger.info("Successfully configured Gemini API")
except Exception as e:
    logger.error(f"Error configuring Gemini API: {str(e)}")

app = Flask(__name__)
# Enable CORS to allow requests from your React app
CORS(app)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API is running"})

@app.route('/api/questions', methods=['POST'])
def generate_questions():
    data = request.json
    logger.info(f"Received request data: {data}")
    
    company = data.get('company', '')
    role = data.get('role', '')
    job_desc = data.get('jobDescription', '')
    skills = data.get('skills', '')
    
    prompt = f"""
    You are an experienced interviewer at {company} for the role of {role}.
    Generate 5 diverse interview questions based on the following job description and required skills.
    
    Job Description:
    {job_desc}
    
    Skills: {skills}
    
    Questions should be a mix of behavioral and technical.
    Format your response as follows (return ONLY the 5 questions, one per line):
    1. [Your first question here]
    2. [Your second question here]
    3. [Your third question here]
    4. [Your fourth question here]
    5. [Your fifth question here]
    """
    
    logger.info(f"Sending prompt to Gemini API")
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        logger.info(f"Received response from Gemini: {response_text[:100]}...")
        
        # Clean up the response to extract only the questions
        questions = []
        lines = response_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for common question formats like "1. What is..." or "- What is..."
            if (line[0].isdigit() and '. ' in line[:5]) or line.startswith('- '):
                # Extract just the question part
                if line[0].isdigit() and '. ' in line[:5]:
                    question = line.split('. ', 1)[1]
                elif line.startswith('- '):
                    question = line[2:]
                else:
                    question = line
                    
                questions.append(question)
        
        # If we still don't have enough questions, try a different approach
        if len(questions) < 5:
            logger.info(f"Couldn't extract questions with standard format, trying alternative parsing.")
            questions = []
            # Just split by newlines and take non-empty lines
            for line in lines:
                line = line.strip()
                if line and len(line) > 10:  # Assuming a valid question is at least 10 chars
                    # Remove any numbering at the beginning
                    if line[0].isdigit() and '. ' in line[:5]:
                        line = line.split('. ', 1)[1]
                    questions.append(line)
        
        # If we still don't have enough questions, generate default ones
        if len(questions) < 5:
            logger.warning(f"Couldn't extract 5 questions from API response. Found {len(questions)}")
            
            # Add default questions to make up for missing ones
            default_questions = [
                f"Tell me about your previous experience that's relevant to the {role} role.",
                f"What specific {skills} skills have you used in your past work?",
                "Describe a challenging project you worked on and how you overcame obstacles.",
                "How do you stay updated with the latest trends in your field?",
                "Do you have any questions about the company or the role?"
            ]
            
            # Add default questions until we have 5
            while len(questions) < 5:
                default_idx = len(questions)
                if default_idx < len(default_questions):
                    questions.append(default_questions[default_idx])
                else:
                    break
        
        # Take only the first 5 questions
        questions = questions[:5]
        
        logger.info(f"Final extracted questions: {questions}")
        return jsonify({"questions": questions})
        
    except Exception as e:
        logger.error(f"Error generating questions: {str(e)}")
        # Return generic interview questions on error
        fallback_questions = [
            f"Tell me about your previous experience that's relevant to the {role} role.",
            f"What specific {skills} skills have you used in your past work?",
            "Describe a challenging project you worked on and how you overcame obstacles.",
            "How do you stay updated with the latest trends in your field?",
            "Do you have any questions about the company or the role?"
        ]
        return jsonify({
            "questions": fallback_questions,
            "warning": "Used fallback questions due to API error",
            "error": str(e)
        })

@app.route('/api/feedback', methods=['POST'])
def generate_feedback():
    data = request.json
    logger.info(f"Received feedback request: {data}")
    
    question = data.get('question', '')
    answer = data.get('answer', '')
    role = data.get('role', '')
    skills = data.get('skills', '')
    
    prompt = f"""
    You are an experienced interviewer evaluating a candidate's response for the role of {role}.
    The candidate was asked: "{question}"
    Their response was: "{answer}"
    
    Required skills for this role: {skills}
    
    Please provide constructive feedback on:
    1. Content relevance and completeness
    2. Communication clarity
    3. Technical accuracy (if applicable)
    4. Areas for improvement
    5. Overall rating (1-5)
    
    Format your response in Markdown with clear sections.
    Keep the feedback professional and actionable.
    """
    
    try:
        response = model.generate_content(prompt)
        feedback_text = response.text
        logger.info(f"Generated feedback (first 100 chars): {feedback_text[:100]}...")
        return jsonify({"feedback": feedback_text})
    except Exception as e:
        logger.error(f"Error generating feedback: {str(e)}")
        # Return generic feedback on error
        fallback_feedback = f"""
## Feedback

### Content Relevance: 3/5
Your answer appears to address the question, but could include more specific details.

### Communication Clarity: 3/5
The response is structured adequately, but could be more concise and clear.

### Technical Accuracy: N/A
Couldn't evaluate technical accuracy at this time.

### Areas for Improvement:
- Provide more concrete examples from your experience
- Structure your answers using the STAR method (Situation, Task, Action, Result)
- Connect your skills more explicitly to the requirements of the {role} position

### Overall Rating: 3/5
A solid answer that could be improved with more specifics and structure.

*Note: This is automated fallback feedback due to an API error.*
        """
        return jsonify({
            "feedback": fallback_feedback,
            "warning": "Used fallback feedback due to API error",
            "error": str(e)
        })

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    try:
        logger.info("Received transcription request")
        
        # Check if the post request has the file part
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return jsonify({"error": "No audio file provided"}), 400
        
        audio_file = request.files['audio']
        
        # If user does not select file, browser also
        # submit an empty file without filename
        if audio_file.filename == '':
            logger.error("Empty audio filename")
            return jsonify({"error": "No selected audio file"}), 400
        
        logger.info(f"Processing audio file: {audio_file.filename}")
        
        # Use the existing transcribe_audio function
        transcription = transcribe_audio(audio_file)
        
        logger.info(f"Transcription completed: {transcription[:50]}...")
        return jsonify({"transcription": transcription})
        
    except Exception as e:
        logger.error(f"Error in transcription: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 