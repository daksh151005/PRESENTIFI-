'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nets, detectSingleFace, TinyFaceDetectorOptions, draw, FaceExpressions } from 'face-api.js';

export default function AddStudentPage() {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();

    useEffect(() => {
        const loadModels = async () => {
            const MODEL_URL = '/models';
            try {
                await nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                await nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                await nets.faceExpressionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
                setMessage('Models loaded, please start the camera.');
            } catch (error) {
                console.error("Failed to load face-api models:", error);
                setMessage('Failed to load face-api models');
            }
        };
        loadModels();
    }, []);

    const startCamera = async () => {
        if (!modelsLoaded) {
            setMessage('Models are not loaded yet');
            return;
        }
        if (!window.isSecureContext) {
            setMessage('Camera access requires HTTPS. Please use a secure connection.');
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
        if (!videoRef.current || !canvasRef.current || !name) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        try {
            const detection = await detectSingleFace(video, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (!detection) {
                setMessage('No face detected. Please try again.');
                return;
            }

            const faceEmbedding = detection.descriptor;

            // Send to API
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, faceEmbedding }),
            });

            if (res.ok) {
                setMessage('Student added successfully!');
                router.push('/students');
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to add student');
            }
        } catch (error) {
            console.error('Error capturing face:', error);
            setMessage('Error capturing face');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Add New Student</h1>
            <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium mb-2">Student Name</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Enter student name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full"
                />
            </div>
            <div className="flex items-center justify-center gap-6 mb-6">
                <video ref={videoRef} autoPlay muted className="w-48 h-36 rounded border border-gray-300" />
                <div className="flex flex-col items-start gap-3">
                    <button onClick={startCamera} className="btn btn-secondary w-full">
                        Start Camera
                    </button>
                    <button onClick={captureFace} className="btn btn-primary w-full" disabled={!name || !modelsLoaded}>
                        Capture Face & Add Student
                    </button>
                </div>
            </div>
            <p className="mt-4 text-center text-red-600">{message}</p>
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
