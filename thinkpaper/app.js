
// !IMPORTANT: REPLACE WITH YOUR OWN CONFIG OBJECT BELOW

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

// Firebase Database Reference and the child
const db = firebase.database()

let data = {}

function readData() {
	const userName = document.getElementById('userName').value
	const userRef = db.ref("users/" + userName)
	userRef.on("value", snap => {
		snap.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			data[key] = value;
		});
		// html에 넣기.
		console.log(data);
		document.getElementById('title').value = data.title;
		document.getElementById('date').value = data.date;
		document.getElementById('direction').innerHTML = data.direction;
		document.getElementById('navi').innerHTML = data['navi'];	// 이렇게 해도 됨.
		document.getElementById('action').innerHTML = data.action;
	});
};

// 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
function onUpdate() {
	let updatedData = {}
	updatedData['title'] = document.getElementById('title').value;
	updatedData['date'] = document.getElementById('date').value;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['navi'] = document.getElementById('navi').value;
	updatedData['action'] = document.getElementById('action').value;

	const userName = document.getElementById('userName').value;
	const userRef = db.ref("users/" + userName)
	userRef.update(updatedData);
	alert("saved.");
	location.reload();
};

// 신규 입력. test라는 이름으로, data를 그대로 입력.
function onNew() {
	let newData = {}
	newData['title'] = document.getElementById('title').value
	newData['date'] = document.getElementById('date').value
	newData['direction'] = document.getElementById('direction').value
	newData['navi'] = document.getElementById('navi').value
	newData['action'] = document.getElementById('action').value

	let userName = document.getElementById('userName').value
	usersRef.child(userName)
		.set(newData);
}