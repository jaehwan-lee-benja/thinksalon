// const firebase = appFireBase; // firebase 자체의 버전 이슈로 있던 기능

const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";

// --------------------------------------------------
// *** gloabl items
// --------------------------------------------------

// HQ dept.
let userData = {}; // 리뷰: user의 계정 정보를 지니고 있는 오브젝트
let bpDataPool = {}; // 리뷰: 서버의 bpData를 로컬로 그대로 가져온 오브젝트

(function() {
	logIn();
})();

// --------------------------------------------------
// *** logIn Manager
// --------------------------------------------------
function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			openEditPaperByDbclick();
			requestReadUserData(user);
			requestReadBpData(user); // 점검필요
		} else {
			window.location.replace("login.html");
		};
	});
}; // 점검중

function logOut() {
	firebase.auth().signOut();
}; // 점검완료

// ==================================================
// *** StoL dept
// ==================================================

// --------------------------------------------------
// *** StoL manager
// --------------------------------------------------

function requestReadUserData(user) {
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
}; // 완료

function requestReadBpData(user) {

	const userRef = db.ref("users").child(user.uid).child("bpData");
	
	userRef.on("value", (snapshot) => {

		snapshot.forEach(childSnap => {
			let bpIdsKey = childSnap.key;
			let bpDataValue = childSnap.val();
			bpDataPool[bpIdsKey] = bpDataValue;
			// [질문] ID를 꼭 넣어야할까? 또는 서버에 입력할 때, ID가 들어가도록 할수는 없을까?
		});
		console.log("bpDataPool2 = ", bpDataPool);

		// ui에 print하기
		printBpData();

	});
}; // 점검중

function printBpData() {
	let lastestDate = getLastestEditedDate();
	console.log("getLastestEditedDate = ", lastestDate);

	let printDataId = getIdByEditedDate(lastestDate);

	console.log("printDataId = ", printDataId);

	printOnUI(printDataId);

};

function getLastestEditedDate(){

	let keys = Object.keys(bpDataPool.character);
	console.log("keys = ", keys);
	let list = keys.map( id => {
		let c = bpDataPool.character[id]
		console.log("c = ", c);
		return {"id": id, "date": c.container.editedDate}
	  }).reverse();

	console.log("list = ", list);

	let characterIdArray = getCharacterIdArray();
	console.log("characterIdArray** = ", characterIdArray)
	let characterEditedDateArray = [];
	characterIdArray.forEach(ids => 
		characterEditedDateArray.push(bpDataPool.character[ids].container.editedDate));
	console.log("characterEditedDateArray = ", characterEditedDateArray);
	// let lastestDate = new Date(Math.max(characterEditedDateArray)); [질문]
	// let lastestDate = characterEditedDateArray.reverse()[0];
	return lastestDate;
};

function getIdByEditedDate(lastestDate) {
	let characterIdArray = Object.keys(bpDataPool.character);
	for (let i = 0; i < characterIdArray.length; i++){
		if(bpDataPool.character[characterIdArray[i]].container.editedDate == lastestDate){
			return characterIdArray[i]
		}
	}
};

function printOnUI(printDataId) {
	selectorById("character").value = bpDataPool.character[printDataId].container.contents.character;
};

function getIdByContents() {
	let contentsOnUI = selectorById("character").value.trim();
	// bpDataPool.character.container.contents = contentsOnUI
};

// ==================================================
// *** LtoS dept
// ==================================================

// --------------------------------------------------
// *** LtoS manager
// --------------------------------------------------

function requestPushPackagedData_character(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child("character")
	.push(packagedBpDataHere);
};

function requestPushPackagedData_direction(characterId, packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child("character")
	.child(characterId)
	.child("direction")
	.push(packagedBpDataHere);
};

function requestUpdatePackagedBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child(packagedBpDataHere.bpId)
	.update(packagedBpDataHere, (e) => {
		console.log("** update completed = ", e);
		});
};

function requestRemovePackagedBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child(packagedBpDataHere.bpId)
	.remove();
};

// --------------------------------------------------
// *** userData Manager
// --------------------------------------------------

function printUserData(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
}; // 점검중

// --------------------------------------------------
// *** bpDataPool Manager
// --------------------------------------------------

// --------------------------------------------------
// *** mainTag Manager
// --------------------------------------------------

// --------------------------------------------------
// *** stage Manager
// --------------------------------------------------

function packageNewCard() {

	console.log("packageNewCard start here");

		let packagedData = {};
		packagedData["container"] = {};
		let characterContainer = packagedData["container"];

		// characterContainer["id"] = characterId; // [질문] 가능할까?
		characterContainer["createdDate"] = timeStamp();
		characterContainer["editedDate"] = timeStamp();
		characterContainer["main"] = "";
		characterContainer["contents"] = {};
		characterContainer["contents"]["character"] = selectorById("character").value.trim();

		console.log("packagedData = ", packagedData);
		return packagedData;
}; // 점검중

// --------------------------------------------------
// *** UI Manager
// --------------------------------------------------

function printSpoonedBpData() {
	selectorById("character").value = spoonedBpData["bpTitle"];
	selectorById("direction").value = spoonedBpData["direction"];
	selectorById("naviArea").value = spoonedBpData[spoonMemory["naviId"]]["naviArea"];
	selectorById("naviB").value = spoonedBpData[spoonMemory["naviId"]]["naviB"];
	selectorById("naviA").value = spoonedBpData[spoonMemory["naviId"]]["naviA"];
	selectorById("actionPlan").value = spoonedBpData[spoonMemory["naviId"]][spoonMemory["actionPlanId"]]["actionPlan"];
	btnShowHideHandlerByClassName("character","readPaper");
}; // 점검중

function printEmptySpoonedBpData() {
	selectorById("character").value = "";
	selectorById("direction").value = "";
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";
	btnShowHideHandlerByClassName("character","createFirstPaper");
}; // 점검중

// 버튼, 편집모드 UI 조절

function uiHide(id) {
	selectorById(id).style.display = "none";
}; // 점검중

function uiShow(id) {
	selectorById(id).style.display = "initial";
}; // 점검중

function btnShowHideHandlerByClassName(className, state) {

	uiHide("openEditPaper_btn_"+className);
	uiHide("cancelEditPaper_btn_"+className);
	uiHide("saveEditedPaper_btn_"+className);
	uiHide("saveNewPaper_btn_"+className);
	uiHide("removePaper_btn_"+className);
	uiHide("openNewPaper_btn_"+className);

	switch(state){
		case "createFirstPaper" :
			uiShow("saveNewPaper_btn_"+className);
			editModeHandlerByClassName(className, "editing");
			break;
		case "openNewPaper" :
			uiShow("saveNewPaper_btn_"+className);
			uiShow("cancelEditPaper_btn_"+className)
			editModeHandlerByClassName(className, "editing");
			break;
		case "readPaper" :
			uiHide("guideMessage");
			uiShow("openEditPaper_btn_"+className);
			uiShow("openNewPaper_btn_"+className);
			uiShow("removePaper_btn_"+className);
			editModeHandlerByClassName(className, "reading");
			break;
		case "editPaper" :
			uiShow("saveEditedPaper_btn_"+className);
			uiShow("cancelEditPaper_btn_"+className);
			uiShow("saveNewPaper_btn_"+className);
			uiShow("removePaper_btn_"+className);
			editModeHandlerByClassName(className, "editing");
			break;
		default:
			let state = null;
	}
	// btnShowHideHandler_mainBp(state, section);
	resizeTextarea();
}; // 점검중

