# MedAssist AI - Setup Instructions

## Quick Setup Guide

### Prerequisites
- Node.js v18+ (already installed)
- MongoDB account (free tier available)
- Anthropic API key

### Step 1: Configure Environment Variables

Edit `backend/.env` and add your credentials:

#### MongoDB Setup:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free account
3. Create a new cluster
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/medassist?retryWrites=true&w=majority`)
5. Copy it to `MONGO_URI` in `.env`

#### Anthropic API Key:
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an account and get your API key
3. Copy it to `ANTHROPIC_API_KEY` in `.env`

#### JWT Secret:
- Change `JWT_SECRET` to a random string (use: `openssl rand -base64 32` on terminal)

### Step 2: Start Backend
```bash
cd backend
npm run dev    # Development mode with auto-reload
# OR
npm start      # Production mode
```
Backend will run on: `http://localhost:5000`

### Step 3: Start Frontend (in another terminal)
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Step 4: Access the Application
- Go to `http://localhost:5173` in your browser
- Register as a patient or doctor
- Start using the app!

### API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/ai/symptom-check` - AI symptom checker
- `POST /api/appointments` - Book appointment
- `GET /api/auth/doctors` - Get list of doctors

### Features
✅ User Authentication (Patient & Doctor)
✅ AI-Powered Symptom Checker
✅ Appointment Booking System
✅ Real-time Chat with Socket.io
✅ Prescription Management
✅ Doctor Panel

### Troubleshooting

**MongoDB Connection Error:**
- Verify `MONGO_URI` is correct in `.env`
- Check if your IP is whitelisted in MongoDB Atlas (Network Access)

**Anthropic API Error:**
- Verify `ANTHROPIC_API_KEY` is correct
- Check if you have API credits

**Port Already in Use:**
- Change `PORT` in `.env` (default: 5000)
- Or kill the process: `npx kill-port 5000 5173`

---

**Happy coding! 🏥**
