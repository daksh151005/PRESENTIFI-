import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const students = await prisma.student.findMany();
        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, studentId } = await request.json();

        if (!name || !studentId) {
            return NextResponse.json({ error: 'Name and studentId are required' }, { status: 400 });
        }

        const student = await prisma.student.create({
            data: {
                studentId,
                name,
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}
