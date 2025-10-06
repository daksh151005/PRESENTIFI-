"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Student {
  id: string
  studentId: string
  name: string
  faceEmbedding: string | null
  createdAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch students:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          A list of all students enrolled in your courses.
        </p>
      </div>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/students/add">Add New Student</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>Showing all {students.length} students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Student ID</th>
                  <th className="pb-3 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{student.studentId}</td>
                    <td className="py-4 text-muted-foreground">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
