// const firebase = appFireBase;
// firebase 자체의 버전 이슈로 있던 기능

const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
let userData = {};
let bpDataPool = {};
let packagedData = {};
let indexArray = [];
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
			requestUserData(user);
			requestBpData(user);
			// requestMainTag();
		} else {
			window.location.replace("login.html");
		};
	});
}; // testing..

function logOut() {
	firebase.auth().signOut();
}; // testing..

// --------------------------------------------------
// *** user에 대한 상태 판단
// --------------------------------------------------

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
}; // testing..

// --------------------------------------------------
// *** serverManager_StoL
// --------------------------------------------------

function requestUserData(user) {
	const userRef = db.ref("users").child(user.uid).child("user");
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			value["uid"] = childSnap.key;
			userData[key] = value;
		});
		printUserInfo(userData);
	});
}; // checked!

function requestBpData(user) {
	const userRef = db.ref("users").child(user.uid);
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			if(key == "bpDataPool") {
				bpDataPool[key] = value;
			};
		});
		indexArray = listupIndexArray();
	});
}; // testing..

// --------------------------------------------------
// *** userManager
// --------------------------------------------------

function printUserInfo(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
}; // checked!

// --------------------------------------------------
// *** indexManager
// --------------------------------------------------

function listupIndexArray() {
	return Object.keys(bpDataPool);
};

// --------------------------------------------------
// *** CRUDManager
// --------------------------------------------------

function saveNewPaper() {

	let packagedDataNew = packageData_new();
	let monitorIndexResult = monitorIndex(packagedDataNew);

	if(monitorIndexResult == Boolean) {
		db.ref("users")
		.child(userData.uid)
		.child("bpDataPool")
		.push(packagedData);
	};

			// let bpTitleArray = Object.keys(bpData);
			// // 첫 bpData인 경우, 메인페이지로 셋팅되게하기
			// if (bpTitleArray.length == 0){
			// 	packagedData["isMainBp"] = "main";
			// } else {
			// 	packagedData["isMainBp"] = "";
			// };

			// currentBpData = packagedData;
			// printCurrentBpData();
			// highLightBorder("character", "rgb(200, 200, 200)");
			// selectorById("guideMessage").style.display = "none";
			// alert("저장되었습니다.");
}; // testing..

function packageData_new() {
	packagedData["createdDate"] = timeStamp();
	packagedData["editedDate"] = timeStamp();
	packagedData["character"] = selectorById("character").value.trim();
	packagedData["direction"] = selectorById("direction").value.trim();
	packagedData["naviArea"] = selectorById("naviArea").value.trim();
	packagedData["naviB"] = selectorById("naviB").value.trim();
	packagedData["naviA"] = selectorById("naviA").value.trim();
	packagedData["actionPlan"] = selectorById("actionPlan").value.trim();
	return packagedData;
}; // testing..

// --------------------------------------------------
// *** monitorManager
// --------------------------------------------------

