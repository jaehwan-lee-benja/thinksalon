
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
	const userRef2 = db.ref("Test/이영수")

	userRef.on("value", snap => {
		snap.forEach(childSnap => {
			//console.log("childSnap=", childSnap.val());
			let key = childSnap.key;
			let value = childSnap.val();
			data[key] = value;
			//console.log('01=',data[key]);
		});
		// html에 넣기.
		//console.log(data);
		document.getElementById('date').value = data.date;
		document.getElementById('direction').innerHTML = data.direction;
		document.getElementById('naviA').innerHTML = data['naviA'];	// 이렇게 해도 됨.
		document.getElementById('naviB').innerHTML = data['naviB'];
		document.getElementById('action').innerHTML = data.action;
	});

	//firebase.database().ref("Test/이영수").on()
	userRef2.on("value", snap => {
		snap.forEach(childSnap2 => {
			//console.log("childSnap2=", childSnap2.val());
			let key2 = childSnap2.key2;
			let value2 = childSnap2.val();
			data[key2] = value2;
			//console.log('02=',value2);
			var array1 = value2;
			//console.log('02.1=',array1);
			console.log('02.2=',array1['날짜']);
		});
		// html에 넣기.
		//document.getElementById('date').value = array1['날짜'];
		//console.log('03=',document.write.array1['날짜'])
		document.getElementById('direction').innerHTML = data.direction;
		//console.log('04=',document.getElementById('direction').innerHTML)
		document.getElementById('naviA').innerHTML = data['naviA'];	// 이렇게 해도 됨.
		document.getElementById('naviB').innerHTML = data['naviB'];
		document.getElementById('action').innerHTML = data.action;
	});

};

// 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
function onUpdate() {
	let updatedData = {}
	updatedData['date'] = document.getElementById('date').value;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['naviA'] = document.getElementById('naviA').value;
	updatedData['naviB'] = document.getElementById('naviB').value;
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
	newData['date'] = document.getElementById('date').value
	newData['direction'] = document.getElementById('direction').value
	newData['naviA'] = document.getElementById('naviA').value
	newData['naviB'] = document.getElementById('naviB').value
	newData['action'] = document.getElementById('action').value

	let userName = document.getElementById('userName').value
	usersRef.child(userName)
		.set(newData);
}

// 신규 버튼과 수정 저장 관계 - CRUD 참고해보기 / 삭제도 필요
var selectorOnNew = document.getElementById('onNew')
//console.log('1=', selectorOnNew.value);

//다크모드
function darkmode() {
	var selectorBody = document.querySelector('body')
	var selectorDarkMode =  document.getElementById('darkMode')
	var selectorGridIndex =  document.getElementById('gridIndex')
	if(selectorDarkMode.value === '다크모드 켜기') {
		selectorBody.style.backgroundColor = '#1E1E1E';
		selectorBody.style.color = 'white';
		selectorDarkMode.value = '다크모드 끄기';
	
		var alist = document.querySelectorAll('a');
		var i = 0;
		while(i < alist.length) {
			alist[i].style.color = 'powderblue';
			i = i + 1;
		}
	
		selectorGridIndex.style.backgroundColor = '#333333';
	
	} else {
		selectorBody.style.backgroundColor = 'white';
		selectorBody.style.color = 'black';
		selectorDarkMode.value = '다크모드 켜기';
	
		var alist = document.querySelectorAll('a');
		var i = 0;
		while(i < alist.length) {
			alist[i].style.color = 'blue';
			i = i + 1;
		}
	
		selectorGridIndex.style.backgroundColor = 'rgb(240, 240, 240)';
	
	}
}

//to do list