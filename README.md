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

Follow these steps to get your local development environment up and running.

### 1. Clone the Repository

Start by cloning the project and navigating into the main directory:

```bash
git clone <repository-url>
cd Exam_Web
````

### 2\. Install Dependencies

Install the required packages for both the backend (`server`) and the frontend (`client`).

**Backend Dependencies (Node.js/Express):**

```bash
cd server
npm install
```

**Frontend Dependencies (React/Vite):**

```bash
cd ../client
npm install
```

### 3\. Configure Environment Variables

Create a file named **`.env`** inside the `/server` directory and add the following configuration.

**`/server/.env` File:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exam_web
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:5173
```

> 💡 **Tip:** For production, use secure environment variables and consider robust services like **SendGrid** or **Mailgun** for email.

-----

## ▶️ Running the Application

### Development Mode

Run the frontend and backend servers concurrently for development with hot-reloading.

| Service | Command | Status |
| :--- | :--- | :--- |
| **Backend** | `cd server && npm run dev` | 🟢 `http://localhost:5000` |
| **Frontend** | `cd client && npm run dev` | 🟢 `http://localhost:5173` |

### Production Mode

To run the application in a production-ready environment:

1.  **Build the Frontend:**

    ```bash
    cd client
    npm run build
    ```

2.  **Start the Backend (serves the built frontend):**

    ```bash
    cd ../server
    npm start
    ```

-----

## 📂 Project Structure

The project follows a standard monorepo structure, separating the client and server.

```
Exam_Web/
├── client/                 # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state management
│   │   ├── layouts/        # Page structure (e.g., student/teacher layout)
│   │   ├── pages/          # Individual pages
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── public/     # Homepage
│   │   │   ├── student/    # Student specific pages (exams, results)
│   │   │   └── teacher/    # Teacher specific pages (create exam, manage users)
│   │   ├── utils/          # Helper functions
│   │   └── assets/
│   └── vite.config.js
│
└── server/                 # Node.js Backend (Express)
    ├── src/
    │   ├── config/         # Database connection, environment setup
    │   ├── controllers/    # Business logic for routes
    │   ├── middleware/     # JWT authentication, error handling
    │   ├── models/         # Mongoose schemas
    │   ├── routes/         # API endpoints
    │   └── server.js       # Application entry point
    └── package.json
```

-----

## 🤝 Contributing

We welcome contributions\! To contribute to this project:

1.  **Fork** the repository.
2.  Create your feature branch:
    ```bash
    git checkout -b feature/AmazingFeature
    ```
3.  Commit your changes:
    ```bash
    git commit -m "feat: Add some AmazingFeature"
    ```
4.  Push to the branch and **open a Pull Request**:
    ```bash
    git push origin feature/AmazingFeature
    ```

-----

## 📄 License

This project is licensed under the **ISC License**. See the `LICENSE` file for details.

-----

## 📞 Support

For support, inquiries, or bug reports:

  * 📧 **Email** the development team directly.
  * 💬 Or, create an **issue** in this GitHub repository.

<!-- end list -->
