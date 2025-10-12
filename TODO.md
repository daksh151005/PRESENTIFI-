# TODO: Implement Simplified Attendance System

## Steps to Complete
- [x] Change session timeout to 60 seconds
- [x] Ensure GPS validation within 100m and WiFi match
- [x] Update attendance page to capture photo on button click with student ID
- [x] Update API to accept studentId and photo, mark attendance
- [x] Add teacher admin panel for managing students and viewing attendances
- [x] Allow students to view their attendance records
- [x] Remove face recognition dependencies and code

## Notes
- Camera starts immediately on page load
- Student enters ID, clicks "Mark Attendance" to capture and submit
- Attendance marked if validations pass
- Teachers can generate QR for sessions with 60s timeout
