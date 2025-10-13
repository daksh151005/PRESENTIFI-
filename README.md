# PRESENTIFI - Attendance Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Google AI](https://img.shields.io/badge/AI-Google%20Generative%20AI-FF6F00?logo=google)
![Build](https://img.shields.io/badge/Build-Passing-success)

## Overview
**PRESENTIFI** is a modern, secure, and intelligent attendance management system built with **Next.js** and **Google Generative AI**. It leverages **QR Codes**, **Facial Recognition**, **GPS**, and **WiFi Validation** to ensure **accurate, real-time, and tamper-proof attendance tracking**.

## Features
- QR Code Scanning – Generate unique session-based QR codes with time and location restrictions  
- Facial Recognition – AI-powered face verification using Google Generative AI  
- Multi-Layer Validation – Combines GPS, WiFi, and facial recognition for enhanced authenticity  
- Real-Time Monitoring – Live dashboard with auto-refresh every few seconds  
- Student Management – Add and manage student profiles with face embeddings  
- Session Management – Create, customize, and control attendance sessions  
- Photo Verification – Optional photo capture during attendance marking  
- Responsive Design – Tailwind CSS + Radix UI for a clean, adaptive interface  

## Tech Stack
| Category | Technologies |
|-----------|--------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Radix UI |
| Database | Prisma ORM with SQLite |
| AI/ML | Google Generative AI (Facial Recognition) |
| Validation | QR Codes, GPS, WiFi Network |
| Deployment | HTTPS-enabled Secure Development |

## Installation & Setup
**1. Clone the Repository**  
`git clone <repository-url>`  
`cd PRESENTIFI`  

**2. Install Dependencies**  
`npm install`  
_or_  
`pnpm install`  

**3. Set Up Database**  
`npx prisma generate`  
`npx prisma db push`  
`npx prisma db seed`  

**4. Configure Environment Variables**  
Create a `.env.local` file in the project root and add:  
`GOOGLE_AI_API_KEY=your_google_ai_api_key`  

**5. Run the Development Server**  
`npm run dev`  
Then open your browser and visit: [https://localhost:3000](https://localhost:3000)

## Usage Guide
### For Teachers
- Create a new session with GPS and WiFi constraints  
- Generate a session QR code  
- Monitor real-time attendance on the dashboard  

### For Students
- Scan the session QR code using a mobile or web scanner  
- Allow camera access for facial recognition  
- Verify GPS and WiFi if required  
- Attendance is automatically marked upon validation  

## API Overview
### Sessions
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /api/sessions | List all sessions |
| POST | /api/sessions | Create a new session |
| GET | /api/sessions/[id]/qr | Generate QR code for session |
| GET | /api/sessions/[id]/attendances | Get attendances for session |

### Students
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /api/students | List all students |
| POST | /api/students | Add new student |
| GET | /api/students/[id]/attendances | Get student’s attendance history |

### Attendance
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | /api/attendance | Get all attendances (supports date filtering) |
| POST | /api/attendance | Mark attendance (internal use) |

## Database Schema
### Student
| Field | Type | Description |
|--------|------|-------------|
| id | String | Unique identifier |
| studentId | String | Student ID number |
| name | String | Full name |
| faceEmbedding | JSON | AI-generated face embedding |
| createdAt | DateTime | Registration timestamp |

### Session
| Field | Type | Description |
|--------|------|-------------|
| id | String | Unique identifier |
| qrId | String | Unique QR code identifier |
| subject | String | Subject name |
| teacher | String | Teacher name |
| latitude / longitude | Float | Location coordinates |
| wifi | String | WiFi SSID/IP range |
| createdAt | DateTime | Session creation time |
| timeoutAt | DateTime | Session expiration time |

### Attendance
| Field | Type | Description |
|--------|------|-------------|
| id | String | Unique identifier |
| studentId | String | Reference to Student |
| sessionId | String | Reference to Session |
| markedAt | DateTime | Timestamp of attendance marking |
| gpsValid | Boolean | GPS validation status |
| wifiValid | Boolean | WiFi validation status |
| faceValid | Boolean | Facial recognition validation status |
| photo | String | Base64 encoded verification photo |
| latitude / longitude | Float | Attendance location |
| wifi | String | Detected WiFi network |

## Contributing
Contributions are welcome and appreciated.  
Fork the repository → Create a feature branch → Commit changes → Push → Open a Pull Request  
Example:
`git checkout -b feature/amazing-feature`
`git commit -m "Add amazing feature"`
`git push origin feature/amazing-feature`

## Screenshots
<img width="1708" height="952" alt="Screenshot 2025-10-13 at 5 54 22 PM" src="https://github.com/user-attachments/assets/c61babdc-e99a-4fef-9344-47bf4c3cbf87" />
<img width="1708" height="952" alt="image" src="https://github.com/user-attachments/assets/608f6958-b1f4-44f5-bb79-4bb9ac95ac00" />
<img width="603" height="1311" alt="IMG_5883" src="https://github.com/user-attachments/assets/0b0a82c4-509a-445d-b382-3062c37d28c8" />
<img width="3416" height="1904" alt="image" src="https://github.com/user-attachments/assets/a7d2845a-2407-4000-9866-fee3ee9bc775" />

