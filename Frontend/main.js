let mediaRecorder;
let recordedBlobs;

const videoElement = document.querySelector('video');
const startButton = document.querySelector('#startButton');
const stopButton = document.querySelector('#stopButton');

startButton.addEventListener('click', async () => {
    startButton.disabled = true;
    stopButton.disabled = false;

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoElement.srcObject = stream;

    recordedBlobs = [];
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
    };

    mediaRecorder.start();
});

stopButton.addEventListener('click', () => {
    stopButton.disabled = true;
    startButton.disabled = false;

    mediaRecorder.stop();
    videoElement.srcObject.getTracks().forEach(track => track.stop());

    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    }).then(response => response.json()).then(data => {
        console.log('Server response:', data);
    });
});