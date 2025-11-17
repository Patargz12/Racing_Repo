# Toyota Race Analyzer - MVP Document

## 🎯 Project Overview

**Problem:** Toyota hackathon provides 18 Excel files with confusing race data. Users need an easy way to analyze this data.

**Solution:** AI-powered chatbot that answers questions about race data using natural language.

**Example:**

- User: "Who won Race 1?"
- App: "Driver 13 won Race 1 with a time of 45:15.035"

---

## 🏗️ Tech Stack

### **Frontend**

- Next.js 15
- TailwindCSS
- Axios

### **Backend**

- Node.js + Express
- MongoDB Atlas (Free tier)
- Mongoose

### **AI**

- Google Gemini 2.5 Flash (FREE - 1M tokens/month)

### **Deployment**

- Frontend: Vercel (free)
- Backend: Railway or Render (free)
- Database: MongoDB Atlas M0 (free)

**Total Cost: $0** ✅

---

## 📁 Project Structure - Monorepo

```
toyota-chatbot/             # Root project folder
├── frontend/               # Next.js app (frontend)
│   ├── components/         # UI components
│   ├── pages/              # App pages/routes
│   ├── lib/                # Helper functions
│   ├── public/             # Static files
│   ├── next.config.js      # Next.js config
│   └── package.json        # Frontend dependencies
├── backend/                # Express backend (API)
│   ├── controllers/        # Request logic
│   ├── models/             # DB schemas
│   ├── routes/             # API routes
│   ├── config/             # DB/env setup
│   ├── scripts/            # Utility scripts
│   ├── data/               # CSV/sample data
│   ├── server.js           # Server launcher
│   └── package.json        # Backend dependencies
├── .env                    # Single env file (frontend & backend)
└── README.md               # Project info and instructions
```

---

## 🔄 How It Works

### **Simple Flow:**

```
1. User asks: "Who won Race 1?"
        ↓
2. Frontend sends question to Backend API
        ↓
3. Backend sends question to Gemini AI
        ↓
4. Gemini generates MongoDB query
        ↓
5. Backend executes query on database
        ↓
6. Gemini formats results into natural language
        ↓
7. Backend sends answer to Frontend
        ↓
8. User sees: "Driver 13 won Race 1"
```

### **Visual Architecture:**

```
┌──────────────┐
│   User       │
│   Browser    │
└──────┬───────┘
       │ Question
       ↓
┌──────────────────┐
│   Frontend       │
│   (Next.js)      │
│   Port 3000      │
└──────┬───────────┘
       │ HTTP Request
       ↓
┌──────────────────┐      ┌──────────────┐
│   Backend        │─────→│  Gemini AI   │
│   (Express)      │←─────│  2.5 Flash   │
│   Port 5000      │      └──────────────┘
└──────┬───────────┘
       │ Query
       ↓
┌──────────────────┐
│   MongoDB        │
│   (8 Collections)│
│   5,500 records  │
└──────────────────┘
```

---

## 📊 Data Structure

### **18 CSV Files → 8 MongoDB Collections**

| CSV Files (Source)               | MongoDB Collection | Records | Purpose                |
| -------------------------------- | ------------------ | ------- | ---------------------- |
| 03_Provisional_Results (6 files) | RaceResult         | ~138    | Final standings        |
| 05_Results_by_Class (6 files)    | ClassResult        | ~138    | Class-based results    |
| 99_Best_10_Laps (2 files)        | BestLap            | ~440    | Top 10 laps per driver |
| 23_AnalysisEndurance (2 files)   | LapTelemetry       | ~1,183  | Lap-by-lap details     |
| 26_Weather (2 files)             | Weather            | ~89     | Weather conditions     |
| RX_barber_lap_start (2 files)    | LapStart           | ~1,168  | Lap start times        |
| RX_barber_lap_end (2 files)      | LapEnd             | ~1,168  | Lap end times          |
| RX_barber_lap_time (2 files)     | LapTime            | ~1,168  | Lap time events        |

**Total: 5,500+ records**

---

## 💾 Database Schema

### **1. RaceResult**

```javascript
{
  raceNumber: 1,
  position: 1,
  driverNumber: 13,
  status: "Classified",
  laps: 27,
  totalTime: "45:15.035",
  fastestLap: "1:37.428",
  fastestLapKph: 136.8,
  vehicle: "Toyota GR86",
  class: "Am"
}
```

