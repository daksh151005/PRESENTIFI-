-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "faceEmbedding" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "qrId" TEXT NOT NULL,
    "subject" TEXT,
    "teacher" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "wifi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeoutAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "markedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gpsValid" BOOLEAN NOT NULL DEFAULT false,
    "wifiValid" BOOLEAN NOT NULL DEFAULT false,
    "faceValid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_qrId_key" ON "Session"("qrId");
