import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJOtP2Bd63pFDABcxNQupqLx84Oa0_q0s",
    authDomain: "ti23f-app-4e957.firebaseapp.com",
    projectId: "ti23f-app-4e957",
    storageBucket: "ti23f-app-4e957.firebasestorage.app",
    messagingSenderId: "173886726174",
    appId: "1:173886726174:web:f22d3f9551aeef83f28e0f",
    measurementId: "G-MD1WHN3NCH"
};

const app = initializeApp(firebaseConfig);
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
export const db = getFirestore(app);
