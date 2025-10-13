"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, MoreHorizontal } from "lucide-react"
import { students as sampleStudents } from "@/lib/data"
import Link from "next/link"

interface Attendance {
  id: string
  markedAt: string
  gpsValid: boolean
  wifiValid: boolean
  faceValid: boolean
  photo?: string
  latitude?: number
  longitude?: number
  wifi?: string
  student: {
    id: string
    studentId: string
    name: string
  }
  session: {
    id: string
    qrId: string
    subject?: string
  }
}

interface Student {
  id: string
  studentId: string
  name: string
}

export default function DashboardPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [attendanceRes, studentsRes] = await Promise.all([
        fetch('/api/attendance?date=today'),
        fetch('/api/students')
      ])
      const attendanceData = await attendanceRes.json()
      const studentsData = await studentsRes.json()
      setAttendances(attendanceData)
      setStudents(studentsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalStudents = students.length
  const presentToday = attendances.length
  const absentToday = totalStudents - presentToday
  const attendancePercentage = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled in current courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-muted-foreground">{attendancePercentage}% attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absentToday}</div>
            <p className="text-xs text-muted-foreground">For the latest session</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-sm font-medium">New Session</CardTitle>
            <CardDescription className="text-primary-foreground/70">Ready to start a class?</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/sessions/new">
              <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                Start a new session
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Attendance</CardTitle>
          <CardDescription>A list of all students and their attendance status for today.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading attendance data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Marked At</th>
                    <th className="pb-3 font-medium">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const attendance = attendances.find((a) => a.student.studentId === student.studentId)
                    const status = attendance ? "present" : "absent"

                    return (
                      <tr key={student.id} className="border-b last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={attendance?.photo || "/placeholder.svg"} alt={student.name} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">{student.studentId}</td>
                        <td className="py-4">
                          <Badge
                            variant={status === "present" ? "default" : "destructive"}
                            className={
                              status === "present"
                                ? "bg-success text-success-foreground hover:bg-success/90"
                                : ""
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {attendance ? new Date(attendance.markedAt).toLocaleString() : "-"}
                        </td>
                        <td className="py-4">
                          {attendance?.photo ? (
                            <img
                              src={attendance.photo}
                              alt="Attendance photo"
                              className="h-10 w-10 rounded object-cover"
                            />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
