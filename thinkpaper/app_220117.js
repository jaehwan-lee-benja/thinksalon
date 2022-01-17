
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
// firebase의 database를 참조하기
const db = firebase.database()
// firebase/database의 'Test' [질문,공부] ID? key값?을 참조하기 - Array에 대한 더 명확한 공부 필요
const usersRef = db.ref("Test")

// [삭제예정] 아래의 용도에 대해서 아직 명확하게 파악이 되지 않음
// usersRef.on("value", snap => {
//	snap.forEach(childSnap => {
//		//console.log("childSnap=", childSnap.val());
//		let key = childSnap.key;
//		let value = childSnap.val();
//		data_usersRef[key] = value;
//	})
// })

//파이어베이스 데이터베이스에서 유저의 키값과 벨류값을 on하기
//아래함수 풀어쓰기: firebase.database().ref("Test/" + userName + "/").on()

function readData() {

	//index.html에서 userName의 value값을 불러옴
	//[질문] index.html이 로딩될 때, 
	const userName = document.getElementById('userName').value

	if(Boolean(userName)) {	

		//data Array로 묶기, [질문, 공부] let과 var의 차이에 대해서 이해 필요
		//let data = {}

		//1차 배열인 경우: const userRef = db.ref("users/" + userName)
		//2차 배열인 경우: 아래와 같이 씀
		const userRef = db.ref("Test/" + userName + "/")

		//date {}에 Key와 Value값 [질문] 배열로 묶기(?)
		
		//on()에 대한 이해: https://kdinner.tistory.com/72
		//on은 Read에 대한 메소드, 
		//on study
		userRef.on('value', (snapshot) => {

			//value 값만 가져오기
			var data = Object.values(snapshot.val());
			//console.log('data=', data)
			//console.log('data[].key=', data[0].date)

			//value 값만 가져오기
			var onKeys = Object.keys(snapshot.val());
			//console.log('onKeys=', onKeys)

			// dateArray에 date 넣기 - 방법B

			var dateArrayB = [];

			for(k=0; k < data[0].date.length-1; k++) {
			dateArrayB.push(data[k].date);
			};

			console.log('dateArrayB=', dateArrayB)

			var dateLength = dateArrayB.length

			document.getElementById('latestDate').innerHTML = '최근 날짜: ' + data[dateLength-1].date;
			console.log('latestDate=', data[dateLength-1].date)
			document.getElementById('direction').innerHTML = data[dateLength-1].direction;
			document.getElementById('naviA').innerHTML = data[dateLength-1].naviA;
			document.getElementById('naviB').innerHTML = data[dateLength-1]['naviB']; // 이렇게 해도 됨.
			document.getElementById('action').innerHTML = data[dateLength-1].action;	

			//  Array에서 select 목록 만들기 - 참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ
			var dateArrayList = document.getElementById("dateSelectBox"),
								dateArrayB;
				
			for(var j = 0; j < dateLength; j++) {
				var option = document.createElement("OPTION"),
					txt = document.createTextNode(dateArrayB[j]);
				option.appendChild(txt);
				option.setAttribute("value", dateArrayB[j]);
				dateArrayList.insertBefore(option,dateArrayList.lastChild);
			}

		});

	//on()스터디로 주석처리
	//------------------------------------------
	//	userRef.on("value", snap => {
	//	snap.forEach(childSnap => {
	//		let key = childSnap.key;
	//		//push로 onNew가 되는 경우, key가 문자로 되고, date[key]가 작동하지 않게된다.
	//		let value = childSnap.val();
	//		data[key] = value;
			//console.log('data[key]=', data[key])
					
			//push로 onNew가 되는 경우, index의 번호로 찾을 수 있지 않을까?
			//let index = childSnap.index;
			//data[index] = value;
			
			//[todo]userName이 데이터베이스에 없는 경우, 알림뜨게하기
			
	//		});

			// dateArray에 date 넣기 - 방법A
	//		var dateArray = [];

	//		for(i=0; i < data[0].date.length-1; i++) {
	//		dateArray.push(data[i].date);
	//		};

	//		console.log('dateArray=', dateArray)
						
			// html에 넣기.	
			// 날짜 value에 배열의 마지막 날짜로 선택하도록하기
	//		document.getElementById('latestDate').innerHTML = '최근 날짜: ' + data[dateArray.length-1].date;
	//		console.log('latestDate=', data[dateArray.length-1].date)
	//		document.getElementById('direction').innerHTML = data[dateArray.length-1].direction;
	//		document.getElementById('naviA').innerHTML = data[dateArray.length-1].naviA;
	//		document.getElementById('naviB').innerHTML = data[dateArray.length-1]['naviB']; // 이렇게 해도 됨.
	//		document.getElementById('action').innerHTML = data[dateArray.length-1].action;	

			//  Array에서 select 목록 만들기 - 참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ
	//		var dateArrayList = document.getElementById("dateSelectBox"),
	//							dateArray;
				
	//		for(var j = 0; j < dateArray.length; j++) {
	//			var option = document.createElement("OPTION"),
	//				txt = document.createTextNode(dateArray[j]);
	//			option.appendChild(txt);
	//			option.setAttribute("value", dateArray[j]);
	//			dateArrayList.insertBefore(option,dateArrayList.lastChild);
	//		}

			// [질문] selectbox 불러오기 시도
			//	for(var j = 0; j < dateArray.length; j++) {
			//		document.getElementById('dateSelect').innerHTML = 
			//		'<option>' + data[j].date; + '</option><br>'
			//		console.log('data[j].date=', data[j].date)
			//	}
			
	//	});
	//------------------------------------------

			//userName프로세스가 잘 작동했음을 확인하는 표식
			var readDateWorked = "Y";
			console.log('readDateWorked=' , readDateWorked)

	} else {

		alert('[이름]을 입력해주시기 바랍니다.');

	}

};

