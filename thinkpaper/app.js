
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

const db = firebase.database()
// firebase/database의 'users' [질문,공부] ID? key값?을 참조하기 - Array에 대한 더 명확한 공부 필요
const usersRef = db.ref("users")

// 보이지않아도 되는 div숨기기
document.getElementById('divWelcomeNew').style.display = 'none';
document.getElementById('divHistory').style.display = 'none';
document.getElementById('divNew_menu').style.display = 'none';
document.getElementById('divEditMode_btn').style.display = 'none';


// 첫방문자 또는 재방문자 구분하기
function welcome(event) {

	let welcomeValue = event.target.value;

	if (welcomeValue === 'welcome_new') {
		document.getElementById('divWelcomeNew').style.display = 'initial';
		document.getElementById('divWelcomeBasic').style.display = 'none';
	} else {
		document.getElementById('divWelcomeNew').style.display = 'none';
		document.getElementById('divWelcomeBasic').style.display = 'initial';
	};

	// 첫방문자 또는 재방문자인것에 따라서 보여지는 요소가 달라질 수 있음을 생각하고 만든 코드(작성중)
	// let welcomeChecked = document.querySelector('input[name="welcome"]').checked;

	// if (welcomeChecked === true) {
	// 	let checkedValue = document.querySelector('input[name="welcome"]:checked').value;
	// } else {
	// 	let checkedValue = document.querySelector('input[name="welcome"]:checked').value;
	// }

}

// --------------------------
// data Object 만들기
// --------------------------

let data = {}

// data = {}에 데이터가 담겼는지 확인하기
// console.log('data@loadData=', data);

// --------------------------
// pageModeHandler = reading or editing
// --------------------------
function pageModeHandler(pageModeOption) {

	//pageModeOption은 매개변수(파라미터)로
	let pageMode = pageModeOption

	if (pageMode === 'editing') {

		//pageMode = 'editing'
		document.getElementById('divContentsControl').style.backgroundColor = '#9CC0E7';
		document.getElementById('divPageMode').innerHTML = '*편집모드';

		//readOnly = '해제'
		document.getElementById('direction').readOnly = false;
		document.getElementById('naviA').readOnly = false;
		document.getElementById('naviB').readOnly = false;
		document.getElementById('action').readOnly = false;

		// div조절
		// 저장하기 버튼
		document.getElementById('divNew_menu').style.display = 'initial';
		// 편집하기 버튼
		document.getElementById('divPageMode_btn').style.display = 'none';
		// 편집취소하기 버튼
		document.getElementById('divEditCancel_btn').style.display = 'initial';
		// 삭제하기 버튼
		document.getElementById('divRemove_btn').style.display = 'initial';


		//font-color = '블루계열'
		document.getElementById('gridMainFrame').style.color = '#9CC0E7';
		document.getElementById('divContentsControl').style.color = '#FFFFFF';

	} else {

		//pageMode = 'reading'
		document.getElementById('divContentsControl').style.backgroundColor = '#EEEEEE';
		document.getElementById('divPageMode').innerHTML = '*읽기모드';

		//readOnly = '작동'
		document.getElementById('direction').readOnly = true;
		document.getElementById('naviA').readOnly = true;
		document.getElementById('naviB').readOnly = true;
		document.getElementById('action').readOnly = true;

		//div조절
		// 저장하기 버튼
		document.getElementById('divNew_menu').style.display = 'none';
		// 편집하기 버튼
		document.getElementById('divPageMode_btn').style.display = 'initial';
		// 편집취소하기 버튼
		document.getElementById('divEditCancel_btn').style.display = 'none';
		// 삭제하기 버튼
		document.getElementById('divRemove_btn').style.display = 'initial';

		// 조회하기를 눌렀을시 사라지는 div
		//document.getElementById('divNew_menu').style.display = 'none';

		//font-color = '회색계열'
		document.getElementById('gridMainFrame').style.color = '#62615F';
		document.getElementById('divContentsControl').style.color = '#62615F';
	}

	console.log('pageMode = ', pageMode)

}



// --------------------------
// readData
// --------------------------

