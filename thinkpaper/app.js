
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
const usersRef = db.ref("users")

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
		document.getElementById('naviA').innerHTML = data['naviA'];	// 이렇게 해도 됨.
		document.getElementById('naviB').innerHTML = data['naviB'];
		document.getElementById('action').innerHTML = data.action;
		document.getElementById('actionMemo').innerHTML = data.actionMemo;
	});
};

// 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
function onUpdate() {
	let updatedData = {}
	updatedData['title'] = document.getElementById('title').value;
	updatedData['date'] = document.getElementById('date').value;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['naviA'] = document.getElementById('naviA').value;
	updatedData['naviB'] = document.getElementById('naviB').value;
	updatedData['action'] = document.getElementById('action').value;
	updatedData['actionMemo'] = document.getElementById('actionMemo').value;


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
	newData['naviA'] = document.getElementById('naviA').value
	newData['naviB'] = document.getElementById('naviB').value
	newData['action'] = document.getElementById('action').value
	newData['actionMemo'] = document.getElementById('actionMemo').value

	let userName = document.getElementById('userName').value
	usersRef.child(userName)
		.set(newData);
}

//주제리스트 만들기
function readDataList() {
	const userName = document.getElementById('userName').value
	const userRef = db.ref("users/" + userName)
	userRef.on("value", snap => {
		snap.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			data[key] = value;
		});
		// html에 넣기.
		document.getElementById('title').value = data['title'];
		console.log(data['title']);
	});
};

//다크모드
function darkmode() {
	
}

//to do list
// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}