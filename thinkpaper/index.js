// 로그인 되었을 때, 아래의 스크립트 진행되기

const auth = firebase.auth()
const db = firebase.database()
const usersRef = db.ref("users")

// 보이지않아도 되는 div숨기기
//document.getElementById('divNewSave_btn').style.display = 'none';
//document.getElementById('divPageEdit_menu').style.display = 'none';
//document.getElementById('divUpdateSave_btn').style.display = 'none';
document.getElementById('divNewPaperCreate_btn').style.display = 'none';

// 로그인, 로그아웃에 따른 메인화면 불러오기 기능

// [질문] mainApp의 역할, 로그아웃 버튼에 mainApp.logOut()이 아닌 logOut()을 하면 안되는지?
// 참고 링크: https://www.youtube.com/watch?v=CvkCjfHts9A&list=PLxCXGTk-TOK9NieH8hhON952KPmIfNSqk&index=15
var mainApp = {};
let data = {};

// --------------------------
// login in/out 하기
// --------------------------
(function () {

	var firebase = appFireBase;
	var uid = null;
	auth.onAuthStateChanged(function (user) {
		if (user) {
			// User is signed in.
			uid = user.uid;

			// User 이메일 보여주기
			var user = auth.currentUser;

			if (user != null) {

				//	----------------
				//	사용자 이름 뜨게하기
				//	----------------

				const userRef = db.ref("users/" + uid)
				console.log("userRef", userRef)

				userRef.on('value', (snapshot) => {

					//	----------------
					//	data Object 채우기
					//	----------------

					snapshot.forEach(childSnap => {

						let key = childSnap.key;
						let value = childSnap.val();
						value['uid'] = childSnap.key;

						data[key] = value;

					});

					//사용자 이름 웹에 띄우기
					document.getElementById("nameChecked").innerHTML = "생각 설계자: " + data.name + " 대표"
					document.getElementById("emailChecked").innerHTML = "(" + data.email + ")"

					//bigPictureData Object 만들기
					const bigPictureRef = db.ref("users/" + uid + "/bigPicture")

					var bigPictureData = {}

					bigPictureRef.on('value', (snapshot) => {

						snapshot.forEach(childSnap => {

							let value = childSnap.val();
							value['uid'] = childSnap.key;

							bigPictureData[value.editedDate] = value;

						});

						console.log("bigPictureData@reading = ", bigPictureData);

					});

					let bigPictureDateList = Object.keys(bigPictureData);
					console.log("bigPictureDateList = ", bigPictureDateList);

					// Array에서 selectBox 목록 만들기 - 참고 링크: https://www.youtube.com/watch?v=HMehtL39VUQ
					let dateSelectbox = document.getElementById("SelectboxDate");

					// SelectboxDate 초기화하기 - 참고 링크: https://stackoverflow.com/questions/42365845/how-to-refresh-select-box-without-reloading-the-whole-form-in-js
					for (let i = dateSelectbox.options.length - 1; i >= 0; i--) {
						dateSelectbox.remove(i + 1);
					}

					// seletBox에 <option> 만들어서, date값 넣기
					for (let i = 0; i < bigPictureDateList.length; i++) {
						let option = document.createElement("OPTION"),
							txt = document.createTextNode(bigPictureDateList[i]);
						option.appendChild(txt);
						option.setAttribute("value", bigPictureDateList[i]);
						dateSelectbox.insertBefore(option, dateSelectbox.lastChild);
					}

					// 조회버튼 누를시 최근 일자로 검색되도록하기
					let lastestDate = bigPictureDateList[bigPictureDateList.length - 1]
					console.log('최근저장된일자=', lastestDate);

					// key=latestDate의 value를 html에 표출하기
					let bigPictureContents = bigPictureData[lastestDate].contents
					// document.getElementById('userNameChecked').innerHTML = userName;
					document.getElementById('dateChecked').innerHTML = lastestDate;
					document.getElementById('paperTitle').innerHTML = bigPictureContents.paperTitle;
					document.getElementById('direction').innerHTML = bigPictureContents.direction;
					document.getElementById('naviA').innerHTML = bigPictureContents.naviA;
					document.getElementById('naviB').innerHTML = bigPictureContents.naviB; // 이렇게 해도 됨.
					document.getElementById('actionPlan').innerHTML = bigPictureContents.actionPlan;

				});
			}

			pageModeHandler('reading');

		} else {
			
			// redirect to login page.
			uid = null;
			window.location.replace("login.html")
		}
	});

	function logOut() {
		firebase.auth().signOut();
	}

	mainApp.logOut = logOut;
	
})()

