'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QrScanner from 'qr-scanner';

export default function QrScannerPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (!videoRef.current) return;

        const scanner = new QrScanner(
            videoRef.current,
            (result) => {
                if (result) {
                    scanner.stop();
                    // Navigate to attendance page with scanned QR code as qrId
                    // Extract only the QR ID from the scanned result if it is a full URL
                    let qrId = result.data;
                    try {
                        const url = new URL(result.data);
                        const paths = url.pathname.split('/');
                        qrId = paths[paths.length - 1];
                    } catch (e) {
                        // Not a URL, use as is
                    }
                    router.push(`/attendance/${qrId}`);
                }
            },
            {
                onDecodeError: (e) => {
                    // Ignore decode errors
                },
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );

        scanner.start().catch((err) => {
            setError('Camera access denied or not available');
        });

        return () => {
            scanner.destroy();
        };
    }, [router]);

    return (
        <div className="p-6 max-w-md mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
            <video ref={videoRef} className="w-full rounded border border-gray-300" />
            {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
    );
}
