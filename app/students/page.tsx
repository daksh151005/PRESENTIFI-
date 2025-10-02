"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { MessageSquare } from "lucide-react"
import { students } from "@/lib/data"

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          A list of all students enrolled in your courses. You can notify students with low attendance.
        </p>
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
                  <th className="pb-3 font-medium">Overall Attendance</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{student.studentId}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <Progress
                          value={student.overallAttendance}
                          className="h-2 w-32"
                          indicatorClassName={
                            student.overallAttendance >= 75
                              ? "bg-primary"
                              : student.overallAttendance >= 50
                                ? "bg-warning"
                                : "bg-destructive"
                          }
                        />
                        <span className="text-sm font-medium">{student.overallAttendance}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      {student.overallAttendance < 75 && (
                        <Button variant="destructive" size="sm" className="gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Notify
                        </Button>
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
