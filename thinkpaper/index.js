const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
const userData = {}; 
let objectById = {};
let isMainShown = false;

const logInDept = {
	"logIn": function logIn() {
		firebase.auth().onAuthStateChanged(function (user) {
			if (user != null) {
				StoLDept.requestReadUserData(user);
				StoLDept.requestReadBigPicture(user);
				openEditCardByDbclick();
			} else {
				window.location.replace("login.html");
			};
		});
	},
	"logOut": function logOut() {
		firebase.auth().signOut();
	}
};

logInDept.logIn();

const StoLDept = {
	"requestReadUserData": 
		function requestReadUserData(user) {
			const userRef = db.ref("users").child(user.uid).child("user");
			userRef.on("value", (snapshot) => {
				snapshot.forEach(childSnap => {
					const key = childSnap.key;
					const value = childSnap.val();
					value["uid"] = childSnap.key;
					userData[key] = value;
				});
				userDept.showUserData(userData);
			});
		},
	"requestReadBigPicture":
		function requestReadBigPicture(user) {

			const userRef = db.ref("users").child(user.uid).child("bigPicture");
			
			userRef.on("value", (snapshot) => {
				console.log("**===== .on is here =====");
		
				const v = snapshot.val();
				objectById = {};

				// [질문] 재귀함수는 이 안에 넣어야 정리가 되는듯함, 괜찮을지?
				function requestReadIdAndObjectFromChildren(o){
					// console.log('**requestReadIdAndObjectFromChildren >>',o)
					const c = o.children;
					if(!c) return;
				
					const ids = Object.keys(c);
					if(ids.length == undefined) return;
				
					ids.forEach( id => {
						const v = c[id];
						objectById[id] = v;
						requestReadIdAndObjectFromChildren(v);
					});
				};

				requestReadIdAndObjectFromChildren(v);
				// console.log('**objectById >>',objectById)
		
				StoLDept.showItOnUI_latest();
		
			});
		},
	"showItOnUI_latest":
		function showItOnUI_latest() {
		
			const idThreadObjectKeysArray = ["character", "direction", "roadmap", "actionPlan"];
			// 리팩토링 후 "roadmap", "actionPlan" 넣기

			idThreadObjectKeysArray.forEach(eachLayer => {

				const latestIdOfEachLayer = getLatestIdByLayer(eachLayer);
				
				if(latestIdOfEachLayer != null) {

					const mainId = getMainId();
				
					if(mainId != null && isMainShown == false) {
						isMainShown = true;
						showItOnUI("character", mainId);
					} else {	
						showItOnUI(eachLayer, latestIdOfEachLayer);
					};
					setupBtnShowOrHideByClassName(eachLayer, "readCard");
					updateSelectbox(eachLayer);
				} else {
					showItIfNoBpData(eachLayer);
					updateSelectbox(eachLayer);
				};
			});
		}
	// function requestSetCard(layerHere, packagedDataHere) {
	// 	const inputId = packagedDataHere.id;
	// 	const switchedRef = getRefBySwitchLayer(layerHere, inputId);
	// 	switchedRef.child(inputId).set(packagedDataHere, (e) => {
	// 		request_followUpEditedDate(layerHere, packagedDataHere);
	// 		alert("저장되었습니다.");});
	// 		// [해결] 문서에서는 then(), catch()를 씀. 차이점? // 문서 버전을 함께 확인하기, 
	//		// [질문] 버전확인 방법
	// 		// 참조: https://firebase.google.com/docs/database/web/read-and-write?hl=ko
	// };
};

