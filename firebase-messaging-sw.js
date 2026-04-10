importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyCjqNq1LkgU1vwDtXVWD5m-_qeWu0T4FsM",
  authDomain: "fixer-355fb.firebaseapp.com",
  projectId: "fixer-355fb",
  storageBucket: "fixer-355fb.firebasestorage.app",
  messagingSenderId: "964487015989",
  appId: "1:964487015989:web:74c40c475bc484a40a0b7c",
});

const messaging = firebase.messaging();
