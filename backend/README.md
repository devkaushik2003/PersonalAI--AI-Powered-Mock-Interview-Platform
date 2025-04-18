# Flask Backend for AI Mock Interview

This backend serves the React frontend by providing APIs that connect to Google's Gemini API for generating interview questions and feedback.

## Setup

1. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file with your Google API key:

   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

   Note: The code includes a default API key, but it's recommended to use your own key.

3. Run the server:

   ```bash
   python app.py
   ```

   The server will start at http://localhost:5000

## API Endpoints

### Generate Questions

- **URL**: `/api/questions`
- **Method**: `POST`
- **Data**:
  ```json
  {
    "company": "Company Name",
    "role": "Job Role",
    "jobDescription": "Job Description...",
    "skills": "Required Skills"
  }
  ```
- **Response**:
  ```json
  {
    "questions": [
      "Question 1",
      "Question 2",
      "Question 3",
      "Question 4",
      "Question 5"
    ]
  }
  ```

### Generate Feedback

- **URL**: `/api/feedback`
- **Method**: `POST`
- **Data**:
  ```json
  {
    "question": "Interview Question",
    "answer": "Candidate's Answer",
    "role": "Job Role",
    "skills": "Required Skills"
  }
  ```
- **Response**:
  ```json
  {
    "feedback": "Markdown formatted feedback..."
  }
  ```

## Integration with React

The React frontend should make requests to these API endpoints to get AI-generated questions and feedback.

Make sure the backend is running before starting the React app. The React app is configured to connect to http://localhost:5000/api.
