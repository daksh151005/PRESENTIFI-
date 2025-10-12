"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus } from "lucide-react"
import Link from "next/link"

interface Session {
  id: string
  qrId: string
  latitude: number
  longitude: number
  wifi?: string
  createdAt: string
  timeoutAt: string
  _count: {
    attendances: number
  }
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions')
      const data = await res.json()
      setSessions(data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const isActive = (timeoutAt: string) => new Date(timeoutAt) > new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Manage and view past attendance sessions.</p>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Start New Session
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>Showing {sessions.length} sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">QR ID</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Attendances</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b last:border-0">
                    <td className="py-4 font-medium">{session.qrId}</td>
                    <td className="py-4">
                      <Badge variant={isActive(session.timeoutAt) ? "default" : "secondary"}>
                        {isActive(session.timeoutAt) ? "Active" : "Expired"}
                      </Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {session.latitude.toFixed(4)}, {session.longitude.toFixed(4)}
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {session._count.attendances}
                    </td>
                    <td className="py-4 text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
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
