// const firebase = appFireBase;
// firebase 자체의 버전 이슈로 있던 기능

const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
let userInfoData = {};
let bpData = {};
let currentBpData = {};

(function() {
	logIn();
	openEditPaperByDbclick();
})();

// --------------------------------------------------
// *** logIn 관리를 위한 함수 세트
// --------------------------------------------------
function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestUserInfoData(user);
			requestBpData(user);
		} else {
			window.location.replace("login.html");
		};
	});
}; // checked!

function logOut() {
	firebase.auth().signOut();
}; // checked!

// --------------------------------------------------
// *** user에 대한 상태 판단
// --------------------------------------------------
function isWebReloaded() {
	// // 참고: https://stackoverflow.com/questions/5004978/check-if-page-gets-reloaded-or-refreshed-in-javascript
	// const pageAccessedByReload = (
	// 	(window.performance.navigation && window.performance.navigation.type === 1) ||
	// 	  window.performance
	// 		.getEntriesByType('navigation')
	// 		.map((nav) => nav.type)
	// 		.includes('reload')
	//   );
	// return pageAccessedByReload;
}; // 쓰이지 않음

function editModeHandler(paperMode) {
	function textareaReadOnly(id, check){
		selectorById(id).readOnly = check;
	};
	if (paperMode == "editing") {
		selectorById("divPaperMode").innerHTML = "작성모드";
		selectorById("gridMainFrame").style.color = "#9CC0E7";
		textareaReadOnly("bpTitle", false);
		textareaReadOnly("direction", false);
		textareaReadOnly("naviArea", false);
		textareaReadOnly("naviB", false);
		textareaReadOnly("naviA", false);
		textareaReadOnly("actionPlan", false);
	} else {
		selectorById("divPaperMode").innerHTML = "읽기모드";
		selectorById("gridMainFrame").style.color = "#424242";
		textareaReadOnly("bpTitle", true);
		textareaReadOnly("direction", true);
		textareaReadOnly("naviArea", true);
		textareaReadOnly("naviB", true);
		textareaReadOnly("naviA", true);
		textareaReadOnly("actionPlan", true);
	};
}; // checked!

// --------------------------------------------------
// *** userInfoData 오브젝트 관리를 위한 함수 세트
// --------------------------------------------------
function requestUserInfoData(user) {
	const userRef = db.ref("users").child(user.uid);
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			value["uid"] = childSnap.key;
			userInfoData[key] = value;
		});
		printUserInfo(userInfoData);
	});
}; // checked!

function printUserInfo(userInfoData) {
	let userName = userInfoData.name;
	let userEmail = userInfoData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
}; // checked!

// --------------------------------------------------
// *** bpData 오브젝트 관리를 위한 함수 세트
// --------------------------------------------------
function requestBpData(user) {

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
			};
		});

		let bpTitleArray = Object.keys(bpData);

		if (bpTitleArray.length > 0) {
			let defaultCurrentBpData = createCurrentBpData();
			printCurrentBpData(defaultCurrentBpData);
			putSelectbox("selectboxBpTitle");
			btnShowHideHandler("readPaper");
		} else {
			printEmptyCurrentBpData();
		};
	});
}; // checked!

function emptyBpData(bpData) {
	let bpTitleArray = Object.keys(bpData);
	for (let i = 0; i < bpTitleArray.length; i++) {
	delete bpData[bpTitleArray[i]];
	};
}; // 쓰이지 않고 있음

function isEmptyBpData(bpData) {
	let bpTitleArray = Object.keys(bpData);
	if (bpTitleArray.length == 0) {
		return true;
	} else {
		return false;
	};
}; // 쓰이지 않고 있음

// --------------------------------------------------
// *** currentBpData 오브젝트 관리를 위한 함수 세트
// --------------------------------------------------
function createCurrentBpData() {
	let currentBpTitle = indexBpTitle();
	let createdCurrentBpData = bpData[currentBpTitle];
	currentBpData = createdCurrentBpData;
	return createdCurrentBpData;
}; // checked!

function updateCurrentBpDataByBpTitle(updatedCurrentBpTitle) {
	let bpTitleArray = Object.keys(bpData);
	let updatedCurrentBpData = {};
	for (let i = 0; i < bpTitleArray.length; i++) {
		let bpTitles = [];
		bpTitles.push(bpTitleArray[i]);
		if(bpTitles == updatedCurrentBpTitle){
			updatedCurrentBpData = bpData[updatedCurrentBpTitle];
		};
	};
	currentBpData = updatedCurrentBpData;
	return updatedCurrentBpData;
}; // checked!

