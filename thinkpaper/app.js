
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
	//const userRef = db.ref("users/" + userName)
	const userRef = db.ref("Test/" + userName +"/")

	//firebase.database().ref("users/" + userName).on()
	userRef.on("value", snap => {
		snap.forEach(childSnap => {
			//console.log("childSnap=", childSnap.val());
			let key = childSnap.key;
			let value = childSnap.val();
			data[key] = value;
			//document.getElementById('dateIndex').value = data[0,'date'];
			//document.getElementById('dateIndex3').value = data.length;
		});

		// html에 넣기.

		//console.log('data[0].date.length', data[0].date.length)

		var dateArray = [];

		// dateArray에 date 넣기
		for(i=0; i < data[0].date.length - 1; i++) {
			dateArray.push(data[i].date);
			//document.getElementById('date').value = data[i].date;

			//[todo]날짜 value에 배열의 마지막 날짜로 선택하도록하기
			//[todo]마지막 일자 선택해서 불러오는 방식 생각하기
			document.getElementById('direction').innerHTML = data[i].direction;
			document.getElementById('naviA').innerHTML = data[i].naviA;
			document.getElementById('naviB').innerHTML = data[i]['naviB']; // 이렇게 해도 됨.
			document.getElementById('action').innerHTML = data[i].action;

			//console.log(data[i].date);
		};

		//console.log('dateArray=', dateArray);
		//document.getElementById('dateArray').innerHTML = dateArray[2];
		//console.log('dateArray.length=', dateArray.length);

	//	li불러오기 시도
	//	var j = 0;
	//	while(j < 3) {
	//		document.getElementById('dateList').innerHTML = 
	//		'<li>' + dateArray[j]; + '</li><br>';
	//		j = j + 1;
	//	}

	// selectbox 불러오기 시도
	//	for(var j = 0; j < dateArray.length; j++) {
	//		document.getElementById('dateSelect').innerHTML = 
	//		'<option>' + data[j].date; + '</option><br>'
	//		console.log('data[j].date=', data[j].date)
	//	}

	//  Array에서 select 목록 만들기
	//	참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ

	var dateArrayList = document.getElementById("dateSelectBox"),
						dateArray;
		
		for(var j = 0; j < dateArray.length; j++) {
			var option = document.createElement("OPTION"),
				txt = document.createTextNode(dateArray[j]);
			option.appendChild(txt);
			option.setAttribute("value", dateArray[j]);
			dateArrayList.insertBefore(option,dateArrayList.lastChild);
		}

		
	});

};

// 선택한 날짜에 맞춰서 내용 집어넣기

function selectDate() {

	//날짜 선택하기
	var selectedDateValue = document.getElementById("dateSelectBox").value;
			console.log('selectedDateValue=', selectedDateValue);
	
	//선택된 날짜에 맞춰서 값 Select하기

	//readDate()의 앞부분 작업 진행하기 = snap하기 
	//질문: *readDate를 처음했기때문에 지워도 진행이 되는것?
//	const userName = document.getElementById('userName').value
//	const userRef = db.ref("Test/" + userName +"/")

//	userRef.on("value", snap => {
//		snap.forEach(childSnap => {
//			//console.log("childSnap=", childSnap.val());
//			let key = childSnap.key;
//			let value = childSnap.val();
//			data[key] = value;
			//document.getElementById('dateIndex').value = data[0,'date'];
			//document.getElementById('dateIndex3').value = data.length;
//		});

		for(k=0; k < data[0].date.length - 1; k++) {

			if (data[k].date === selectedDateValue) {
				//document.getElementById('date').value = data[k].date;
				document.getElementById('direction').innerHTML = data[k].direction;
				document.getElementById('naviA').innerHTML = data[k].naviA;
				document.getElementById('naviB').innerHTML = data[k]['naviB']; // 이렇게 해도 됨.
				document.getElementById('action').innerHTML = data[k].action;
			} else {
				
			}
		};

//	});
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