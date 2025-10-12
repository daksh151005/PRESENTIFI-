"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AttendanceRecord {
    id: string
    markedAt: string
    gpsValid: boolean
    wifiValid: boolean
    faceValid: boolean
    session: {
        id: string
        subject: string | null
        teacher: string | null
        createdAt: string
    }
}

export default function StudentAttendancePage() {
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [studentId, setStudentId] = useState('')

    useEffect(() => {
        // In a real app, get studentId from auth
        const id = prompt('Enter your Student ID to view attendance:')
        if (id) {
            setStudentId(id)
            fetch(`/api/students/${id}/attendances`)
                .then(res => res.json())
                .then(data => {
                    setAttendances(data)
                    setLoading(false)
                })
                .catch(error => {
                    console.error('Failed to fetch attendances:', error)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [])

    if (loading) {
        return <div className="p-6">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Attendance</h1>
                <p className="text-muted-foreground">
                    View your attendance records for all sessions.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>Showing {attendances.length} attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {attendances.map((attendance) => (
                            <div key={attendance.id} className="flex items-start gap-4 border-b pb-4 last:border-0">
                                <Avatar>
                                    <AvatarFallback>{attendance.session.subject?.charAt(0) || 'S'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{attendance.session.subject || 'Session'}</h3>
                                        <Badge variant={attendance.faceValid && attendance.gpsValid && attendance.wifiValid ? 'default' : 'destructive'}>
                                            {attendance.faceValid && attendance.gpsValid && attendance.wifiValid ? 'Valid' : 'Invalid'}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {attendance.session.teacher} • {new Date(attendance.markedAt).toLocaleString()}
                                    </p>
                                    <div className="flex gap-2">
                                        <Badge variant={attendance.faceValid ? 'default' : 'secondary'}>Face: {attendance.faceValid ? '✓' : '✗'}</Badge>
                                        <Badge variant={attendance.gpsValid ? 'default' : 'secondary'}>GPS: {attendance.gpsValid ? '✓' : '✗'}</Badge>
                                        <Badge variant={attendance.wifiValid ? 'default' : 'secondary'}>WiFi: {attendance.wifiValid ? '✓' : '✗'}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
