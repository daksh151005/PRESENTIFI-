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



export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const dateFilter = searchParams.get('date');

        let whereClause = {};
        if (dateFilter) {
            if (dateFilter === 'today') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                whereClause = {
                    markedAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                };
            } else {
                // Assume dateFilter is in YYYY-MM-DD format
                const selectedDate = new Date(dateFilter);
                selectedDate.setHours(0, 0, 0, 0);
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                whereClause = {
                    markedAt: {
                        gte: selectedDate,
                        lt: nextDay,
                    },
                };
            }
        } else {
            // Default to today if no date provided
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            whereClause = {
                markedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            };
        }

        const attendances = await prisma.attendance.findMany({
            where: whereClause,
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

        // Check if student has already marked attendance today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                studentId: student.id,
                markedAt: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        if (existingAttendance) {
            return NextResponse.json({ error: 'Attendance already marked for today' }, { status: 409 });
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
