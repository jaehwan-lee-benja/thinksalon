const firebase = appFireBase;
const db = firebase.database();

let userInfoData = {};
let bpData = {};
let currentBpData = {};

(function () {
		firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			readUser(user);
		} else {
			window.location.replace("login.html");
		};
	});
})();

function logOut() {
	firebase.auth().signOut();
};

function readUser(user) {
	const userRef = db.ref("users").child(user.uid);
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			if(key == "bigPicture") {
				let bigPictures = value;
				let bpIds = Object.keys(bigPictures);
				bpIds.forEach( bpId => {
					let bigPicture = bigPictures[bpId];
					let bpTitle = bigPicture.bpTitle;
					bpData[bpTitle] = bigPicture;
					bpData[bpTitle]["bpId"] = bpId;
				});
			}else{
				value["uid"] = childSnap.key;
				userInfoData[key] = value;
			};
		});
		//아래 내용을 readCurrentBpData()로 뺄 수 있는가?
		let bpTitleList = Object.keys(bpData);
		if(bpTitleList.length > 0) {
			let currentTitle = getCurrentTitle(bpTitleList);
			createCurrentBpData(currentTitle);
			createSelectbox(bpTitleList);
			stateHandler("readPaper");
		} else {
			stateHandler("createFirstPaper");
		};
		printUserInfo();
	});
};

function createSelectbox(bpTitleList) {

	let selectboxTitle = document.getElementById("selectboxTitle");

	// SelectboxTitle 초기화하기
	for (let i = selectboxTitle.options.length - 1; i >= 0; i--) {
		selectboxTitle.remove(i + 1);
	};

	// seletbox에 <option> 만들어서, Title값 넣기
	for (let i = 0; i < bpTitleList.length; i++) {
		let option = document.createElement("OPTION"),
			txt = document.createTextNode(bpTitleList[i]);
		option.appendChild(txt);
		option.setAttribute("value", bpTitleList[i]);
		selectboxTitle.insertBefore(option, selectboxTitle.lastChild);
	};

	// selectbox에 현재 타이틀 띄우기
	let currentTitle = currentBpData.bpTitle;
	for (let i = 1; i < bpTitleList.length + 1; i++) {
		let optionTitleList = document.getElementById("selectboxTitle").options[i].value;
		if (optionTitleList == currentTitle) {
			document.getElementById("selectboxTitle").options[i].setAttribute('selected', true);
		};
	};
};

function getCurrentTitle(bpTitleList) {
	let selectedTitle = document.getElementById("selectboxTitle").value;
	if (selectedTitle == "클릭하여 선택"){
		let currentTitle = bpTitleList[bpTitleList.length-1];
		return currentTitle;
	} else {
		let currentTitle = selectTitle();
		return currentTitle;
	};
};

function createCurrentBpData(currentTitle) {
			// lastestDate로 currentBpData만들기
		for (let key in bpData) {
			if(key == currentTitle){
				let bpDataSet = bpData[key]
				for (let key in bpDataSet) {
					currentBpData[key] = bpDataSet[key];
				};
			};
		};
		printbpData();
};

function printbpData() {

	let dateChecked = currentBpData.editedDate

	document.getElementById("dateChecked").innerHTML = dateChecked;
	document.getElementById("bpTitle").innerHTML = currentBpData.bpTitle;
	document.getElementById("direction").innerHTML = currentBpData.contents.direction;
	document.getElementById("naviA").innerHTML = currentBpData.contents.naviA;
	document.getElementById("naviB").innerHTML = currentBpData.contents.naviB;
	document.getElementById("actionPlan").innerHTML = currentBpData.contents.actionPlan;

	pageModeHandler("reading");

};

function stateHandler(state) {

	function hide(id) {
		document.getElementById(id).style.display = "none";
	};
	
	function show(id) {
		document.getElementById(id).style.display = "initial";
	};
	
	hide("openEditPaper_btn");
	hide("cancelEditPaper_btn");
	hide("saveEditedPaper_btn");
	hide("saveNewPaper_btn");
	hide("removePaper_btn");
	hide("openNewPaper_btn");
	
	switch(state){
		case "createFirstPaper" :
			document.getElementById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
			show("saveNewPaper_btn");
			pageModeHandler("editing");
			break;
		case "openNewPaper" :
			show("saveNewPaper_btn");
			show("cancelEditPaper_btn")
			pageModeHandler("editing");
			break;
		case "readPaper" :
			show("openEditPaper_btn");
			show("openNewPaper_btn");
			show("removePaper_btn");
			pageModeHandler("reading");
			break;
		case "editPaper" :
			show("saveEditedPaper_btn");
			show("cancelEditPaper_btn");
			show("saveNewPaper_btn");
			show("removePaper_btn");
			pageModeHandler("editing");
			break;
		default:
			let state = null;
	}
	console.log("state = ", state);
};

function printUserInfo() {

	let userName = userInfoData.name;
	let userEmail = userInfoData.email;
	document.getElementById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	document.getElementById("emailChecked").innerHTML = "(" + userEmail + ")"

};

