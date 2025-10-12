'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AttendancePage() {
    const { qrId } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [message, setMessage] = useState('Loading session...');
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [expired, setExpired] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [cameraStarted, setCameraStarted] = useState(false);

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
                        setMessage('Session valid. Click "Start Camera" to begin.');
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
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setCameraStarted(true);
                setMessage('Camera started. Enter your Student ID and click "Mark Attendance".');
            }
        } catch (error) {
            console.error('Camera error:', error);
            setMessage('Camera access denied. Please allow camera permissions in your browser settings and reload the page. If using HTTP, try HTTPS or localhost. For mobile, ensure the site is HTTPS.');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return null;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            return canvas.toDataURL('image/jpeg');
        }
        return null;
    };

    const markAttendance = async () => {
        if (attendanceMarked || expired || !studentId.trim()) return;

        const photo = capturePhoto();
        if (!photo) {
            setMessage('Failed to capture photo');
            return;
        }

        setAttendanceMarked(true);
        setMessage('Marking attendance...');

        try {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const wifi = navigator.onLine ? 'Connected' : 'Offline'; // Simple wifi check

                const response = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        qrId,
                        studentId: studentId.trim(),
                        photo,
                        latitude,
                        longitude,
                        wifi,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    setMessage(`Attendance marked successfully for ${studentId}!`);
                } else {
                    setMessage(data.error || 'Failed to mark attendance');
                    setAttendanceMarked(false);
                }
            }, (error) => {
                setMessage('Location access denied. Attendance not marked.');
                setAttendanceMarked(false);
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
            setMessage('Error marking attendance');
            setAttendanceMarked(false);
        }
    };

    useEffect(() => {
        return () => {
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
                For session: <strong>{qrId}</strong>
            </p>
            {!cameraStarted && !expired && (
                <button
                    onClick={startCamera}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 mb-4"
                >
                    Start Camera
                </button>
            )}
            <div className="flex flex-col items-center gap-4 mb-4">
                <video ref={videoRef} autoPlay muted className="w-full max-w-xs h-48 rounded border border-gray-300" />
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="mb-4">
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your Student ID"
                    disabled={attendanceMarked || expired}
                />
            </div>
            <button
                onClick={markAttendance}
                disabled={attendanceMarked || expired || !studentId.trim() || !cameraStarted}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {attendanceMarked ? 'Attendance Marked' : 'Mark Attendance'}
            </button>
            <p className="text-sm text-gray-500 mt-4">Time left: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong></p>
            <p className="mt-4 text-center text-red-600 text-sm">{message}</p>
        </div>
    );
}
