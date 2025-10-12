'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function AttendancePage() {
    const { qrId } = useParams();
    const [message, setMessage] = useState('Loading session...');
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds
    const [expired, setExpired] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                        setMessage('Session valid. Take a photo to mark attendance.');
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
            } finally {
                setLoading(false);
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPhoto(reader.result as string);
                setMessage('Photo captured. Enter your Student ID and click "Mark Attendance".');
            };
            reader.readAsDataURL(file);
        }
    };

    const markAttendance = async () => {
        if (!photo) return;

        // Get location
        if (!navigator.geolocation) {
            setMessage('Geolocation is not supported');
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;

            try {
                const response = await fetch('/api/attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        qrId,
                        studentId,
                        photo,
                        latitude,
                        longitude,
                        wifi: navigator.onLine ? 'connected' : null, // Simple wifi check
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    setAttendanceMarked(true);
                    setMessage(`Attendance marked successfully! GPS: ${data.validations.gpsValid ? 'Valid' : 'Invalid'}, WiFi: ${data.validations.wifiValid ? 'Valid' : 'Invalid'}`);
                } else {
                    setMessage(data.error || 'Failed to mark attendance');
                }
            } catch (error) {
                console.error('Failed to mark attendance:', error);
                setMessage('Failed to mark attendance');
            }
        }, (error) => {
            console.error('Failed to get location:', error);
            setMessage('Failed to get location');
        });
    };

    if (loading) {
        return (
            <div className="p-6 max-w-md mx-auto text-center min-h-screen flex flex-col justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg">Loading session...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-md mx-auto text-center min-h-screen flex flex-col justify-center">
            <img src="/placeholder-logo.svg" alt="Presentifi" className="mx-auto mb-6 w-20 h-20" />
            <h1 className="text-3xl font-bold mb-4">Mark Attendance</h1>
            <p className="mb-6 text-base text-gray-600">
                For session: <strong>{qrId}</strong>
            </p>
            {!expired && (
                <div className="mb-6">
                    <label htmlFor="photo" className="block text-lg font-medium text-gray-700 mb-4">Take Photo</label>
                    <input
                        id="photo"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoChange}
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                        disabled={attendanceMarked || expired}
                    />
                </div>
            )}
            {photo && (
                <div className="flex flex-col items-center gap-4 mb-6">
                    <img src={photo} alt="Captured" className="w-full h-64 rounded-lg border-2 border-gray-300 object-cover" />
                </div>
            )}
            <div className="mb-6">
                <label htmlFor="studentId" className="block text-lg font-medium text-gray-700 mb-4">Student ID</label>
                <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="Enter your Student ID"
                    disabled={attendanceMarked || expired}
                />
            </div>
            <button
                onClick={markAttendance}
                disabled={attendanceMarked || expired || !studentId.trim() || !photo}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-lg font-semibold"
            >
                {attendanceMarked ? 'Attendance Marked' : 'Mark Attendance'}
            </button>
            <p className="text-lg text-gray-500 mt-6">Time left: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong></p>
            <p className="mt-6 text-center text-red-600 text-lg">{message}</p>
        </div>
    );
}