function pageModeHandler(pageMode) {
	if (pageMode == "editing") {
		document.getElementById("divPaperMode").innerHTML = "작성모드";
		document.getElementById("gridMainFrame").style.color = "#9CC0E7";
		document.getElementById("bpTitle").readOnly = false;
		document.getElementById("direction").readOnly = false;
		document.getElementById("naviA").readOnly = false;
		document.getElementById("naviB").readOnly = false;
		document.getElementById("actionPlan").readOnly = false;
		document.getElementById("divPaperInfo").style.display = "none";
	} else {
		document.getElementById("divPaperMode").innerHTML = "읽기모드";
		document.getElementById("gridMainFrame").style.color = "#424242";
		document.getElementById("bpTitle").readOnly = true;
		document.getElementById("direction").readOnly = true;
		document.getElementById("naviA").readOnly = true;
		document.getElementById("naviB").readOnly = true;
		document.getElementById("actionPlan").readOnly = true;
	};
};

function selectTitle() {

	let selectedTitleValue = document.getElementById("selectboxTitle").value;

	if (selectedTitleValue != "클릭하여 선택") {
		let selectedBpData = bpData[selectedTitleValue];

		document.getElementById("dateChecked").innerHTML = selectedBpData.editedDate;
		document.getElementById("bpTitle").value = selectedBpData.bpTitle;
		document.getElementById("direction").value = selectedBpData.contents.direction;
		document.getElementById("naviA").value = selectedBpData.contents.naviA;
		document.getElementById("naviB").value = selectedBpData.contents.naviB;
		document.getElementById("actionPlan").value = selectedBpData.contents.actionPlan;
	
		let currentTitle = selectedBpData.bpTitle;
		createCurrentBpData(currentTitle);
		stateHandler("readPaper");
	} else {
		location.reload();
	};
};

function selectSavedTitle(bpTitle) {
	console.log("check!")
	let selectedBpData = bpData[bpTitle];

	document.getElementById("dateChecked").innerHTML = selectedBpData.editedDate;
	document.getElementById("bpTitle").value = selectedBpData.bpTitle;
	document.getElementById("direction").value = selectedBpData.contents.direction;
	document.getElementById("naviA").value = selectedBpData.contents.naviA;
	document.getElementById("naviB").value = selectedBpData.contents.naviB;
	document.getElementById("actionPlan").value = selectedBpData.contents.actionPlan;

	// 220322 - 아래 부분 함수로 만들어서, 저장하고나서 입력된 내용으로 보이도록 하기 reload가 아닌.
	let currentTitle = selectedBpData.bpTitle;
	createCurrentBpData(currentTitle);
	// selectbox에 현재 타이틀 띄우기
	let bpTitleList = Object.keys(bpData);
	for (let i = 1; i < bpTitleList.length + 1; i++) {
		let optionTitleList = document.getElementById("selectboxTitle").options[i].value;
		if (optionTitleList == currentTitle) {
			document.getElementById("selectboxTitle").options[i].setAttribute('selected', true);
		};
	};
	stateHandler("readPaper");
};

function openNewPaper() {

	stateHandler("openNewPaper");

	document.getElementById("dateChecked").innerHTML = timeStamp();
	document.getElementById("bpTitle").value = "";
	document.getElementById("direction").value = "";
	document.getElementById("naviA").value = "";
	document.getElementById("naviB").value = "";
	document.getElementById("actionPlan").value = "";

	pageModeHandler("editing");

};

function openEditPaper() {

	stateHandler("editPaper");

};

function cancelEditPaper() {

	let currentTitle = getCurrentTitle();
	createCurrentBpData(currentTitle);
	stateHandler("readPaper");

};

function saveEditedPaper() {
	
	let updatedBpData = {
		contents: {}
	};

	updatedBpData["editedDate"] = timeStamp();
	updatedBpData["bpTitle"] = document.getElementById("bpTitle").value;
	updatedBpData.contents["direction"] = document.getElementById("direction").value;
	updatedBpData.contents["naviA"] = document.getElementById("naviA").value;
	updatedBpData.contents["naviB"] = document.getElementById("naviB").value;
	updatedBpData.contents["actionPlan"] = document.getElementById("actionPlan").value;

	db.ref("users")
		.child(userInfoData.uid)
		.child("bigPicture")
		.child(currentBpData.bpId)
		.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
	});

	stateHandler("readPaper");
	alert("저장되었습니다.");
	//selectSavedTitle();
	location.reload();
};

function removePaper() {

	if (confirm("정말 삭제하시겠습니까?")) {
		db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.child(currentBpData.bpId)
			.remove();
		alert("삭제되었습니다.");
		location.reload();
	};

	stateHandler("readPaper");

};

