// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzDnDukc2pMqzBbg5zZFy8h1av07nkCGg",
    authDomain: "student-market-place-c820d.firebaseapp.com",
    databaseURL: "https://student-market-place-c820d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "student-market-place-c820d",
    storageBucket: "student-market-place-c820d.firebasestorage.app",
    messagingSenderId: "580208304914",
    appId: "1:580208304914:web:806deda2809e175ef3c9cb",
    measurementId: "G-RP42DRE1HF"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Debug logging
console.log('Firebase initialized:', firebase.apps.length > 0);
console.log('Firestore instance:', db ? 'Available' : 'Not available');

// Set persistence to LOCAL
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
        console.error('Error setting auth persistence:', error);
    });

// Export Firebase services
window.auth = auth;
window.db = db; 