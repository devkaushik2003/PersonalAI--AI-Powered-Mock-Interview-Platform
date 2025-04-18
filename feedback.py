import google.generativeai as genai

genai.configure(api_key="PLACE YOUR OWN KEY HERE")
model = genai.GenerativeModel("gemini-2.0-flash")

def generate_feedback_prompt(question, answer, role, skills):
    return f"""
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

Keep the feedback professional and actionable.
"""

def evaluate_answer(question, answer, role, skills):
    prompt = generate_feedback_prompt(question, answer, role, skills)
    response = model.generate_content(prompt)
    return response.text
