# TODO: Make Today Attendance Sync Like Live Attendance

## Steps to Complete
- [x] Modify GET /api/attendance to filter attendances by today's date when query param 'date=today' is provided
- [x] Update app/attendance/page.tsx to fetch with '?date=today' and poll every 5 seconds instead of 10

## Notes
- Use date comparison in Prisma query to filter markedAt >= start of today and < start of tomorrow
- Change polling interval from 10000ms to 5000ms for more live-like updates