// function editSameTitle(newBpTitle, sameTitle) {
// 	if (newBpTitle == sameTitle) {
// 		let editedNewBpTitle = newBpTitle + "*"
// 		let sameTitle2 = getSameTitle(editedNewBpTitle);
// 		if (sameTitle2 == undefined){
// 			return editedNewBpTitle;
// 		} else {
// 			editSameTitle(editedNewBpTitle, sameTitle2);
// 		};
// 	} else {
// 		return newBpTitle;
// 	};
// };

function getSameTitle(newBpTitle) {
	let bpTitleList = Object.keys(bpData);
	let filterSameTitleList = (query) => {
		return bpTitleList.find(newBpTitle => query == newBpTitle);
	};
	let sameTitleList = filterSameTitleList(newBpTitle);
	return sameTitleList;
};

// function countSameTitle(bpTitle) {
// 	let bpTitleList = Object.keys(bpData);
// 	let filterSameTitleList = (query) => {
// 		return bpTitleList.filter(title => bpTitle.indexOf(query) > -1);
// 	};
// 	let sameTitleList = filterSameTitleList(bpTitle);
// 	let sameTitleCounts = sameTitleList.length + 1;
// 	let updatedTitle = bpTitle + " (" + sameTitleCounts + ")";
// 	return updatedTitle;
// };

function checkUntitle(writtenBpTitle) {
	if (writtenBpTitle == ""){
		let newBpTitle = "제목없음";
		return newBpTitle;
	} else {
		let newBpTitle = writtenBpTitle;
		return newBpTitle;
	};
};

function saveNewPaper() {

	let newBpData = {
		contents: {}
	};

	newBpData["editedDate"] = timeStamp();
	newBpData["createdDate"] = timeStamp();
	newBpData.contents["direction"] = document.getElementById("direction").value;
	newBpData.contents["naviA"] = document.getElementById("naviA").value;
	newBpData.contents["naviB"] = document.getElementById("naviB").value;
	newBpData.contents["actionPlan"] = document.getElementById("actionPlan").value;

	let newBpTitle = document.getElementById("bpTitle").value;
	let sameTitle = getSameTitle(newBpTitle);
	if (newBpTitle != "") {
		if (sameTitle == undefined) {
			newBpData["bpTitle"] = newBpTitle;
			db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.push(newBpData);
	
			selectSavedTitle(newBpTitle);
			//stateHandler("readPaper");
			alert("저장되었습니다.");
			//location.reload();
		} else {
			alert("중복된 페이퍼 제목이 있습니다. 페이퍼 제목을 수정해주시기 바랍니다.");
		};
	} else {
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	}
	
};

function setMainBp() {
	// 새로 작성중인 코드(220316)

	// 1. 서버로부터 bpId 읽어오기
	// 2. bpId = currentBpId 매칭하기
	// 3. 매칭이 되면, setMainBp = "main"으로 설정하기
	// 4. 다른 setMainBp 중 "main"이 있던게 있다면, null로 바꾸기
	// 5. 새로고침하기

	// 1. 서버로부터 bpId 읽어오기

	// 팝업으로 확인도 진행한다.
	// 완료되면 리딩모드로 진행된다.
	// 처음 페이지 로드시에는 그럼 메인페이퍼 셋팅 된것으로 체크된다.
	// 페이퍼정보 화면에서도 '메인페이퍼로 설정되어있음'을 표시한다.
	// 페이퍼이름 옆에 '별표'를 붙여서 리스트 중 어떤 것이 메인인지도 볼 수 있게한다.
};

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
};

function resizeTextarea() {
	// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
	const tx = document.getElementsByTagName("textarea");
	for (let i = 0; i < tx.length; i++) {
		tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		tx[i].addEventListener("input", OnInput, false);
	};
	
	function OnInput() {
		this.style.height = "auto";
		this.style.height = (this.scrollHeight) + "px";
	};
};

// [향후 개선하기] 더블클릭시 작성모드로 설정되기
// [버그] direction에 있는 textarea만 선택이 되고 있음
// const card = document.querySelector("textarea");

// card.addEventListener("dblclick", function (e) {
// 	openEditPaper();
// });

function darkmode() {
	let selectorBody = document.querySelector("body")
	let selectorDarkMode = document.getElementById("darkMode")
	let selectorGridIndex = document.getElementById("gridIndex")
	let selectordivContentsControl = document.getElementById("divContentsControl")
	if (selectorDarkMode.value === "다크모드 켜기") {
		selectorBody.style.backgroundColor = "#1E1E1E";
		selectorBody.style.color = "white";
		selectorDarkMode.value = "다크모드 끄기";

		let alist = document.querySelectorAll("a");
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = "powderblue";
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = "#333333";
		selectordivContentsControl.style.backgroundColor = "#333333";

	} else {
		selectorBody.style.backgroundColor = "white";
		selectorBody.style.color = "black";
		selectorDarkMode.value = "다크모드 켜기";

		let alist = document.querySelectorAll("a");
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = "blue";
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = "rgb(240, 240, 240)";
		selectordivContentsControl.style.backgroundColor = "rgb(240, 240, 240)";

	}
};