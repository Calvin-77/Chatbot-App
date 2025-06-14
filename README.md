# Chatbot-App

A full-stack chatbot application featuring a Node.js/Express backend and a React Native (Expo) frontend. This project provides a modern conversational interface, user authentication, and integrates with generative AI via Google APIs.

---

## Features

- **Modern Mobile and Web UI:** Built using React Native and Expo for cross-platform support.
- **Conversational AI:** Integrates generative AI for chatbot responses (see dependencies).
- **Authentication:** Likely uses JWT-based login (see backend dependencies).
- **State Management and Navigation:** Uses React Navigation and Async Storage.
- **Form Handling & Validation:** Leveraging Formik and Yup for robust form flows.
- **Backend API:** Node.js + Express server with MongoDB for data storage.
- **Secure:** Uses bcryptjs for password hashing and dotenv for environment configuration.
- **Easy Setup:** Simple scripts for running both frontend and backend.

---

## Directory Structure

```
Chatbot-App/
├── backend/      # Express backend API
│   ├── config/   # Configuration files
│   ├── routes/   # Express routes
│   ├── server.js # Entry point for backend server
│   └── package.json
└── frontend/     # React Native (Expo) frontend
    ├── assets/   # Images and static assets
    ├── screens/  # App screens/components
    ├── App.js    # Entry point for React Native app
    └── package.json
```
[View all files in backend](https://github.com/Calvin-77/Chatbot-App/tree/main/backend)  
[View all files in frontend](https://github.com/Calvin-77/Chatbot-App/tree/main/frontend)  

---

## Getting Started

### Prerequisites

- **Node.js** (v16+ recommended)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **MongoDB** (local or Atlas)

---

### Backend Setup

```bash
cd backend
npm install
# Create a .env file with your environment variables (see dotenv usage)
npm start
```

- Main dependencies: express, mongoose, mongodb, jsonwebtoken, bcryptjs, cors, dotenv

---

### Frontend Setup

```bash
cd frontend
npm install
expo start
```

- Main dependencies: react, react-native, expo, @react-navigation, axios, @google/generative-ai, formik, yup, realm, and more.

---

## Scripts

**Backend**
- `npm start` - Start the Express backend

**Frontend**
- `npm start` / `expo start` - Start the Expo development server
- `npm run android` / `npm run ios` / `npm run web` - Platform-specific launches

---

## Customization & Configuration

- Backend configuration should be set in `backend/config/` and via a `.env` file.
- Frontend environment variables can be set using `react-native-dotenv` and in `frontend/app.config.js`.

---

## License

This project is licensed under the ISC License.

---

## Author

- Calvin-77

---

## Contributions

Feel free to open issues or submit pull requests!

---

*Note: This README is based on the detected project structure and dependencies. For a complete list of files, directories, and features, view the repository on [GitHub](https://github.com/Calvin-77/Chatbot-App). Results may be incomplete due to API pagination limits.*
