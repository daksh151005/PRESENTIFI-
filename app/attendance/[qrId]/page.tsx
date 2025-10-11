'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { nets, detectSingleFace, TinyFaceDetectorOptions, draw, FaceExpressions, FaceMatcher, LabeledFaceDescriptors } from 'face-api.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function AttendancePage() {
    const { qrId } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [message, setMessage] = useState('Loading...');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [faceMatcher, setFaceMatcher] = useState<FaceMatcher | null>(null);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [expired, setExpired] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const detectionInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                await nets.faceExpressionNet.loadFromUri(MODEL_URL); // Load face expression model
                setModelsLoaded(true);
                setMessage('Models loaded, loading session...');
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
                    if (remaining > 0) {
                        setMessage('Session valid, starting camera...');
                        await fetchStudents();
                        startCamera();
                    } else {
                        setExpired(true);
                        setMessage('Session expired');
                    }
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

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/students');
            if (response.ok) {
                const studentData = await response.json();
                setStudents(studentData);

                // Create labeled face descriptors
                const labeledDescriptors = studentData
                    .filter((s: any) => s.faceEmbedding)
                    .map((s: any) => {
                        const descriptor = new Float32Array(JSON.parse(s.faceEmbedding));
                        return new LabeledFaceDescriptors(s.studentId, [descriptor]);
                    });

                if (labeledDescriptors.length > 0) {
                    const matcher = new FaceMatcher(labeledDescriptors, 0.6);
                    setFaceMatcher(matcher);
                    setMessage('Students loaded, ready for face recognition.');
                } else {
                    setMessage('No students with face embeddings found.');
                }
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
            setMessage('Failed to load students');
        }
    };

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
        const isLocalhost = window.location.hostname.includes('localhost');
        const isPrivateIP = /^(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(window.location.hostname);
        if (!window.isSecureContext && !isLocalhost && !isPrivateIP) {
            setMessage('Camera access requires HTTPS. Please use a secure connection (e.g., ngrok or similar).');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setScanning(true);
                setMessage('Camera started, scanning for faces...');
                startDetection();
            }
        } catch (error) {
            console.error('Camera error:', error);
            setMessage('Camera access denied. Please allow camera permissions in the browser prompt and reload the page.');
        }
    };

    const startDetection = () => {
        if (detectionInterval.current) clearInterval(detectionInterval.current);
        detectionInterval.current = setInterval(async () => {
            if (!videoRef.current || !faceMatcher || attendanceMarked || expired) return;
            await detectAndMatchFace();
        }, 2000); // Scan every 2 seconds
    };

    const detectAndMatchFace = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Detect face
        const detection = await detectSingleFace(video, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor().withFaceExpressions();

        if (!detection) {
            return;
        }

        // Draw detection
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw.drawDetections(canvas, [detection.detection]);
            draw.drawFaceLandmarks(canvas, detection.landmarks);
            const expressions = detection.expressions;
            const dominantExpression = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0] as keyof FaceExpressions;
            ctx.fillText(`Expression: ${dominantExpression}`, detection.detection.box.x, detection.detection.box.y - 10);
        }

        // Match face
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        const label = bestMatch.toString();
        const distance = bestMatch.distance;

        if (distance < 0.6) {
            setMessage(`Face matched: ${label}. Marking attendance...`);
            markAttendance(label, detection.descriptor, dominantExpression);
        } else {
            setMessage('Face not recognized. Please try again.');
        }
    };

    const markAttendance = async (matchedStudentId: string, faceDescriptor: Float32Array, expression?: string) => {
        if (attendanceMarked || expired) return;

        setAttendanceMarked(true);
        if (detectionInterval.current) clearInterval(detectionInterval.current);

        try {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const wifi = 'CollegeWiFi'; // Placeholder

                const response = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        qrId,
                        studentId: matchedStudentId,
                        faceEmbedding: JSON.stringify(Array.from(faceDescriptor)),
                        latitude,
                        longitude,
                        wifi,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    setMessage(`Attendance marked successfully for ${matchedStudentId}!`);
                } else {
                    setMessage(data.error || 'Failed to mark attendance');
                    setAttendanceMarked(false);
                    startDetection(); // Retry
                }
            }, (error) => {
                setMessage('Location access denied. Attendance not marked.');
                setAttendanceMarked(false);
                startDetection();
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            setMessage('Error marking attendance');
            setAttendanceMarked(false);
            startDetection();
        }
    };

    useEffect(() => {
        return () => {
            if (detectionInterval.current) clearInterval(detectionInterval.current);
            if (videoRef.current && videoRef.current.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="p-4 sm:p-6 max-w-lg mx-auto text-center min-h-screen flex flex-col justify-center">
            <img src="/placeholder-logo.svg" alt="Presentifi" className="mx-auto mb-4 w-12 h-12 sm:w-16 sm:h-16" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mark Attendance</h1>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-gray-600">
                Show your face to the camera for session: <strong>{qrId}</strong>. Attendance will be marked automatically upon recognition.
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
                <video ref={videoRef} autoPlay muted className="w-full max-w-xs h-48 rounded border border-gray-300" />
                <canvas ref={canvasRef} className="w-full max-w-xs h-48 rounded border border-gray-300" />
            </div>
            {scanning && (
                <p className="text-sm text-blue-600 mb-4">Scanning for faces...</p>
            )}
            <p className="text-sm text-gray-500 mb-4">Time left: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong></p>
            <button className="text-blue-600 underline text-sm" onClick={() => alert('Accessibility mode coming soon')}>
                Use Accessibility Mode
            </button>
            <p className="mt-4 text-center text-red-600 text-sm">{message}</p>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
