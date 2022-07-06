const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";

let userData = {};
let bigPicture = {};
let objectById = {};
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
			// openEditCardByDbclick();
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

function getIdAndObjectFromChildren(o){
	// console.log('getIdAndObjectFromChildren >>',o)
	const c = o.children
	if(!c) return;

	const ids = Object.keys(c)
	if(ids.length == undefined) return;

	ids.forEach( id => {
		const v = c[id]
		objectById[id] = v
		getIdAndObjectFromChildren(v)
	});
	
}

function requestReadBigPicture(user) {

	const userRef = db.ref("users").child(user.uid).child("bigPicture");
	
	userRef.on("value", (snapshot) => {

		console.log("===== .on is here =====");

		const v = snapshot.val()
		getIdAndObjectFromChildren(v)
		// console.log('objectById >>',objectById)

		snapshot.forEach(childSnap => {
			let key_id = childSnap.key;
			let value_data = childSnap.val();
			bigPicture[key_id] = value_data;
			// console.log('>>>> ',bigPicture);

		});

		let characterKeysArray = Object.keys(bigPicture.children);

		if (characterKeysArray.length > 0) {
			// let mainId = getMainId();
			// if(mainId != null && isMainShown == false) {
			//	isMainShown = true;
			//	showItOnUI(mainId);
			// } else {
				showItOnUI("character", getLastestEditedId('character'));
			// };
			showSelectbox("character");

			let parentsOfDirection = bigPicture.children[getLastestEditedId('character')];
			let idArray = Object.keys(parentsOfDirection.children);

			if(idArray.length < 1) {
				console.log("there's no direction - 1");
				btnShowHideHandlerByClassName("direction","readCard");
				return null;
			} else {
				showItOnUI("direction", getLastestEditedId('direction'));
				showSelectbox("direction");
			};
		} else {
		showItIfNoBpData();
		};

	});
};

///// LtoS manager

function requestSetCard_character(packagedDataHere) {

		db.ref("users")
		.child(userData.uid)
		.child("bigPicture")
		.child("children")
		.child(packagedDataHere.id)
		.set(packagedDataHere);

};

function requestSetCard(layer, packagedDataHere) {

	let cardId_character = getCardId("character");

	const characterRef = db.ref("users")
		.child(userData.uid)
		.child("bigPicture")
		.child("children");

	switch(layer){
		case "character" :
			characterRef
			.child(packagedDataHere.id)
			.set(packagedDataHere);
			break;
		case "direction" :
			characterRef
			.child(cardId_character)
			.child("children")
			.child(packagedDataHere.id)
			.set(packagedDataHere);
			break;
		case "roadmap" :
			console.log("roadmap");
			break;
		case "actionPlan" :
			console.log("actionPlan");
			break;
		default: 
			let layer = null;
	};
};

function requestUpdateCard(layerHere, packagedDataHere) {

	const characterRef = db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("children");

	console.log("packagedDataHere =", packagedDataHere);

	switch(layerHere){
		case "character" :
			characterRef
			.child(packagedDataHere.id)
			.update(packagedDataHere, (e) => {
				console.log("** update completed = ", e);
				});			
			break;
		case "direction" :
			characterRef
			.child(packagedDataHere.parentsId)
			.child("children")
			.child(packagedDataHere.id)
			.update(packagedDataHere, (e) => {
				console.log("** update completed = ", e);
				});
			break;
		case "roadmap" :
			console.log("roadmap");
			break;
		case "actionPlan" :
			console.log("actionPlan");
			break;
		default: 
			let layerHere = null;
	};

};

