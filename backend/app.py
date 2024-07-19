# backend/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from moviepy.editor import VideoFileClip
from google.cloud import speech
import io
import os
import wave
import json
from vosk import Model, KaldiRecognizer

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'video' not in request.files:
        return "No file part", 400
    
    file = request.files['video']
    if file.filename == '':
        return "No selected file", 400

    filename = 'temp_video.webm'
    file.save(filename)

    # Extract audio from video
    video = VideoFileClip(filename)
    audio_path = 'temp_audio.wav'
    video.audio.write_audiofile(audio_path)

    model_path = "vosk-model-en-in-0.5"

    os.remove(filename)
    os.remove(audio_path)
    return transcribe_audio(model_path, audio_path)
    

def transcribe_audio(audio_file_path, model_path):
    # Check if model path exists
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}")
        return

    # Load the Vosk model
    model = Model(model_path)

    # Open the audio file
    wf = wave.open(audio_file_path, "rb")
    if wf.getnchannels() != 1:
        print("Audio file must be mono")
        return

    rec = KaldiRecognizer(model, wf.getframerate())

    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = rec.Result()
            print(json.loads(result)['text'])
        else:
            partial_result = rec.PartialResult()
            print(json.loads(partial_result)['partial'])

    # Print final result
    final_result = rec.FinalResult()
    print(json.loads(final_result)['text'])
    return final_result

if __name__ == '__main__':
    app.run(debug=True)