### **2. BestLap**

```javascript
{
  raceNumber: 1,
  driverNumber: 13,
  lapRank: 1,              // 1 = fastest
  lapTime: "1:37.428",
  lapNumber: 8,
  averageTime: "1:37.703"
}
```

### **3. LapTelemetry**

```javascript
{
  raceNumber: 1,
  driverNumber: 13,
  lapNumber: 8,
  lapTime: "1:37.428",
  sector1Time: "31.245",
  sector2Time: "33.891",
  sector3Time: "32.292",
  topSpeed: 195.3,
  kph: 136.8
}
```

### **4. Weather**

```javascript
{
  raceNumber: 1,
  timeUtcStr: "9/6/2025 6:41:18 PM",
  airTemp: 29.8,
  trackTemp: 35.2,
  humidity: 56.75,
  windSpeed: 2.88,
  rain: 0
}
```

---

## 🔄 Data Import Process

### **How Excel Files Become MongoDB Data:**

```
Step 1: Read CSV Files
        ↓
Step 2: Parse with XLSX library
        ↓
Step 3: Convert to JSON objects
        ↓
Step 4: Map to Mongoose schemas
        ↓
Step 5: Insert into MongoDB
```

### **Example Transformation:**

**CSV Row:**

```
NUMBER;VEHICLE;CLASS;BESTLAP_1;BESTLAP_1_LAPNUM
13;Toyota GR86;Am;1:37.428;8
```

**Becomes MongoDB Document:**

```javascript
{
  raceNumber: 1,
  driverNumber: 13,
  lapRank: 1,
  lapTime: "1:37.428",
  lapNumber: 8,
  vehicle: "Toyota GR86",
  class: "Am"
}
```

### **Important Notes:**

- CSV files use **semicolon (;)** delimiter (most files)
- Some files use **comma (,)** delimiter (barber lap files)
- Need to detect delimiter automatically
- Convert "-" strings to null values
- Extract race number from filename

---

## 🎨 UI Design - Toyota Racing Theme

### **Color Palette:**

```
Toyota Red:    #EB0A1E  (Primary - buttons, accents)
Racing Black:  #1A1A1A  (Background)
Carbon Gray:   #2D2D2D  (Cards, message bubbles)
Steel Gray:    #4A4A4A  (Borders)
White:         #FFFFFF  (Text)
```

### **Design Style:**

- Bold and sporty
- Sharp angles and geometric shapes
- Racing stripes as accents
- Checkered flag motifs
- Smooth animations
- Responsive (mobile + desktop)

### **Layout:**

```
┌─────────────────────────────────┐
│  🏁 TOYOTA GAZOO RACING         │  Header
│     Race Analyzer AI            │
├─────────────────────────────────┤
│                                 │
│  ⚪ Bot: Hi! Ask me anything   │  Chat Area
│                                 │  (Scrollable)
│           User: Who won? 🔴    │
│                                 │
│  ⚪ Bot: Driver 13 won...      │
│                                 │
├─────────────────────────────────┤
│  [Quick Q] [Quick Q] [Quick Q] │  Samples
├─────────────────────────────────┤
│  [Type question...] [🚀 Send] │  Input
└─────────────────────────────────┘
```

---

## 🔌 API Endpoints

### **POST /api/analyze**

Ask a question about race data

**Request:**

```json
{
  "question": "Who won Race 1?"
}
```

**Response:**

```json
{
  "answer": "Driver 13 won Race 1 with a time of 45:15.035",
  "dataRetrieved": 1
}
```

### **GET /api/stats**

Get database statistics

**Response:**

```json
{
  "raceResults": 138,
  "totalRecords": 5492,
  "drivers": [2, 3, 5, 7, 13, 18, 21, 22, ...],
  "races": [1, 2]
}
```

### **GET /api/sample-questions**

Get pre-built questions

**Response:**

```json
[
  "Who won Race 1?",
  "What was the fastest lap time?",
  "Compare driver 13 and 22"
]
```

---

## 🎯 Core Features

### **Must-Have:**

1. ✅ Chat interface
2. ✅ Natural language questions
3. ✅ AI-powered answers
4. ✅ Sample questions
5. ✅ Basic stats display

### **User Experience:**