function requestRemoveCard(layerHere, idHere) {

	console.log("layerHere = ", layerHere);
	console.log("idHere = ", idHere);

	let keyArray = "";

	const characterRef = db.ref("users")
	.child(userData.uid)
	.child("bigPicture")
	.child("children");

	let emptyData = {children: ""};

	switch(layerHere){
		case "character" :
			keyArray = Object.keys(bigPicture.children);
			if (keyArray.length != 1) {
				characterRef
				.child(idHere)
				.remove();
			} else {
				db.ref("users")
				.child(userData.uid)
				.child("bigPicture")
				.set(emptyData);
			};		
			break;

		case "direction" :
			let parentsOfDirection = bigPicture.children[getLastestEditedId('character')];
			keyArray = Object.keys(parentsOfDirection.children);
			if (keyArray.length != 1) {

				characterRef
				.child(getParentsIdfromChildId(idHere))
				.child("children")
				.child(idHere)
				.remove();
				
			} else {
				characterRef
				.child(packagedDataHere.parentsId)
				.set(emptyData);
			};		
			break;

		case "roadmap" :
			console.log("roadmap");
			break;
		case "actionPlan" :
			console.log("actionPlan");
			break;
		default: 
			let layer = null;
	};
};

function requestUpdateMainCard_character(characterId) {

	let characterIdArray = Object.keys(bigPicture.children);
	
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
		.child("children")
		.child(eachId)
		.update(setMainValue, (e) => {
			console.log("** update completed = ", e);
			});

	});
	
};

///// user data manager

function showUserData(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "방문자: " + userName + " 대표";
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"+"		";
};

///// local data manager

function packageNewCard(layer) {

	let moniterResult = monitorCardBlankOrDuplicates(layer);

	if (moniterResult == true) {
		let idNew = uuidv4();

		let packagedData = {};
		packagedData["id"] = idNew;
		packagedData["parentsId"] = "";
		packagedData["children"] = "";

		packagedData["createdDate"] = timeStamp();
		packagedData["editedDate"] = timeStamp();
		packagedData["main"] = "";
		packagedData["layer"] = layer;
		packagedData["contents"] = {};

		let contents = packagedData["contents"];
		switch(layer){
			case "character" :
				contents["character"] = selectorById("character").value.trim();
				break;
			case "direction" :
				console.log("getCardId('character') = ", getCardId("character"));
				packagedData["parentsId"] = getCardId("character");
				contents["direction"] = selectorById("direction").value.trim();
				break;
			case "roadmap" :
				contents["roadmapArea"] = selectorById("roadmapArea").value.trim();
				contents["roadmapA"] = selectorById("roadmapA").value.trim();
				contents["roadmapB"] = selectorById("roadmapArea").value.trim();
				break;
			case "actionPlan" :
				contents["actionPlan"] = selectorById("actionPlan").value.trim();
				break;
			default: 
				let layer = null;
		};

		return packagedData;
	};
		
};

function packageEditedCard(layerHere) {

	function moniterIfCardChanged(layerHere2) {

		// 현재 UI에 띄워진 값 포착하기
		let id = selectorById("cardId_"+layerHere2).value;
		let value = selectorById(layerHere2).value.trim();
		let object = {"id": id, [layerHere2]: value};

		// 로컬 데이터에 있는 값 포착하기
		let arrayWithId = getIdArrayByMap(layerHere, "contents", layerHere);
	
		// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
		for(let i = 0; i < arrayWithId.length; i++) {
			if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
				return false;
			};
		};
		return true;
	};
	
	function getMoniterResult(layerHere3, isChanged) {
		if (isChanged == true) {
			let moniterResultInFunction = monitorCardBlankOrDuplicates(layerHere3);
			return moniterResultInFunction;
		} else {
			return true;
		};
	};

	let moniterResult = getMoniterResult(layerHere, moniterIfCardChanged(layerHere));
	
	if (moniterResult == true) {
		let packagedData = {};
		packagedData["id"] = getCardId(layerHere);
		packagedData["parentsId"] = getCardParentsId(layerHere);
		console.log("getCardParentsId(layerHere) = ", getCardParentsId(layerHere));
		packagedData["editedDate"] = timeStamp();
		packagedData["contents"] = {};

		let contents = packagedData["contents"];
		switch(layerHere){
			case "character" :
				contents["character"] = selectorById("character").value.trim();
				break;
			case "direction" :
				contents["direction"] = selectorById("direction").value.trim();
				break;
			case "roadmap" :
				contents["roadmapArea"] = selectorById("roadmapArea").value.trim();
				contents["roadmapA"] = selectorById("roadmapA").value.trim();
				contents["roadmapB"] = selectorById("roadmapArea").value.trim();
				break;
			case "actionPlan" :
				contents["actionPlan"] = selectorById("actionPlan").value.trim();
				break;
			default: 
				let layer = null;
		};
		console.log("packagedData = ", packagedData);
		return packagedData;
	};
};

