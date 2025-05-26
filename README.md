# AI-powered-Career-Intelligent-Webapp
---
Great! Here's the **enhanced `README.md` file** with **GitHub-style badges**, **color-coded sections**, and optional deployment notes for **Render** and **Vercel**.

---

````markdown
# 🎓 AI-Powered Career Guidance Web Application

[![Frontend: React](https://img.shields.io/badge/frontend-react-blue.svg)]()
[![Backend: Node.js + FastAPI](https://img.shields.io/badge/backend-node.js%20%2B%20fastapi-yellow.svg)]()
[![Database: MongoDB](https://img.shields.io/badge/database-mongodb-brightgreen.svg)]()

An intelligent, full-stack platform that uses AI to guide users toward their ideal career paths. This system analyzes personal and professional data to deliver tailored career roadmaps, learning paths, skill gap analysis, and exam suggestions.

---

## 🧭 Project Overview

🚀 **Tech Stack**:
- **Frontend**: React + Custom CSS  
- **Backend**: Node.js (Express) + Python (FastAPI)  
- **Database**: MongoDB  
- **LLM Integration**: OpenChat via OpenRouter

🎯 **Goal**: Help users make informed career decisions using real-time, personalized AI recommendations.

---

## 🗂️ Features Overview

| 🚀 Feature                        | 📝 Description                                                                                   |
|----------------------------------|--------------------------------------------------------------------------------------------------|
| 👤 Onboarding                    | Collects data like education, skills, goals, interests, preferences, experience, and insights.   |
| 🧠 AI Career Recommendations     | Uses OpenChat to suggest careers and generate personalized roadmaps.                             |
| 📊 Skill Gap Analysis            | Detects gaps between current and target career skills.                                           |
| 🛤️ Career Path Suggestions       | Offers step-by-step career progression plans.                                                    |
| 📈 Job Market Insights           | Shows trends, demands, and relevant skills by industry/role.                                     |
| 📚 Learning Recommendations      | Suggests courses/resources based on identified gaps.                                             |
| 📝 Exam & Certification Module   | LLM-powered suggestions for exams; API-based upcoming exam listings and deadline tracking.       |
| 💾 Saved Roadmaps (Local Only)   | Allows roadmap saving using browser local storage (no login required).                          |
| 🔐 Role-Based Authentication     | Separate access for students and faculty using JWT tokens.                                       |

---

## 🧩 System Modules

### 🎨 Frontend – React
- **Responsive, clean UI** with custom CSS  
- Forms, dashboard cards, roadmap previews  
- Route-based navigation with modular components

### ⚙️ Node.js Backend
Handles:
- Authentication (JWT)  
- User profile creation and management  
- Communication with MongoDB  
- General API logic

### 🧠 FastAPI Backend (Python)
Divided into:
- **Career Intelligence Server**  
  - Processes user data with OpenChat  
  - Returns career recommendations and roadmaps  
- **Exam Suggestion Server**  
  - Suggests relevant exams using LLM  
  - Lists upcoming exams via API (no scraping)

### 🗃️ MongoDB Database
Stores:
- User profiles  
- Roadmaps  
- Exam tracking  
- Learning suggestions

---

## 🔐 Authentication

- JWT-based secure login system  
- Role separation (student vs. faculty)  
- Protected routes and access control

---

## 📱 Future Enhancements

| Planned Feature                     | Status         |
|------------------------------------|----------------|
| 🧑‍🏫 Real-Time Chatbot Assistant     | 🚧 In Progress |
| 📲 Mobile App Support               | 🔜 Coming Soon |

---

## 🛠️ Installation & Setup

### 🔧 Prerequisites
- Node.js (v18+)  
- Python 3.10+  
- MongoDB  
- OpenRouter API key  

### ⚙️ Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/career-guidance-app.git
cd career-guidance-app

# 2. Set up frontend
cd client
npm install
npm start

# 3. Set up Node.js backend
cd ../server-node
npm install
npm run dev

# 4. Set up FastAPI backends (career + exam)
cd ../server-fastapi-career
uvicorn main:app --reload

cd ../server-fastapi-exams
uvicorn main:app --reload

# 5. Create .env files for API keys and MongoDB URI
````

---

## 🚀 Deployment Instructions

### 🟪 Frontend (Vercel)

1. Push `client/` to a separate GitHub repo (or subfolder deployment).
2. Connect your repo to [vercel.com](https://vercel.com).
3. Set `npm run build` as build command and `dist` or `build` as output directory.

### 🟦 Backend (Render)

1. Push each backend to a separate GitHub repo (Node, FastAPI).
2. Create a new Web Service on [render.com](https://render.com):

   * For **Node.js**, choose `web service` → Node.
   * For **FastAPI**, choose `web service` → Python.
3. Set environment variables (.env) in Render dashboard.
4. Add MongoDB URI and OpenRouter key to each backend.

---

## 📌 Folder Structure

```
career-guidance-app/
├── client/                                   # React frontend
├── server-node/                              # Node.js + Express (auth, CRUD)
├── server-fastapi-career-guidance/           # FastAPI career recommendations & skill analysis
├── server-fastapi-roadmap-generator/         # FastAPI roadmap generator module
```

---

## 🤝 Contributors

| Name       | Role                 |
| ---------- | -------------------- |
| Aadish     | Full-stack Developer |
| Shruti     | Front-end Developer  |
| OpenRouter | LLM Provider         |

---

> ⭐ If you like this project, consider starring it on GitHub and sharing it with others!

---

## 🔗 Connect With Us

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white)](www.linkedin.com/in/aadishkumar-s-a7016b1b3)  
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/Aadish-KumarS)  
[![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:aadishkumarak90@gmail.com)
```