function printCurrentBpData() {
	selectorById("dateChecked").innerHTML = currentBpData.editedDate.slice(0, 10);
	selectorById("bpTitle").value = currentBpData.bpTitle;
	selectorById("direction").value = currentBpData.direction;
	selectorById("naviArea").value = currentBpData.naviArea;
	selectorById("naviB").value = currentBpData.naviB;
	selectorById("naviA").value = currentBpData.naviA;
	selectorById("actionPlan").value = currentBpData.actionPlan;
}; // checked!

function inputCurrentBpData() {
	currentBpData["editedDate"] = timeStamp();
	currentBpData["bpTitle"] = selectorById("bpTitle").value.trim();
	currentBpData["direction"] = selectorById("direction").value.trim();
	currentBpData["naviArea"] = selectorById("naviArea").value.trim();
	currentBpData["naviB"] = selectorById("naviB").value.trim();
	currentBpData["naviA"] = selectorById("naviA").value.trim();
	currentBpData["actionPlan"] = selectorById("actionPlan").value.trim();
	return currentBpData;
}; // checked!

function printEmptyCurrentBpData() {
	selectorById("dateChecked").innerHTML = timeStamp().slice(0, 10);
	selectorById("bpTitle").value = "";
	selectorById("direction").value = "";
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
	btnShowHideHandler("createFirstPaper");
}; // checked!

// --------------------------------------------------
// *** indexing BpTitle 관리를 위한 함수 세트
// --------------------------------------------------
function indexBpTitle() {

	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value;

	if (selectboxBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		// by reloaded or openMainBp_btn(=reloaded)
		let currentBpTitle = findMainBpTitle();
		return currentBpTitle;
	} else {
		// by selectbox
		let currentBpTitle = selectorById("selectboxBpTitle").value;
		return currentBpTitle;
	};
}; // checked!

function getSameBpTitle(newBpTitle) {
	let bpTitleArray = Object.keys(bpData);
	let filterSamebpTitleArray = (query) => {
		return bpTitleArray.find(newBpTitle => query == newBpTitle);
	};
	let samebpTitleArray = filterSamebpTitleArray(newBpTitle);
	return samebpTitleArray;
}; // checked!

// --------------------------------------------------
// *** selectBox 관리를 위한 함수 세트
// --------------------------------------------------
function putSelectbox(selectboxId) {

	let bpTitleArray = Object.keys(bpData);
	let selectbox = selectorById(selectboxId);
	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	// <option> 만들어서, bpTitleArray 넣기
	for (let i = 0; i < bpTitleArray.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(bpTitleArray[i]);
		let mainBpTitle = findMainBpTitle();
		let bpTitle = bpData[bpTitleArray[i]].bpTitle;
		if(mainBpTitle == bpTitle){
			let mainBpTitleOptionMark = bpTitle + "★";
			let mainTxt = document.createTextNode(mainBpTitleOptionMark);
			option.appendChild(mainTxt);
		} else {
			option.appendChild(txt);
		};
		option.setAttribute("value", bpTitleArray[i]);
		selectbox.insertBefore(option, selectbox.lastChild);
	};
	printCurrentBpTitleOnSelectbox();
}; // checked!

function printCurrentBpTitleOnSelectbox() {
	console.log("check: printCurrentBpTitleOnSelectbox");
	let bpTitleArray = Object.keys(bpData);
	let currentBpTitle = currentBpData.bpTitle;
	console.log("currentBpTitle = ", currentBpTitle);

	for (let i = 0; i <= bpTitleArray.length; i++) {
		if(bpTitleArray.length == 0){
			selectorById("selectboxBpTitle").options[0].setAttribute("selected", true);
		} else {
			let selectorOption = selectorById("selectboxBpTitle").options[i];
			let optionValue = selectorOption.value;
			console.log("optionValue = ", optionValue);
			selectorOption.removeAttribute("selected");
			if (optionValue == currentBpTitle) {
				selectorOption.setAttribute("selected", true);
			};
		};
	};
}; // checked!

function getBpTitleFromSelectboxBpTitle() {
	let selectedBpTitleValue = selectorById("selectboxBpTitle").value;
	if (selectedBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		let bpTitleArray = Object.keys(bpData);
		selectedBpTitleValue = bpTitleArray[0];
	};
	return selectedBpTitleValue;
}; // checked!

