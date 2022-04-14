// const firebase = appFireBase; // firebase 자체의 버전 이슈로 있던 기능

const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
let userData = {};
let bpDataPool = {};
let spoonedBpData = {};
let packagedBpData = {};
let mainBpTitleMemory = "";
let bpTitleSpoonMemory = "";
let updatedMainBpTitleMemory = "";

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
		// 콜백은 서버에 데이터 변경시 자동으로 작동한다.
		// 참고: https://firebase.google.com/docs/reference/js/v8/firebase.database.Reference#on
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
			processSpoonToPrint();
		} else {
			printItIfNoBpData();
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
}; // checked!

function requestUpdateBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child(packagedBpDataHere.bpId)
	.update(packagedBpDataHere, (e) => {
		console.log("update completed = ", e);
		});
}; // checked!

function requestRemoveSpoonedBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child(packagedBpDataHere.bpId)
	.remove();
}; // checked!

function requestChangeIsMainBpValue() {
	requestUpdateEveryIsMainBpValueToBlank();
	requestUpdateOneIsMainBpValueToMain();
}; // checked!

function requestUpdateEveryIsMainBpValueToBlank() {

	let updatedBpData = {};
	updatedBpData["isMainBp"] = "";

	let bpTitleArray = listupBpTitleArray();
	if (bpTitleArray.length > 0){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let bpIds = bpDataPool[bpTitleArray[i]].bpId;
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

function requestUpdateOneIsMainBpValueToMain() {

	let updatedBpData = {};
	updatedBpData["isMainBp"] = "main";

	let bpTitleArray = listupBpTitleArray();
	if (bpTitleArray.length > 0){
		for (let i = 0; i < bpTitleArray.length; i++) {
			if (bpDataPool[bpTitleArray[i]].bpTitle == updatedMainBpTitleMemory) {
				let bpIds = bpDataPool[bpTitleArray[i]].bpId;
				db.ref("users")
					.child(userData.uid)
					.child("bigPicture")
					.child(bpIds)
					.update(updatedBpData, (e) => {
					console.log("update completed = ", e);
					});
			};
		};
	};

}; // checked!

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

// --------------------------------------------------
// *** bpTitle Manager
// --------------------------------------------------

function listupBpTitleArray() {
	let listupBpTitleArrayResult = Object.keys(bpDataPool);
	return listupBpTitleArrayResult;
}; // checked!

function pickupBpTitleSpoonBySelectbox() {
	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value;
	if (selectboxBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		console.log("pickupBpTitleSpoonBySelectbox by INIT");
		let bpTitleSpoon = bpTitleSpoonMemory;
		return bpTitleSpoon;
	} else {
		console.log("pickupBpTitleSpoonBySelectbox by selectboxBpTitleValue");
		let bpTitleSpoon = selectboxBpTitleValue;
		bpTitleSpoonMemory = bpTitleSpoon;
		return bpTitleSpoon;
	};
};

function pickupBpTitleSpoon() {
	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value;

	if (selectboxBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		// by reloaded or openMainBp_btn(=reloaded)
		console.log("pickupBpTitleSpoon by pointMainBpTitle")
		let bpTitleSpoon = pointMainBpTitle();
		bpTitleSpoonMemory = bpTitleSpoon;
		return bpTitleSpoon;
	} else {
		if (bpTitleSpoonMemory != "") {
			// by requestUpdateBpdata
			console.log("pickupBpTitleSpoon by bpTitleSpoonMemory")
			let bpTitleSpoon = bpTitleSpoonMemory;
			return bpTitleSpoon;
		// } else {
		// 	// by selectbox
		// 	console.log("pickupBpTitleSpoon (3)")
		// 	let bpTitleSpoon = selectorById("selectboxBpTitle").value;
		// 	return bpTitleSpoon;
		};
	};
}; // testing..

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
				mainBpTitleMemory = mainBpTitle;
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

	if (uniqueIsMainBpValueArray.length != 0){
		if (uniqueIsMainBpValueArray.length == 1){
			if(uniqueIsMainBpValueArray[0] == ""){
				console.log("There is no mainBp");
				// setMainBpTitle(); [질문] removePaper에서 이 과정이 있지 않은데, 생기는 현상, update에서 관여를 하는가?
				return false;
			} else {
				// console.log("There is mainBp1");
				return true;
			};
		} else {
			// console.log("There is mainBp2");
			return true;
		};
	};
}; // checked!

function setMainBp() {
	updatedMainBpTitleMemory = spoonedBpData.bpTitle;
	requestChangeIsMainBpValue();
}; // checked!

function setAltMainBpTitle(packagedBpDataHere) {
	let bpTitleArray = listupBpTitleArray();
	let filteredBpTitleArray = [];
	for (let i = 0; i < bpTitleArray.length; i++) {
		if (bpTitleArray[i] != packagedBpDataHere.bpTitle) {
			filteredBpTitleArray.push(bpTitleArray[i]);
		};
	};
	filteredBpTitleArray.sort();
	updatedMainBpTitleMemory = filteredBpTitleArray[0];
	requestChangeIsMainBpValue();
}; // checked!

function gotoMainBp() {
	bpTitleSpoonMemory = mainBpTitleMemory;
	spoonBpData(mainBpTitleMemory);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
}; // checked!

// --------------------------------------------------
// *** stage Manager
// --------------------------------------------------

function spoonBpData(bpTitleSpoonHere) {
	let spoonedBpDataInFunction = bpDataPool[bpTitleSpoonHere];
	spoonedBpData = spoonedBpDataInFunction;
	return spoonedBpDataInFunction;
}; // checked!

function processSpoonToPrint() {
	let bpTitleSpoon = pickupBpTitleSpoon();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
}; // checked!

function packageBpDataNew() {

	let monitorBpTitleBlankOrDuplicatesResult = monitorBpTitleBlankOrDuplicates();

	if (monitorBpTitleBlankOrDuplicatesResult == true) {

		// 적혀있는 내용들로 패키징하기
		packagedBpData["createdDate"] = timeStamp(); // new에만 해당함
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
}; // checked!

function packageBpDataEdited() {
	let monitorBpTitleBlankResult = monitorBpTitleBlank();

	if (monitorBpTitleBlankResult == true) {

		// 적혀있는 내용들로 패키징하기
		packagedBpData["bpId"] = spoonedBpData.bpId; // edited에만 해당함
		// packagedBpData["createdDate"] = spoonedBpData.createdDate; // edited에만 해당함
		packagedBpData["editedDate"] = timeStamp();
		packagedBpData["bpTitle"] = selectorById("bpTitle").value.trim();
		packagedBpData["direction"] = selectorById("direction").value.trim();
		packagedBpData["naviArea"] = selectorById("naviArea").value.trim();
		packagedBpData["naviB"] = selectorById("naviB").value.trim();
		packagedBpData["naviA"] = selectorById("naviA").value.trim();
		packagedBpData["actionPlan"] = selectorById("actionPlan").value.trim();

		return packagedBpData;
	};
}; // checked!

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
			uiHide("guideMessage");
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

function printItIfNoBpData() {
	printEmptySpoonedBpData();
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
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

	for (let i = 0; i <= bpTitleArray.length; i++) {
		if(bpTitleArray.length == 0){
			selectorById("selectboxBpTitle").options[0].setAttribute("selected", true);
		} else {
			let selectorOption = selectorById("selectboxBpTitle").options[i];
			let optionValue = selectorOption.value;
			selectorOption.removeAttribute("selected");
			if (optionValue == bpTitleSpoonMemory) {
				selectorOption.setAttribute("selected", true);
			};
		};
	};

}; // checked!

function selectBpTitleBySelectbox() {
	let bpTitleSpoon = pickupBpTitleSpoonBySelectbox();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData();
}; // testing..

// --------------------------------------------------
// *** CRUD Manager
// --------------------------------------------------

function saveNewPaper() {
	let packagedBpData = packageBpDataNew();

	//sync Global bpTitleSpoonMemory
	bpTitleSpoonMemory = packagedBpData.bpTitle;
	
	requestPushNewBpData(packagedBpData);
	alert("저장되었습니다.");

}; // checked!

function saveEditedPaper() {
	let packagedBpData = packageBpDataEdited();

	//sync Global bpTitleSpoonMemory
	bpTitleSpoonMemory = packagedBpData.bpTitle;

	requestUpdateBpData(packagedBpData);
	alert("저장되었습니다.");

}; // checked!

function removePaper() {
	packagedBpData = spoonedBpData;
	if (packagedBpData.isMainBp == "main") {
		setAltMainBpTitle(packagedBpData);
	};
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemoveSpoonedBpData(spoonedBpData);
		alert("삭제되었습니다.");
		location.reload();
	};
}; // checked!

function openNewPaper() {
	printEmptySpoonedBpData();
	btnShowHideHandler("openNewPaper");
}; // checked!

function openEditPaperByDbclick() {
	const card = document.getElementsByTagName("textarea");
	for (let i = 0; i < card.length; i++) {
		card[i].addEventListener("dblclick", function (e) {
			let bpTitleArray = listupBpTitleArray();
			if(bpTitleArray.length > 0){
				openEditPaper();
			};
		});
	};
}; // checked!

function openEditPaper() {
	btnShowHideHandler("editPaper");
}; // checked!

function cancelEditPaper() {
	spoonBpData(spoonedBpData.bpTitle);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
}; // checked!

// --------------------------------------------------
// *** monitor Manager
// --------------------------------------------------

function monitorBpTitleBlankOrDuplicates() {
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
}; // checked!

function monitorBpTitleBlank() {
	let packagedBpTitle = selectorById("bpTitle").value.trim();
	if (packagedBpTitle != "") {
		return true;
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
}; // checked!

function getSameBpTitleArray(packagedBpTitle) {
	let bpTitleArray = listupBpTitleArray();
	let filterSameIndexArray = (query) => {
		return bpTitleArray.find(packagedBpTitle => query == packagedBpTitle);
	};
	let sameBpTitleArray = filterSameIndexArray(packagedBpTitle);
	return sameBpTitleArray;
}; // checked!

// --------------------------------------------------
// *** general Supporter
// --------------------------------------------------

function selectorById(id) {
	return document.getElementById(id);
}; // checked!

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
}; // checked!