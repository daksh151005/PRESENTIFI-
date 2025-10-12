import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create sample students
    const students = [
        { studentId: 'S001', name: 'Alice Johnson' },
        { studentId: 'S002', name: 'Bob Smith' },
        { studentId: 'S003', name: 'Charlie Brown' },
        { studentId: 'S004', name: 'Diana Prince' },
        { studentId: 'S005', name: 'Eve Wilson' },
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