function monitorIndex(packagedData) {
	let packagedIndex = selectorById("character").value.trim();
	let sameIndexArray = getSameIndexArray(packagedIndex);
	if (packagedIndex != "") {
		if (sameIndexArray == undefined) {
			return true;
		} else {
			highLightBorder("character", "red");
			alert("중복된 페이퍼 제목이 있습니다. 페이퍼 제목을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder("character", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
};

function getSameIndexArray(packagedIndex) {
	let filterSameIndexArray = (query) => {
		return indexArray.find(packagedIndex => query == packagedIndex);
	};
	let sameIndexArray = filterSameIndexArray(packagedIndex);
	return sameIndexArray;
}; // testing..

// --------------------------------------------------
// *** supporter
// --------------------------------------------------
function selectorById(id) {
	return document.getElementById(id);
}; // checked!

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
}; // checked!


// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------


// --------------------------------------------------
// *** bpData 오브젝트 관리를 위한 함수 세트
// --------------------------------------------------

function emptyBpData() {
	let bpTitleArray = Object.keys(bpData);
	for (let i = 0; i < bpTitleArray.length; i++) {
	delete bpData[bpTitleArray[i]];
	};
}; // 쓰이지 않고 있음

function emptyCurrentBpData() {
	let bpTitleArray = Object.keys(bpData);
	for (let i = 0; i < bpTitleArray.length; i++) {
		if(currentBpData.bpTitle == bpData[bpTitleArray[i]].bpTitle){
			delete bpData[bpTitleArray[i]];
		};
	};
}; // 쓰이지 않고 있음

function isEmptyBpData() {
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
	console.log("currentBpTitle @ createCurrentBpData = ", currentBpTitle);
	let createdCurrentBpData = bpData[currentBpTitle];
	currentBpData = createdCurrentBpData;
	return createdCurrentBpData;
}; // testing..

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
}; // testing..

function printCurrentBpData() {
	selectorById("dateChecked").innerHTML = currentBpData.editedDate.slice(0, 10);
	selectorById("bpTitle").value = currentBpData.bpTitle;
	selectorById("direction").value = currentBpData.direction;
	selectorById("naviArea").value = currentBpData.naviArea;
	selectorById("naviB").value = currentBpData.naviB;
	selectorById("naviA").value = currentBpData.naviA;
	selectorById("actionPlan").value = currentBpData.actionPlan;
	printCurrentBpTitleOnSelectbox();
}; // testing..

function inputCurrentBpData() {
	currentBpData["editedDate"] = timeStamp();
	currentBpData["bpTitle"] = selectorById("bpTitle").value.trim();
	currentBpData["direction"] = selectorById("direction").value.trim();
	currentBpData["naviArea"] = selectorById("naviArea").value.trim();
	currentBpData["naviB"] = selectorById("naviB").value.trim();
	currentBpData["naviA"] = selectorById("naviA").value.trim();
	currentBpData["actionPlan"] = selectorById("actionPlan").value.trim();
	return currentBpData;
}; // testing..

function printEmptyCurrentBpData() {
	selectorById("dateChecked").innerHTML = timeStamp().slice(0, 10);
	selectorById("bpTitle").value = "";
	selectorById("direction").value = "";
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";
	btnShowHideHandler("createFirstPaper");
}; // testing..

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
}; // testing..

function getSameBpTitle(newBpTitle) {
	let bpTitleArray = Object.keys(bpData);
	let filterSamebpTitleArray = (query) => {
		return bpTitleArray.find(newBpTitle => query == newBpTitle);
	};
	let samebpTitleArray = filterSamebpTitleArray(newBpTitle);
	return samebpTitleArray;
}; // testing..

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
			let mainBpTitleOptionMark = bpTitle + " ★";
			let mainTxt = document.createTextNode(mainBpTitleOptionMark);
			option.appendChild(mainTxt);
		} else {
			option.appendChild(txt);
		};
		option.setAttribute("value", bpTitleArray[i]);
		selectbox.insertBefore(option, selectbox.lastChild);
	};
	printCurrentBpTitleOnSelectbox();
}; // testing..

function printCurrentBpTitleOnSelectbox() {

	let bpTitleArray = Object.keys(bpData);
	let currentBpTitle = currentBpData.bpTitle;

	for (let i = 0; i <= bpTitleArray.length; i++) {
		if(bpTitleArray.length == 0){
			selectorById("selectboxBpTitle").options[0].setAttribute("selected", true);
		} else {
			let selectorOption = selectorById("selectboxBpTitle").options[i];
			let optionValue = selectorOption.value;
			selectorOption.removeAttribute("selected");
			if (optionValue == currentBpTitle) {
				selectorOption.setAttribute("selected", true);
			};
		};
	};

}; // testing..