- Type question in plain English
- Get instant AI response
- See loading indicator
- Click sample questions for ideas
- View conversation history

### **Example Questions:**

- "Who won Race 1?"
- "What was the fastest lap in Race 2?"
- "Compare driver 13 and driver 22"
- "What was the weather during Race 1?"
- "Which driver improved the most?"
- "Show me top 5 fastest laps"
- "What was driver 13's average speed?"

---

## 🚀 Development Timeline

### **Day 1: Setup & Data Import**

- Create monorepo structure
- Setup MongoDB Atlas account
- Get Gemini API key
- Import 18 CSV files to MongoDB
- Verify 5,500 records imported

### **Day 2: Build Backend**

- Create Express server
- Setup MongoDB connection
- Create 8 Mongoose models
- Build API endpoints
- Integrate Gemini AI

### **Day 3: Build Frontend**

- Setup Next.js project
- Implement Toyota Racing theme
- Build chat interface
- Connect to backend API
- Add sample questions

### **Day 4: Deploy & Demo**

- Deploy frontend to Vercel
- Deploy backend to Railway
- Test production
- Prepare demo presentation

---

## 💰 Cost Breakdown

| Service       | Free Tier             | Estimated Usage | Cost         |
| ------------- | --------------------- | --------------- | ------------ |
| Gemini 2.5    | 1M tokens/month       | ~5K questions   | **$0**       |
| MongoDB Atlas | 512MB storage         | ~2MB used       | **$0**       |
| Vercel        | Unlimited deployments | 1 site          | **$0**       |
| Railway       | 500 hours/month       | 1 server        | **$0**       |
| **TOTAL**     |                       |                 | **$0/month** |

---

## ✅ Success Criteria

### **Functional:**

- ✅ User can ask questions in natural language
- ✅ System retrieves correct data from MongoDB
- ✅ AI provides accurate answers
- ✅ Response time < 5 seconds
- ✅ Works on mobile and desktop

### **Technical:**

- ✅ 5,500+ records imported successfully
- ✅ 8 MongoDB collections created
- ✅ API endpoints responding
- ✅ Frontend connects to backend
- ✅ Gemini AI integration working

---

## 🎓 Key Concepts

### **RAG (Retrieval-Augmented Generation)**

The app uses RAG pattern:

1. **Retrieve** relevant data from MongoDB
2. **Augment** the prompt with that data
3. **Generate** natural language answer

### **Why This Works:**

- LLM gets real race data (not making it up)
- Data is structured and queryable
- Answers are accurate and specific
- Can handle complex questions

### **Example:**

```
Without RAG:
User: "Who won Race 1?"
LLM: "I don't have access to that data"

With RAG:
User: "Who won Race 1?"
System: [Queries MongoDB] → Gets Driver 13 data
LLM: "Driver 13 won Race 1 with 45:15.035"
```

---

## 🎯 What Makes This MVP Special

### **For Toyota:**

✅ Solves real problem (data analysis)
✅ Uses official race data
✅ Professional racing theme
✅ Demo-ready in 3 days

### **For Hackathon:**

✅ Complete end-to-end solution
✅ Uses cutting-edge AI (Gemini 2.5)
✅ Modern tech stack
✅ Production-quality design
✅ Zero cost to build

### **Technical Highlights:**

✅ 18 CSV files → 8 clean collections
✅ 5,500+ records processed
✅ Natural language interface
✅ AI-powered query generation
✅ Monorepo architecture

---

## 📋 Deliverables

### **What You'll Build:**

1. Working chatbot web app
2. Backend API with 3 endpoints
3. MongoDB database with 5,500 records
4. Toyota Racing themed UI
5. Deployed production site

### **What You'll Demo:**

- Live chatbot answering race questions
- Show database with imported data
- Explain AI query generation
- Demonstrate mobile responsiveness
- Show API endpoints working

---

## 🏁 Conclusion

**This MVP proves:** AI can make complex race data accessible through natural language.

**Timeline:** 3-4 days
**Cost:** $0
**Complexity:** Medium
**Impact:** High

**Tech Highlights:**

- 18 CSV files processed
- 8 MongoDB collections
- 5,500+ records
- Gemini 2.5 AI
- Toyota Racing design
- Full-stack monorepo

**Ready to build your Toyota Race Analyzer! 🚀**
