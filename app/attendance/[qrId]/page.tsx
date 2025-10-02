'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AttendancePage() {
    const { qrId } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [studentId, setStudentId] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Load face-api.js models (assuming models are in public/models)
        // For simplicity, placeholder
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            setMessage('Camera access denied');
        }
    };

    const captureFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        if (!studentId) {
            setMessage('Please enter your Student ID');
            return;
        }

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Placeholder: in real app, use face-api.js to detect and get descriptor
        const faceEmbedding = JSON.stringify([0.1, 0.2, 0.3]); // Placeholder

        // Get location
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            // Get WiFi (placeholder)
            const wifi = 'CollegeWiFi'; // In real app, get from browser API or input

            // Send to API
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    qrId,
                    studentId,
                    faceEmbedding,
                    latitude,
                    longitude,
                    wifi,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Attendance marked successfully!');
            } else {
                setMessage(data.error || 'Failed to mark attendance');
            }
        });
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Mark Attendance</h1>
            <p className="mb-4 text-center">
                Show your face to the camera and enter your Student ID for session: <strong>{qrId}</strong>
            </p>
            <input
                type="text"
                placeholder="e.g., S001"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="input input-bordered w-full mb-4"
            />
            <button onClick={startCamera} className="btn btn-primary mb-4 w-full">
                Start Camera
            </button>
            <video ref={videoRef} autoPlay className="border mb-4 w-full rounded" />
            <canvas ref={canvasRef} className="hidden" />
            <button onClick={captureFace} className="btn btn-secondary w-full">
                Capture Photo & Submit
            </button>
            <p className="mt-4 text-center">{message}</p>
        </div>
    );
}
