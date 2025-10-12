'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddStudentPage() {
    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [message, setMessage] = useState('');
    const router = useRouter();

    const addStudent = async () => {
        if (!name || !studentId) {
            setMessage('Please fill in all fields');
            return;
        }

        try {
            const res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, studentId }),
            });

            if (res.ok) {
                setMessage('Student added successfully!');
                router.push('/students');
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to add student');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            setMessage('Error adding student');
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Add New Student</h1>
            <div className="mb-6">
                <label htmlFor="studentId" className="block text-sm font-medium mb-2">Student ID</label>
                <input
                    id="studentId"
                    type="text"
                    placeholder="Enter student ID"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="input input-bordered w-full mb-4"
                />
                <label htmlFor="name" className="block text-sm font-medium mb-2">Student Name</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Enter student name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input input-bordered w-full"
                />
            </div>
            <button onClick={addStudent} className="btn btn-primary w-full">
                Add Student
            </button>
            <p className="mt-4 text-center text-red-600">{message}</p>
        </div>
    );
}
