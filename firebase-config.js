<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAYDUuTdG9mW4R3Co7vqjrUeLX5l8y2RNY",
    authDomain: "namrata-s-boutique.firebaseapp.com",
    projectId: "namrata-s-boutique",
    storageBucket: "namrata-s-boutique.firebasestorage.app",
    messagingSenderId: "406191013721",
    appId: "1:406191013721:web:8985c38f62bbb122375648",
    measurementId: "G-SYJTF4ZJ7H"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
</script>