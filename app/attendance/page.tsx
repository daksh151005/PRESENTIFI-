"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export default function AttendancePage() {
    const [attendances, setAttendances] = useState<Attendance[]>([])

    useEffect(() => {
        fetchAttendances()
        const interval = setInterval(fetchAttendances, 10000) // Poll every 10 seconds
        return () => clearInterval(interval)
    }, [])

    const fetchAttendances = async () => {
        try {
            const res = await fetch('/api/attendance')
            const data = await res.json()
            setAttendances(data)
        } catch (error) {
            console.error('Failed to fetch attendances:', error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Attendance Records</h1>
                    <p className="text-muted-foreground">View all attendance records with student and session details.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Attendances</CardTitle>
                    <CardDescription>Showing {attendances.length} attendance records</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b text-left text-sm text-muted-foreground">
                                    <th className="pb-3 font-medium">Student</th>
                                    <th className="pb-3 font-medium">Session</th>
                                    <th className="pb-3 font-medium">Marked At</th>
                                    <th className="pb-3 font-medium">Validations</th>
                                    <th className="pb-3 font-medium">Photo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendances.map((attendance) => (
                                    <tr key={attendance.id} className="border-b last:border-0">
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={attendance.photo} alt={attendance.student.name} />
                                                    <AvatarFallback>{attendance.student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{attendance.student.name}</div>
                                                    <div className="text-sm text-muted-foreground">{attendance.student.studentId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div>
                                                <div className="font-medium">{attendance.session.qrId}</div>
                                                {attendance.session.subject && (
                                                    <div className="text-sm text-muted-foreground">{attendance.session.subject}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 text-muted-foreground">
                                            {new Date(attendance.markedAt).toLocaleString()}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex gap-1">
                                                <Badge variant={attendance.gpsValid ? "default" : "destructive"}>
                                                    GPS
                                                </Badge>
                                                <Badge variant={attendance.wifiValid ? "default" : "destructive"}>
                                                    WiFi
                                                </Badge>
                                                <Badge variant={attendance.faceValid ? "default" : "destructive"}>
                                                    Face
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            {attendance.photo ? (
                                                <img
                                                    src={attendance.photo}
                                                    alt="Attendance photo"
                                                    className="h-10 w-10 rounded object-cover"
                                                />
                                            ) : (
                                                <span className="text-muted-foreground">No photo</span>
                                            )}
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