const LtoSDept = {
	"requestSetCard": 
		function requestSetCard(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const switchedRef = LtoSDept.getRefBySwitchLayer(layerHere, inputId);
			switchedRef.child(inputId)
			.set(packagedDataHere)
			.then((e) => {
				LtoSDept.request_followUpEditedDate(layerHere, packagedDataHere, function(){
					alert("저장되었습니다.");
				});
			});
		},
	"requestUpdateCard":
		function requestUpdateCard(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const switchedRef = LtoSDept.getRefBySwitchLayer(layerHere, inputId);
			switchedRef.child(inputId)
			.update(packagedDataHere, (e) => {
				LtoSDept.request_followUpEditedDate(layerHere, packagedDataHere);
				console.log("**update completed = ", e);
				alert("수정되었습니다.");
			});
		},
	"requestRemoveCard":
		function requestRemoveCard(layerHere, idHere) {

			const inputId = idHere;
			const packagedData = objectById[inputId];
			packagedData.editedDate = getTimeStamp();
		
			const switchedRef = LtoSDept.getRefBySwitchLayer(layerHere, inputId);
			const idArrayLength = getEveryIdArrayOfLayer(layerHere).length;
		
			if(layerHere == "character" && idArrayLength == 1) {
				// character레이어에서 remove진행시, 
				// firebase의 bigPicture 자체가 사라져, 로딩 로직에서 버그가 남.
				// 그래서 예외 처리
				const emptyData = {children: ""};
				const switchedRefForEmptyData = switchedRef.parent;
				switchedRefForEmptyData.set(emptyData, (e) => {
					console.log("**remove completed = ", e);
					alert("삭제되었습니다.");
					});
			} else {
				switchedRef.child(inputId).remove((e) => {
					LtoSDept.request_followUpEditedDate(layerHere, packagedData);
					console.log("**remove completed = ", e);
					alert("삭제되었습니다.");
					});
			};
		},
	"request_followUpEditedDate":
		function request_followUpEditedDate(layerHere, packagedDataHere, cb) {
			const parentsId = packagedDataHere.parentsId;
			const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
			const switchedRef = LtoSDept.getRefBySwitchLayer(parentsLayer, parentsId);
			const editedDateForParents = {"editedDate": packagedDataHere.editedDate};
				
			function requestUpdateEditedDate(layer1, layer2, layer3, layer4) {
			
				const idThreadObjectKeysArray = [layer1, layer2, layer3, layer4].filter((l)=> l != undefined );
				// filter에 대해서 천천히 이해하기
			
				const last = idThreadObjectKeysArray.length;
				let counter = 0;
				idThreadObjectKeysArray.forEach(eachLayer => {
					switchedRef.child(parentsId)
					// parentsId -> eachLayer 생각하기
					.update(editedDateForParents, (e) => {
						console.log("**followUpEditedDate completed = ", e);
						if(++counter == last) {
							cb();
						}
					});
				});
			};
		
			switch(layerHere) {
				case "character" :
					// 해당없음
					break;
				case "direction" :
					requestUpdateEditedDate("character");
					break;
				case "roadmap" :
					requestUpdateEditedDate("character", "direction");
				case "actionPlan" :
					requestUpdateEditedDate("character", "direction", "roadmap");
				default : null;
			};
		},
	"requestUpdateMainCard":
		function requestUpdateMainCard(idHere) {
			const characterIdArray = getEveryIdArrayOfLayer("character");
			characterIdArray.forEach(eachId => {
				let setMainValue = {};
				if (eachId == idHere) {
					setMainValue = {
						"main": "main",
						"editedDate": getTimeStamp()
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
					console.log("**updateMainCard completed = ", e);
					});
			});
		},
	"getRefBySwitchLayer":
		function getRefBySwitchLayer(layerHere, inputIdHere) {
			console.log("**=====getRefBySwitchLayer() start=====");
			const userRef = db.ref("users").child(userData.uid);
			const bigPictureRef = userRef.child("bigPicture");
			const characterRef = bigPictureRef.child("children");
			const resultIsNewId = isNewId(inputIdHere);
			if (resultIsNewId) {
				switch(layerHere){
					case "character" :
						return characterRef;
					case "direction" : 
						const characterId = getParentsIdfromChildId("direction", inputIdHere);
						const directionRef = characterRef.child(characterId).child("children");
						return directionRef;
					case "roadmap" : 
						const characterId2 = getParentsIdfromChildId("direction", inputIdHere);
						const directionRef2 = characterRef.child(characterId2).child("children");
						const directionId = getCardId("direction");
						const roadmapRef = directionRef2.child(directionId).child("children");
						return roadmapRef;
					case "actionPlan" : 
						const characterId3 = getParentsIdfromChildId("direction", inputIdHere);
						const directionRef3 = characterRef.child(characterId3).child("children");
						const directionId2 = getCardId("direction");
						const roadmapRef2 = directionRef3.child(directionId2).child("children");
						const roadmapId = getCardId("roadmap");
						const actionPlanRef = roadmapRef2.child(roadmapId).child("children");
						return actionPlanRef;
					default: 
						return null;
				};
			} else {
				const idThreadObject = getIdThreadObjectById(inputIdHere);
				const directionRef = characterRef.child(idThreadObject.characterId).child("children");	
				switch(layerHere){
					case "character" : 
						return characterRef;
					case "direction" : 
						return directionRef;
					case "roadmap" : 
						const roadmapRef = directionRef.child(idThreadObject.directionId).child("children");
						return roadmapRef;
					case "actionPlan" : 
						const roadmapRef2 = directionRef.child(idThreadObject.directionId).child("children");
						const actionPlanRef = roadmapRef2.child(idThreadObject.roadmapId).child("children");
						return actionPlanRef;
					default: 
						return null;
				};
			};
		}
};
	
