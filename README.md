🎓 CampusOne – Smart Campus Complaint & Management System

> **Bridging the gap between students and administration with real-time tracking and seamless campus management.**

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📖 Overview

**CampusOne** is a mobile-first smart campus application built using **React Native (Expo)** and **Firebase**. It simplifies complaint management, mess feedback, and campus analytics while ensuring security through a robust **Role-Based Access Control (RBAC)** system.

### 🌟 Key Highlights
- **Real-time Sync:** Complaints and events update instantly across devices.
- **Secure Access:** Distinct portals for Students and Admins (Wardens).
- **Data-Driven:** Automated weekly analytics for mess quality and facility issues.

---

## 📸 App Screenshots

### 📱 Student & User Experience
| **Login & Authentication** | **Dashboard & Events** | **Profile & Settings** |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/95ec1c3e-5332-43f0-b0ea-8559880d1f48" width="200" /> | <img src="https://github.com/user-attachments/assets/71ac132f-b2a6-42c6-8423-2390990c5303" width="200" /> | <img src="https://github.com/user-attachments/assets/b6c50edb-46c5-4937-a8e2-5902c5077047" width="200" /> |
| **Secure Entry** | **Real-time Campus Feed** | **User Management** |

<br>

### 🚨 Complaints & Mess Management
| **Complaint Tracking** | **Event Details** | **Mess Feedback** |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/d1b34bc4-85ac-422a-885e-ed3b124cb08b" width="200" /> | <img src="https://github.com/user-attachments/assets/7c357350-1bb3-4412-869f-9683d22e29c8" width="200" /> | <img src="https://github.com/user-attachments/assets/692e23ad-7165-4418-825b-4c77716d8ed4" width="200" /> |
| **Live Status Updates** | **Seamless Registration** | **Daily Meal Rating** |

<br>

### 📊 Admin & Analytics Dashboard
| **Mess Committee** | **Admin vs User** | **Complaint Form** |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/621bd501-d986-4451-a5ff-f1a24c7c9821" width="200" /> | <img src="https://github.com/user-attachments/assets/45e07530-9677-4c3e-896c-bf865f289361" width="200" /> | <img src="https://github.com/user-attachments/assets/703de9da-bcf3-45a1-8605-b386ab1d11a7" width="200" /> |
| **Manage Issues** | **Weekly Statistics** | **App Configuration** |
---

## 📱 Features

### 🛡️ Role-Based Access Control (RBAC)
- **Security:** Admin access is verified against a secure Firestore whitelist.
- **Protection:** Prevents unauthorized role switching or data access.

### 🎓 Student Portal
- **📢 Raise Complaints:** Report maintenance issues with photo evidence.
- **⏱️ Real-time Tracking:** See status changes (Pending → In Progress → Resolved).
- **🍽️ Mess Feedback:** Rate meals on Taste, Hygiene, and Quantity.
- **📅 Events:** View upcoming campus activities.

### 👮 Admin / Warden Dashboard
- **👀 Monitoring:** View all active complaints sorted by priority.
- **✏️ Action:** Update status and resolve issues.
- **📊 Analytics:**
  - Resolution time tracking.
  - Category-wise breakdown (Water, WiFi, Electricity, etc.).
  - Weekly Mess feedback averages.

---

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo, Expo Router
- **Backend:** Firebase (Firestore, Authentication)
- **Media:** Cloudinary (Image Storage)
- **State Management:** React Hooks + Firestore Realtime Listeners
- **Styling:** Custom Theme System (Light / Dark Mode support)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1️⃣ Clone the Repository
```
git clone [https://github.com/your-username/CampusOne.git](https://github.com/your-username/CampusOne.git)
cd CampusOne
```

2️⃣ Install Dependencies
```
npm install
```

3️⃣ Configure Environment
Create a .env file in the root directory and add your Firebase credentials:

Code snippet
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```
4️⃣ Run the App
```
npx expo start
```
Scan the QR code using the Expo Go app on your Android/iOS device.

📂 Project Structure

```
src/
├── app/                  # Expo Router Screens
│   ├── (tabs)/           # Tab Navigation (Dashboard, Complaints, Mess)
│   ├── login.tsx         # Authentication Logic
│   └── _layout.tsx       # Root Layout & Auth Guards
├── components/           # Reusable UI Components (Cards, Buttons)
├── utils/
│   ├── firebase.js       # Firebase Config
│   ├── theme.js          # Theme (Colors, Typography)
│   └── auth/             # Auth Hooks & Context
└── assets/               # Static Images & Icons
```
**🤝 Contributing**

Contributions are welcome!

1.Fork the repository.

2.Create a Feature Branch (git checkout -b feature/AmazingFeature).

3.Commit your changes (git commit -m "Add AmazingFeature

4.Push to the branch (git push origin feature/AmazingFeature).

5.Open a Pull Request.

<div align="center"> <p>Built with ❤️ for the Smart Campus Initiative</p> </div>
