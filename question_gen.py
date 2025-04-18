# question_gen.py
import google.generativeai as genai

genai.configure(api_key="Place Your Own Key Here")
model = genai.GenerativeModel("gemini-2.0-flash")
def generate_prompt(company, role, job_desc, skills):
    return f"""
You are an experienced interviewer at {company} for the role of {role}.
Generate 5 diverse interview questions based on the following job description and required skills.

Job Description:
{job_desc}

Skills: {skills}

Questions should be a mix of behavioral and technical.
"""


def generate_questions_with_gemini(prompt: str):
    # MOCK: Replace this with actual Gemini 2.0 Flash API call
    # Example response structure
    return [
        "Can you describe a challenging project you worked on and how you handled it?",
        "How would you optimize a Python-based web service for performance?",
        "What does good teamwork mean to you in a software development context?",
        "Can you explain the difference between supervised and unsupervised learning?",
        "How do you prioritize tasks when working on multiple projects?"
    ]


def get_interview_questions(company, role, job_desc, skills):
    prompt = generate_prompt(company, role, job_desc, skills)
    questions = generate_questions_with_gemini(prompt)
    return questions