const userDept = {
	"showUserData":
	function showUserData(userDataHere) {
		const userName = userDataHere.name;
		const userEmail = userDataHere.email;
		getSelectorById("nameChecked").innerHTML = "방문자: " + userName + " 대표";
		getSelectorById("emailChecked").innerHTML = "(" + userEmail + ")"+"		";
	}
};

///// UI manager

const UIDept = {
	"showEmptyCard":
		function showEmptyCard(layerHere) {
			getSelectorById(layerHere).value = "";
		}
};


function showItOnUI(layerHere, idHere) {
	if (idHere != null) {
		getSelectorById(layerHere).value = objectById[idHere].contents[layerHere];
		getSelectorById("cardId_"+layerHere).value = objectById[idHere].id;
		getSelectorById("cardParentsId_"+layerHere).value = objectById[idHere].parentsId;
	} else {
		UIDept.showEmptyCard(layerHere);
	};
	setupBtnShowOrHideByClassName(layerHere,"readCard");
};

function showItOnUI_followUp(layerHere) {
	function showItOnUI_latest_byLayerCondition(layer1, layer2, layer3, layer4) {
	
		const idThreadObjectKeysArray = [layer1, layer2, layer3, layer4];
	
		function getLatestIdByLayer(layerHere) {
			const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere);
			if(eachIdArrayByLayer.length > 0){
				const latestId = getLastestEditedId(eachIdArrayByLayer);
				return latestId;
			} else {
				return null;
			};
		};
	
		idThreadObjectKeysArray.forEach(eachLayer => {
			if (eachLayer != undefined) {
				const latestIdOfEachLayer = getLatestIdByLayer(eachLayer);
				if(latestIdOfEachLayer != null) {
					showItOnUI(eachLayer, latestIdOfEachLayer);
					setupBtnShowOrHideByClassName(eachLayer, "readCard");
				} else {
					showItIfNoBpData(eachLayer);
				};
				updateSelectbox(eachLayer);
			};
		});
	};
	
	switch(layerHere) {
		case "character" :
			showItOnUI_latest_byLayerCondition("direction", "roadmap", "actionPlan");
			// 리팩토링 후 showItOnUI_latest_byLayerCondition("direction", "roadmap", "actionPlan");
			break;
		case "direction" :
			showItOnUI_latest_byLayerCondition("roadmap", "actionPlan");
			// 리팩토링 후 showItOnUI_latest_byLayerCondition("roadmap", "actionPlan");
			break;
		case "roadmap" :
			showItOnUI_latest_byLayerCondition("actionPlan");
		case "actionPlan" :
			// 해당없음
		default : null;
	};
};

function hideUI(id) {
	getSelectorById(id).style.display = "none";
};

function showUI(id) {
	getSelectorById(id).style.display = "initial";
};

function setupBtnShowOrHideByClassName(layerHere, state) {

	// 카드 안내 글씨 지우기
	if(layerHere != "character") {
		const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
		const parentsCardValue = getSelectorById(parentsLayer).value;
		const alertTextElement = getSelectorById("alert_txt_"+layerHere);
		if(parentsCardValue != "" && alertTextElement.innerText != "") {
			alertTextElement.innerHTML = "";
		};
	};

	// 일단 모두 가리기
	hideUI("openEditCard_btn_"+layerHere);
	hideUI("cancelEditCard_btn_"+layerHere);
	hideUI("saveEditedCard_btn_"+layerHere);
	hideUI("saveNewCard_btn_"+layerHere);
	hideUI("removeCard_btn_"+layerHere);
	hideUI("openNewCard_btn_"+layerHere);

	// 모드에 따라 설정하기
	switch(state){
		case "createFirstCard" :
			showUI("saveNewCard_btn_"+layerHere);
			setupEditModeByClassName(layerHere, "editing");
			break;
		case "openNewCard" :
			showUI("saveNewCard_btn_"+layerHere);
			showUI("cancelEditCard_btn_"+layerHere)
			setupEditModeByClassName(layerHere, "editing");
			break;
		case "readCard" :
			hideUI("guideMessage");
			showUI("openEditCard_btn_"+layerHere);
			showUI("openNewCard_btn_"+layerHere);
			showUI("removeCard_btn_"+layerHere);
			setupEditModeByClassName(layerHere, "reading");
			break;
		case "editCard" :
			showUI("saveEditedCard_btn_"+layerHere);
			showUI("cancelEditCard_btn_"+layerHere);
			showUI("saveNewCard_btn_"+layerHere);
			showUI("removeCard_btn_"+layerHere);
			setupEditModeByClassName(layerHere, "editing");
			editCard_followUp(layerHere);
			break;
		case "inactiveCard" :
			setupEditModeByClassName(layerHere, "reading");
			getSelectorById("alert_txt_"+layerHere).innerHTML = "(상위 카드 작성 후, 작성 가능)";
			break;
		default:
			const state = null;
	}
	if(layerHere == "character") {
		function setupBtnShowOrHideByClassName_main(layerHere) {

			hideUI("gotoMainCard_btn_"+layerHere);
			hideUI("setMainCard_btn_"+layerHere);
			hideUI("setMainCard_txt_"+layerHere);
		
			const cardId = getSelectorById("cardId_character").value;
			const mainId = getMainId();
		
			if(cardId == mainId) {
				showUI("setMainCard_txt_"+layerHere);
			} else {
				if (mainId != null) {
					showUI("gotoMainCard_btn_"+layerHere);
					showUI("setMainCard_btn_"+layerHere);
				} else {
					showUI("setMainCard_btn_"+layerHere);
				};
			};
		};
		setupBtnShowOrHideByClassName_main(layerHere, state);
	};
	resizeTextarea();
};

