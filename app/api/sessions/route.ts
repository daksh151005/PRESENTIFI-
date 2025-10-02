import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

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

        // Generate QR code data URL with qrId encoded
        const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://192.168.1.11:3000'}/attendance/${qrId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);

        return NextResponse.json({ session, qrCodeDataUrl });
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
