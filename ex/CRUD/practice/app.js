// Initialize Firebase 
var config = {
    apiKey: "AIzaSyBmGlVK1P-fTw_RvFaA9tV1pEv8-Rk_-z4",
    authDomain: "thinksalon-2021.firebaseapp.com",
    databaseURL: "https://thinksalon-2021-default-rtdb.firebaseio.com",
    projectId: "thinksalon-2021",
    storageBucket: "thinksalon-2021.appspot.com",
    messagingSenderId: "892004428811",
    appId: "1:892004428811:web:805e7e85048e791af6eb0e",
    measurementId: "G-YE9WY5Z6ZS"
};
firebase.initializeApp(config);

const dbRef = firebase.database().ref();

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