function openCurrentBpDataBySelectboxBpTitle() {
	let currentBpTitleBySelectbox = getBpTitleFromSelectboxBpTitle();
	updateCurrentBpDataByBpTitle(currentBpTitleBySelectbox);
	printCurrentBpData();
	btnShowHideHandler("readPaper");
}; // checked!

// --------------------------------------------------
// *** mainBpData 관리를 위한 함수 세트
// --------------------------------------------------

function findMainBpTitle() {

	let bpTitleArray = Object.keys(bpData);

	function createIsMainBpValueArray() {
		let isMainBpValueArray = [];
		for (let i = 0; i < bpTitleArray.length; i++) {
			let isMainBpValue = bpData[bpTitleArray[i]].isMainBp;
			isMainBpValueArray.push(isMainBpValue);
		};
		return isMainBpValueArray;
	};

	let isMainBpValueArray = createIsMainBpValueArray();
	
	if (isMainBpValueArray.length == 1){
		// isMainBpValueArray갯수가 1개인 경우, 
		// mainBp가 없는 경우( = 기존 mainBp가 삭제된 경우), 또는 1개만 있는 경우이다.
		// 이때, 첫번째 bpTitle을 mainBp로 놓기
		bpData[bpTitleArray[0]].isMainBp = "main";
		let mainBpTitle = bpData[bpTitleArray[0]].bpTitle;
		return mainBpTitle;
	} else {
		for (let i = 0; i < bpTitleArray.length; i++) {
			let isMainBpValue2 = bpData[bpTitleArray[i]].isMainBp;
			if (isMainBpValue2 == "main") {
				let mainBpTitle = bpData[bpTitleArray[i]].bpTitle;
				return mainBpTitle;
			};
		};
	};
}; // checked!

function setMainBp() {

	let updatedBpData = {};
	updatedBpData["isMainBp"] = "main";

	db.ref("users")
		.child(userInfoData.uid)
		.child("bigPicture")
		.child(currentBpData.bpId)
		.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
		});

	unsetMainBp();

	// local bpData update
	currentBpData["isMainBp"] = "main";
	let bpTitleArray = Object.keys(bpData);
	for (let i = 0; i < bpTitleArray.length; i++) {
		let bpTitle = bpData[bpTitleArray[i]].bpTitle;
		if (bpTitle != currentBpData.bpTitle) {
			bpData[bpTitleArray[i]].isMainBp = "";
		};
	};
	
	// alert message
	if(bpTitleArray.length > 1){
		alert("메인 페이퍼로 설정이 완료되었습니다.");
	};

	btnShowHideHandler("readPaper");
	//location.reload();

}; // checked!

function unsetMainBp() {

	let updatedBpData = {};

	updatedBpData["isMainBp"] = "";

	let bpTitleArray = Object.keys(bpData);
	for (let i = 0; i < bpTitleArray.length; i++) {
		let bpIds = bpData[bpTitleArray[i]].bpId;
		console.log("bpIds = ", bpIds);

		if (bpIds != currentBpData.bpId) {
			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.child(bpIds)
				.update(updatedBpData, (e) => {
				console.log("update completed = ", e);
				});
		};
	};
}; // checked!

function openMainBp() {
	let mainBpTitle = findMainBpTitle();
	updateCurrentBpDataByBpTitle(mainBpTitle);
	console.log("currentBpData = ", currentBpData);
	printCurrentBpData();
	printCurrentBpTitleOnSelectbox();
}; // checked!

// --------------------------------------------------
// *** CRUD 관리를 위한 함수 세트
// --------------------------------------------------

function openNewPaper() {
	printEmptyCurrentBpData();
	btnShowHideHandler("openNewPaper");
}; // checked!

