# TODO: Fix Attendance Page Face Scanning

## Steps to Complete
- [x] Download face-api.js models to public/models directory
- [x] Update app/attendance/[qrId]/page.tsx to load face-api.js models on component mount
- [x] Implement real face detection and embedding extraction in captureFace function
- [x] Replace placeholder face embedding with real embedding from face-api.js
- [x] Fix webpack configuration to ignore Node.js modules (fs, encoding) for face-api.js
- [ ] Test the updated attendance page to verify face scanning works

## Notes
- Ensure camera permissions are granted
- Handle cases where no face is detected
- Verify backend API correctly validates the real embeddings
