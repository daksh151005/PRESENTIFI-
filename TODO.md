# TODO: Implement Automated Student Attendance Backend

## 1. Setup Database and Dependencies
- [x] Install Prisma, qrcode, face-api.js
- [x] Initialize Prisma with SQLite
- [x] Define database schema (Student, Session, Attendance)

## 2. Create API Routes
- [x] POST /api/sessions: Create new session with QR code and 60s timeout
- [x] GET /api/sessions: List all sessions
- [x] GET /api/sessions/[id]/qr: Return QR code image/data
- [x] POST /api/attendance: Mark attendance with validation (QR active, GPS, WiFi, face)

## 3. Implement QR Code Generation and Timeout
- [x] Generate unique QR ID for each session
- [x] Set 60s timeout, disable after
- [x] Store session location for GPS validation

## 4. Add Face Recognition
- [x] Store student face embeddings in DB (placeholder)
- [x] Frontend: Use face-api.js to capture face and send embeddings
- [x] Backend: Verify face against student's stored embedding (placeholder)

## 5. Location and WiFi Validation
- [x] GPS: Check if within 100m of session location
- [x] WiFi: Validate college network (check IP range or parameter)

## 6. Update Frontend
- [x] Replace mock data with API calls
- [x] Update new session page to generate real QR and show live attendance
- [x] Add face capture page for students

## 7. Testing
- [x] Test QR generation and timeout
- [x] Test attendance marking with validations
- [x] Test face recognition, GPS, WiFi checks
