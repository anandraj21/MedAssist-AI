# 🏥 MedAssist AI — AI-Powered Healthcare Platform

A full-stack MERN application with AI-powered symptom checking, smart doctor matching, real-time consultations, and prescription management.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| AI | Anthropic Claude (claude-sonnet-4) |
| Real-time | Socket.io |
| Auth | JWT (JSON Web Tokens) |
| Fonts | DM Sans + Playfair Display |

---

## 📁 Project Structure

```
medassist/
├── frontend/          # React app (Vite)
│   └── src/
│       ├── components/   # Navbar, Sidebar, ChatBot, AppointmentCard
│       ├── pages/        # Login, Register, Dashboard, Appointment, etc.
│       ├── services/     # API calls (api.js, auth.js, aiService.js)
│       ├── context/      # AuthContext
│       └── App.jsx       # Routes
│
└── backend/           # Express API
    ├── config/        # MongoDB connection
    ├── controllers/   # Auth, Appointments, AI, Chat
    ├── models/        # User, Appointment, Prescription
    ├── routes/        # API routes
    ├── middleware/    # JWT auth middleware
    ├── socket/        # Socket.io real-time logic
    └── server.js      # Entry point
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

---

### 1. Clone & Setup Backend

```bash
cd medassist/backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/medassist
JWT_SECRET=your_super_secret_key_here
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 2. Setup Frontend

```bash
cd medassist/frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| **Patient** | Dashboard, Book appointments, AI symptom checker, Chat, Prescriptions |
| **Doctor** | Dashboard, Manage appointments, Write prescriptions, AI summary generation, Chat |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register patient or doctor |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/doctors` | List all doctors |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/appointments` | Book appointment (patient) |
| GET | `/api/appointments/my` | My appointments (patient) |
| GET | `/api/appointments/doctor` | My patients (doctor) |
| PUT | `/api/appointments/:id` | Update status |
| POST | `/api/appointments/:id/prescription` | Save prescription (doctor) |
| GET | `/api/appointments/prescriptions` | My prescriptions (patient) |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/symptom-check` | AI symptom analysis |
| POST | `/api/ai/chat` | AI chat assistant |
| POST | `/api/ai/summarize` | Generate prescription summary |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `register` | Client → Server | Register user with socket |
| `join_room` | Client → Server | Join consultation room |
| `send_message` | Client → Server | Send chat message |
| `receive_message` | Server → Client | Receive chat message |
| `typing` | Client → Server | Typing indicator |
| `user_typing` | Server → Client | Show typing to others |

---

## 🤖 AI Features

1. **Symptom Checker** — Patient enters symptoms → Claude analyzes and suggests specialist + urgency level
2. **AI Chat Bot** — Floating chatbot available across the app for health queries
3. **Prescription Summary** — Doctor fills prescription → Claude generates patient-friendly summary
4. **Consultation AI** — AI assistant embedded in the real-time chat for quick medical queries

---

## 🗄️ Database Schema

### Users
```json
{ "name": "", "email": "", "password": "", "role": "patient|doctor|admin",
  "specialization": "", "experience": 0, "consultationFee": 500,
  "age": 0, "bloodGroup": "", "phone": "" }
```

### Appointments
```json
{ "patientId": "ObjectId", "doctorId": "ObjectId", "date": "Date",
  "timeSlot": "", "symptoms": "", "aiSuggestion": "",
  "status": "pending|confirmed|completed|cancelled", "type": "online|in-person" }
```

### Prescriptions
```json
{ "appointmentId": "ObjectId", "patientId": "ObjectId", "doctorId": "ObjectId",
  "diagnosis": "", "doctorNotes": "", "medicines": [],
  "aiSummary": "", "followUpDate": "Date" }
```

---

## 🎨 Pages

| Page | Route | Role |
|------|-------|------|
| Login | `/login` | All |
| Register | `/register` | All |
| Dashboard | `/dashboard` | All |
| Book Appointment | `/appointments` | Patient |
| AI Symptom Checker | `/symptom-checker` | Patient |
| Prescriptions | `/prescriptions` | Patient |
| Doctor Panel | `/doctor-panel` | Doctor |
| Consultation Chat | `/chat` | All |

---

## 📦 Building for Production

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend - use PM2
npm install -g pm2
cd backend
pm2 start server.js --name medassist-api
```

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a long random string in production
- Never commit your `.env` file
- Use HTTPS in production
- MongoDB Atlas recommended for cloud deployment

---

## 📞 Support

Built with ❤️ using MERN + Claude AI
