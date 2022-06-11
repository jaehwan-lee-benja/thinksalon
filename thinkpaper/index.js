const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";

let userData = {};
let bigPicture = {character:""};

(function() {
	logIn();
})();

///// logIn manager

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestReadUserData(user);
			requestReadBigPicture(user);
			openEditPaperByDbclick();
		} else {
			window.location.replace("login.html");
		};
	});
};

function logOut() {
	firebase.auth().signOut();
};

///// StoL manager

function requestReadUserData(user) {
	const userRef = db.ref("users").child(user.uid).child("user");
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			value["uid"] = childSnap.key;
			userData[key] = value;
		});
		showUserData(userData);
	});
};

function requestReadBigPicture(user) {

	const userRef = db.ref("users").child(user.uid).child("bigPicture");

	userRef.on("value", (snapshot) => {

		snapshot.forEach(childSnap => {
			let bpIdsKey = childSnap.key;
			let bpDataValue = childSnap.val();
			bigPicture[bpIdsKey] = bpDataValue;
		});

		console.log("bigPicture = ", bigPicture);
	
		let characterKeysArray = Object.keys(bigPicture.character);

		if (characterKeysArray.length > 0) {
			showBigPicture();
		} else {
			showItIfNoBpData();
		};

	});
};

function showBigPicture() {
	let lastestId = getLastestEditedId();
	showItOnUI(lastestId);
	btnShowHideHandlerByClassName("character","readPaper");
};

function getLastestEditedId(){
	let keys = Object.keys(bigPicture.character);
	let list = keys.map( id => {
		let c = bigPicture.character[id];
		return {"id": id, "date": c.props.editedDate};
	  }).reverse();
	  // [질문] reverse가 왜 date 기준으로 되는것일까? id 기준으로 되지는 않을까? 
	return list[0].id;
};

function showItOnUI(printDataId) {
	selectorById("character").value = bigPicture.character[printDataId].props.contents.character;
};

///// LtoS dept

///// LtoS manager

function requestPushPackagedData_character(packagedDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("character")
	.child(packagedDataHere.id)
	.set(packagedDataHere);
};

function requestUpdatePackagedData_character(packagedDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("character")
	.child(packagedDataHere.id)
	.update(packagedDataHere, (e) => {
		console.log("** update completed = ", e);
		});
};

function requestRemoveByCharacterId(characterId) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("character")
	.child(characterId)
	.remove();
};

///// user data manager

function showUserData(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
};

///// local data manager

function packageNewCard(level) {

	console.log("packageNewCard start here");

		let idNew = uuidv4();

		let packagedData = {};
		packagedData["id"] = idNew;
		packagedData["parentsId"] = "";
		packagedData["props"] = {};
		packagedData["children"] = "";

		let props = packagedData["props"];
		props["createdDate"] = timeStamp();
		props["editedDate"] = timeStamp();
		props["main"] = "";
		props["level"] = level;
		props["contents"] = {};

		let contents = props["contents"];
		switch(level){
			case "character" :
				contents["character"] = selectorById("character").value.trim();
				break;
			case "direction" :
				contents["direction"] = selectorById("direction").value.trim();
				break;
			case "navi" :
				contents["naviArea"] = selectorById("naviArea").value.trim();
				contents["naviA"] = selectorById("naviA").value.trim();
				contents["naviB"] = selectorById("naviArea").value.trim();
				break;
			case "actionPlan" :
				contents["actionPlan"] = selectorById("actionPlan").value.trim();
				break;
			default: 
				let level = null;
		};

		return packagedData;
};

function packageEditedCard(level) {

	console.log("packageEditedCard start here");

		let packagedData = {};
		packagedData["id"] = catchId_character();
		packagedData["props"] = {};

		let props = packagedData["props"];
		props["editedDate"] = timeStamp();
		props["contents"] = {};

		let contents = props["contents"];
		switch(level){
			case "character" :
				contents["character"] = selectorById("character").value.trim();
				break;
			case "direction" :
				contents["direction"] = selectorById("direction").value.trim();
				break;
			case "navi" :
				contents["naviArea"] = selectorById("naviArea").value.trim();
				contents["naviA"] = selectorById("naviA").value.trim();
				contents["naviB"] = selectorById("naviArea").value.trim();
				break;
			case "actionPlan" :
				contents["actionPlan"] = selectorById("actionPlan").value.trim();
				break;
			default: 
				let level = null;
		};

		return packagedData;
};

function catchId_character() {

	let valueCharacter = document.getElementById("character").value;

	console.log("valueCharacter = ", valueCharacter);

	let characterKeysArray = Object.keys(bigPicture.character);

	let idCharacterArray = characterKeysArray.map( id => {
		let c = bigPicture.character[id];
		return {"id": id, "character": c.props.contents.character};
	  });

	console.log("idCharacterArray = ", idCharacterArray);

	// 배열의 특정 값 찾기 - 참고 링크: https://hianna.tistory.com/406
	function isValueCharacter(element) {
		if(element.character == valueCharacter) {
			return true;
		};
	};

	const character = idCharacterArray.find(isValueCharacter);

	console.log("character = ", character);
	console.log("character.id = ", character.id);

	return character.id;

};

///// UI Manager

function printEmptySpoonedBpData() {
	selectorById("character").value = "";
	// selectorById("direction").value = "";
	// selectorById("naviArea").value = "";
	// selectorById("naviB").value = "";
	// selectorById("naviA").value = "";
	// selectorById("actionPlan").value = "";
	btnShowHideHandlerByClassName("character","createFirstPaper");
};

function uiHide(id) {
	selectorById(id).style.display = "none";
};

function uiShow(id) {
	selectorById(id).style.display = "initial";
};

function btnShowHideHandlerByClassName(className, state) {

	console.log("paperState = ", state);

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
};

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
};

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
};

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

function showItIfNoBpData() {
	printEmptySpoonedBpData();
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
};

///// selectbox Manager

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
};

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

};

function selectBpTitleBySelectbox() {
	let bpTitleSpoon = pickupBpTitleSpoonBySelectbox();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData();
};

///// CRUD Manager

function saveNewCard() {
	let packagedBpData = packageNewCard("character");
	if (packagedBpData != null) {
		requestPushPackagedData_character(packagedBpData);
		alert("저장되었습니다.");
	};
};

function saveEditedCard() {
	let packagedData = packageEditedCard("character");

	requestUpdatePackagedBpData(packagedData);
	alert("저장되었습니다.");

};

function removeCard() {
	let removeId = catchId_character();
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemoveByCharacterId(removeId);
		alert("삭제되었습니다.");
		location.reload();
	};
};

function openNewPaper() {
	printEmptySpoonedBpData();
	btnShowHideHandlerByClassName("character","openNewPaper");
};

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
};

function openEditPaper() {
	btnShowHideHandlerByClassName("character","editPaper");
};

function cancelEditPaper() {
	spoonBpData(spoonedBpData.bpTitle);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
};

///// general supporter

function selectorById(id) {
	return document.getElementById(id);
};

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
};

function getCharacterIdArray() {
	return Object.keys(bigPicture.character);
};

function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
};