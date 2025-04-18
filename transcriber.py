# transcriber.py

import requests
import tempfile
import os

def transcribe_audio(file):
    """
    Takes an audio file and transcribes it using AssemblyAI's free API.
    """
    # Save the audio file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file.read())
        tmp_path = tmp.name

    # Upload to AssemblyAI
    upload_url = "https://api.assemblyai.com/v2/upload"
    headers = {"authorization": "Place Your Own Key Here"}
    
    with open(tmp_path, "rb") as f:
        response = requests.post(upload_url, headers=headers, data=f)
    upload_url = response.json()["upload_url"]
    
    # Transcribe
    transcript_url = "https://api.assemblyai.com/v2/transcript"
    json = {"audio_url": upload_url}
    response = requests.post(transcript_url, json=json, headers=headers)
    transcript_id = response.json()["id"]
    
    # Get transcription
    polling_url = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
    while True:
        polling_response = requests.get(polling_url, headers=headers)
        if polling_response.json()["status"] == "completed":
            text = polling_response.json()["text"]
            break
    
    # Clean up
    os.unlink(tmp_path)
    return text