function setupEditModeByClassName(layerHere, cardMode) {
	function setupTextareaReadOnly(id, trueOrFalse){
		getSelectorById(id).readOnly = trueOrFalse;
	};
	if (cardMode == "editing") {
		document.getElementsByClassName(layerHere)[0].style.color = "#9CC0E7";
		document.getElementsByClassName(layerHere)[0].style.borderColor = "#9CC0E7";
		setupTextareaBorderColorByClass(layerHere, "3px", "#9CC0E7");
		setupTextareaReadOnly(layerHere, false);
	} else {
		document.getElementsByClassName(layerHere)[0].style.color = "#424242";
		document.getElementsByClassName(layerHere)[0].style.borderColor = "#424242";
		setupTextareaBorderColorByClass(layerHere, "1px", "#c8c8c8");
		setupTextareaReadOnly(layerHere, true);
	};
};

function editCard_followUp(layerHere) {
	// children카드가 0개일 시, inactive 처리하기
	const childrenLayer = getchildrenLayerBySwitchLayer(layerHere);
	if (childrenLayer != null) {
		const childrenIdArray = getEveryIdArrayOfLayer(childrenLayer);
		// children 카드에 아무것도 없으면, inactive 있으면, read로 읽기
		if(childrenIdArray.length == 0) {
			setupBtnShowOrHideByClassName(childrenLayer, "inactiveCard");
		} else {
			setupBtnShowOrHideByClassName(childrenLayer, "readCard");
		};
	};
	if (layerHere != "character") {
	const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
	setupEditModeByClassName(parentsLayer, "reading");
	};
};

function setupTextareaBorderColorByClass(layerHere, px, color) {
    setTimeout(()=>{
		const selectorTextareaOnCard = document.getElementsByClassName(layerHere);
		for (let i = 0; i < selectorTextareaOnCard.length; i++) {
			selectorTextareaOnCard[i].style.border = "solid " + px + color;
		};
	},1);
};

function resizeTextarea() {
	// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
	const tx = document.getElementsByTagName("textarea");
	for (let i = 0; i < tx.length; i++) {
		// [해결] i는 const로 하면 안될것 같다. i++이 i를 다시 정의하는 과정이기 때문에. 그럴까?
		tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		tx[i].addEventListener("input", OnInput, false);
	};

	function OnInput() {
		this.style.height = "auto";
		this.style.height = (this.scrollHeight) + "px";
	};
};

function showItIfNoBpData(layerHere) {
	
	function showMessage() {
		const guideMessage = getSelectorById("guideMessage");
		const guideMessageValue = getSelectorById("guideMessage").innerText;
		if (guideMessageValue == "") {
			guideMessage.innerHTML = "'파란색 네모칸에 내용을 작성해보세요~!'"
		};
	};

	UIDept.showEmptyCard(layerHere);

	if(layerHere == "character") {
		setupBtnShowOrHideByClassName(layerHere,"createFirstCard");
		editCard_followUp(layerHere);
		showMessage();
	} else {
		// direction 카드부터는 부모 레이어가 0이 아닌 경우에만, showEmptyCard(=createFirstCard)를 진행한다.
		const parentLayer = getParentsLayerBySwitchLayer(layerHere);
		const parentsIdArrayLength = getEveryIdArrayOfLayer(parentLayer).length;

		if(parentsIdArrayLength != 0) {
			setupBtnShowOrHideByClassName(layerHere,"createFirstCard");
			editCard_followUp(layerHere);
			showMessage();
		};
	};
};

