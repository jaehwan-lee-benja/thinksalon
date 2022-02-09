    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-analytics.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries
    
var app_fireBase = {};
(function(){

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyBmGlVK1P-fTw_RvFaA9tV1pEv8-Rk_-z4",
        authDomain: "thinksalon-2021.firebaseapp.com",
        databaseURL: "https://thinksalon-2021-default-rtdb.firebaseio.com",
        projectId: "thinksalon-2021",
        storageBucket: "thinksalon-2021.appspot.com",
        messagingSenderId: "892004428811",
        appId: "1:892004428811:web:805e7e85048e791af6eb0e",
        measurementId: "G-YE9WY5Z6ZS"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);

    app_fireBase = firebase;
})()
