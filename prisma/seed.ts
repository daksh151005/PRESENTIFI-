import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create sample students
    const students = [
        { studentId: 'S001', name: 'Alice Johnson', faceEmbedding: JSON.stringify([0.1, 0.2, 0.3]) },
        { studentId: 'S002', name: 'Bob Smith', faceEmbedding: JSON.stringify([0.4, 0.5, 0.6]) },
        { studentId: 'S003', name: 'Charlie Brown', faceEmbedding: JSON.stringify([0.7, 0.8, 0.9]) },
        { studentId: 'S004', name: 'Diana Prince', faceEmbedding: JSON.stringify([1.0, 1.1, 1.2]) },
        { studentId: 'S005', name: 'Eve Wilson', faceEmbedding: JSON.stringify([1.3, 1.4, 1.5]) },
    ];

    for (const student of students) {
        await prisma.student.create({
            data: student,
        });
    }

    console.log('Seeded students');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
