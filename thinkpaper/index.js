const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";

let userData = {};
let bigPicture = {character:""};
let isMainShown = false;

(function() {
	logIn();
})();

///// logIn manager

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestReadUserData(user);
			requestReadBigPicture(user);
			openEditCardByDbclick();
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

		console.log("===== .on is here =====");

		snapshot.forEach(childSnap => {
			let key_ids = childSnap.key;
			let value_data = childSnap.val();
			bigPicture[key_ids] = value_data;
		});
	
		let characterKeysArray = Object.keys(bigPicture.character);

		if (characterKeysArray.length > 0) {
			let mainId = getMainId();
			console.log("isMainShown = ", isMainShown);
			if(mainId != null && isMainShown == false) {
				isMainShown = true;
				showItOnUI(mainId);
			} else {
				showItOnUI(getLastestEditedId());
			};
			showSelectbox("selectbox_character");
		} else {
			showItIfNoBpData();
		};
	});
};

///// LtoS manager

function requestPushCard_character(packagedDataHere) {

	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("character")
	.child(packagedDataHere.id)
	.set(packagedDataHere);

};

function requestUpdateCard_character(packagedDataHere) {

	let cardId = selectorById("cardId_character").value;

	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("character")
	.child(cardId)
	.child("props")
	.update(packagedDataHere, (e) => {
		console.log("** update completed = ", e);
		});

};

function requestRemoveCard_character(characterId) {
	db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("character")
	.child(characterId)
	.remove();
};

function requestUpdateMainCard_character(characterId) {

	let characterIdArray = Object.keys(bigPicture.character);
	
	characterIdArray.forEach(eachId => {

		let setMainValue = {};

		if (eachId == characterId) {
			setMainValue = {
				"main": "main",
				"editedDate": timeStamp()
			};
		} else {
			setMainValue = {
				"main": ""
			};
		};

		db.ref("users")
		.child(userData.uid)
		.child("bigPicture")
		.child("character")
		.child(eachId)
		.child("props")
		.update(setMainValue, (e) => {
			console.log("** update completed = ", e);
			});

	});
	
};

///// user data manager

function showUserData(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "방문자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
};

///// local data manager