function getLastestEditedId(layer) {
	let sortedArray = sortEditedDateArrayWithId(layer);
	if (sortedArray != null) {
		let latestEditedId = sortedArray[0];
		return latestEditedId.id;
	} else {
		return null;
	};
};

function sortEditedDateArrayWithId2(keysArrayHere){

	function getKeysArray(keysArrayHere){
		console.log("keysArrayHere = ", keysArrayHere);
		if (keysArrayHere == null) {
			let keysArrayReturn = Object.keys(bigPicture.children);
			return keysArrayReturn;
		} else {
			return keysArrayHere;
		};
	};

	let keysArray = getKeysArray(keysArrayHere);

	let editedDateArray = keysArray.map( id => {
		let c = bigPicture.children[id];
		return {"id": id, "date": c.editedDate};
	  });

	editedDateArray.sort(
		(a,b) => new Date(b.date) - new Date(a.date)
	);

	return editedDateArray;
};

function sortEditedDateArrayWithId(layerHere) {

	let idEditedDateArray = getIdArrayByMap(layerHere, "general", "editedDate");
	if (idEditedDateArray != null) {
		let editedDateArray = idEditedDateArray.map(element => element.editedDate);
		let editedDateArrayinReverseOrder = editedDateArray.sort(date_descending);
		let arr2 = [];
		for(let i = 0; i < editedDateArrayinReverseOrder.length; i++) {
			let datesAfterSorting = editedDateArrayinReverseOrder[i];
			for (let j = 0; j < editedDateArray.length; j++) {
				let datesBeforeSorting = idEditedDateArray[j].editedDate;
				let id = idEditedDateArray[j].id
				if (datesAfterSorting == datesBeforeSorting) {
					arr2.push({"id": id, "editedDate": datesAfterSorting});
				};
			};
		};
		return arr2;
	} else {
		return null;
	}
	
};

function getIdArrayByMap(layer, scope1, key1, scope2, key2) {		
	
	if(layer == "character"){
		let idArray = Object.keys(bigPicture.children);
		let mappedArray = idArray.map( id => {

			let obj = {"id":id};

			if (scope1 == "contents") {
				obj[key1] =  bigPicture.children[id].contents[key1];
			} else {
				obj[key1] =  bigPicture.children[id][key1];
			};

			if (scope2 == "contents") {
				obj[key2] =  bigPicture.children[id].contents[key2];
			} else {
				obj[key2] =  bigPicture.children[id][key2];
			};

			return obj;

			});
		return mappedArray;

	} else {
		let parentsOfDirection = bigPicture.children[getLastestEditedId('character')];
		let idArray = Object.keys(parentsOfDirection.children);
		if(idArray.length < 1) {
			console.log("there's no direction - 2");
			return null;
		} else {
			let mappedArray = idArray.map( id => {
				let obj = {"id":id};
	
				if (scope1 == "contents") {
					obj[key1] =  parentsOfDirection.children[id].contents[key1];
				} else {
					obj[key1] =  parentsOfDirection.children[id][key1];
				};
				if (scope2 == "contents") {
					obj[key2] =  parentsOfDirection.children[id].contents[key2];
				} else {
					obj[key2] =  parentsOfDirection[key2];
				};
	
				return obj;
				
				});
			return mappedArray;
		};
	};

};

///// UI manager

