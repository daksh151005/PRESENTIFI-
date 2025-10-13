"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const fetchAttendances = useCallback(async () => {
        try {
            const dateParam = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD format
            const res = await fetch(`/api/attendance?date=${dateParam}`)
            const data = await res.json()
            setAttendances(data)
        } catch (error) {
            console.error('Failed to fetch attendances:', error)
        }
    }, [selectedDate])

    useEffect(() => {
        fetchAttendances()
        const interval = setInterval(fetchAttendances, 5000) // Poll every 5 seconds for live sync
        return () => clearInterval(interval)
    }, [fetchAttendances])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Attendance Records</h1>
                    <p className="text-muted-foreground">View all attendance records with student and session details.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[280px] justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
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
                                                <Image
                                                    src={attendance.photo}
                                                    alt="Attendance photo"
                                                    width={40}
                                                    height={40}
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