function packageNewCard(level) {

	let moniterResult = monitorCardBlankOrDuplicates_character();

	if (moniterResult == true) {
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
		
};

function packageEditedCard(level) {

	function moniterIfCardChanged_character() {

		// 현재 UI에 띄워진 값 포착하기
		let characterId = selectorById("cardId_character").value;
		let characterValue = selectorById("character").value.trim();
		let characterObject = {"id": characterId, "character": characterValue};

		// 로컬 데이터에 있는 값 포착하기
		let characterArrayWithId = getIdArrayByMap("contents", "character");
	
		// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
		for(let i = 0; i < characterArrayWithId.length; i++) {
			if(JSON.stringify(characterObject) === JSON.stringify(characterArrayWithId[i])) {
				return false;
			};
		};
		return true;
	};
	
	function getMoniterResult(isChanged) {
		if (isChanged == true) {
			let moniterResultInFunction = monitorCardBlankOrDuplicates_character();
			return moniterResultInFunction;
		} else {
			return true;
		};
	};

	let moniterResult = getMoniterResult(moniterIfCardChanged_character());
	// 파라미터 direction, navi, actionPlan 가능할것으로 보임
	
	if (moniterResult == true) {
		let packagedData = {};
		packagedData["editedDate"] = timeStamp();
		packagedData["contents"] = {};

		let contents = packagedData["contents"];
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
};

function getLastestEditedId() {
	return sortedEditedDateArrayWithId()[0].id
};

function sortedEditedDateArrayWithId2(){
	let keys = Object.keys(bigPicture.character);
	let editedDateArray = keys.map( id => {
		let c = bigPicture.character[id];
		return {"id": id, "date": c.props.editedDate};
	  });
	console.log("editedDateArray = ", editedDateArray);
	let sortedEditedDateArray = editedDateArray.sort((a,b) => a.date - b.date);
	console.log("sortedEditedDateArray = ", sortedEditedDateArray);
	let reversedEditedDateArray = sortedEditedDateArray.reverse();
	console.log("reversedEditedDateArray = ", reversedEditedDateArray);
	return sortedEditedDateArray;
}; // [질문] sorting이 되지 않음

function sortedEditedDateArrayWithId() {
	let idEditedDateArray = getIdArrayByMap("props", "editedDate");
	let editedDateArray = idEditedDateArray.map(element => element.editedDate);
	let editedDateArrayinReverseOrder = editedDateArray.sort(date_descending);
	let arr = [];
	for(let i = 0; i < editedDateArrayinReverseOrder.length; i++) {
		let datesAfterSorting = editedDateArrayinReverseOrder[i];
		for (let j = 0; j < editedDateArray.length; j++) {
			let datesBeforeSorting = idEditedDateArray[j].editedDate;
			let id = idEditedDateArray[j].id
			if (datesAfterSorting == datesBeforeSorting) {
				arr.push({"id": id, "editedDate": datesAfterSorting});
			};
		};
	};
	return arr;
};

function getIdArrayByMap(scope1, key1, scope2, key2) {
	let characterIdArray = Object.keys(bigPicture.character);
	let idArrayWithKeys = characterIdArray.map( id => {
		let obj = {"id":id};
		if (scope1 == "props") {
			obj[key1] =  bigPicture.character[id].props[key1];
		} else {
			obj[key1] =  bigPicture.character[id].props.contents[key1];
		};
		if (scope2 == "props") {
			obj[key2] =  bigPicture.character[id].props[key2];
		} else {
			obj[key2] =  bigPicture.character[id].props.contents[key2];
		};
		return obj;
	  });
	return idArrayWithKeys;
};

///// UI manager

function showEmptyCard() {
	selectorById("character").value = "";
	// selectorById("direction").value = "";
	// selectorById("naviArea").value = "";
	// selectorById("naviB").value = "";
	// selectorById("naviA").value = "";
	// selectorById("actionPlan").value = "";
	btnShowHideHandlerByClassName("character","createFirstPaper");
};

function showItOnUI(printDataId) {
	selectorById("character").value = bigPicture.character[printDataId].props.contents.character;
	selectorById("cardId_character").value = bigPicture.character[printDataId].id;
	btnShowHideHandlerByClassName("character","readPaper");
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
	btnShowHideHandlerByClassName_main(className, state);
	resizeTextarea();
};

function btnShowHideHandlerByClassName_main(className) {
	uiHide("gotoMainCard_btn_"+className);
	uiHide("setMainCard_btn_"+className);
	uiHide("setMainCard_txt_"+className);

	let cardId = selectorById("cardId_character").value;
	let mainId = getMainId();
	if(cardId == mainId) {
		uiShow("setMainCard_txt_"+className);
	} else {
		if (mainId != null) {
			uiShow("gotoMainCard_btn_"+className);
			uiShow("setMainCard_btn_"+className);
		} else {
			uiShow("setMainCard_btn_"+className);
		};
	};
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
		const selectorTextareaOnCard = document.getElementsByTagName("textarea");
		for (let i = 0; i < selectorTextareaOnCard.length; i++) {
			selectorTextareaOnCard[i].style.border = "solid " + px + color;
		};
	},1);
};

