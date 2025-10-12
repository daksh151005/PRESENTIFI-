import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const studentId = params.id;

        const attendances = await prisma.attendance.findMany({
            where: { studentId },
            include: {
                session: true,
            },
            orderBy: { markedAt: 'desc' },
        });

        return NextResponse.json(attendances);
    } catch (error) {
        console.error('Error fetching attendances:', error);
        return NextResponse.json({ error: 'Failed to fetch attendances' }, { status: 500 });
    }
}