function getBpTitleFromSelectboxBpTitle() {
	let selectedBpTitleValue = selectorById("selectboxBpTitle").value;
	if (selectedBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		let bpTitleArray = Object.keys(bpData);
		selectedBpTitleValue = bpTitleArray[0];
	};
	return selectedBpTitleValue;
}; // testing..

function openCurrentBpDataBySelectboxBpTitle() {
	let currentBpTitleBySelectbox = getBpTitleFromSelectboxBpTitle();
	updateCurrentBpDataByBpTitle(currentBpTitleBySelectbox);
	printCurrentBpData();
	btnShowHideHandler("readPaper");
}; // testing..

// --------------------------------------------------
// *** mainBpData 관리를 위한 함수 세트
// --------------------------------------------------

function findMainBpTitle() {
	let bpTitleArray = Object.keys(bpData);
	let IsThereAnyMainBpResult = IsThereAnyMainBp();
	console.log("IsThereAnyMainBpResult = ", IsThereAnyMainBpResult);
	if (IsThereAnyMainBpResult == true){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let isMainBpValue = bpData[bpTitleArray[i]].isMainBp;
			let mainBpTitle = bpData[bpTitleArray[i]].bpTitle;
			if (isMainBpValue == "main") {
				console.log("findMainBpTitle1");
				console.log("mainBpTitle1 = ", mainBpTitle);
				return mainBpTitle;
			};
		};
	} else {
		console.log("findMainBpTitle3");
		setMainBp();
		bpData[bpTitleArray[0]].isMainBp = "main";
		let mainBpTitle = bpData[bpTitleArray[0]].bpTitle;
		return mainBpTitle;
	};
}; // testing..

function IsThereAnyMainBp() {
	let isMainBpValueArray = [];
	let bpTitleArray = Object.keys(bpData);
	for (let i = 0; i < bpTitleArray.length; i++) {
		let isMainBpValue = bpData[bpTitleArray[i]].isMainBp;
		isMainBpValueArray.push(isMainBpValue);
	};

	let uniqueIsMainBpValueArray = isMainBpValueArray.filter((element, index) => {
			return isMainBpValueArray.indexOf(element) == index;
		});

	console.log("uniqueIsMainBpValueArray = ", uniqueIsMainBpValueArray);
	if (uniqueIsMainBpValueArray.length == 1){
		if(uniqueIsMainBpValueArray[0] == ""){
			return false;
		};
	} else {
		return true;
	};
};

function catchFirstBpIdByBpTitleArray() {
	let bpTitleArray = Object.keys(bpData);
	let firstBpId = bpData[bpTitleArray[0]].bpId;
	return firstBpId;
};

// 정비할것
function setMainBp() {

	let updatedBpData = {};
	updatedBpData["isMainBp"] = "main";

	let thisBpIdArray = [];
	let bpTitleArray = Object.keys(bpData);
	let currentBpDataLength = Object.keys(currentBpData).length;

	if (currentBpDataLength > 0) {
		thisBpIdArray.push(currentBpData.bpId);

		unsetMainBp();

		// update currentBpData(local) 
		currentBpData["isMainBp"] = "main";
		console.log("bpTitleArray @ setMainBp = ", bpTitleArray);

		for (let i = 0; i < bpTitleArray.length; i++) {
			let bpTitle = bpData[bpTitleArray[i]].bpTitle;
			if (bpTitle != currentBpData.bpTitle) {
				bpData[bpTitleArray[i]].isMainBp = "";
			};
		};

	} else {
		let firstBpIdByBpTitleArray = catchFirstBpIdByBpTitleArray();
		thisBpIdArray.push(firstBpIdByBpTitleArray);
	};

	let thisBpId = thisBpIdArray[0];
	console.log("thisBpId @ setManBp = ", thisBpId);

	db.ref("users")
		.child(userInfoData.uid)
		.child("bigPicture")
		.child(thisBpId)
		.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
		});
	
	// alert message
	// if(bpTitleArray.length > 1){
	// 	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value
	// 	console.log("selectboxBpTitleValue @ before alert", selectboxBpTitleValue);
	// 	if (selectboxBpTitleValue != SELECTBOX_BPTITLE_VALUE_INIT) {
	// 		alert("메인 페이퍼로 설정이 완료되었습니다.");
	// 	};
	// };
	function alertSetMainBp() {
		alert("메인 페이퍼로 설정이 완료되었습니다.");
	};
	let selectorOpenMainBpBtn = selectorById("openMainBp_btn")
	selectorOpenMainBpBtn.addEventListener("click", alertSetMainBp);

	btnShowHideHandler("readPaper");
	//location.reload();

}; // testing..

