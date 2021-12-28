// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

//import { initializeApp } from 'firebase/app';
//import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-lite.js";

// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyBmGlVK1P-fTw_RvFaA9tV1pEv8-Rk_-z4",
authDomain: "thinksalon-2021.firebaseapp.com",
projectId: "thinksalon-2021",
storageBucket: "thinksalon-2021.appspot.com",
messagingSenderId: "892004428811",
appId: "1:892004428811:web:805e7e85048e791af6eb0e",
measurementId: "G-YE9WY5Z6ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log('test01');
console.log(app);
console.log('test01.1');

//막히는 부분
document.write('firebaseConfig');

firebase.initializeApp(firebaseConfig);

var consoleTest = firebase.initializeApp(firebaseConfig);
console.log('test02');
consoleTest;
document.write(consoleTest);
document.write('test03');
console.log('test04');
console.log(consoleTest);
const db = getFirestore(app);

// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, 'cities');
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map(doc => doc.data());
  return cityList;
}

//막히는 부분
//const dbRef = firebase.database().ref();
const usersRef = dbRef.child('users');
console.log('test05');
console.log(usersRef);

const userListUI = document.getElementById("userList");
usersRef.on("child_added", snap => {
    let user = snap.val();
    let $li = document.createElement("li");
    $li.innerHTML = user.name;
    $li.setAttribute("child-key", snap.key);
    $li.addEventListener("click", userClicked) 
    userListUI.append($li);
});

function userClicked(e) {
  var userID = e.target.getAttribute("child-key");
  const userRef = dbRef.child('users/' + userID);
  const userDetailUI = document.getElementById("userDetail");
  userDetailUI.innerHTML = ""
  userRef.on("child_added", snap => {
      var $p = document.createElement("p");
      $p.innerHTML = snap.key + " - " + snap.val()
      userDetailUI.append($p);
  });
}