function highLightBorder(id, color) {
	return getSelectorById(id).style.borderColor = color;
};

///// list manager

function updateList(layerHere, sortedArray) {

	const listId = "list_"+layerHere;
	const list = getSelectorById(listId);

	const lis = list.getElementsByTagName("LI");
	// list 초기화하기
	for(let i=lis.length-1; i>=0; i-- ){
		lis[i].remove()
	};

	for (let i = 0; i < sortedArray.length; i++) {
		const liValue = sortedArray[i][layerHere];
        const listItem = document.createElement('li');
		listItem.innerHTML = liValue;
        list.appendChild(listItem);
	};
};

///// selectbox manager

function updateSelectbox(layerHere) {

	const selectboxId = "selectbox_"+layerHere;
	const selectbox = getSelectorById(selectboxId);

	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};

	// Array 만들기

	function getMappedObject_IdEditedDateContents(layerHere3) {		

		const returnArray = [];

		const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere3);
		eachIdArrayByLayer.forEach(EachId => {
			let returnObject = {};
			returnObject["id"] = objectById[EachId].id;
			returnObject["editedDate"] = objectById[EachId].editedDate;
			returnObject[layerHere3] = objectById[EachId].contents[layerHere3];
			returnArray.push(returnObject);
		});

		return returnArray;
	};

	const mappedArray = getMappedObject_IdEditedDateContents(layerHere);

	// selectbox option list 순서 잡기(최근 편집 순서)
	function sortingArray(mappedArrayHere){
		mappedArrayHere.sort(
			(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
		);
		return mappedArrayHere;
	};

	let sortedArray = sortingArray(mappedArray);

	// <option> 만들어서, Array 넣기
	for (let i = 0; i < sortedArray.length; i++) {
		const option = document.createElement("OPTION");
		const optionId = sortedArray[i].id;
		const optionValue = sortedArray[i][layerHere];
		const txt = document.createTextNode(optionValue);
		const mainId = getMainId();
		if(optionId == mainId) {
			const mainOptionMark = optionValue + " ★";
			const mainTxt = document.createTextNode(mainOptionMark);
			option.appendChild(mainTxt);
		} else {
			option.appendChild(txt);
		};
		option.setAttribute("value", optionId);
		option.setAttribute("innerHTML", optionValue);
		selectbox.insertBefore(option, selectbox.lastChild);
	};

	// updateList(layerHere, sortedArray);

};

function selectBySelectbox(layerHere) {
	const selectboxId = "selectbox_"+layerHere;
	const id = getSelectorById(selectboxId).value;
	if(id != SELECTBOX_BPTITLE_VALUE_INIT) {
		showItOnUI(layerHere, id);
		showItOnUI_followUp(layerHere);
	};
};

///// mainCard mananger

function setMainCard() {
	const characterId = getSelectorById("cardId_character").value;
	LtoSDept.requestUpdateMainCard(characterId);
};

function gotoMainCard() {
	const mainId = getMainId();
	showItOnUI("character", mainId);
	updateSelectbox("character");
};

function getMainId() {
	const characterIdArray = getEveryIdArrayOfLayer("character");
	let mainId = "";
	characterIdArray.forEach(eachId => {
		if(objectById[eachId].main == "main") {
			mainId = eachId;
		};
	});
	if (mainId != ""){
		return mainId;
	} else {
		return null;
	};
};

///// CRUD manager

function saveNewCard(layerHere) {

	function packageNewCard(layerHere) {

		const moniterResult = monitorCardBlankOrDuplicates(layerHere);
	
		if (moniterResult) {
	
			function catchContentsDataBySwitchLayer(layerHere2) {
	
				const catchContentsData = {};
				catchContentsData["contents"] = {};
				const contents = catchContentsData["contents"];
			
				switch(layerHere2){
					case "character" :
						catchContentsData["parentsId"] = "";
						contents["character"] = getSelectorById("character").value.trim();
						break;
					case "direction" :
						catchContentsData["parentsId"] = getCardId("character");
						contents["direction"] = getSelectorById("direction").value.trim();
						break;
					case "roadmap" :
						catchContentsData["parentsId"] = getCardId("direction");
						contents["roadmap"] = getSelectorById("roadmap").value.trim();
						// contents["roadmapA"] = getSelectorById("roadmapA").value.trim();
						// contents["roadmapB"] = getSelectorById("roadmapB").value.trim();
						break;
					case "actionPlan" :
						catchContentsData["parentsId"] = getCardId("roadmap");
						contents["actionPlan"] = getSelectorById("actionPlan").value.trim();
						break;
					default:
						const layerHere2 = null;
				};
				return catchContentsData;
			};
	
			const catchedData = catchContentsDataBySwitchLayer(layerHere);
	
			function getUuidv4() {
				return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
				  (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
				);
			};
	
			const idNew = getUuidv4();
			catchedData["id"] = idNew;
			catchedData["children"] = "";
			catchedData["createdDate"] = getTimeStamp();
			catchedData["editedDate"] = getTimeStamp();
			catchedData["main"] = "";
			catchedData["layer"] = layerHere;

			return catchedData;
		};
			
	};

	const packagedData = packageNewCard(layerHere);

	if (packagedData != null) {
		LtoSDept.requestSetCard(layerHere, packagedData);
		showItOnUI_followUp(layerHere);
	};
};

