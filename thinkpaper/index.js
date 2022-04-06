// const firebase = appFireBase;
// firebase 자체의 버전 이슈로 있던 기능

const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
let userData = {};
let bpDataPool = {};
let spoonedBpData = {};
let packagedBpData = {};

(function() {
	logIn();
	openEditPaperByDbclick();
})();

// --------------------------------------------------
// *** logIn Manager
// --------------------------------------------------
function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestUserData(user);
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
// *** UI Manager
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
}; // checked!

// --------------------------------------------------
// *** server Manager_StoL
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
		printUserData(userData);
	});
}; // checked!

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
					bpDataPool[bpTitle] = bigPicture;
					bpDataPool[bpTitle]["bpId"] = bpId;
				});
			};
		});
		let bpTitleArray = listupBpTitleArray();
		if (bpTitleArray.length > 0) {

			let bpTitleSpoon = pickupBpTitleSpoon();
			spoonBpData(bpTitleSpoon);
			printSpoonedBpData();

			putSelectbox("selectboxBpTitle");

		} else {
			printEmptySpoonedBpData();
			selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
		};
	});
}; // checked!

// --------------------------------------------------
// *** server Manager_LtoS
// --------------------------------------------------

function requestPushNewBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.push(packagedBpDataHere);
};

// --------------------------------------------------
// *** userData Manager
// --------------------------------------------------

function printUserData(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
}; // checked!

// --------------------------------------------------
// *** bpDataPool Manager
// --------------------------------------------------

function emptyBpDataPool() {
	let bpTitleArray = Object.keys(bpDataPool);
	for (let i = 0; i < bpTitleArray.length; i++) {
	delete bpDataPool[bpTitleArray[i]];
	};
}; // 쓰이지 않고 있음

function isEmptyBpDataPool() {
	let bpTitleArray = Object.keys(bpDataPool);
	if (bpTitleArray.length == 0) {
		return true;
	} else {
		return false;
	};
}; // 쓰이지 않고 있음

// --------------------------------------------------
// *** bpTitle Manager
// --------------------------------------------------

function listupBpTitleArray() {
	let listupBpTitleArrayResult = Object.keys(bpDataPool);
	return listupBpTitleArrayResult;
}; // checked!

function pickupBpTitleSpoon() {
	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value;

	if (selectboxBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		// by reloaded or openMainBp_btn(=reloaded)
		let bpTitleSpoon = pointMainBpTitle();
		return bpTitleSpoon;
	} else {
		// if (packagedBpData.bpTitle != null) {
		// 	// by requestUpdateBpdata
		// 	let bpTitleSpoon = packagedBpData.bpTitle;
		// 	return bpTitleSpoon;
		// } else {
			// by selectbox
			let bpTitleSpoon = selectorById("selectboxBpTitle").value;
			return bpTitleSpoon;
		// };
	};
};

// --------------------------------------------------
// *** mainTag Manager
// --------------------------------------------------

function pointMainBpTitle() {
	let bpTitleArray = listupBpTitleArray();
	let IsThereAnyMainBpResult = monitorIsThereAnyMainBp();
	if (IsThereAnyMainBpResult == true){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let isMainBpValue = bpDataPool[bpTitleArray[i]].isMainBp;
			let mainBpTitle = bpDataPool[bpTitleArray[i]].bpTitle;
			if (isMainBpValue == "main") {
				return mainBpTitle;
			};
		};
	};
}; // checked!

function monitorIsThereAnyMainBp() {
	
	let isMainBpValueArray = [];
	let bpTitleArray = listupBpTitleArray();

	for (let i = 0; i < bpTitleArray.length; i++) {
		let isMainBpValue = bpDataPool[bpTitleArray[i]].isMainBp;
		isMainBpValueArray.push(isMainBpValue);
	};

	let uniqueIsMainBpValueArray = isMainBpValueArray.filter((element, index) => {
			return isMainBpValueArray.indexOf(element) == index;
		});

	if (uniqueIsMainBpValueArray.length == 1){
		if(uniqueIsMainBpValueArray[0] == ""){
			console.log("There is no mainBp");
			return false;
		} else {
			// console.log("There is mainBp");
			return true;
		};
	} else {
		// console.log("There is mainBp");
		return true;
	};
}; // checked!

// --------------------------------------------------
// *** stage Manager
// --------------------------------------------------

