"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Copy, CheckCircle2, Clock, MapPin } from "lucide-react"
import { students } from "@/lib/data"

interface LiveAttendance {
  studentId: string
  timestamp: string
  date: string
  location: string
}

export default function NewSessionPage() {
  const [qrId, setQrId] = useState(2)
  const [progress, setProgress] = useState(0)
  const [copied, setCopied] = useState(false)
  const [liveAttendance, setLiveAttendance] = useState<LiveAttendance[]>([
    {
      studentId: "S001",
      timestamp: "23:54:41",
      date: "02/10/2025",
      location: "Campus Library",
    },
    {
      studentId: "S002",
      timestamp: "23:52:41",
      date: "02/10/2025",
      location: "Campus Library",
    },
    {
      studentId: "S004",
      timestamp: "23:52:41",
      date: "02/10/2025",
      location: "Campus Library",
    },
    {
      studentId: "S005",
      timestamp: "23:51:41",
      date: "02/10/2025",
      location: "Campus Library",
    },
  ])

  const sessionUrl = "https://6000-firebase-studio-1757313885964..."

  // Simulate QR code refresh every 120 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(0)
      setQrId((prev) => prev + 1)
    }, 120000)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 100 / 120
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [])

  // Simulate new students checking in
  useEffect(() => {
    const timeout = setTimeout(() => {
      const remainingStudents = students.filter((s) => !liveAttendance.some((a) => a.studentId === s.id))
      if (remainingStudents.length > 0) {
        const randomStudent = remainingStudents[Math.floor(Math.random() * remainingStudents.length)]
        const now = new Date()
        setLiveAttendance((prev) => [
          {
            studentId: randomStudent.id,
            timestamp: now.toLocaleTimeString("en-US", { hour12: false }),
            date: now.toLocaleDateString("en-GB"),
            location: "Campus Library",
          },
          ...prev,
        ])
      }
    }, 10000)

    return () => clearTimeout(timeout)
  }, [liveAttendance])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const attendedStudents = liveAttendance.map((a) => students.find((s) => s.id === a.studentId)!).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* QR Code Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Live Session: CS101: Intro to Computer Science</CardTitle>
              <CardDescription>
                Students can scan the QR code to mark their attendance. The list will update in real-time. The QR code
                refreshes every 120 seconds.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={`/qr-code-.jpg?height=300&width=300&query=qr+code+${qrId}`}
                  alt="QR Code"
                  className="h-72 w-72 rounded-lg border-4 border-border"
                />
                <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <span className="text-primary">#</span>
                  QR ID: {qrId}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">QR code refreshes automatically</p>
              </div>

              {/* Session URL */}
              <div className="flex w-full max-w-md items-center gap-2">
                <input
                  type="text"
                  value={sessionUrl}
                  readOnly
                  className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Attendance Section */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Live Attendance</CardTitle>
              </div>
              <CardDescription>{liveAttendance.length} students have checked in.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendedStudents.map((student, index) => {
                  const attendance = liveAttendance.find((a) => a.studentId === student.id)!
                  return (
                    <div key={student.id} className="flex items-start gap-3 border-b pb-4 last:border-0">
                      <Avatar>
                        <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{student.name}</p>
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {attendance.timestamp}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {attendance.date}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {attendance.location}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