function readData() {

	// index.html에서 userName의 value값을 불러옴
	const userName = document.getElementById('userName').value

	if (userName) {

		// 파이어베이스 데이터베이스에서 유저의 키값과 벨류값을 on하기
		// on은 Read에 대한 메소드, on()에 대한 이해: https://kdinner.tistory.com/72

		const userRef = db.ref("users/" + userName + "/")

		userRef.on('value', (snapshot) => {

			snapshot.forEach(childSnap => {

				let value = childSnap.val();
				//console.log('value = childSnap.val(); = ', value)

				value['id'] = childSnap.key

				// 말로 풀어보면,
				// value라는 객체에 id라는 key의 value은 childSnap.key와 같다. 
				// let "object=value" = { "key=id" : "value=childSnap.key" } 
				// let value = {"id": "childSnap.key"

				// *여기서 뒷쪽의 childSnap.key의 key는 
				// '-Mtbm7fZoiwTIOKLTUJ0'와 비슷한 형태로 
				// firebase/realtimedatabase 객체의 key값이다.

				// object와 key, value의 이해
				// object는 {"key1": "value1", "key2": "value2" }와 같은 형태로 생겼다.
				// object["key1"] = "value1" 과 같이 표현할 수 있다.

				data[value.date] = value

			});

			// data = {}에 데이터가 담겼는지 확인하기
			console.log('data@readData = ', data);

			// JSON.stringify()를 통해 배열과 객체의 차이를 확인할 수 있다.
			// data=[] => 배열 => JSON.stringify(data) 콘솔이 찍히지 않음
			// data={} => 객체 => JSON.stringify(data) 콘솔이 찍힘
			// console.log('JSON.stringify(data) = ', JSON.stringify(data))
		
			// dateList 에 date 넣기
			let dateList = Object.keys(data);
			console.log("dateList = ", dateList);	

			// Array에서 selectBox 목록 만들기 - 참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ
			let dateSelectbox = document.getElementById("SelectboxDate");

			// SelectboxDate 초기화하기 - 참고 링크: https://stackoverflow.com/questions/42365845/how-to-refresh-select-box-without-reloading-the-whole-form-in-js
			for (let i = dateSelectbox.options.length - 1; i >= 0; i--) {
				dateSelectbox.remove(i + 1);
			}

			// seletBox에 <option> 만들어서, date값 넣기
			for (let i = 0; i < dateList.length; i++) {
				let option = document.createElement("OPTION"),
					txt = document.createTextNode(dateList[i]);
				option.appendChild(txt);
				option.setAttribute("value", dateList[i]);
				dateSelectbox.insertBefore(option, dateSelectbox.lastChild);
			}

			// 조회버튼 누를시 최근 일자로 검색되도록하기
			let latestDay = dateList[dateList.length - 1]
			console.log('최근저장된일자=', latestDay);

			// key=latestDay의 value를 html에 표출하기
			// @infoTable
			document.getElementById('userNameChecked').innerHTML = userName;
			document.getElementById('dateChecked').innerHTML = latestDay;
			// @mainPage
			document.getElementById('direction').innerHTML = data[latestDay].direction;
			document.getElementById('naviA').innerHTML = data[latestDay].naviA;
			document.getElementById('naviB').innerHTML = data[latestDay]['naviB']; // 이렇게 해도 됨.
			document.getElementById('action').innerHTML = data[latestDay].action;

		});	

		// 조회하기로 검색이 되었을 시 눌렀을시 등장하는 div
		document.getElementById('divHistory').style.display = 'initial';
		document.getElementById('divBasic_menu').style.display = 'initial';
		document.getElementById('divEditMode_btn').style.display = 'initial';

		// readData 프로세스가 잘 작동했음을 확인하는 표식
		var readDataWorked = "good";
		console.log('readDateWorked?userName = ', readDataWorked)

		pageModeHandler('reading');

	} else {

		alert('[이름]을 입력해주시기 바랍니다.');

		// readData 프로세스가 잘 작동했음을 확인하는 표식
		var readDataWorked = "empthy";
		console.log('readDateWorked?userName = ', readDataWorked)

	}

};

// 선택한 날짜에 맞춰서 내용 집어넣기

function selectDate() {

	//날짜 선택하기
	let selectedDateValue = document.getElementById("SelectboxDate").value;
	console.log('selectedDateValue=', selectedDateValue);

	document.getElementById('dateChecked').innerHTML = data[selectedDateValue].date;
	document.getElementById('direction').value = data[selectedDateValue].direction;
	document.getElementById('naviA').value = data[selectedDateValue].naviA;
	document.getElementById('naviB').value = data[selectedDateValue]['naviB']; // 이렇게 해도 됨.
	document.getElementById('action').value = data[selectedDateValue].action;

	pageModeHandler('reading');

}

function mode_editing() {
	
	pageModeHandler('editing');

}

// --------------------------
// onUpdate: 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
// --------------------------