function saveNewPaper() {

	let newBpData = inputCurrentBpData();
	let newBpTitle = selectorById("bpTitle").value.trim();
	let sameBpTitle = getSameBpTitle(newBpTitle);

	if (newBpTitle != "") {
		if (sameBpTitle == undefined) {
			newBpData["bpTitle"] = newBpTitle;
			newBpData["createdDate"] = timeStamp();

			let bpTitleArray = Object.keys(bpData);

			// 첫 bpData인 경우, 메인페이지로 셋팅되게하기
			if (bpTitleArray.length == 0){
				newBpData["isMainBp"] = "main";
			} else {
				newBpData["isMainBp"] = "";
			};

			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.push(newBpData);

			currentBpData = newBpData;
			printCurrentBpData();
			highLightBorder("bpTitle", "rgb(200, 200, 200)");
			selectorById("guideMessage").style.display = "none";
			alert("저장되었습니다.");
		} else {
			highLightBorder("bpTitle", "red");
			alert("중복된 페이퍼 제목이 있습니다. 페이퍼 제목을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
}; // checked!

function openEditPaper() {
	btnShowHideHandler("editPaper");
}; // checked!

function openEditPaperByDbclick() {
	const card = document.getElementsByTagName("textarea");
	for (let i = 0; i < card.length; i++) {
		card[i].addEventListener("dblclick", function (e) {
			openEditPaper();
		});
	};
}; // checked!

function cancelEditPaper() {
	createCurrentBpData();
	highLightBorder("bpTitle", "rgb(200, 200, 200)");
	btnShowHideHandler("readPaper");
}; // checked!

function saveEditedPaper() {

	let updatedBpData = inputCurrentBpData();
	let updatedCurrentBpTitle = selectorById("bpTitle").value.trim();

	if (updatedCurrentBpTitle != "") {
			updatedBpData["bpTitle"] = updatedCurrentBpTitle;

			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.child(currentBpData.bpId)
				.update(updatedBpData, (e) => {
				console.log("update completed = ", e);
				});

			currentBpData = updatedBpData;
			printCurrentBpData();
			putSelectbox("selectboxBpTitle");
			highLightBorder("bpTitle", "rgb(200, 200, 200)");
			alert("저장되었습니다.");
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
}; // checked!

function removePaper() {
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다")) {
		db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.child(currentBpData.bpId)
			.remove();
		alert("삭제되었습니다.");
		location.reload();
	};
}; // checked!

// --------------------------------------------------
// *** UI 관리를 위한 함수 세트
// --------------------------------------------------

function uiHide(id) {
	selectorById(id).style.display = "none";
}; // checked!

function uiShow(id) {
	selectorById(id).style.display = "initial";
}; // checked!

function btnShowHideHandler(state) {

	uiHide("openEditPaper_btn");
	uiHide("cancelEditPaper_btn");
	uiHide("saveEditedPaper_btn");
	uiHide("saveNewPaper_btn");
	uiHide("removePaper_btn");
	uiHide("openNewPaper_btn");

	switch(state){
		case "createFirstPaper" :
			uiShow("saveNewPaper_btn");
			editModeHandler("editing");
			break;
		case "openNewPaper" :
			uiShow("saveNewPaper_btn");
			uiShow("cancelEditPaper_btn")
			editModeHandler("editing");
			break;
		case "readPaper" :
			uiShow("openEditPaper_btn");
			uiShow("openNewPaper_btn");
			uiShow("removePaper_btn");
			editModeHandler("reading");
			break;
		case "editPaper" :
			uiShow("saveEditedPaper_btn");
			uiShow("cancelEditPaper_btn");
			uiShow("saveNewPaper_btn");
			uiShow("removePaper_btn");
			editModeHandler("editing");
			break;
		default:
			let state = null;
	}
	btnShowHideHandler_mainBp(state);
	resizeTextarea();
}; // checked!

function btnShowHideHandler_mainBp(state) {
	if (currentBpData.isMainBp == "main") {
		uiHide("setMainBp_btn");
		uiHide("openMainBp_btn");
		uiShow("setMainBp_txt");
	} else {
		if(state == "createFirstPaper") {
			console.log("btnShowHideHandler_mainBp check");
			uiHide("openMainBp_btn");
			uiHide("setMainBp_btn");
		} else {
			uiShow("openMainBp_btn");
			uiShow("setMainBp_btn");
		};
		uiHide("setMainBp_txt");
	};
}; // checked!

function highLightBorder(id, color) {
	return selectorById(id).style.borderColor = color;
}; // checked!

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
}; // checked!

function darkmode() {
	let selectorBody = document.querySelector("body")
	let selectorDarkMode = selectorById("darkMode")
	let selectorGridIndex = selectorById("gridIndex")
	let selectordivContentsControl = selectorById("divContentsControl")
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
}; // 쓰이지 않고 있음

// --------------------------------------------------
// *** 기타 함수 세트
// --------------------------------------------------
function selectorById(id) {
	return document.getElementById(id);
}; // checked!

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
}; // checked!