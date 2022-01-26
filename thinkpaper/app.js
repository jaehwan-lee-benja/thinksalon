
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
const usersRef = db.ref("users")

// 보이지않아도 되는 div숨기기
document.getElementById('divWelcomeNew').style.display = 'none';
document.getElementById('divHistory').style.display = 'none';
document.getElementById('divNewSave_btn').style.display = 'none';
document.getElementById('divPageEdit_menu').style.display = 'none';
document.getElementById('divUpdateSave_btn').style.display = 'none';
   
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

	// // 첫방문자 또는 재방문자인것에 따라서 보여지는 요소가 달라질 수 있음을 생각하고 만든 코드(작성중)
	// let welcomeChecked = document.querySelector('input[name="welcome"]').checked;

	// if (welcomeChecked === true) {
	// 	let checkedValue = document.querySelector('input[name="welcome"]:checked').value;
	// } else {
	// 	let checkedValue = document.querySelector('input[name="welcome"]:checked').value;
	// }

}

//더블클릭시 편집모드로 설정되기
//[버그] direction에 있는 textarea만 선택이 되고 있음
const card = document.querySelector('textarea');

card.addEventListener('dblclick', function (e) {
	mode_editing();
});

//teaxarea 자동크기
//출처: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
  tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
  tx[i].addEventListener("input", OnInput, false);
}

function OnInput() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
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
		//document.getElementById('divContentsControl').style.backgroundColor = '#9CC0E7';
		document.getElementById('divPageMode').innerHTML = '편집모드';

		//readOnly = '해제'
		document.getElementById('direction').readOnly = false;
		document.getElementById('naviA').readOnly = false;
		document.getElementById('naviB').readOnly = false;
		document.getElementById('action').readOnly = false;

		// div조절
		// 저장하기 버튼
		document.getElementById('divNewSave_btn').style.display = 'initial';
		// 편집하기 버튼
		document.getElementById('divEdit_btn').style.display = 'none';
		// 편집취소하기 버튼
		document.getElementById('divEditCancel_btn').style.display = 'initial';
		// 수정본 저장하기 버튼
		document.getElementById('divUpdateSave_btn').style.display = 'initial';
		// 삭제하기 버튼
		document.getElementById('divRemove_btn').style.display = 'initial';


		//font-color = '블루계열'
		document.getElementById('gridMainFrame').style.color = '#9CC0E7';
		document.getElementById('divContentsControl').style.color = '#9CC0E7';

	} else {

		//pageMode = 'reading'
		//document.getElementById('divContentsControl').style.backgroundColor = '#EEEEEE';
		document.getElementById('divPageMode').innerHTML = '읽기모드';

		//readOnly = '작동'
		document.getElementById('direction').readOnly = true;
		document.getElementById('naviA').readOnly = true;
		document.getElementById('naviB').readOnly = true;
		document.getElementById('action').readOnly = true;

		//div조절
		// 저장하기 버튼
		document.getElementById('divNewSave_btn').style.display = 'none';
		// 편집하기 버튼
		document.getElementById('divEdit_btn').style.display = 'initial';
		// 편집취소하기 버튼
		document.getElementById('divEditCancel_btn').style.display = 'none';
		// 수정본 저장하기 버튼
		document.getElementById('divUpdateSave_btn').style.display = 'none';
		// 삭제하기 버튼
		document.getElementById('divRemove_btn').style.display = 'initial';

		// 조회하기를 눌렀을시 사라지는 div
		//document.getElementById('divNewSave_btn').style.display = 'none';

		//font-color = '회색계열'
		document.getElementById('gridMainFrame').style.color = '#424242';
		document.getElementById('divContentsControl').style.color = '#424242';
	}

	console.log('pageMode = ', pageMode)

}

// --------------------------
// timeStamp
// --------------------------

// [질문] 아래의 내용을 넣으면, todayValue가 이 함수 안에 갖히게되어 쓰이지 않는 단점이 있음
// 이때 var을 써서 진행할 것인가? 아니면 더 좋은 방법이 있을까?
// function timeStamp() {

