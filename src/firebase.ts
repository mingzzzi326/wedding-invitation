// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCSr1bcra400PvQwc3vE3espTo96wcDQJU",
    authDomain: "hh-wedding-invitation.firebaseapp.com",
    projectId: "hh-wedding-invitation",
    storageBucket: "hh-wedding-invitation.firebasestorage.app",
    messagingSenderId: "935639837927",
    appId: "1:935639837927:web:677a3a2afffdce07290642",
    measurementId: "G-PNDK5V5TGD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);