function saveEditedCard(layerHere) {
	function packageEditedCard(layerHere) {

		function moniterIfCardChanged(layerHere2) {
	
			// 현재 UI에 띄워진 값 포착하기
			const id = getSelectorById("cardId_"+layerHere2).value;
			const value = getSelectorById(layerHere2).value.trim();
			const object = {"id": id, [layerHere2]: value};
	
			// 로컬 데이터에 있는 값 포착하기
	
			function getMappedObject_idContents(layerHere2) {		
	
				const returnArray = [];
		
				const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere2);
				eachIdArrayByLayer.forEach(EachId => {
					const returnObject = {};
					returnObject["id"] = objectById[EachId].id;
					returnObject[layerHere2] = objectById[EachId].contents[layerHere2];
					returnArray.push(returnObject);
				});
		
				return returnArray;
			};
	
			const arrayWithId = getMappedObject_idContents(layerHere);
		
			// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
			for(let i = 0; i < arrayWithId.length; i++) {
				if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
					return false;
				};
			};
			return true;
		};
		
		function getMoniterResult(layerHere3, isChanged) {
			if (isChanged) {
				const moniterResultInFunction = monitorCardBlankOrDuplicates(layerHere3);
				return moniterResultInFunction;
			} else {
				return true;
			};
		};
	
		const moniterResult = getMoniterResult(layerHere, moniterIfCardChanged(layerHere));
		
		if (moniterResult) {
			const packagedData = {};
			packagedData["id"] = getCardId(layerHere);
			packagedData["parentsId"] = getSelectorById("cardParentsId_"+layerHere).value;
			packagedData["editedDate"] = getTimeStamp();
			packagedData["contents"] = {};
	
			const contents = packagedData["contents"];
			switch(layerHere){
				case "character" :
					contents["character"] = getSelectorById("character").value.trim();
					break;
				case "direction" :
					contents["direction"] = getSelectorById("direction").value.trim();
					break;
				case "roadmap" :
					contents["roadmap"] = getSelectorById("roadmap").value.trim();
					contents["roadmapA"] = getSelectorById("roadmapA").value.trim();
					contents["roadmapB"] = getSelectorById("roadmapB").value.trim();
					break;
				case "actionPlan" :
					contents["actionPlan"] = getSelectorById("actionPlan").value.trim();
					break;
				default: 
					const layer = null;
			};
			return packagedData;
		};
	};

	const packagedData = packageEditedCard(layerHere);
	if (packagedData != null) {
		LtoSDept.requestUpdateCard(layerHere, packagedData);
	};
};

function removeCard(layerHere) {
	const removeId = getSelectorById("cardId_"+layerHere).value;
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		LtoSDept.requestRemoveCard(layerHere, removeId);
	};
};

function openNewCard(layerHere) {
	getSelectorById("cardId_"+layerHere).value = "";
	UIDept.showEmptyCard(layerHere);
	setupBtnShowOrHideByClassName(layerHere,"openNewCard");

	function openNewCard_followUp(layerHere) {
		function openNewCard_byLayerCondition(layer1, layer2, layer3, layer4) {
		
			const idThreadObjectKeysArray = [layer1, layer2, layer3, layer4];
		
			idThreadObjectKeysArray.forEach(eachLayer => {
				if (eachLayer != undefined) {
					UIDept.showEmptyCard(eachLayer);
					setupBtnShowOrHideByClassName(eachLayer, "inactiveCard");
				};
			});
		};
		
		switch(layerHere) {
			case "character" :
				openNewCard_byLayerCondition("direction", "roadmap", "actionPlan");
				// 리팩토링 후 openNewCard_byLayerCondition("direction", "roadmap", "actionPlan");
				break;
			case "direction" :
				openNewCard_byLayerCondition("roadmap", "actionPlan");
				// openNewCard_byLayerCondition("roadmap", "actionPlan");
				break;
			case "roadmap" :
				openNewCard_byLayerCondition("actionPlan");
			case "actionPlan" :
				// 해당없음
			default : null;
		};
	};
	openNewCard_followUp(layerHere);
	//작업중: 새 카드가 열릴 시, 나머지 카드는 비어있는 카드가 되어야함
};

