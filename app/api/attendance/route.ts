import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to calculate distance between two points (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Convert to meters
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}



export async function GET() {
    try {
        const attendances = await prisma.attendance.findMany({
            include: {
                student: true,
                session: true,
            },
            orderBy: {
                markedAt: 'desc',
            },
        });

        return NextResponse.json(attendances);
    } catch (error) {
        console.error('Error fetching attendances:', error);
        return NextResponse.json({ error: 'Failed to fetch attendances' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { qrId, studentId, photo, latitude, longitude, wifi } = await request.json();

        // Find session
        const session = await prisma.session.findUnique({
            where: { qrId },
        });

        if (!session) {
            return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 });
        }

        // Check timeout
        if (new Date() > session.timeoutAt) {
            return NextResponse.json({ error: 'Session expired' }, { status: 410 });
        }

        // Find student
        const student = await prisma.student.findUnique({
            where: { studentId },
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Validate GPS (within 100m)
        const distance = getDistance(session.latitude, session.longitude, latitude, longitude);
        const gpsValid = distance <= 100;

        // Validate WiFi (simple check if matches)
        const wifiValid = session.wifi ? wifi === session.wifi : true;

        // Create attendance
        const attendance = await prisma.attendance.create({
            data: {
                studentId: student.id,
                sessionId: session.id,
                gpsValid,
                wifiValid,
                faceValid: true, // Since photo is captured
                photo,
                latitude,
                longitude,
                wifi,
            },
        });

        return NextResponse.json({
            success: true,
            attendance,
            validations: { gpsValid, wifiValid },
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
    }
}
