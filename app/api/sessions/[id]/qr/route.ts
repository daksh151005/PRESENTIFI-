import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

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

        // Generate QR code data URL
        const qrCodeDataUrl = await QRCode.toDataURL(params.id);

        return NextResponse.json({ qrCodeDataUrl, session });
    } catch (error) {
        console.error('Error fetching QR:', error);
        return NextResponse.json({ error: 'Failed to fetch QR' }, { status: 500 });
    }
}
