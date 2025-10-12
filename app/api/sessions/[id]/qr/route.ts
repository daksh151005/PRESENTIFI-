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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await prisma.session.findUnique({
            where: { qrId: params.id },
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Check if session is still active
        if (new Date() > session.timeoutAt) {
            return NextResponse.json({ error: 'Session expired' }, { status: 410 });
        }

        // Generate QR code data URL with full URL
        const host = request.headers.get('host') || 'localhost:3000';
        const ip = getLocalIP();
        const baseHost = host.split(':')[0];
        const port = host.split(':')[1] || '3000';
        const qrHost = baseHost === 'localhost' ? `${ip}:${port}` : host;
        const qrUrl = `https://${qrHost}/attendance/${params.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);

        return NextResponse.json({ qrCodeDataUrl, session });
    } catch (error) {
        console.error('Error fetching QR:', error);
        return NextResponse.json({ error: 'Failed to fetch QR' }, { status: 500 });
    }
}
