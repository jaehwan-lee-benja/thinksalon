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
console.log(firebaseConfig);

// Initialize Firebase
// 막히는 부분 - initializeApp 함수가 없다고 뜸
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const dbRef = app.database().ref();
const usersRef = dbRef.child('users');

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