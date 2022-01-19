
// !IMPORTANT: REPLACE WITH YOUR OWN CONFIG OBJECT BELOW

// Initialize Firebase
let config = {
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

//파이어베이스 데이터베이스에서 유저의 키값과 벨류값을 on하기

document.getElementById('welcomeNewDiv').style.display = 'none';
document.getElementById('historyDiv').style.display = 'none';
document.getElementById('mode_read').style.display = 'initail';
document.getElementById('mode_edit').style.display = 'none';
document.getElementById('new_menuDiv').style.display = 'none';
document.getElementById('editMode_btnDiv').style.display = 'none';

//let welcomeChecked = document.querySelector('input[name="welcome"]').checked;
//console.log('welcomeChecked1=', welcomeChecked)

//첫방문자 또는 재 방문자 구분하기
function welcome(event) {

	let welcomeValue = event.target.value;

	if(welcomeValue === 'welcome_new') {
		document.getElementById('welcomeNewDiv').style.display = 'initial';
		document.getElementById('welcomeBasicDiv').style.display = 'none';
	} else {
		document.getElementById('welcomeNewDiv').style.display = 'none';
		document.getElementById('welcomeBasicDiv').style.display = 'initial';
	};

	console.log("1")
	
	let welcomeChecked = document.querySelector('input[name="welcome"]').checked;
	console.log('welcomeChecked2=', welcomeChecked)

	//여기부터풀기
	if(welcomeChecked === true) {
		let checkedValue = document.querySelector('input[name="welcome"]:checked').value;
		console.log('checkedValue=', checkedValue)
	} else {
		let checkedValue = document.querySelector('input[name="welcome"]:checked').value;
		console.log('checkedValue=', checkedValue)
	}

}

function readData() {

	//index.html에서 userName의 value값을 불러옴
	//[질문] index.html이 로딩될 때, 
	const userName = document.getElementById('userName').value

	if(Boolean(userName)) {	

		const userRef = db.ref("Test/" + userName + "/")
		
		//on()에 대한 이해: https://kdinner.tistory.com/72
		//on은 Read에 대한 메소드 
		userRef.on('value', (snapshot) => {

			
			//[질문] data 묶기, {}, [] 같은가? value 값만 가져오기
			let data = Object.values(snapshot.val());
			//console.log('data[].key=', data[0].date)

			//Keys 값만 가져오기
			let onKeys = Object.keys(snapshot.val());
			//console.log('onKeys=', onKeys)

			//Array에서 select 목록 만들기 - 참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ
			let dateArrayList = document.getElementById("dateSelectBox");
		
				// dateArray에 date 넣기
				let dateArray = [];
		
				//date값만배열에넣기
				//console.log('onKeys.length=', onKeys.length)
				for(k=0; k < onKeys.length; k++) {
					dateArray.push(data[k].date);
				};
				console.log('dateArray=',dateArray)
			
				//dateSelectBox 초기화하기 - 참고 링크: https://stackoverflow.com/questions/42365845/how-to-refresh-select-box-without-reloading-the-whole-form-in-js	
				for(i = dateArrayList.options.length - 1 ; i >= 0 ; i--) {
					dateArrayList.remove(i + 1);
				}
				
			for(let j = 0; j < dateArray.length; j++) {
				let option = document.createElement("OPTION"),
					txt = document.createTextNode(dateArray[j]);
				option.appendChild(txt);
				option.setAttribute("value", dateArray[j]);
				dateArrayList.insertBefore(option,dateArrayList.lastChild);
			}
						
			// html에 최근 값 적기
			// document.getElementById('option[0]').innerHTML = '이전 날짜 불러오기';

			//조회버튼 누를시 최근 일자로 검색되도록하기
			console.log('최근저장된일자=', data[onKeys.length-1].date);
			document.getElementById('userNameChecked').innerHTML = userName;
			document.getElementById('dateChecked').innerHTML = data[onKeys.length-1].date;
			//document.getElementById('date').value = data[onKeys.length-1].date;
			document.getElementById('direction').innerHTML = data[onKeys.length-1].direction;
			document.getElementById('naviA').innerHTML = data[onKeys.length-1].naviA;
			document.getElementById('naviB').innerHTML = data[onKeys.length-1]['naviB']; // 이렇게 해도 됨.
			document.getElementById('action').innerHTML = data[onKeys.length-1].action;	


		});

		document.getElementById('historyDiv').style.display = 'initial';		
		document.getElementById('basic_menuDiv').style.display = 'initial';
		document.getElementById('editMode_btnDiv').style.display = 'initial';
		document.getElementById('new_menuDiv').style.display = 'none';

		//userName프로세스가 잘 작동했음을 확인하는 표식
		var readDataWorked = "good";
		console.log('readDateWorked1=' , readDataWorked)

	} else {

		alert('[이름]을 입력해주시기 바랍니다.');

		var readDataWorked = "empthy";
		console.log('readDataWorked2=' , readDataWorked)

	}

	console.log('readDataWorked3=' , readDataWorked)

};

// 선택한 날짜에 맞춰서 내용 집어넣기

function selectDate() {

	//날짜 선택하기
	let selectedDateValue = document.getElementById("dateSelectBox").value;
	console.log('selectedDateValue=', selectedDateValue);

	const userName = document.getElementById('userName').value
	const userRef = db.ref("Test/" + userName + "/")
		
	userRef.on('value', (snapshot) => {

		let data = Object.values(snapshot.val());
		let onKeys = Object.keys(snapshot.val());

		//선택된 날짜에 맞춰서 값 Select하기
		for(i=0; i < onKeys.length; i++) {

			if (data[i].date === selectedDateValue) {

				document.getElementById('dateChecked').innerHTML = data[i].date;
				document.getElementById('direction').innerHTML = data[i].direction;
				document.getElementById('naviA').innerHTML = data[i].naviA;
				document.getElementById('naviB').innerHTML = data[i]['naviB']; // 이렇게 해도 됨.
				document.getElementById('action').innerHTML = data[i].action;

			} else {
				
			}
		};
	});
}	

	

// let data{}를 let data = Object.values(snapshot.val()); 로 변경
//[질문] data를 {}로 묶는 것과 []로 묶는 것의 차이
//새로 적용한 것은 []로 묶이게된다.
//let data = Object.values(snapshot.val());
// 어떤 차이가 있을지를 스터디해보기
//-----여기부터-----
//	let data = {}

//	const userName = document.getElementById('userName').value
//	const userRef = db.ref("Test/" + userName + "/")

//	userRef.on("value", snap => {
//		snap.forEach(childSnap => {
//			let key = childSnap.key;
//			let value = childSnap.val();
//			data[key] = value;
//		});
//

//		console.log('data=', data)

//		for(i=0; i < data[0].date.length - 1; i++) {

//			if (data[i].date === selectedDateValue) {
				//document.getElementById('date').value = data[i].date;
//				document.getElementById('direction').innerHTML = data[i].direction;
//				document.getElementById('naviA').innerHTML = data[i].naviA;
//				document.getElementById('naviB').innerHTML = data[i]['naviB']; // 이렇게 해도 됨.
//				document.getElementById('action').innerHTML = data[i].action;
//			} else {
				
//			}
//		};

//	});
//};
//	-----여기까지----


// 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
// function onUpdate() {
//	let updatedData = {}
//	updatedData['date'] = document.getElementById('date').value;
//	updatedData['direction'] = document.getElementById('direction').value;
//	updatedData['naviA'] = document.getElementById('naviA').value;
//	updatedData['naviB'] = document.getElementById('naviB').value;
//	updatedData['action'] = document.getElementById('action').value;

//	const userName = document.getElementById('userName').value;

//	let onKeys = Object.keys(snapshot.val());
	
	//기존에 있던 원소의 갯수 새기
//	for(i=0; i < onKeys.length; i++) {
//		console.log(data[i].length);
//	};

	//for(j=0; j < 2; j++) {
	//	const usersRefParent = db.ref("Test/" + userName + "/" + j)
	//	let updatedDataArray = []
		//const userRef = db.ref("users/" + userName)
	//	usersRefParent.update(updatedData);
	//	console.log(usersRefParent.update(updatedData))
		//console.log(usersRefParent.updatedDataArray.update(updatedData))
	//}
	
//	alert("saved.");
//	//location.reload();
//};

function editMode() {
	//readOnly해제
	document.getElementById('direction').readOnly = false;
	document.getElementById('naviA').readOnly = false;
	document.getElementById('naviB').readOnly = false;
	document.getElementById('action').readOnly = false;

	document.getElementById('mode_read').style.display = 'none';
	document.getElementById('mode_edit').style.display = 'initial';
	document.getElementById('new_menuDiv').style.display = 'initial';
	document.getElementById('editMode_btnDiv').style.display = 'none';

}

function onUpdate() {
	let updatedData = {}

	let today = new Date();   
	console.log('today=',today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	updatedData['date'] = todayValue;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['naviA'] = document.getElementById('naviA').value;
	updatedData['naviB'] = document.getElementById('naviB').value;
	updatedData['action'] = document.getElementById('action').value;


	const userName = document.getElementById('userName').value;

	//[Todo] 고민할것 참고: https://kdinner.tistory.com/72
	const userRef = db.ref("Test/"+ userName + '/' +  + '/')

	userRef.update(updatedData);

	alert("저장되었습니다.");

};

function onNewSave() {

	let newData = {}

	let today = new Date();   
	console.log('today=',today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	newData['date'] = todayValue;
	console.log('newData.date=', newData['date']);
	newData['direction'] = document.getElementById('direction').value
	newData['naviA'] = document.getElementById('naviA').value
	newData['naviB'] = document.getElementById('naviB').value
	newData['action'] = document.getElementById('action').value

	const usersRef = db.ref("Test")

	let userName = document.getElementById('userName').value
	usersRef.child(userName)
		//parent를 만들지 못하다가 push의 솔루션을 찾게됨
		.push(newData);
		//.set(newData);

	alert("저장되었습니다.");

}

// 신규 버튼과 수정 저장 관계 - CRUD 참고해보기 / 삭제도 필요
// let selectorOnNew = document.getElementById('onNew')
//console.log('1=', selectorOnNew.value);

//다크모드
function darkmode() {
	let selectorBody = document.querySelector('body')
	let selectorDarkMode =  document.getElementById('darkMode')
	let selectorGridIndex =  document.getElementById('gridIndex')
	let selectorcontentsControl = document.getElementById('contentsControl')
	if(selectorDarkMode.value === '다크모드 켜기') {
		selectorBody.style.backgroundColor = '#1E1E1E';
		selectorBody.style.color = 'white';
		selectorDarkMode.value = '다크모드 끄기';
	
		let alist = document.querySelectorAll('a');
		let i = 0;
		while(i < alist.length) {
			alist[i].style.color = 'powderblue';
			i = i + 1;
		}
	
		selectorGridIndex.style.backgroundColor = '#333333';
		selectorcontentsControl.style.backgroundColor = '#333333';
	
	} else {
		selectorBody.style.backgroundColor = 'white';
		selectorBody.style.color = 'black';
		selectorDarkMode.value = '다크모드 켜기';
	
		let alist = document.querySelectorAll('a');
		let i = 0;
		while(i < alist.length) {
			alist[i].style.color = 'blue';
			i = i + 1;
		}
	
		selectorGridIndex.style.backgroundColor = 'rgb(240, 240, 240)';
		selectorcontentsControl.style.backgroundColor = 'rgb(240, 240, 240)';
	
	}
}

// [to do] memo
// tectbox를 읽기용으로 바꾸기
// Action을 to do list로 만들기