function showEmptyCard(layerHere) {
	selectorById(layerHere).value = "";
	// selectorById("direction").value = "";
	// selectorById("roadmapArea").value = "";
	// selectorById("roadmapB").value = "";
	// selectorById("roadmapA").value = "";
	// selectorById("actionPlan").value = "";
	btnShowHideHandlerByClassName(layerHere,"createFirstCard");
	// btnShowHideHandlerByClassName("direction","readCard");
};

function showItOnUI(layerHere, idHere) {
	if (idHere != null) {
		let parentsOfCharacter = bigPicture.children[idHere];

		if(layerHere == "character") {
			selectorById("character").value = parentsOfCharacter.contents.character;
			selectorById("cardId_character").value = parentsOfCharacter.id;
			selectorById("cardParentsId_character").value = parentsOfCharacter.parentsId;
		} else {
			let everyKeysArray = Object.keys(objectById);
			let characterCardId = selectorById("cardId_character").value;
	
			for(let i = 0; i < everyKeysArray.length; i++) {
	
				let eachParentsIdOfDirection = objectById[everyKeysArray[i]].parentsId;
	
				if(eachParentsIdOfDirection == characterCardId){
					let keyOfDirection = getLastestEditedId("direction");
					selectorById("direction").value = objectById[keyOfDirection].contents.direction;
					selectorById("cardId_direction").value = objectById[keyOfDirection].id;
					selectorById("cardParentsId_direction").value = objectById[keyOfDirection].parentsId;
					btnShowHideHandlerByClassName("direction","readCard");
				};
			};
		};
	};
	btnShowHideHandlerByClassName(layerHere,"readCard");
};

function showItOnUIWithLayer(layer, id) {
	if (layer == "character") {
		let parentsOfCharacter = bigPicture.children[id]
		selectorById("character").value = parentsOfCharacter.contents.character;
		selectorById("cardId_character").value = parentsOfCharacter.id;
		btnShowHideHandlerByClassName("character","readCard");
	} else {
		let parentsIdOfDirection = indexId(id).parentsId;
		let parentsOfDirection = bigPicture.children[parentsIdOfDirection].children[id];
		selectorById("direction").value = parentsOfDirection.contents.direction;
		selectorById("cardId_direction").value = parentsOfDirection.id;
		btnShowHideHandlerByClassName("direction","readCard");
	};
};

function uiHide(id) {
	selectorById(id).style.display = "none";
};

function uiShow(id) {
	selectorById(id).style.display = "initial";
};