// 선택한 날짜에 맞춰서 내용 집어넣기

function selectDate() {

	//날짜 선택하기
	var selectedDateValue = document.getElementById("dateSelectBox").value;
	console.log('selectedDateValue=', selectedDateValue);
	
	//선택된 날짜에 맞춰서 값 Select하기

	//readDate()의 앞부분 작업 진행하기 = snap하기 
	//질문: *readDate를 처음했기때문에 지워도 진행이 되는것?
	let data = {}

	const userName = document.getElementById('userName').value
	const userRef = db.ref("Test/" + userName + "/")

	userRef.on("value", snap => {
		snap.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			data[key] = value;
		});

		for(i=0; i < data[0].date.length - 1; i++) {

			if (data[i].date === selectedDateValue) {
				//document.getElementById('date').value = data[i].date;
				document.getElementById('direction').innerHTML = data[i].direction;
				document.getElementById('naviA').innerHTML = data[i].naviA;
				document.getElementById('naviB').innerHTML = data[i]['naviB']; // 이렇게 해도 됨.
				document.getElementById('action').innerHTML = data[i].action;
			} else {
				
			}
		};

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

	//기존에 있던 원소의 갯수 새기 [이음새 - 220117]
	for(i=0; i < data[0].length-1; i++) {
		console.log(data[i].length);
	};

	//for(j=0; j < 2; j++) {
	//	const usersRefParent = db.ref("Test/" + userName + "/" + j)
	//	var updatedDataArray = []
		//const userRef = db.ref("users/" + userName)
	//	usersRefParent.update(updatedData);
	//	console.log(usersRefParent.update(updatedData))
		//console.log(usersRefParent.updatedDataArray.update(updatedData))
	//}
	
	alert("saved.");
	//location.reload();
};

// 신규 입력. test라는 이름으로, data를 그대로 입력.

function onNewSave() {

	let newData = {}
	newData['date'] = document.getElementById('date').value
	newData['direction'] = document.getElementById('direction').value
	newData['naviA'] = document.getElementById('naviA').value
	newData['naviB'] = document.getElementById('naviB').value
	newData['action'] = document.getElementById('action').value

	const usersRefParent = db.ref("Test")
	//console.log(usersRefParent)

	let userName = document.getElementById('userName').value
	usersRefParent.child(userName)
		.set(newData);
		//.set("/" + newData);
}

// 신규 버튼과 수정 저장 관계 - CRUD 참고해보기 / 삭제도 필요
// var selectorOnNew = document.getElementById('onNew')
//console.log('1=', selectorOnNew.value);

//다크모드
function darkmode() {
	var selectorBody = document.querySelector('body')
	var selectorDarkMode =  document.getElementById('darkMode')
	var selectorGridIndex =  document.getElementById('gridIndex')
	var selectorContentsSave = document.getElementById('contentsSave')
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
		selectorContentsSave.style.backgroundColor = '#333333';
	
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
		selectorContentsSave.style.backgroundColor = 'rgb(240, 240, 240)';
	
	}
}

// [to do] memo
// tectbox를 읽기용으로 바꾸기
// Action을 to do list로 만들기