// 	let today = new Date();
// 	console.log('today=', today);
// 	let todayValue = today.toLocaleString()
// 	console.log('todayValue=', todayValue);
	
// }

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

				value['pageId'] = childSnap.key

				// 말로 풀어보면,
				// value라는 객체에 pageId라는 key의 value는 childSnap.key와 같다. 
				// let "object=value" = { "key=pageId" : "value=childSnap.key" } 
				// let value = {"pageId": "childSnap.key"}

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
		//[삭제예정] document.getElementById('divBasic_menu').style.display = 'initial';
		document.getElementById('divPageEdit_menu').style.display = 'initial';

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

// --------------------------
// 새페이퍼 만들기
// --------------------------

function newPaperCreate() {
	
	let today = new Date();
	console.log('today=', today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	document.getElementById('dateChecked').innerHTML = todayValue;
	document.getElementById('direction').value = '';
	document.getElementById('naviA').value = '';
	document.getElementById('naviB').value = '';
	document.getElementById('action').value = '';

	document.getElementById('divHistory').style.display = 'initial';
	//[삭제예정] document.getElementById('divBasic_menu').style.display = 'initial';
	document.getElementById('divPageEdit_menu').style.display = 'initial';

	pageModeHandler('editing');

	document.getElementById('divUpdateSave_btn').style.display = 'none';
	document.getElementById('divRemove_btn').style.display = 'none';


}

// --------------------------
// 편집모드 설정하기
// --------------------------

function mode_editing() {
	
	document.getElementById('divHistory').style.display = 'initial';
	//[삭제예정] document.getElementById('divBasic_menu').style.display = 'initial';
	document.getElementById('divPageEdit_menu').style.display = 'initial';

	pageModeHandler('editing');

}

// --------------------------
// 편집모드 취소하기
// --------------------------

function editingCancel() {
	
	//document.getElementById('divHistory').style.display = 'initial';
	//document.getElementById('divBasic_menu').style.display = 'initial';
	//document.getElementById('divPageEdit_menu').style.display = 'initial';

	pageModeHandler('reading');

}

// --------------------------
// onUpdate: 버튼 클릭 시 데이터를 수정하기. *주의 신규입력 아님.
// --------------------------

function onUpdate() {
	let updatedData = {}

	let dateCheckedValue = document.getElementById("dateChecked").innerHTML;

	console.log('dateCheckedValue = ', dateCheckedValue)

	updatedData['date'] = dateCheckedValue;
	updatedData['direction'] = document.getElementById('direction').value;
	updatedData['naviA'] = document.getElementById('naviA').value;
	updatedData['naviB'] = document.getElementById('naviB').value;
	updatedData['action'] = document.getElementById('action').value;

	const userName = document.getElementById('userName').value;

	//console.log("data@onUpdate = ", data)

	let userPageId = data[dateCheckedValue].pageId

	//[Todo] 고민할것 참고: https://kdinner.tistory.com/72
	const userRef = db.ref("users/" + userName + '/' + userPageId + '/')

	userRef.update(updatedData);

	pageModeHandler('reading');

	alert("저장되었습니다.");

};

function onRemove() {
	let removeData = {}

	let dateCheckedValue = document.getElementById("dateChecked").innerHTML;

	console.log('dateCheckedValue = ', dateCheckedValue)

	removeData['date'] = dateCheckedValue;
	removeData['direction'] = document.getElementById('direction').value;
	removeData['naviA'] = document.getElementById('naviA').value;
	removeData['naviB'] = document.getElementById('naviB').value;
	removeData['action'] = document.getElementById('action').value;

	const userName = document.getElementById('userName').value;

	//console.log("data@onUpdate = ", data)

	let userPageId = data[dateCheckedValue].pageId

	//[Todo] 고민할것 참고: https://kdinner.tistory.com/72
	const userRef = db.ref("users/" + userName + '/' + userPageId + '/')

	console.log('userRef@delete = ', userRef)
	

	pageModeHandler('reading');

	//삭제재확인
	if (confirm("정말 삭제하시겠습니까?")){
		userRef.remove();

		alert("삭제되었습니다.");

	} 

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