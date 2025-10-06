'use client';

'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { nets, detectSingleFace, TinyFaceDetectorOptions, draw, FaceExpressions } from 'face-api.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function AttendancePage() {
    const { qrId } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [studentId, setStudentId] = useState('');
    const [message, setMessage] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                await nets.faceExpressionNet.loadFromUri(MODEL_URL); // Load face expression model
                setModelsLoaded(true);
                setMessage('Models loaded, please start the camera.');
            } catch (error) {
                console.error("Failed to load face-api models:", error);
                setMessage('Failed to load face-api models');
            }
        };
        loadModels();
    }, []);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/sessions/${qrId}/qr`);
                if (response.ok) {
                    const data = await response.json();
                    const timeoutAt = new Date(data.session.timeoutAt);
                    const now = new Date();
                    const remaining = Math.max(0, Math.floor((timeoutAt.getTime() - now.getTime()) / 1000));
                    setTimeLeft(remaining);
                } else {
                    setMessage('Session not found or expired');
                    setExpired(true);
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
                setMessage('Failed to load session');
            }
        };
        fetchSession();
    }, [qrId]);

    useEffect(() => {
        if (timeLeft <= 0) {
            setExpired(true);
            setMessage('QR code has expired. Attendance cannot be marked.');
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const startCamera = async () => {
        if (!modelsLoaded) {
            setMessage('Models are not loaded yet');
            return;
        }
        if (!window.isSecureContext) {
            setMessage('Camera access requires HTTPS. Please use a secure connection (e.g., ngrok or similar).');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            setMessage('Camera access denied. Please allow camera permissions.');
        }
    };

    const captureFace = async () => {
        if (expired) {
            setMessage('QR code has expired. Attendance cannot be marked.');
            return;
        }
        if (!videoRef.current || !canvasRef.current) return;
        if (!studentId) {
            setMessage('Please enter your Student ID');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Detect face with tinyFaceDetector
        const detection = await detectSingleFace(video, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor().withFaceExpressions();

        if (!detection) {
            setMessage('No face detected, please try again');
            return;
        }

        // Get face descriptor (embedding)
        const faceEmbedding = detection.descriptor;

        // Draw the detected face box on canvas (optional)
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        let dominantExpression: string | undefined;
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw.drawDetections(canvas, [detection.detection]);
            draw.drawFaceLandmarks(canvas, detection.landmarks);
            // Display face expression
            const expressions = detection.expressions;
            dominantExpression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof FaceExpressions;
            ctx.fillText(`Expression: ${dominantExpression}`, detection.detection.box.x, detection.detection.box.y - 10);
        }

        // Convert Float32Array to regular array for JSON serialization
        const faceEmbeddingArray = Array.from(faceEmbedding);

        // Use Gemini API for additional processing (example)
        const apiKey = process.env.GOOGLE_API_KEY;
        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            try {
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                const prompt = `Student ID: ${studentId}, Face detected with expression: ${dominantExpression || 'unknown'}`;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                console.log('Gemini API response:', text);
            } catch (error) {
                console.error('Gemini API error:', error);
            }
        }

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
                    faceEmbedding: JSON.stringify(faceEmbeddingArray),
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
        <div className="p-4 sm:p-6 max-w-lg mx-auto text-center min-h-screen flex flex-col justify-center">
            <img src="/placeholder-logo.svg" alt="Presentifi" className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mark Attendance</h1>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">
                Show your face to the camera and enter your Student ID for session: <strong>{qrId}</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
                <video ref={videoRef} autoPlay muted className="w-full max-w-xs h-48 rounded border border-gray-300" />
                <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                    <label htmlFor="studentId" className="font-semibold text-sm sm:text-base">Student ID</label>
                    <input
                        id="studentId"
                        type="text"
                        placeholder="e.g., S001"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="input input-bordered w-full"
                    />
                    <button onClick={captureFace} className="btn btn-primary w-full mt-2" disabled={expired}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h1l1-2h14l1 2h1v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14a3 3 0 100-6 3 3 0 000 6z" />
                        </svg>
                        Capture Photo & Submit
                    </button>
                </div>
            </div>
            <button onClick={startCamera} className="btn btn-secondary mb-4 w-full max-w-xs" disabled={expired || !modelsLoaded}>
                Start Camera
            </button>
            <p className="text-sm text-gray-500 mb-4">Time left: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong></p>
            <button className="text-blue-600 underline text-sm" onClick={() => alert('Accessibility mode coming soon')}>
                Use Accessibility Mode
            </button>
            <p className="mt-4 text-center text-red-600 text-sm">{message}</p>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