function unsetMainBp() {

	let updatedBpData = {};

	updatedBpData["isMainBp"] = "";

	let bpTitleArray = Object.keys(bpData);
	console.log("bpTitleArray @ unsetMainBp = ", bpTitleArray);

	if (bpTitleArray.length > 0){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let bpIds = bpData[bpTitleArray[i]].bpId;
	
			console.log("currentBpData.bpId @ unsetMainBp = ", currentBpData.bpId);
	
			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.child(bpIds)
				.update(updatedBpData, (e) => {
				console.log("update completed = ", e);
				});
	
		};
	};
}; // testing..

function openMainBp() {
	let mainBpTitle = findMainBpTitle();
	updateCurrentBpDataByBpTitle(mainBpTitle);
	printCurrentBpData();
	btnShowHideHandler("readPaper");
}; // testing..

// --------------------------------------------------
// *** CRUD 관리를 위한 함수 세트
// --------------------------------------------------

function openNewPaper() {
	printEmptyCurrentBpData();
	btnShowHideHandler("openNewPaper");
}; // testing..



function openEditPaper() {
	btnShowHideHandler("editPaper");
}; // testing..

function openEditPaperByDbclick() {
	const card = document.getElementsByTagName("textarea");
	for (let i = 0; i < card.length; i++) {
		card[i].addEventListener("dblclick", function (e) {
			openEditPaper();
		});
	};
}; // testing..

function cancelEditPaper() {
	createCurrentBpData();
	printCurrentBpData();
	highLightBorder("bpTitle", "rgb(200, 200, 200)");
	btnShowHideHandler("readPaper");
}; // testing..

// 정비할것
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
}; // testing..

// mainBp가 없어진 경우, 다른 mainBp가 생겨야한다. setMainBp 활용가능할듯?!
function removePaper() {
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.child(currentBpData.bpId)
			.remove();

		// console.log("bpData1 = ", bpData);
		// console.log("currentBpData1 = ", currentBpData);
		// console.log("bpData2 = ", bpData);
		// let changedCurrentBpTitle = findMainBpTitle();
		// updateCurrentBpDataByBpTitle(changedCurrentBpTitle);
		// console.log("currentBpData2 = ", currentBpData);
		//printCurrentBpData();
		//emptyBpData();
		alert("삭제되었습니다.");
		location.reload();
	};
}; // testing..

// --------------------------------------------------
// *** UI 관리를 위한 함수 세트
// --------------------------------------------------

function uiHide(id) {
	selectorById(id).style.display = "none";
}; // testing..

function uiShow(id) {
	selectorById(id).style.display = "initial";
}; // testing..

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
}; // testing..

function btnShowHideHandler_mainBp(state) {
	uiHide("setMainBp_btn");
	uiHide("openMainBp_btn");
	uiHide("setMainBp_txt");
	if (currentBpData.isMainBp == "main") {
		uiShow("setMainBp_txt");
	} else {
		if(state != "createFirstPaper") {
			uiShow("openMainBp_btn");
			uiShow("setMainBp_btn");
		};
	};
}; // testing..

function highLightBorder(id, color) {
	return selectorById(id).style.borderColor = color;
}; // testing..

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
}; // testing..

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