function openEditCardByDbclick() {
	const textareaOnCard = document.getElementsByTagName("textarea");
	for (let i = 0; i < textareaOnCard.length; i++) {
		textareaOnCard[i].addEventListener("dblclick", function (e) {
			const layer = e.target.id;
			const idArray = getEveryIdArrayOfLayer(layer);
			const readOnlyCondition = textareaOnCard[i].readOnly;
			if(idArray.length > 0 && readOnlyCondition){
				openEditCard(layer);
			}else if(idArray.length = 0){
				openNewCard(layer);
			};
		});
	};
};

function openEditCard(layerHere) {
	setupBtnShowOrHideByClassName(layerHere,"editCard");
};

function cancelEditCard(layerHere) {
	const cardId = getSelectorById("cardId_"+layerHere).value;
	if(cardId != ""){
		showItOnUI(layerHere, cardId);
		const childrenLayer = getchildrenLayerBySwitchLayer(layerHere);
		if (childrenLayer != null) {
			const idArray = getEveryIdArrayOfLayer(childrenLayer);
			if(idArray.length == 0) {
				setupBtnShowOrHideByClassName(childrenLayer, "createFirstCard");
			};
		};
	} else {
		// 기존 카드가 있는 상태에서, 새 카드 만들기 후, 편집 취소를 할 때의 경우, 최신 lastest 카드를 보여주기
		// 기존 카드가 없는 경우에는 cancelEditCard 버튼이 나타나지 않음.
		const id = getLatestIdByLayer(layerHere);
		showItOnUI(layerHere, id);
	};
};

///// monitor manager