console.log("data@background = ", data)
console.log("bigPictureData@back = ", bigPictureData);


//[향후 개선하기] 더블클릭시 작성모드로 설정되기
//[버그] direction에 있는 textarea만 선택이 되고 있음
// const card = document.querySelector('textarea');

// card.addEventListener('dblclick', function (e) {
// 	mode_editing();
// });

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
// pageModeHandler = reading or editing
// --------------------------
function pageModeHandler(pageModeOption) {

	//pageModeOption은 매개변수(파라미터)로
	let pageMode = pageModeOption

	if (pageMode === 'editing') {

		//pageMode = 'editing'
		//document.getElementById('divContentsControl').style.backgroundColor = '#9CC0E7';
		document.getElementById('divPaperMode').innerHTML = '작성모드';

		//readOnly = '해제'
		document.getElementById('paperTitle').readOnly = false;
		document.getElementById('direction').readOnly = false;
		document.getElementById('naviA').readOnly = false;
		document.getElementById('naviB').readOnly = false;
		document.getElementById('actionPlan').readOnly = false;

		// div조절
		// 저장하기 버튼
		document.getElementById('divNewSave_btn').style.display = 'initial';
		// 작성하기 버튼
		document.getElementById('divEdit_btn').style.display = 'none';
		// 작성취소하기 버튼
		document.getElementById('divEditCancel_btn').style.display = 'initial';
		// 수정본 저장하기 버튼
		document.getElementById('divUpdateSave_btn').style.display = 'initial';
		// 삭제하기 버튼
		document.getElementById('divRemove_btn').style.display = 'initial';
		document.getElementById('divNewPaperCreate_btn').style.display = 'none';


		//font-color = '블루계열'
		document.getElementById('gridMainFrame').style.color = '#9CC0E7';
		document.getElementById('divContentsControl').style.color = '#9CC0E7';

	} else {

		//pageMode = 'reading'
		//document.getElementById('divContentsControl').style.backgroundColor = '#EEEEEE';
		document.getElementById('divPaperMode').innerHTML = '읽기모드';

		//readOnly = '작동'
		document.getElementById('paperTitle').readOnly = true;
		document.getElementById('direction').readOnly = true;
		document.getElementById('naviA').readOnly = true;
		document.getElementById('naviB').readOnly = true;
		document.getElementById('actionPlan').readOnly = true;

		//div조절
		// 저장하기 버튼
		document.getElementById('divNewSave_btn').style.display = 'none';
		// 작성하기 버튼
		document.getElementById('divEdit_btn').style.display = 'initial';
		// 작성취소하기 버튼
		document.getElementById('divEditCancel_btn').style.display = 'none';
		// 수정본 저장하기 버튼
		document.getElementById('divUpdateSave_btn').style.display = 'none';
		// 삭제하기 버튼
		document.getElementById('divRemove_btn').style.display = 'initial';
		document.getElementById('divNewPaperCreate_btn').style.display = 'initial';

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

// 선택한 날짜에 맞춰서 내용 집어넣기

function selectDate() {

	//날짜 선택하기
	let selectedDateValue = document.getElementById("SelectboxDate").value;
	console.log('selectedDateValue=', selectedDateValue);

	document.getElementById('dateChecked').innerHTML = bigPictureData[selectedDateValue].editedDate;
	document.getElementById('direction').value = bigPictureData[selectedDateValue].contents.direction;
	document.getElementById('naviA').value = bigPictureData[selectedDateValue].contents.naviA;
	document.getElementById('naviB').value = bigPictureData[selectedDateValue].contents.naviB;
	document.getElementById('actionPlan').value = bigPictureData[selectedDateValue].contents.actionPlan;

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
	document.getElementById('paperTitle').value = '';
	document.getElementById('direction').value = '';
	document.getElementById('naviA').value = '';
	document.getElementById('naviB').value = '';
	document.getElementById('actionPlan').value = '';

	document.getElementById('divHistory').style.display = 'initial';
	document.getElementById('divPageEdit_menu').style.display = 'initial';

	pageModeHandler('editing');

	document.getElementById('divUpdateSave_btn').style.display = 'none';
	document.getElementById('divRemove_btn').style.display = 'none';


}

// --------------------------
// 작성모드 설정하기
// --------------------------

function mode_editing() {

	document.getElementById('divHistory').style.display = 'initial';
	document.getElementById('divPageEdit_menu').style.display = 'initial';

	pageModeHandler('editing');

}

// --------------------------
// 작성모드 취소하기
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
	let updatedData = {
		contents: {}
	}

	let dateCheckedValue = document.getElementById("dateChecked").innerHTML;

	console.log('dateCheckedValue = ', dateCheckedValue)

	let today = new Date();
	console.log('today=', today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	updatedData['editedDate'] = todayValue;
	updatedData.contents['direction'] = document.getElementById('direction').value;
	updatedData.contents['naviA'] = document.getElementById('naviA').value;
	updatedData.contents['naviB'] = document.getElementById('naviB').value;
	updatedData.contents['actionPlan'] = document.getElementById('actionPlan').value;

	console.log("updatedData = ", updatedData)

	let userUid = data.uid
	let bigPictureUid = bigPictureData[dateCheckedValue].uid

	const userRef = db.ref("users/" + userUid + '/bigPicture/' + bigPictureUid + '/')

	userRef.update(updatedData, (e) => {
		console.log('update completed = ', e);
	});

	pageModeHandler('reading');

	alert("저장되었습니다.");

};

function onRemove() {
	let removeData = {
		contents: {}
	}

	console.log("bigPictureData@onRemove = ", bigPictureData)

	let dateCheckedValue = document.getElementById("dateChecked").innerHTML;

	console.log('dateCheckedValue = ', dateCheckedValue)

	removeData['date'] = dateCheckedValue;
	removeData.contents['direction'] = document.getElementById('direction').value;
	removeData.contents['naviA'] = document.getElementById('naviA').value;
	removeData.contents['naviB'] = document.getElementById('naviB').value;
	removeData.contents['actionPlan'] = document.getElementById('actionPlan').value;

	let userUid = data.uid
	let bigPictureUid = bigPictureData[dateCheckedValue].uid

	const userRef = db.ref("users/" + userUid + '/bigPicture/' + bigPictureUid + '/')

	pageModeHandler('reading');

	//삭제재확인
	if (confirm("정말 삭제하시겠습니까?")) {

		userRef.remove();

		alert("삭제되었습니다.");

	}

};

function onNewSave() {

	let newBigPicture = {
		contents: {}
	}

	let today = new Date();
	console.log('today=', today);
	let todayValue = today.toLocaleString()
	console.log('todayValue=', todayValue);

	newBigPicture['createdDate'] = todayValue;
	newBigPicture['editedDate'] = todayValue;
	newBigPicture.contents['paperTitle'] = document.getElementById('paperTitle').value
	newBigPicture.contents['direction'] = document.getElementById('direction').value
	newBigPicture.contents['naviA'] = document.getElementById('naviA').value
	newBigPicture.contents['naviB'] = document.getElementById('naviB').value
	newBigPicture.contents['actionPlan'] = document.getElementById('actionPlan').value

	console.log("newBigPicture = ", newBigPicture)

	const usersRef = db.ref("users")
	let userUid = data.uid

	usersRef.child(userUid + "/bigPicture/")
		.push(newBigPicture);

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