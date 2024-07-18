// src/Recorder.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const Recorder = () => {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    // Cleanup function to stop the stream when the component is unmounted
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable = event => {
      chunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      chunks.current = [];
      const videoURL = URL.createObjectURL(blob);
      setVideoURL(videoURL);
      
      // Send the blob to the backend
      const formData = new FormData();
      formData.append('video', blob, 'video.webm');

      try {
        const response = await axios.post('http://localhost:5000/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Text extracted from audio: ' + response.data.text);
      } catch (error) {
        console.error('Error uploading the video', error);
      }
    };

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    setRecording(false);
    // Stop the video stream
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  };

  return (
    <div>
      <h1>Video and Audio Recorder</h1>
      <video ref={videoRef} autoPlay style={{ width: '100%', maxHeight: '400px' }} />
      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      {videoURL && (
        <div>
          <h2>Recorded Video</h2>
          <video src={videoURL} controls style={{ width: '100%', maxHeight: '400px' }} />
        </div>
      )}
    </div>
  );
};

export default Recorder;
