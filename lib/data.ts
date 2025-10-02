export interface Student {
  id: string
  name: string
  studentId: string
  avatar: string
  overallAttendance: number
}

export interface AttendanceRecord {
  studentId: string
  status: "present" | "absent" | "late"
  timestamp?: string
  date?: string
  location?: string
}

export interface Session {
  id: string
  course: string
  status: "live" | "completed"
  date: string
  attendance: number
  totalStudents: number
}

export const students: Student[] = [
  {
    id: "S001",
    name: "Alice Johnson",
    studentId: "S001",
    avatar: "/professional-woman.png",
    overallAttendance: 100,
  },
  {
    id: "S002",
    name: "Bob Williams",
    studentId: "S002",
    avatar: "/professional-man.png",
    overallAttendance: 75,
  },
  {
    id: "S003",
    name: "Charlie Brown",
    studentId: "S003",
    avatar: "/person-student.jpg",
    overallAttendance: 50,
  },
  {
    id: "S004",
    name: "Diana Miller",
    studentId: "S004",
    avatar: "/woman-student.png",
    overallAttendance: 100,
  },
  {
    id: "S005",
    name: "Ethan Davis",
    studentId: "S005",
    avatar: "/man-student.png",
    overallAttendance: 100,
  },
  {
    id: "S006",
    name: "Fiona Garcia",
    studentId: "S006",
    avatar: "/professional-woman.png",
    overallAttendance: 0,
  },
  {
    id: "S007",
    name: "George Rodriguez",
    studentId: "S007",
    avatar: "/professional-man.png",
    overallAttendance: 100,
  },
  {
    id: "S008",
    name: "Hannah Wilson",
    studentId: "S008",
    avatar: "/woman-student.png",
    overallAttendance: 100,
  },
  {
    id: "S009",
    name: "Ian Martinez",
    studentId: "S009",
    avatar: "/man-student.png",
    overallAttendance: 50,
  },
  {
    id: "S010",
    name: "Jane Anderson",
    studentId: "S010",
    avatar: "/professional-woman.png",
    overallAttendance: 100,
  },
]

export const sessions: Session[] = [
  {
    id: "1",
    course: "CS101: Intro to Computer Science",
    status: "completed",
    date: "2024-07-28",
    attendance: 38,
    totalStudents: 40,
  },
  {
    id: "2",
    course: "MA203: Linear Algebra",
    status: "completed",
    date: "2024-07-27",
    attendance: 25,
    totalStudents: 30,
  },
  {
    id: "3",
    course: "PHY301: Quantum Mechanics",
    status: "completed",
    date: "2024-07-26",
    attendance: 18,
    totalStudents: 20,
  },
  {
    id: "4",
    course: "CS101: Intro to Computer Science",
    status: "completed",
    date: "2024-07-21",
    attendance: 39,
    totalStudents: 40,
  },
]

export const todayAttendance: AttendanceRecord[] = [
  { studentId: "S001", status: "present" },
  { studentId: "S002", status: "present" },
  { studentId: "S003", status: "absent" },
  { studentId: "S004", status: "present" },
  { studentId: "S005", status: "late" },
  { studentId: "S006", status: "absent" },
  { studentId: "S007", status: "present" },
  { studentId: "S008", status: "present" },
  { studentId: "S009", status: "absent" },
  { studentId: "S010", status: "present" },
]