function btnShowHideHandlerByClassName(className, state) {

	// console.log("cardState = ", state);

	uiHide("openEditCard_btn_"+className);
	uiHide("cancelEditCard_btn_"+className);
	uiHide("saveEditedCard_btn_"+className);
	uiHide("saveNewCard_btn_"+className);
	uiHide("removeCard_btn_"+className);
	uiHide("openNewCard_btn_"+className);

	switch(state){
		case "createFirstCard" :
			uiShow("saveNewCard_btn_"+className);
			editModeHandlerByClassName(className, "editing");
			break;
		case "openNewCard" :
			uiShow("saveNewCard_btn_"+className);
			uiShow("cancelEditCard_btn_"+className)
			editModeHandlerByClassName(className, "editing");
			break;
		case "readCard" :
			uiHide("guideMessage");
			uiShow("openEditCard_btn_"+className);
			uiShow("openNewCard_btn_"+className);
			uiShow("removeCard_btn_"+className);
			editModeHandlerByClassName(className, "reading");
			break;
		case "editCard" :
			uiShow("saveEditedCard_btn_"+className);
			uiShow("cancelEditCard_btn_"+className);
			uiShow("saveNewCard_btn_"+className);
			uiShow("removeCard_btn_"+className);
			editModeHandlerByClassName(className, "editing");
			break;
		default:
			let state = null;
	}
	if(className == "character") {
		btnShowHideHandlerByClassName_main(className, state);
	};
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

function editModeHandlerByClassName(className, cardMode) {
	function textareaReadOnly(id, check){
		selectorById(id).readOnly = check;
	};
	if (cardMode == "editing") {
		document.getElementsByClassName(className)[0].style.color = "#9CC0E7";
		document.getElementsByClassName(className)[0].style.borderColor = "#9CC0E7";
		textareaBorderColorHandlerByClass(className, "3px", "#9CC0E7");
		textareaReadOnly(className, false);
	} else {
		document.getElementsByClassName(className)[0].style.color = "#424242";
		document.getElementsByClassName(className)[0].style.borderColor = "#424242";
		textareaBorderColorHandlerByClass(className, "1px", "#c8c8c8");
		textareaReadOnly(className, true);
	};
};

function editModeHandler(cardMode) {
	function textareaReadOnly(id, trueOrFalse){
		selectorById(id).readOnly = trueOrFalse;
	};
	if (cardMode == "editing") {
		selectorById("gridMainFrame").style.color = "#9CC0E7";
		textareaReadOnly("character", false);
		textareaReadOnly("direction", false);
		textareaReadOnly("roadmapArea", false);
		textareaReadOnly("roadmapB", false);
		textareaReadOnly("roadmapA", false);
		textareaReadOnly("actionPlan", false);
		textareaBorderColorHandler("2px", "#9CC0E7");
	} else {
		selectorById("gridMainFrame").style.color = "#424242";
		textareaReadOnly("character", true);
		textareaReadOnly("direction", true);
		textareaReadOnly("roadmapArea", true);
		textareaReadOnly("roadmapB", true);
		textareaReadOnly("roadmapA", true);
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
	showEmptyCard("character");
	showEmptyCard("direction");
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
};

function highLightBorder(id, color) {
	return selectorById(id).style.borderColor = color;
};

///// selectbox manager

function showSelectbox(layerHere) {

	let selectboxId = "selectbox_"+layerHere;
	let selectbox = selectorById(selectboxId);

	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	
	// Array 만들기
	function getMappedArray(layerHere2){
		let mappedArray = getIdArrayByMap(layerHere2,"general", "editedDate", "contents", layerHere2);
		return mappedArray;
	};
	let mappedArray = getMappedArray(layerHere);
	  
	// selectbox option list 순서 잡기(최근 편집 순서)
	function sortingArray(mappedArrayHere) {

		let editedDateArray = mappedArrayHere.map(element => element.editedDate);
		let editedDateArrayinReverseOrder = editedDateArray.sort(date_descending);

		let arr = [];

		for(let i = 0; i < editedDateArrayinReverseOrder.length; i++) {

			let datesAfterSorting = editedDateArrayinReverseOrder[i];

			for (let j = 0; j < editedDateArray.length; j++) {

				let id = mappedArrayHere[j].id;
				let datesBeforeSorting = mappedArrayHere[j].editedDate;

				if (datesAfterSorting == datesBeforeSorting) {
					let value = mappedArrayHere[j][layerHere];
					arr.push({"id": id, "editedDate": datesBeforeSorting, [layerHere]: value});
				};
			};
		};
		return arr;
	};

	let sortedArray = sortingArray(mappedArray);

	// <option> 만들어서, Array 넣기
	for (let i = 0; i < sortedArray.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(sortedArray[i][layerHere]);
		let optionId = sortedArray[i].id;
		let optionValue = sortedArray[i][layerHere];
		let mainId = getMainId();
		if(optionId == mainId) {
			let mainOptionMark = optionValue + " ★";
			let mainTxt = document.createTextNode(mainOptionMark);
			option.appendChild(mainTxt);
		} else {
			option.appendChild(txt);
		};
		option.setAttribute("value", sortedArray[i].id);
		option.setAttribute("innerHTML", sortedArray[i][layerHere]);
		selectbox.insertBefore(option, selectbox.lastChild);
	};
};

function selectBySelectbox(layerHere) {
	let selectboxId = "selectbox_"+layerHere
	let id = selectorById(selectboxId).value;
	console.log("id = ", id);
	showItOnUIWithLayer(layerHere, id);

	if(layerHere == "character") {

		let parentsOfDirection = bigPicture.children[getLastestEditedId('character')];
		let idArray = Object.keys(parentsOfDirection.children);

		if(idArray.length < 1) {
			console.log("there's no direction - 3");
			return null;
		} else {
			showItOnUI("direction", getLastestEditedId('direction'));
			showSelectbox("direction");
			btnShowHideHandlerByClassName("direction","readCard");
		};
	};
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
	let idMainArray = getIdArrayByMap("character","general", "main");
	for(let i = 0; i < idMainArray.length; i++) {
		if(idMainArray[i].main == "main"){
			return idMainArray[i].id;
		};
	};
};

///// CRUD manager

function saveNewCard(layer) {
	let packagedBpData = packageNewCard(layer);
	if (packagedBpData != null) {
		requestSetCard(layer, packagedBpData);
		alert("저장되었습니다.");
	};
};

function saveEditedCard(layer) {
	let packagedData = packageEditedCard(layer);
	if (packagedData != null) {
		requestUpdateCard(layer, packagedData);
		alert("저장되었습니다.");
	};
};

function removeCard(layerHere) {
	let removeId = selectorById("cardId_"+layerHere).value;
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemoveCard(layerHere,removeId);
		alert("삭제되었습니다.");
	};
};

function openNewCard(layerHere) {
	showEmptyCard(layerHere);
	btnShowHideHandlerByClassName(layerHere,"openNewCard");
};

function openEditCardByDbclick() {
	const TextareaOnCard = document.getElementsByTagName("textarea");
	for (let i = 0; i < TextareaOnCard.length; i++) {
		TextareaOnCard[i].addEventListener("dblclick", function (e) {
			let characterIdArray = Object.keys(bigPicture.children);
			if(characterIdArray.length > 0){
				openEditCard();
			};
		});
	};
};

function openEditCard(layerHere) {
	btnShowHideHandlerByClassName(layerHere,"editCard");
};

function cancelEditCard(layerHere) {
	let cardId = selectorById("cardId_"+layerHere).value;
	showItOnUI(layerHere, cardId);
};

///// monitor manager

function monitorCardBlankOrDuplicates(layerHere) {
	let cardValue = selectorById(layerHere).value.trim();
	if (cardValue != "") {
		let sameTextArray = getSameTextArray(cardValue);
		if (sameTextArray == undefined) {
			return true;
		} else {
			highLightBorder(layerHere, "red");
			alert("중복된 카드가 있습니다. 내용을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder(layerHere, "red");
		alert("카드가 비어있습니다. 내용을 입력해주시기 바랍니다.");
	};
	return false;
};

function getSameTextArray(text) {
	
	let IdArray_character = getIdArrayByMap("character","contents", "character");
	
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

function getCardId(layerHere) {
	return selectorById("cardId_"+layerHere).value;
};

function getCardParentsId(layerHere) {
	return selectorById("cardParentsId_"+layerHere).value;
};

function indexId(idHere) {
	let characterArray = Object.keys(bigPicture.children);
	for(let i = 0; i < characterArray.length; i++) {
		if(characterArray[i] == idHere) {
			return {"layer": "character", "id": idHere};
		} else {
			let directionArray = Object.keys(bigPicture.children[characterArray[i]].children);
			for(let j = 0; j < directionArray.length; j++) {
				if(directionArray[j] == idHere) {
					return {"layer": "direction", "id": idHere, "parentsId": characterArray[i]};
				};
			};
		};
	};
	return console.log("There's any same id");
};

function getParentsIdfromChildId(childIdHere) {
	
	let everyKeysArray = Object.keys(objectById);
	console.log("childIdHere =", childIdHere);
	console.log("everyKeysArray = ", everyKeysArray);
	console.log("objectById = ", objectById);

	for(let i = 0; i < everyKeysArray.length; i++) {
		if(everyKeysArray[i] == childIdHere) {
			console.log("objectById[childIdHere].parentsId = ", objectById[childIdHere].parentsId);
			return objectById[childIdHere].parentsId;
		};
	};
};