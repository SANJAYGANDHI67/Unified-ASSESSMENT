# 🎓 Unified Assessment Platform

> AI-Assisted Online Assessment Platform for Students, Instructors, and Administrators

![Status](https://img.shields.io/badge/Status-Completed-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20JS-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js-green)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-red)

---

# 📖 Overview

Unified Assessment Platform is a full-stack web application designed to simplify the complete examination workflow for educational institutions.

The platform enables instructors to create assessments manually or using Artificial Intelligence, students to attempt examinations securely, and administrators to manage users and monitor system activities.

The application integrates Google Gemini AI to automate question generation and descriptive answer evaluation while allowing instructors to perform final review before publishing marks.

---

# 🚀 Key Features

## 👨‍🎓 Student Module

- Secure Login
- Dashboard
- View Published Assessments
- Start Assessment
- Save Answers
- Submit Assessment
- View Submission Status
- View Evaluation Results

---

## 👨‍🏫 Instructor Module

- Instructor Dashboard
- Create Assessment
- Manual Question Creation
- AI Question Generation
- AI Question Review
- Approve / Reject AI Questions
- Publish Assessment
- Manage Assessments
- View Student Submissions
- Automatic MCQ Evaluation
- AI-based Descriptive Evaluation
- Final Instructor Evaluation
- Submit Final Marks

---

## 👨‍💼 Admin Module

- Admin Dashboard
- User Management
- Role Management
- System Logs
- Platform Settings

---

# 🤖 AI Features

## AI Question Generation

Google Gemini generates:

- Multiple Choice Questions
- Descriptive Questions

Based on:

- Uploaded Syllabus PDF
- Subject
- Selected Topics
- Difficulty Level
- Marks Configuration

---

## AI Descriptive Evaluation

For descriptive answers, the platform automatically:

- Reads student answer
- Reads reference answer
- Evaluates answer using Gemini
- Assigns AI Score
- Generates AI Feedback
- Stores evaluation in database

Instructor can review AI suggestions before submitting final marks.

---

# 🏗 System Architecture

```
React Frontend
        │
        ▼
Express REST API
        │
        ▼
Business Services
        │
        ▼
MySQL Database
        │
        ▼
Google Gemini AI
```

---

# ⚙ Technology Stack

## Frontend

- React.js
- React Router
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- JWT Authentication

## Database

- MySQL

## AI

- Google Gemini 2.5 Flash

---

# 📂 Project Structure

```
FRONTEND
│
├── frontend
│   ├── components
│   ├── pages
│   ├── layouts
│   ├── lib
│   └── routes
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── utils
│   └── uploads
│
└── database
```

---

# 🔄 Application Workflow

## Instructor

```
Login
      ↓
Create Assessment
      ↓
Upload Syllabus
      ↓
Generate AI Questions
      ↓
Review Questions
      ↓
Approve Questions
      ↓
Publish Assessment
```

---

## Student

```
Login
      ↓
View Published Assessments
      ↓
Start Assessment
      ↓
Answer Questions
      ↓
Submit Assessment
```

---

## Evaluation

```
Student Submission
        ↓
Automatic MCQ Evaluation
        ↓
AI Descriptive Evaluation
        ↓
Instructor Review
        ↓
Final Marks
        ↓
Student Result
```

---

# 🔒 Authentication

- JWT Authentication
- Protected Routes
- Role-Based Authorization

Roles:

- Student
- Instructor
- Admin

---

# 🗄 Database Modules

Main Tables

- users
- roles
- assessments
- questions
- ai_questions
- submissions
- answers
- evaluations
- ai_feedback
- system_logs

---

# 📊 Performance Highlights

- Modular Backend Architecture
- RESTful API Design
- Optimized SQL Queries
- AI-assisted Evaluation
- Reduced Manual Evaluation Time
- Scalable Service-Based Structure
- Secure Authentication
- Role-Based Access Control

---

# 🎯 Major Components

### Authentication

- Login
- Registration
- JWT Verification

### Assessment Management

- Create Assessment
- Publish Assessment
- Manage Assessments

### AI Engine

- Question Generation
- Descriptive Evaluation

### Submission Engine

- Save Answers
- Submit Assessment
- Evaluation

### Analytics

- Dashboard Statistics
- Performance Overview

### Administration

- User Management
- Logs
- Settings

---

# 🔐 Security

- JWT Authentication
- Protected REST APIs
- Role-Based Authorization
- Secure Password Storage
- Environment Variable Configuration
- API Validation

---

# 📈 Future Enhancements

- Email Notifications
- Certificate Generation
- Advanced Analytics Dashboard
- AI Plagiarism Detection
- PDF Result Reports
- Multi-language Support
- Question Bank Management

---

# 👨‍💻 Developed By

**Sanjay Gandhi**

Full Stack Developer

Internship Project

---

# 📄 License

This project is developed for educational and internship purposes.
