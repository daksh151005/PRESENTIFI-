import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import os from 'os';

const prisma = new PrismaClient();

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

export async function POST(request: NextRequest) {
    try {
        const { subject, teacher, latitude, longitude, wifi } = await request.json();

        // Generate unique QR ID
        const qrId = Math.random().toString(36).substring(2, 10);

        // Set timeout 60 seconds from now
        const timeoutAt = new Date(Date.now() + 60 * 1000);

        // Create session in DB
        const session = await prisma.session.create({
            data: {
                qrId,
                latitude,
                longitude,
                wifi,
                timeoutAt,
            },
        });

        // Generate QR code data URL with full URL using the request host or local IP
        const host = request.headers.get('host');
        const ip = getLocalIP();
        const baseHost = host ? host.split(':')[0] : 'localhost';
        const port = host ? host.split(':')[1] : '3000';
        const qrHost = baseHost === 'localhost' ? `${ip}:${port}` : host;
        const qrUrl = `http://${qrHost}/attendance/${qrId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);

        return NextResponse.json({ session, qrCodeDataUrl, qrUrl });
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const sessions = await prisma.session.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}