function monitorCardBlankOrDuplicates(layerHere) {
	const cardValue = getSelectorById(layerHere).value.trim();
	if (cardValue != "") {

		function getSameTextArray(layerHere2, cardValueHere) {

			const idArray = getEveryIdArrayOfLayer(layerHere2);

			const mappedIdArray = idArray.map( id => {
				const mappingObject = {"id":id};
				mappingObject[layerHere2] = objectById[id].contents[layerHere2];	
				return mappingObject;
				});
		
			const valueArray = [];
			for(let i = 0; i < mappedIdArray.length; i++) {
				valueArray.push(mappedIdArray[i][layerHere2]);
			};
		
			const filterSameTextArray = (query) => {
				return valueArray.find(value => query == value);
			}; //문법 형태의 이해

			// function filterSameTextArray(query) {
			// 	return valueArray.find(value => query == value);
			// }; //한번더 보기
		
			const sameTextArray = filterSameTextArray(cardValueHere);
		
			return sameTextArray;
		};

		const sameTextArray = getSameTextArray(layerHere, cardValue);
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

///// general supporter

function getSelectorById(id) {
	return document.getElementById(id);
};

function getTimeStamp() {
	const now = new Date();
	const nowString = now.toISOString();
	return nowString;
};

function getCardId(layerHere) {
	const result = getSelectorById("cardId_"+layerHere).value;
	return result;
};

function getLastestEditedId(keysArrayHere) {

	const mappedArray = keysArrayHere.map( id => {
		const c = objectById[id];
		return {"id": id, "editedDate": c.editedDate};
	}).sort(
		(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
	);

	if (mappedArray != null) {
		const latestEditedId = mappedArray[0];
		return latestEditedId.id;
	} else {
		return null;
	};

};

function copyAndPast() {
	//자주 쓰는 텍스트의 복붙을 위한 자료, 의미없는 함수
	switch(layerHere) {
		case "character" :
		case "direction" :
		case "roadmap" :
		case "actionPlan" :
		default :
	};
}

// 보관
function getLayerByEventListener() {
	const inputButtonSelector = document.getElementsByTagName("input");
	for (let i = 0; i < inputButtonSelector.length; i++) {
		inputButtonSelector[i].addEventListener("click", function (e) {
			eventListenerResult = "";
			returnClassName = e.target.parentNode.parentNode.className;
			eventListenerResult = returnClassName;
		});
	};
};

// id manager
// **id manager에서는 필요한 id값을 가져온다.
// **id 값은 대표적으로 parentsId, idTread로 해당한다.

function getParentsIdfromChildId(layerHere, childIdHere) {
	console.log("**=====getParentsIdfromChildId start=====");

	const everyIdArray = getEveryIdArrayOfLayer(layerHere);
	let parentsId = "";

	if(layerHere == "character") {
		parentsId = "bigPicture";
		return parentsId;
	} else {
		for(let i = 0; i < everyIdArray.length; i++) {
			if(everyIdArray[i] == childIdHere) {
				parentsId = objectById[childIdHere].parentsId;
				return parentsId;
			};
		};
		const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
		parentsId = getCardId(parentsLayer);
		return parentsId;
	};
};

function getIdThreadObjectById(inputIdhere) {
	
	const resultIsNewId = isNewId(inputIdhere);

	let returnObject = {};

	if (resultIsNewId) {
		returnObject["characterId"] = getCardId("character");
		returnObject["directionId"] = getCardId("direction");
		returnObject["roadmapId"] = getCardId("raodmap");
		returnObject["actionPlanId"] = getCardId("actionPlan");
		return returnObject;
	} else {
		const unitObject = objectById[inputIdhere];
		const inputLayer = unitObject.layer;

		function getIdBySwitchLayer(layerHere) {
			const returnObject2 = {};
			switch(layerHere){
				case "character" : 
					returnObject2["characterId"] = inputIdhere;
					returnObject2["directionId"] = "";
					returnObject2["roadmapId"] = "";
					returnObject2["actionPlanId"] = "";
					break;
				case "direction" :
					returnObject2["characterId"] = getParentsIdfromChildId("direction", inputIdhere);
					returnObject2["directionId"] = inputIdhere;
					returnObject2["roadmapId"] = "";
					returnObject2["actionPlanId"] = "";
					break;
				case "roadmap" :
					const directionId = getParentsIdfromChildId("roadmap", inputIdhere);
					const characterId = getParentsIdfromChildId("direction", directionId);
					returnObject2["characterId"] = characterId;
					returnObject2["directionId"] = directionId;
					returnObject2["roadmapId"] = inputIdhere;
					returnObject2["actionPlanId"] = "";
					break;
				case "actionPlan" :
					const roadmapId = getParentsIdfromChildId("actionPlan", inputIdhere);
					const direcitonId2 = getParentsIdfromChildId("roadmap", roadmapId);
					const characterId2 = getParentsIdfromChildId("direction", direcitonId2);
					returnObject2["characterId"] = characterId2;
					returnObject2["directionId"] = direcitonId2;
					returnObject2["roadmapId"] = roadmapId;
					returnObject2["actionPlanId"] = inputIdhere;
					break;
				default: null;	
			};
			return returnObject2;
		};
		
		returnObject = getIdBySwitchLayer(inputLayer);
		return returnObject;
	};
};

function getEveryIdArrayOfLayer(layerHere) {
	const everyIdArray = Object.keys(objectById);
	const everyIdArrayOfLayer = [];
	
	for(let i = 0; i < everyIdArray.length; i++) {
		if(objectById[everyIdArray[i]].layer == layerHere ) {
			everyIdArrayOfLayer.push(everyIdArray[i]);
		};
	};

	// character 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
	if(layerHere != "character") {
		const everyIdArrayOfLayerFromSameParents = [];
		for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
			const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
			if (objectById[everyIdArrayOfLayer[j]].parentsId == getCardId(parentsLayer)){
				everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
			};
		};
		return everyIdArrayOfLayerFromSameParents;
	};
	
	return everyIdArrayOfLayer;
};

function isNewId(idHere) {
	const everyIdArray = Object.keys(objectById);
	const checkpoint = everyIdArray.includes(idHere);
	if (checkpoint) {
		return false;
	} else {
		return true;
	};
};

function getLatestIdByLayer(layerHere) {
	const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere);
	if(eachIdArrayByLayer.length > 0){
		const latestId = getLastestEditedId(eachIdArrayByLayer);
		return latestId;
	} else {
		return null;
	};
};

// switch manager
// switch 기능이 필요할때 작용한다.

function getParentsLayerBySwitchLayer(layerHere) {
	switch(layerHere){
		case "character" : 
			return null;
		case "direction" :
			return "character";
		case "roadmap" :
			return "direction";
		case "actionPlan" :
			return "roadmap";
		default : return null; 
	};
};

function getchildrenLayerBySwitchLayer(layerHere) {
	switch(layerHere){
		case "character" : 
			return "direction";
		case "direction" :
			// return null;
			return "roadmap";
		case "roadmap" :
			// return null;
			return "actionPlan";
		case "actionPlan" :
			return null;
		// 리팩토링 후 개선하기
		default : return null; 
	};
};