function textareaBorderColorHandlerByClass(className, px, color) {
    setTimeout(()=>{
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
	showEmptyCard();
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
};

function highLightBorder(id, color) {
	return selectorById(id).style.borderColor = color;
};

///// selectbox manager

function showSelectbox(selectboxId) {

	let selectbox = selectorById(selectboxId);
	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	
	// Array 만들기
	let characterArray = getIdArrayByMap("props", "editedDate", "contents", "character");
	  
	// selectbox option list 순서 잡기(최근 편집 순서)
	function sortingArray() {

		let editedDateArray = characterArray.map(element => element.editedDate);
		let editedDateArrayinReverseOrder = editedDateArray.sort(date_descending);

		let arr = [];

		for(let i = 0; i < editedDateArrayinReverseOrder.length; i++) {

			let datesAfterSorting = editedDateArrayinReverseOrder[i];

			for (let j = 0; j < editedDateArray.length; j++) {

				let id = characterArray[j].id;
				let datesBeforeSorting = characterArray[j].editedDate;
				let character = characterArray[j].character;

				if (datesAfterSorting == datesBeforeSorting) {
					arr.push({"id": id, "editedDate": datesBeforeSorting, "character": character});
				};

			};

		};
		return arr;
	};

	let orderedCharacterArray = sortingArray();

	// <option> 만들어서, Array 넣기
	for (let i = 0; i < orderedCharacterArray.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(orderedCharacterArray[i].character);
		let optionId = orderedCharacterArray[i].id;
		let optionValue = orderedCharacterArray[i].character;
		let mainId = getMainId();
		if(optionId == mainId) {
			let mainOptionMark = optionValue + " ★";
			let mainTxt = document.createTextNode(mainOptionMark);
			option.appendChild(mainTxt);
		} else {
			option.appendChild(txt);
		};
		option.setAttribute("value", orderedCharacterArray[i].id);
		option.setAttribute("innerHTML", orderedCharacterArray[i].character);
		selectbox.insertBefore(option, selectbox.lastChild);
	};
};

function selectBySelectbox_character() {
	let selectedCharacterId = selectorById("selectbox_character").value;
	showItOnUI(selectedCharacterId);
};

///// mainCard mananger

function setMainCard() {
	let characterId = selectorById("cardId_character").value;
	requestUpdateMainCard_character(characterId);
};

function gotoMainCard_character() {
	showItOnUI(getMainId());
	showSelectbox("selectbox_character");
};

function getMainId() {
	let idMainArray = getIdArrayByMap("props", "main");
	for(let i = 0; i < idMainArray.length; i++) {
		if(idMainArray[i].main == "main"){
			return idMainArray[i].id;
		};
	};
};

///// CRUD manager

function saveNewCard() {
	let packagedBpData = packageNewCard("character");
	if (packagedBpData != null) {
		requestPushCard_character(packagedBpData);
		alert("저장되었습니다.");
	};
};

function saveEditedCard() {

	let packagedData = packageEditedCard("character");

	if (packagedData != null) {
		requestUpdateCard_character(packagedData);
		alert("저장되었습니다.");
	};

};

function removeCard() {
	let removeId = selectorById("cardId_character").value;
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemoveCard_character(removeId);
		alert("삭제되었습니다.");
	};
};

function openNewCard() {
	showEmptyCard();
	btnShowHideHandlerByClassName("character","openNewPaper");
};

function openEditCardByDbclick() {
	const TextareaOnCard = document.getElementsByTagName("textarea");
	for (let i = 0; i < TextareaOnCard.length; i++) {
		TextareaOnCard[i].addEventListener("dblclick", function (e) {
			let characterIdArray = Object.keys(bigPicture.character);
			if(characterIdArray.length > 0){
				openEditCard();
			};
		});
	};
};

function openEditCard() {
	btnShowHideHandlerByClassName("character","editPaper");
};

function cancelEditCard() {
	let cardId = selectorById("cardId_character").value;
	showItOnUI(cardId);
};

///// monitor manager

function monitorCardBlankOrDuplicates_character() {
	let cardValue = selectorById("character").value.trim();
	if (cardValue != "") {
		let sameTextArray = getSameTextArray(cardValue);
		if (sameTextArray == undefined) {
			return true;
		} else {
			highLightBorder("character", "red");
			alert("중복된 카드가 있습니다. 내용을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder("character", "red");
		alert("카드가 비어있습니다. 내용을 입력해주시기 바랍니다.");
	};
	return false;
};

function getSameTextArray(text) {
	
	let IdArray_character = getIdArrayByMap("contents", "character");
	
	let textArray = [];
	for(let i = 0; i < IdArray_character.length; i++) {
		textArray.push(IdArray_character[i].character);
	};

	let filterSameTextArray = (query) => {
		return textArray.find(text => query == text);
	};

	let sameTextArray = filterSameTextArray(text);

	return sameTextArray;
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

function uuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
};

function date_ascending(a, b) { // 오름차순    
	return Date.parse(a) - Date.parse(b);
};
	
function date_descending(a, b) { // 내림차순    
	return Date.parse(b) - Date.parse(a);
};