function spoonBpData(bpTitleSpoon) {
	let spoonedBpDataInFunction = bpDataPool[bpTitleSpoon];
	spoonedBpData = spoonedBpDataInFunction;
	return spoonedBpDataInFunction;
};

function emptySpoonedBpData() {
	let bpTitleArray = listupBpTitleArray();
	for (let i = 0; i < bpTitleArray.length; i++) {
		if(spoonedBpData.bpTitle == bpDataPool[bpTitleArray[i]].bpTitle){
			delete bpDataPool[bpTitleArray[i]];
		};
	};
}; // 사용하지 않음

// --------------------------------------------------
// *** UI Manager
// --------------------------------------------------

function printSpoonedBpData() {
	selectorById("dateChecked").innerHTML = spoonedBpData.editedDate.slice(0, 10);
	selectorById("bpTitle").value = spoonedBpData.bpTitle;
	selectorById("direction").value = spoonedBpData.direction;
	selectorById("naviArea").value = spoonedBpData.naviArea;
	selectorById("naviB").value = spoonedBpData.naviB;
	selectorById("naviA").value = spoonedBpData.naviA;
	selectorById("actionPlan").value = spoonedBpData.actionPlan;
	btnShowHideHandler("readPaper");
}; // checked!

function printEmptySpoonedBpData() {
	selectorById("dateChecked").innerHTML = timeStamp().slice(0, 10);
	selectorById("bpTitle").value = "";
	selectorById("direction").value = "";
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";
	btnShowHideHandler("createFirstPaper");
}; // checked!

// --------------------------------------------------
// *** selectbox Manager
// --------------------------------------------------

