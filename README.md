<h1 align="center">🎓 Exam Web Application</h1>

<p align="center">
  <b>A comprehensive web-based exam management system</b> that enables teachers to create and manage exams while allowing students to take them securely.  
  Features include role-based access, real-time exam taking, automated grading, and in-depth analytics.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-ISC-blue?style=for-the-badge"/>
</p>

---

## 🚀 Key Features

### 🔐 Authentication & Security
- OTP-based email verification for user registration  
- Secure login/logout with **JWT authentication**  
- Password hashing using **bcrypt**  
- Forgot password & account recovery  
- Role-based access control (**Student/Teacher**)  
- Protected routes and session management  
- Account deletion functionality  

---

### 👥 User Management
- Dedicated **profiles** for students and teachers  
- Email verification system  
- Soft deletion of user accounts  

---

### 🏫 Class Management

#### 👩‍🏫 Teacher
- Create classes with unique enrollment codes  
- Approve/reject student join requests (individually or in bulk)  
- Import/export students via **CSV/PDF**  
- Soft deletion with cleanup using **cron jobs**  

#### 👨‍🎓 Student
- Join classes using a unique code  
- View and manage enrolled classes  
- Option to leave a class  

---

### 🧠 Exam Creation & Management (Teacher)
- Multi-section exams with instructions & duration  
- Optional **access codes** for extra security  
- Question types:  
  - ✅ MCQ  
  - ✅ Multi-select  
  - 📝 Short/Long Text  
  - 💻 Code-based  
- Randomized questions per section  
- Difficulty levels (**Easy / Medium / Hard**)  
- Tag-based question organization  
- Publish, unpublish, schedule, duplicate, or delete exams  
- Exam preview before publishing  

---

### 📚 Question Bank
- Reusable question repository  
- Search & filter by difficulty, tag, or keyword  
- Supports media attachments  
- Add directly to exams  

---

### 🧑‍💻 Exam Taking (Student)
- Real-time timer with auto-save  
- Secure submission & anti-cheating measures  
- Navigation restriction during exam  
- Access code protection  

---

### 🧾 Results & Grading
- **Automatic grading** for objective questions  
- Manual grading for subjective ones  
- Percentage and pass/fail calculation  
- Result viewing for students  
- Gradebook export (**CSV/PDF**)  

---

### 📊 Analytics & Reporting (Teacher)
- Performance tracking & class-wise analytics  
- Visual dashboards using **Recharts**  
- Insightful student progress reports  

---

### 💎 UI/UX Features
- Fully responsive design (Mobile + Desktop)  
- Built with **Tailwind CSS**  
- Toast notifications, skeleton screens & modals  
- Sidebar navigation and protected routes  
- Comprehensive validation & error handling  

---

### 🌐 Public Pages
- Landing Page  
- About, Contact, Privacy Policy  
- Terms & Conditions  
- Help Center  

---

### ⚙️ Backend Infrastructure
- RESTful **Express.js API**  
- MongoDB with **Mongoose ODM**  
- File uploads via **Multer**  
- Email via **Nodemailer**  
- Automated **cron jobs** for cleanup  
- CORS enabled & environment-based config  
- Health-check endpoints  

---

## 🛠️ Technologies Used

### 🎨 Frontend
- **React** + **Vite**  
- **Tailwind CSS**  
- **React Router DOM**  
- **Axios**, **React Hot Toast**, **Recharts**, **Lucide React**

### ⚙️ Backend
- **Node.js**, **Express.js**, **MongoDB**, **Mongoose**  
- **JWT**, **bcryptjs**, **Nodemailer**, **Multer**  
- **CSV Parser**, **PDFKit**, **Node Cron**

### 🧰 Development Tools
- **ESLint**, **PostCSS**, **Autoprefixer**, **Nodemon**

---

## 📋 Prerequisites

Before running this application, ensure the following are installed:

- [**Node.js (v16+)**](https://nodejs.org/)  
- [**npm**](https://www.npmjs.com/)  
- [**MongoDB**](https://www.mongodb.com/)

---

## ⚡ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Exam_Web