function onUpdate() {
	let updatedData = {}

	let today = new Date();
	console.log('today=', today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	updatedData['date'] = todayValue;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['naviA'] = document.getElementById('naviA').value;
	updatedData['naviB'] = document.getElementById('naviB').value;
	updatedData['action'] = document.getElementById('action').value;


	const userName = document.getElementById('userName').value;

	//[Todo] 고민할것 참고: https://kdinner.tistory.com/72
	const userRef = db.ref("users/" + userName + '/' + + '/')

	userRef.update(updatedData);

	pageModeHandler('reading');

	alert("저장되었습니다.");

};

function onNewSave() {

	let newData = {}

	let today = new Date();
	console.log('today=', today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	newData['date'] = todayValue;
	console.log('newData.date=', newData['date']);
	newData['direction'] = document.getElementById('direction').value
	newData['naviA'] = document.getElementById('naviA').value
	newData['naviB'] = document.getElementById('naviB').value
	newData['action'] = document.getElementById('action').value

	const usersRef = db.ref("users")

	let userName = document.getElementById('userName').value
	usersRef.child(userName)
		//parent를 만들지 못하다가 push의 솔루션을 찾게됨
		.push(newData);
	//.set(newData);

	pageModeHandler('reading');

	alert("저장되었습니다.");

}

// function onRemove() {

// 	//index.html에서 userName의 value값을 불러옴
// 	//[질문] index.html이 로딩될 때,
// 	const userName = document.getElementById('userName').value

// 	if(Boolean(userName)) {

// 		const userRef = db.ref("users/" + userName + "/")

// 		//on()에 대한 이해: https://kdinner.tistory.com/72
// 		//on은 Read에 대한 메소드
// 	//	userRef.on('value', (snapshot) => {

// 	//		onValueSet = {}

// 			//[질문] data 묶기, {}, [] 같은가? value 값만 가져오기
// 	//		let onValue = Object.values(snapshot.val());
// 			//console.log('onValue[].key=', onValue[0].date)

// 			//Keys 값만 가져오기
// 	//		let onKeys = Object.keys(snapshot.val());
// 			//console.log('onKeys=', onKeys)

// 	//		onValueSet[onKeys] = onValue
// 	//	});

// 		//console.log('onValueSet=', onValueSet);

// 	//	let userName2 = document.getElementById('userName').value
// 	//	let removeArr = usersRef.child(userName2).child()
// 	//	console.log('removeArr=', removeArr)
// 		//removeArr.remove();

// 	//
// 		//날짜 선택하기
// 		let selectedDateValue = document.getElementById("SelectboxDate").value;

// 			data = {}

// 			userRef.on("value", snap => {
// 				snap.forEach(childSnap => {
// 				let key = childSnap.key;
// 				let value = childSnap.val();
// 				data[key] = value;
// 			});
// 			console.log('data=', data)

// 			//선택된 날짜에 맞춰서 값 Select하기
// 			// for(i=0; i < onKeys.length; i++) {

// 			//	if (data[i].date === selectedDateValue) {

// 			//		data[i]

// 			//		console.log('data[i]=', data[i])

// 			//		data[i].remove()

// 			//	} else {

// 			//	}

// 			//	if (category.parent.children[i].date === selectedDateValue) {

// 			//		console.log('catagory.parent=',catagory.parent)

// 					//console.log('data[i]=', data[i])

// 					//data[i].remove()

// 			//	} else {

// 			//	}
// 			//};

// 		});

// 	};

// 	alert("삭제되었습니다.");

// 	readData();

// };

// 신규 버튼과 수정 저장 관계 - CRUD 참고해보기 / 삭제도 필요
// let selectorOnNew = document.getElementById('onNew')
//console.log('1=', selectorOnNew.value);

//다크모드
function darkmode() {
	let selectorBody = document.querySelector('body')
	let selectorDarkMode = document.getElementById('darkMode')
	let selectorGridIndex = document.getElementById('gridIndex')
	let selectordivContentsControl = document.getElementById('divContentsControl')
	if (selectorDarkMode.value === '다크모드 켜기') {
		selectorBody.style.backgroundColor = '#1E1E1E';
		selectorBody.style.color = 'white';
		selectorDarkMode.value = '다크모드 끄기';

		let alist = document.querySelectorAll('a');
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = 'powderblue';
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = '#333333';
		selectordivContentsControl.style.backgroundColor = '#333333';

	} else {
		selectorBody.style.backgroundColor = 'white';
		selectorBody.style.color = 'black';
		selectorDarkMode.value = '다크모드 켜기';

		let alist = document.querySelectorAll('a');
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = 'blue';
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = 'rgb(240, 240, 240)';
		selectordivContentsControl.style.backgroundColor = 'rgb(240, 240, 240)';

	}
}

// [to do] memo
// tectbox를 읽기용으로 바꾸기
// Action을 to do list로 만들기