function putSelectbox(selectboxId) {

	let bpTitleArray = listupBpTitleArray();
	let selectbox = selectorById(selectboxId);
	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	// <option> 만들어서, bpTitleArray 넣기
	for (let i = 0; i < bpTitleArray.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(bpTitleArray[i]);
		let mainBpTitle = pointMainBpTitle();
		let bpTitle = bpDataPool[bpTitleArray[i]].bpTitle;
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
	printBpTitleSpoonOnSelectbox();
}; // checked!

function printBpTitleSpoonOnSelectbox() {

	let bpTitleArray = listupBpTitleArray();
	let currentBpTitle = spoonedBpData.bpTitle;

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

}; // checked!

function selectBpTitleBySelectbox() {
	let bpTitleSpoon = pickupBpTitleSpoon();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData();
};

// --------------------------------------------------
// *** CRUD Manager
// --------------------------------------------------

function packagedBpDataNew() {
	let monitorBpTitleResult = monitorBpTitle();
	if (monitorBpTitleResult == true) {
		packagedBpData["createdDate"] = timeStamp();
		packagedBpData["editedDate"] = timeStamp();
		packagedBpData["bpTitle"] = selectorById("bpTitle").value.trim();
		packagedBpData["direction"] = selectorById("direction").value.trim();
		packagedBpData["naviArea"] = selectorById("naviArea").value.trim();
		packagedBpData["naviB"] = selectorById("naviB").value.trim();
		packagedBpData["naviA"] = selectorById("naviA").value.trim();
		packagedBpData["actionPlan"] = selectorById("actionPlan").value.trim();

		let IsThereAnyMainBpResult = monitorIsThereAnyMainBp();
		if (IsThereAnyMainBpResult == true) {
			packagedBpData["isMainBp"] = ""
		} else {
			packagedBpData["isMainBp"] = "main"
		};

		return packagedBpData;
	};
}; // testing..

function saveNewPaper() {

	let packagedBpData = packagedBpDataNew();
	requestPushNewBpData(packagedBpData);
	spoonedBpData = packagedBpData;
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");

}; // checked!

function saveNewPaper_before() {

	let newBpData = inputSpoonedBpData();
	let newBpTitle = selectorById("bpTitle").value.trim();
	let sameBpTitle = getSameBpTitle(newBpTitle);

	if (newBpTitle != "") {
		if (sameBpTitle == undefined) {
			newBpData["bpTitle"] = newBpTitle;
			newBpData["createdDate"] = timeStamp();

			let bpTitleArray = Object.keys(bpDataPool);

			// 첫 bpDataPool인 경우, 메인페이지로 셋팅되게하기
			if (bpTitleArray.length == 0){
				newBpData["isMainBp"] = "main";
			} else {
				newBpData["isMainBp"] = "";
			};

			db.ref("users")
				.child(userData.uid)
				.child("bigPicture")
				.push(newBpData);

			spoonedBpData = newBpData;
			printSpoonedBpData();
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

// --------------------------------------------------
// *** CRUD Manager
// --------------------------------------------------

function monitorBpTitle() {
	let packagedBpTitle = selectorById("bpTitle").value.trim();
	if (packagedBpTitle != "") {
		let sameBpTitleArray = getSameBpTitleArray(packagedBpTitle);
		if (sameBpTitleArray == undefined) {
			return true;
		} else {
			highLightBorder("bpTitle", "red");
			alert("중복된 페이퍼 제목이 있습니다. 페이퍼 제목을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
}; // testing..

function getSameBpTitleArray(packagedBpTitle) {
	let bpTitleArray = listupBpTitleArray();
	let filterSameIndexArray = (query) => {
		return bpTitleArray.find(packagedBpTitle => query == packagedBpTitle);
	};
	let sameBpTitleArray = filterSameIndexArray(packagedBpTitle);
	return sameBpTitleArray;
}; // testing..

// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------


// --------------------------------------------------
// *** spoonedBpData 오브젝트 관리를 위한 함수 세트
// --------------------------------------------------

function updateSpoonedBpDataByBpTitle(updatedCurrentBpTitle) {
	let bpTitleArray = Object.keys(bpDataPool);
	let updatedSpoonedBpData = {};
	for (let i = 0; i < bpTitleArray.length; i++) {
		let bpTitles = [];
		bpTitles.push(bpTitleArray[i]);
		if(bpTitles == updatedCurrentBpTitle){
			updatedSpoonedBpData = bpDataPool[updatedCurrentBpTitle];
		};
	};
	spoonedBpData = updatedSpoonedBpData;
	return updatedSpoonedBpData;
}; // checked!



function inputSpoonedBpData() {
	spoonedBpData["editedDate"] = timeStamp();
	spoonedBpData["bpTitle"] = selectorById("bpTitle").value.trim();
	spoonedBpData["direction"] = selectorById("direction").value.trim();
	spoonedBpData["naviArea"] = selectorById("naviArea").value.trim();
	spoonedBpData["naviB"] = selectorById("naviB").value.trim();
	spoonedBpData["naviA"] = selectorById("naviA").value.trim();
	spoonedBpData["actionPlan"] = selectorById("actionPlan").value.trim();
	return spoonedBpData;
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
	let bpTitleArray = Object.keys(bpDataPool);
	let filterSamebpTitleArray = (query) => {
		return bpTitleArray.find(newBpTitle => query == newBpTitle);
	};
	let samebpTitleArray = filterSamebpTitleArray(newBpTitle);
	return samebpTitleArray;
}; // checked!

// --------------------------------------------------
// *** selectBox 관리를 위한 함수 세트
// --------------------------------------------------

function getBpTitleFromSelectboxBpTitle() {
	let selectedBpTitleValue = selectorById("selectboxBpTitle").value;
	if (selectedBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		let bpTitleArray = Object.keys(bpDataPool);
		selectedBpTitleValue = bpTitleArray[0];
	};
	return selectedBpTitleValue;
}; // checked!

function openSpoonedBpDataBySelectboxBpTitle() {
	let currentBpTitleBySelectbox = getBpTitleFromSelectboxBpTitle();
	updateSpoonedBpDataByBpTitle(currentBpTitleBySelectbox);
	printSpoonedBpData();
	btnShowHideHandler("readPaper");
}; // checked!

// --------------------------------------------------
// *** mainBpData 관리를 위한 함수 세트
// --------------------------------------------------

function findMainBpTitle() {
	let bpTitleArray = Object.keys(bpDataPool);
	let IsThereAnyMainBpResult = IsThereAnyMainBp();
	console.log("IsThereAnyMainBpResult = ", IsThereAnyMainBpResult);
	if (IsThereAnyMainBpResult == true){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let isMainBpValue = bpDataPool[bpTitleArray[i]].isMainBp;
			let mainBpTitle = bpDataPool[bpTitleArray[i]].bpTitle;
			if (isMainBpValue == "main") {
				console.log("findMainBpTitle1");
				console.log("mainBpTitle1 = ", mainBpTitle);
				return mainBpTitle;
			};
		};
	} else {
		console.log("findMainBpTitle3");
		setMainBp();
		bpDataPool[bpTitleArray[0]].isMainBp = "main";
		let mainBpTitle = bpDataPool[bpTitleArray[0]].bpTitle;
		return mainBpTitle;
	};
}; // checked!



function catchFirstBpIdByBpTitleArray() {
	let bpTitleArray = Object.keys(bpDataPool);
	let firstBpId = bpDataPool[bpTitleArray[0]].bpId;
	return firstBpId;
};

// 정비할것
function setMainBp() {

	let updatedBpData = {};
	updatedBpData["isMainBp"] = "main";

	let thisBpIdArray = [];
	let bpTitleArray = Object.keys(bpDataPool);
	let spoonedBpDataLength = Object.keys(spoonedBpData).length;

	if (spoonedBpDataLength > 0) {
		thisBpIdArray.push(spoonedBpData.bpId);

		unsetMainBp();

		// update spoonedBpData(local) 
		spoonedBpData["isMainBp"] = "main";
		console.log("bpTitleArray @ setMainBp = ", bpTitleArray);

		for (let i = 0; i < bpTitleArray.length; i++) {
			let bpTitle = bpDataPool[bpTitleArray[i]].bpTitle;
			if (bpTitle != spoonedBpData.bpTitle) {
				bpDataPool[bpTitleArray[i]].isMainBp = "";
			};
		};

	} else {
		let firstBpIdByBpTitleArray = catchFirstBpIdByBpTitleArray();
		thisBpIdArray.push(firstBpIdByBpTitleArray);
	};

	let thisBpId = thisBpIdArray[0];
	console.log("thisBpId @ setManBp = ", thisBpId);

	db.ref("users")
		.child(userData.uid)
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

}; // checked!

function unsetMainBp() {

	let updatedBpData = {};

	updatedBpData["isMainBp"] = "";

	let bpTitleArray = Object.keys(bpDataPool);
	console.log("bpTitleArray @ unsetMainBp = ", bpTitleArray);

	if (bpTitleArray.length > 0){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let bpIds = bpDataPool[bpTitleArray[i]].bpId;
	
			console.log("spoonedBpData.bpId @ unsetMainBp = ", spoonedBpData.bpId);
	
			db.ref("users")
				.child(userData.uid)
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
	updateSpoonedBpDataByBpTitle(mainBpTitle);
	printSpoonedBpData();
	btnShowHideHandler("readPaper");
}; // checked!

// --------------------------------------------------
// *** CRUD 관리를 위한 함수 세트
// --------------------------------------------------

function openNewPaper() {
	printEmptySpoonedBpData();
	btnShowHideHandler("openNewPaper");
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
	createSpoonedBpData();
	printSpoonedBpData();
	highLightBorder("bpTitle", "rgb(200, 200, 200)");
	btnShowHideHandler("readPaper");
}; // checked!

// 정비할것
function saveEditedPaper() {

	let updatedBpData = inputSpoonedBpData();
	let updatedCurrentBpTitle = selectorById("bpTitle").value.trim();

	if (updatedCurrentBpTitle != "") {
			updatedBpData["bpTitle"] = updatedCurrentBpTitle;

			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.child(spoonedBpData.bpId)
				.update(updatedBpData, (e) => {
				console.log("update completed = ", e);
				});

			spoonedBpData = updatedBpData;
			printSpoonedBpData();
			putSelectbox("selectboxBpTitle");
			highLightBorder("bpTitle", "rgb(200, 200, 200)");
			alert("저장되었습니다.");
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
}; // checked!

// mainBp가 없어진 경우, 다른 mainBp가 생겨야한다. setMainBp 활용가능할듯?!
function removePaper() {
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.child(spoonedBpData.bpId)
			.remove();

		// console.log("bpDataPool1 = ", bpDataPool);
		// console.log("spoonedBpData1 = ", spoonedBpData);
		// console.log("bpDataPool2 = ", bpDataPool);
		// let changedCurrentBpTitle = findMainBpTitle();
		// updateSpoonedBpDataByBpTitle(changedCurrentBpTitle);
		// console.log("spoonedBpData2 = ", spoonedBpData);
		//printSpoonedBpData();
		//emptyBpDataPool();
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
	uiHide("setMainBp_btn");
	uiHide("openMainBp_btn");
	uiHide("setMainBp_txt");
	if (spoonedBpData.isMainBp == "main") {
		uiShow("setMainBp_txt");
	} else {
		if(state != "createFirstPaper") {
			uiShow("openMainBp_btn");
			uiShow("setMainBp_btn");
		};
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