function editModeHandlerByClassName(className, paperMode) {
	function textareaReadOnly(id, check){
		selectorById(id).readOnly = check;
	};
	if (paperMode == "editing") {
		document.getElementsByClassName(className)[0].style.color = "#9CC0E7";
		document.getElementsByClassName(className)[0].style.borderColor = "#9CC0E7";
		textareaBorderColorHandlerByClass(className, "3px", "#9CC0E7");
		textareaReadOnly("character", false);
		// selectorById -> byClassName으로 바꾸기
	} else {
		document.getElementsByClassName(className)[0].style.color = "#424242";
		document.getElementsByClassName(className)[0].style.borderColor = "#424242";
		textareaBorderColorHandlerByClass(className, "1px", "#c8c8c8");
		textareaReadOnly("character", true);
	};
}; // 점검중

function editModeHandler(paperMode) {
	function textareaReadOnly(id, check){
		selectorById(id).readOnly = check;
	};
	if (paperMode == "editing") {
		selectorById("divPaperMode").innerHTML = "작성모드";
		selectorById("gridMainFrame").style.color = "#9CC0E7";
		textareaReadOnly("character", false);
		textareaReadOnly("direction", false);
		textareaReadOnly("naviArea", false);
		textareaReadOnly("naviB", false);
		textareaReadOnly("naviA", false);
		textareaReadOnly("actionPlan", false);
		textareaBorderColorHandler("2px", "#9CC0E7");
	} else {
		selectorById("divPaperMode").innerHTML = "읽기모드";
		selectorById("gridMainFrame").style.color = "#424242";
		textareaReadOnly("character", true);
		textareaReadOnly("direction", true);
		textareaReadOnly("naviArea", true);
		textareaReadOnly("naviB", true);
		textareaReadOnly("naviA", true);
		textareaReadOnly("actionPlan", true);
		textareaBorderColorHandler("1px", "#c8c8c8");
	};
}; // 점검중

function textareaBorderColorHandler(px, color) {
    setTimeout(()=>{
		// console.log("textareaBorderColorHandler |"+ px +" "+ color +"|");
		const selectorTextareaOnCard = document.getElementsByTagName("textarea");
		for (let i = 0; i < selectorTextareaOnCard.length; i++) {
			selectorTextareaOnCard[i].style.border = "solid " + px + color;
		};
	},1);
};

function textareaBorderColorHandlerByClass(className, px, color) {
    setTimeout(()=>{
		// console.log("textareaBorderColorHandler |"+ px +" "+ color +"|");
		const selectorTextareaOnCard = document.getElementsByClassName(className);
		for (let i = 0; i < selectorTextareaOnCard.length; i++) {
			selectorTextareaOnCard[i].style.border = "solid " + px + color;
		};
	},1);
};

function btnShowHideHandler_mainBp(state, section) {
	uiHide("setMainBp_btn", section);
	uiHide("openMainBp_btn", section);
	uiHide("setMainBp_txt", section);
	if (spoonedBpData.isMainBp == "main") {
		uiShow("setMainBp_txt");
	} else {
		if(state != "createFirstPaper") {
			uiShow("openMainBp_btn", section);
			uiShow("setMainBp_btn", section);
		};
	};
}; // 점검중

function highLightBorder(id, color) {
	//return selectorById(id).style.borderColor = color;
}; // 점검중

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
}; // 점검중

function printItIfNoBpData() {
	printEmptySpoonedBpData();
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
}; // 점검중

// --------------------------------------------------
// *** selectbox Manager
// --------------------------------------------------

