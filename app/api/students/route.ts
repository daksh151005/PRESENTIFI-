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
        const { name, faceEmbedding } = await request.json();

        if (!name || !faceEmbedding) {
            return NextResponse.json({ error: 'Name and faceEmbedding are required' }, { status: 400 });
        }

        // Generate studentId
        const lastStudent = await prisma.student.findFirst({ orderBy: { studentId: 'desc' } });
        let studentId = 'S001';
        if (lastStudent) {
            const num = parseInt(lastStudent.studentId.slice(1)) + 1;
            studentId = 'S' + num.toString().padStart(3, '0');
        }

        const student = await prisma.student.create({
            data: {
                studentId,
                name,
                faceEmbedding: JSON.stringify(faceEmbedding),
            },
        });

        return NextResponse.json(student);
    } catch (error) {
        console.error('Error creating student:', error);
        return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
    }
}
