# 📋 TodoApp - Task Manager

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)  
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)  
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

**Smart task management application with status tracking and advanced filtering**

---

**Sections:**  
[Features](#-features) • [Technologies](#-technologies) • [Installation](#-installation) • [Running](#-running-the-application) • [Building](#-building-apk)

</div>

---

## 📱 Features

### ✨ Core Functionality
- ✅ Create tasks with title, description, due date, and location
- 🔄 Status management: pending, in-progress, completed, cancelled
- 🎯 Advanced filtering by task status (all, active, completed, in-progress, cancelled)
- 📊 Multiple sorting options by date added, due date, status
- 💾 Automatic data persistence using local storage
- 📱 Responsive design supporting both portrait and landscape orientations
- 🎨 Intuitive UI with visual status indicators

### 🎨 Visual Features
- Color-coded status badges for quick visual recognition  
- Interactive checkboxes for quick completion toggling  
- Card-based design with shadows and rounded corners  
- Dark theme support (follows system preferences)  
- Adaptive layout for various screen sizes  

### 📊 Statistics & Analytics
- Real-time task counters  
- Completed vs active task tracking  
- Visual badges showing task counts in filters  

---

## 🛠 Technologies

### Frontend Stack
- **React Native** - Cross-platform mobile framework  
- **Expo** - Development platform for React Native  
- **TypeScript** - Type-safe JavaScript development  

### Expo Modules
- `expo-crypto` - UUID generation for tasks  
- `expo-screen-orientation` - Screen orientation management  
- `expo-font` - Custom font loading  
- `expo-file-system` - File system operations  

### Data Management
- **AsyncStorage** - Local data persistence on device  
- **Zod** - Runtime data validation for forms  

### UI/UX
- **React Native Gesture Handler** - Gestures and navigation  
- **Responsive Design** - Multi-screen size support  
- **Keyboard Avoiding View** - Smart keyboard management  

---

## 📦 Installation

### Prerequisites
- Node.js 16 or higher  
- npm or yarn package manager  
- Expo CLI  
- Android Studio (for APK builds)  
- Java JDK 11+  

### 1. Clone Repository
```bash
git clone <repository-url>
cd TodoApp
2. Install Dependencies
bash
Копировать код
npm install
# or
yarn install
3. Setup Environment
Ensure Expo CLI is installed globally:

bash
Копировать код
npm install -g @expo/cli
🚀 Running the Application
Development with Expo Go
Start Metro Bundler:

bash
Копировать код
npx expo start
# or
npm start
Run on Device:

Android: Scan QR code with Expo Go app

iOS: Scan QR code with Camera app

Alternative Start Commands:

bash
Копировать код
# Start with cache clearance
npx expo start --clear

# Start for specific platform
npx expo start --android
npx expo start --ios

# Start with tunnel for external device testing
npx expo start --tunnel
🏗 Building APK
Method 1: Native Build (Recommended)
bash
Копировать код
# 1. Generate Native Files
npx expo prebuild

# 2. Build Release APK
cd android
./gradlew assembleRelease

# 3. Locate Built APK
android/app/build/outputs/apk/release/app-release.apk
Method 2: EAS Build (Cloud)
bash
Копировать код
# Install EAS CLI
npm install -g @expo/eas-cli

# Build APK
npx eas build --platform android

# Or build locally
npx eas build --platform android --local
Method 3: Classic Expo Build
bash
Копировать код
npx expo build:android
📁 Project Structure
text
Копировать код
TodoApp/
├── components/
│   └── TodoApp/
│       ├── TodoApp.tsx      # Main application component
│       ├── TodoForm.tsx     # Task creation form
│       ├── TodoItem.tsx     # Individual task component
│       ├── types.ts         # TypeScript type definitions
│       └── validation.ts    # Zod validation schemas
├── assets/                  # Static assets (fonts, images)
├── android/                 # Native Android code
├── ios/                     # Native iOS code
├── app.json                 # Expo configuration
└── package.json             # Dependencies and scripts
🎯 Usage Guide
Creating Tasks
Tap "+ New Task" button

Fill required "Task Title" field

Add optional description, due date, or location

Tap "Save" to create task

Managing Tasks
Toggle Completion: Tap the checkbox

Change Status: Use In Progress, Complete, Cancel buttons

View Details: Tap any task to see full information

Delete Task: Use "Delete" button in task actions

Filtering & Sorting
Filter: All, Active, Completed, In Progress, Cancelled

Sort: Date Added, Due Date, Status

Search: Real-time task filtering based on current selection

🔧 Troubleshooting
Common Issues
Metro Bundler Cache Problems

bash
Копировать код
npx expo start --clear
# or
npx react-native clean
Native Build Failures

bash
Копировать код
# Clean and regenerate
rm -rf android ios
npx expo prebuild --clean
Dependency Issues

bash
Копировать код
# Clear all caches
rm -rf node_modules package-lock.json
npm install
Performance Tips
Use the latest Expo SDK version

Keep dependencies updated

Test on physical devices when possible

Monitor bundle size with expo build:android --clear

🤝 Contributing
Fork the repository

Create a feature branch:

bash
Копировать код
git checkout -b feature/amazing-feature
Commit changes:

bash
Копировать код
git commit -m 'Add amazing feature'
Push to branch:

bash
Копировать код
git push origin feature/amazing-feature
Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
If you encounter any issues:

Check the troubleshooting section above

Search existing GitHub issues

Create a new issue with detailed description

<div align="center">
🎉 Enjoy organizing your tasks with TodoApp! 🎉

Built with ❤️ using React Native and Expo

</div> ```