function putSelectbox(selectboxId) {

	let selectbox = selectorById(selectboxId);
	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	// <option> 만들어서, bpTitleArray 넣기
	for (let i = 0; i < bpTitleArray.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(bpTitleArray[i]);
		let mainBpTitle = mainTagMemory["bpTitle"];
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
}; // 점검중

function printBpTitleSpoonOnSelectbox() {

	for (let i = 0; i <= bpTitleArray.length; i++) {
		if(bpTitleArray.length == 0){
			selectorById("selectboxBpTitle").options[0].setAttribute("selected", true);
		} else {
			let selectorOption = selectorById("selectboxBpTitle").options[i];
			let optionValue = selectorOption.value;
			selectorOption.removeAttribute("selected");
			if (optionValue == spoonMemory["bpTitle"]) {
				selectorOption.setAttribute("selected", true);
			};
		};
	};

}; // 점검중

function selectBpTitleBySelectbox() {
	let bpTitleSpoon = pickupBpTitleSpoonBySelectbox();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData();
}; // testing..

// --------------------------------------------------
// *** CRUD Manager
// --------------------------------------------------

function saveNewPaper() {
	console.log("saveNewPaper start");
	let packagedBpData = packageNewBpData();
	console.log("packagedBpData @saveNewPaper  = ",packagedBpData);

	//sync Global packagedMemory["bpTitle"]
	if (packagedBpData != null) {
		console.log("packagedBpData != null");
		packagedMemory["bpTitle"] = packagedBpData.bpTitle;
		requestPushPackagedBpData(packagedBpData);
		alert("저장되었습니다.");
	};
}; // 점검중

function saveNewCard() {
	console.log("saveNewPaper start");
	let packagedBpData = packageNewCard();
	// console.log("packagedBpData @saveNewPaper  = ",packagedBpData);

	//sync Global packagedMemory["bpTitle"]
	if (packagedBpData != null) {
		console.log("packagedBpData != null");
		requestPushPackagedData_character(packagedBpData);
		alert("저장되었습니다.");
	};
}; // 점검중

function saveEditedPaper() {
	let packagedBpData = packageEditedBpData();

	//sync Global packagedMemory["bpTitle"]
	packagedMemory["bpTitle"] = packagedBpData.bpTitle;

	requestUpdatePackagedBpData(packagedBpData);
	alert("저장되었습니다.");

}; // 점검중


function removePaper() {
	packagedRemoveBpData = spoonedBpData;

	//sync Global packagedMemory["bpTitle"]
	packagedMemory["bpTitle"] = packagedRemoveBpData.bpTitle;
	
	if (packagedRemoveBpData.bpTitle == mainTagMemory["bpTitle"]) {
		setAltMainBpTitle(packagedRemoveBpData);
	};

	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemovePackagedBpData(packagedRemoveBpData);
		alert("삭제되었습니다.");
		location.reload();
	};
}; // 점검중

function openNewPaper() {
	printEmptySpoonedBpData();
	btnShowHideHandlerByClassName("character","openNewPaper");
}; // 점검중

function openEditPaperByDbclick() {
	const TextareaOnCard = document.getElementsByTagName("textarea");
	for (let i = 0; i < TextareaOnCard.length; i++) {
		TextareaOnCard[i].addEventListener("dblclick", function (e) {
			let characterIdArray = getCharacterIdArray();
			if(characterIdArray.length > 0){
				openEditPaper();
			};
		});
	};
}; // 점검중

function openEditPaper() {
	btnShowHideHandlerByClassName("character","editPaper");
}; // 점검중

function openNewNaviCard() {
	printEmptyNaviCard();
	btnShowHideHandlerByClassName("character","openNewPaper");
}; // 점검중

function saveNewNaviCard() {
	let packagedNewNaviCard = packageNewNaviCard();

	//sync Global packagedMemory["bpTitle"]
	if (packagedNewNaviCard != null) {
		// packagedMemory["bpTitle"] = packagedNewNaviCard.bpTitle;
		requestPushPackagedNaviCard(spoonedBpData.bpId, packagedNewNaviCard);
		alert("저장되었습니다.");
	};
}; // 점검중

function cancelEditPaper() {
	spoonBpData(spoonedBpData.bpTitle);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
}; // 점검중

// --------------------------------------------------
// *** general Supporter
// --------------------------------------------------

function selectorById(id) {
	return document.getElementById(id);
}; // 점검중

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
}; // 점검중

function getCharacterIdArray() {
	return Object.keys(bpDataPool.character);
};