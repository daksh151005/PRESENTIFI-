"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, Clock, MapPin, Users } from "lucide-react"

interface Attendance {
  id: string
  studentId: string
  sessionId: string
  markedAt: string
  gpsValid: boolean
  wifiValid: boolean
  faceValid: boolean
  student: {
    id: string
    name: string
  }
}

interface Session {
  id: string
  qrId: string
  qrCodeDataUrl: string
  latitude: number
  longitude: number
  wifi?: string
  createdAt: string
  timeoutAt: string
}

export default function NewSessionPage() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [wifi, setWifi] = useState("")
  const [session, setSession] = useState<Session | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    // Get current location with high accuracy and error handling
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Error getting location: ' + error.message + '. Please enable location permissions and try again.')
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }, [])

  const startSession = async () => {
    if (!location) {
      alert('Location not available')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude, wifi }),
      })
      const data = await res.json()
      setSession(data)
      // Start polling for attendances
      pollAttendances(data.id)

      // Start timer for session expiration
      const timeoutAt = new Date(data.session.timeoutAt);
      const updateTimer = () => {
        const now = new Date();
        const diff = Math.max(0, Math.floor((timeoutAt.getTime() - now.getTime()) / 1000));
        setTimeLeft(diff);
        if (diff <= 0) {
          clearInterval(timerId);
        }
      };
      updateTimer();
      const timerId = setInterval(updateTimer, 1000);
    } catch (error) {
      console.error('Failed to start session:', error)
    } finally {
      setLoading(false)
    }
  }

  const pollAttendances = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/attendances`) // Need to create this API
        const data = await res.json()
        setAttendances(data)
      } catch (error) {
        console.error('Failed to fetch attendances:', error)
      }
    }, 5000) // Poll every 5 seconds

    // Clear interval after 60 seconds
    setTimeout(() => clearInterval(interval), 60000)
  }

  const isActive = session && new Date(session.timeoutAt) > new Date()

  return (
    <div className="space-y-6">
      {!session ? (
        <Card>
          <CardHeader>
            <CardTitle>Start New Session</CardTitle>
            <CardDescription>Configure location and WiFi for attendance validation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="wifi">WiFi Network (optional)</Label>
              <Input
                id="wifi"
                value={wifi}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWifi(e.target.value)}
                placeholder="Enter WiFi network name"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Location: {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Getting location...'}
              </p>
            </div>
            <Button onClick={startSession} disabled={!location || loading}>
              {loading ? 'Starting...' : 'Start Session'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Live Session: QR ID {session.qrId}</CardTitle>
                <CardDescription>
                  Students can scan the QR code to mark their attendance. Session expires at {new Date(session.timeoutAt).toLocaleTimeString()}.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <img
                  src={session.qrCodeDataUrl}
                  alt="QR Code"
                  className="h-72 w-72 rounded-lg border-4 border-border"
                />
                <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                  <span className="text-primary">#</span>
                  QR ID: {session.qrId}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Status: {isActive ? 'Active' : 'Expired'}
                  </p>
                  {isActive && (
                    <p className="text-sm text-muted-foreground">
                      Time left: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <CardTitle>Live Attendance</CardTitle>
                </div>
                <CardDescription>{attendances.length} students have checked in.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendances.map((attendance) => (
                    <div key={attendance.id} className="flex items-start gap-3 border-b pb-4 last:border-0">
                      <Avatar>
                        <AvatarFallback>{attendance.student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{attendance.student.name}</p>
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(attendance.markedAt).toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={attendance.gpsValid ? 'text-green-600' : 'text-red-600'}>
                            GPS: {attendance.gpsValid ? '✓' : '✗'}
                          </span>
                          <span className={attendance.wifiValid ? 'text-green-600' : 'text-red-600'}>
                            WiFi: {attendance.wifiValid ? '✓' : '✗'}
                          </span>
                          <span className={attendance.faceValid ? 'text-green-600' : 'text-red-600'}>
                            Face: {attendance.faceValid ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
