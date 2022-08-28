const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
const COLOR_LINE_GRAY = "#C8C8C8";
const COLOR_TXT_DARKGRAY = "#2A2B2A";
const COLOR_FOCUSED_YELLOW = "#F7DA7B";
const COLOR_SELECTED_GRAYGREEN = "#CFD4C9";

const COLORSET_ADDLI = 
	"color:"+COLOR_LINE_GRAY+";"+ 
	"background: '';"+
	"border: 1px solid "+COLOR_LINE_GRAY+";";

const userData = {};
let objectById = {};
let eventListenerResult = {};

(function() {
	logIn();
})();

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			StoLDept.requestReadUserData(user);
			StoLDept.requestReadBigPicture(user);
			UIDept.showHideDiv(null);
			UIDept.showHideMainImage();
			UIDept.setMainImage();
			// supportDept.getLayerByEventListenerByButton();
		} else {
			window.location.replace("login.html");
		};
	});
};

function logOut() {
	firebase.auth().signOut();
};

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

			const userRef = db.ref("users")
							.child(user.uid)
							.child("bigPicture");
			
			userRef.on("value", (snapshot) => {
				console.log("**===== .on is here =====");
		
				const v = snapshot.val();
				objectById = {};

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
		
				UIDept.showItOnUI();

			});
		}
};

const LtoSDept = {
	"request_followupEditedDate":
		function request_followupEditedDate(layerHere, packagedDataHere, cb) {

			let idThreadObjectKeysArray = [];
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

			switch(layerHere) {
				case "layer0" :
					// 해당 없음
					break;
				case "layer1" :
					idThreadObjectKeysArray = ["layer0"];
					break;
				case "layer2" :
					idThreadObjectKeysArray = ["layer0", "layer1"];
					break;
				case "layer3" :
					idThreadObjectKeysArray = ["layer0", "layer1", "layer2"];
					break;
				default : null;
			};

			if (layerHere != "layer0") {
				const lastCount = idThreadObjectKeysArray.length;
				if(lastCount != 0) {
					let counter = 0;
					idThreadObjectKeysArray.forEach(eachLayer => {
						const editedDateForParents = {"editedDate": packagedDataHere.editedDate};
						const eachId = idThreadObject[eachLayer+"Id"];
						const switchedRef = switchDept.getRefBySwitchLayer(eachLayer, idThreadObject);
						switchedRef.child(eachId)
						.update(editedDateForParents, (e) => {
							console.log("**followupEditedDate completed = ", e);
							if(++counter == lastCount) {
								cb();
							}
						});
					});
				};
			} else {
				cb();
			};
		}
};
	
const userDept = {
	"showUserData":
	function showUserData(userDataHere) {
		const userName = userDataHere.name;
		const userEmail = userDataHere.email;
		document.getElementById("nameChecked").innerHTML = "방문자: " + userName;
		document.getElementById("emailChecked").innerHTML = "(" + userEmail + ")"+"		";
	}
};

const UIDept = {
	"showEmptyCard": 
		function showEmptyCard(layerHere) {
			document.getElementById(layerHere).value = "";
		},
	"showEmptyLi": 
		function showEmptyLi(idHere) {
			const liElement = document.getElementById(idHere);
			const textareaElement = liElement.children[0];
			textareaElement.value = "";
		},
	"showItOnUI": 
		function showItOnUI(layerHere) {
			UIDept.setupBtnShowOrHideByClassName_li(layerHere,"readCard");
			UIDept.setLiColorByCard(layerHere);
		},
	"showItOnUI_followup":
		function showItOnUI_followup(layerHere) {
			let idThreadObjectKeysArray = [];
			switch(layerHere) {
				case "layer0" :
					idThreadObjectKeysArray = ["layer1", "layer2", "layer3"];
					break;
				case "layer1" :
					idThreadObjectKeysArray = ["layer2", "layer3"];
					break;
				case "layer2" :
					idThreadObjectKeysArray = ["layer3"];
					break;
				case "layer3" :
					// 해당없음
					break;
				default : null;
			};
			idThreadObjectKeysArray.forEach(eachLayer => {
				const latestIdOfEachLayer = idDept.getLatestIdByLayer(eachLayer);
				if(latestIdOfEachLayer != null) {
					UIDept.showItOnUI(eachLayer, latestIdOfEachLayer);
				} else {
					UIDept.showItIfNoCard(eachLayer);
				};
				listDept.updateList(eachLayer);
			});
		},
	"hideUI":
		function hideUI(id) {
			document.getElementById(id).style.display = "none";
		},
	"showUI":
		function showUI(id) {
			document.getElementById(id).style.display = "initial";
		},
	"setupBtnShowOrHideByClassName":
		function setupBtnShowOrHideByClassName(layerHere, state) {

			// 카드 안내 글씨 지우기
			if(layerHere != "layer0") {
				const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				const parentsCardValue = document.getElementById(parentsLayer).value;
				const alertTextElement = document.getElementById("alert_txt_"+layerHere);
				if(parentsCardValue != "" && alertTextElement.innerText != "") {
					alertTextElement.innerHTML = "";
				};
			};

			// 모든 버튼 지우기
			UIDept.hideUI("openEditCard_btn_"+layerHere);
			UIDept.hideUI("cancelEditCard_btn_"+layerHere);
			UIDept.hideUI("saveEditedCard_btn_"+layerHere);
			UIDept.hideUI("saveNewCard_btn_"+layerHere);
			UIDept.hideUI("removeCard_btn_"+layerHere);
			UIDept.hideUI("openNewCard_btn_"+layerHere);

			// 모드에 따라 설정하기
			switch(state){
				case "createFirstCard" :
					idDept.emptyCardId(layerHere);
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					break;
				case "openNewCard" :
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.showUI("cancelEditCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					break;
				case "readCard" :
					UIDept.showUI("openEditCard_btn_"+layerHere);
					UIDept.showUI("openNewCard_btn_"+layerHere);
					UIDept.showUI("removeCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "reading");
					break;
				case "editCard" :
					UIDept.showUI("saveEditedCard_btn_"+layerHere);
					UIDept.showUI("cancelEditCard_btn_"+layerHere);
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.showUI("removeCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					UIDept.editCard_followup(layerHere);
					break;
				case "inactiveCard" :
						idDept.emptyCardId(layerHere);
						UIDept.setupTextareaModeByClassName(layerHere, "reading");
						document.getElementById("alert_txt_"+layerHere).innerHTML = "(상위 카드 작성 후, 작성 가능)";
					break;
				default:
					const state = null;
			};

			const eachCardValue = document.getElementById(layerHere).value;
			if(eachCardValue != "") {
				UIDept.hideUI("guideMessage");
			} else {
				UIDept.showUI("guideMessage");
			};
			UIDept.resizeTextarea();
		},
	"setupBtnShowOrHideByClassName_li":
		function setupBtnShowOrHideByClassName_li(layerHere, idHere, state) {

			// 카드 안내 글씨 지우기
			if(layerHere != "layer0") {
				const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				const parentsCardValue = document.getElementById(parentsLayer).value;
				const alertTextElement = document.getElementById("alert_txt_"+layerHere);
				if(parentsCardValue != "" && alertTextElement.innerText != "") {
					alertTextElement.innerHTML = "";
				};
			};

			// 모든 버튼 지우기
			UIDept.hideUI("openEditCard_btn_"+layerHere);
			UIDept.hideUI("cancelEditCard_btn_"+layerHere);
			UIDept.hideUI("saveEditedCard_btn_"+layerHere);
			UIDept.hideUI("saveNewCard_btn_"+layerHere);
			UIDept.hideUI("removeCard_btn_"+layerHere);
			UIDept.hideUI("openNewCard_btn_"+layerHere);

			// 모드에 따라 설정하기
			switch(state){
				case "createFirstCard" :
					idDept.emptyCardId(layerHere);
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					break;
				case "openNewCard" :
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.showUI("cancelEditCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName_li(idHere, "editing");
					break;
				case "readCard" :
					UIDept.showUI("openEditCard_btn_"+layerHere);
					UIDept.showUI("openNewCard_btn_"+layerHere);
					UIDept.showUI("removeCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "reading");
					break;
				case "editCard" :
					UIDept.showUI("saveEditedCard_btn_"+layerHere);
					UIDept.showUI("cancelEditCard_btn_"+layerHere);
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.showUI("removeCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName_li(idHere, "editing");
					UIDept.editCard_followup(layerHere);
					break;
				case "inactiveCard" :
					// const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					// const isReadingMode = document.getElementById(parentsLayer).readOnly;
					// if (isReadingMode) {
						// case "createFirstCard"의 변형 버전
						// idDept.emptyCardId(layerHere);
						// UIDept.showUI("saveNewCard_btn_"+layerHere);
						// UIDept.setupTextareaModeByClassName(layerHere, "editing");
					// } else {
						idDept.emptyCardId(layerHere);
						UIDept.setupTextareaModeByClassName(layerHere, "reading");
						document.getElementById("alert_txt_"+layerHere).innerHTML = "(상위 카드 작성 후, 작성 가능)";
					// };
					break;
				default:
					const state = null;
			};

			const eachCardValue = document.getElementById(layerHere).value;
			if(eachCardValue != "") {
				UIDept.hideUI("guideMessage");
			} else {
				UIDept.showUI("guideMessage");
			};
			UIDept.resizeTextarea();
		},
	"setupTextareaModeByClassName":
		function setupTextareaModeByClassName(layerHere, cardMode) {
			if (cardMode == "editing") {
				document.getElementsByClassName(layerHere)[0].style.color = COLOR_FOCUSED_YELLOW;
				document.getElementsByClassName(layerHere)[0].style.borderColor = COLOR_FOCUSED_YELLOW;
				UIDept.setupTextareaBorderColorByClass(layerHere, "2px", COLOR_FOCUSED_YELLOW);
				UIDept.setupTextareaReadOnly(layerHere, false);
			} else {
				document.getElementsByClassName(layerHere)[0].style.color = COLOR_TXT_DARKGRAY;
				document.getElementsByClassName(layerHere)[0].style.borderColor = COLOR_TXT_DARKGRAY;
				UIDept.setupTextareaBorderColorByClass(layerHere, "1px", COLOR_LINE_GRAY);
				UIDept.setupTextareaReadOnly(layerHere, true);
			};
		},
	"setupTextareaModeByClassName_li":
		function setupTextareaModeByClassName_li(idHere, cardMode) {
			const liElement = document.getElementById(idHere);
			const textareaElement = liElement.children[0];
			if (cardMode == "editing") {
				textareaElement.style.color = COLOR_FOCUSED_YELLOW;
				textareaElement.style.borderColor = COLOR_FOCUSED_YELLOW;
				UIDept.setupTextareaBorderColorByClass_li(idHere, "2px", COLOR_FOCUSED_YELLOW);
				UIDept.setupTextareaReadOnly_li(idHere, false);
			} else {
				textareaElement.style.color = COLOR_TXT_DARKGRAY;
				textareaElement.style.borderColor = COLOR_TXT_DARKGRAY;
				UIDept.setupTextareaBorderColorByClass_li(idHere, "1px", COLOR_LINE_GRAY);
				UIDept.setupTextareaReadOnly_li(idHere, true);
			};
		},
	"setupTextareaReadOnly":
		function setupTextareaReadOnly(layerHere, trueOrFalse){
			const textareaElement = document.getElementById(layerHere);
			textareaElement.readOnly = trueOrFalse;
			if(trueOrFalse == false) {
				setTimeout(()=>{
				textareaElement.style.backgroundColor = "#FFF";
				textareaElement.style.border = "solid 2px" + COLOR_SELECTED_GRAYGREEN;
				},1);
			}
		},
	"setupTextareaReadOnly_li":
		function setupTextareaReadOnly_li(idHere, trueOrFalse){
			const liElement = document.getElementById(idHere);
			const textareaElement = liElement.children[0];
			textareaElement.readOnly = trueOrFalse;
			if(trueOrFalse == false) {
				setTimeout(()=>{
				textareaElement.style.backgroundColor = "#FFF";
				textareaElement.style.border = "solid 2px" + COLOR_SELECTED_GRAYGREEN;
				},1);
			}
		},
	"editCard_followup":
		function editCard_followup(layerHere) {

			// 카드 갯수가 0이면, inactive / 있으면, read로 읽기

			let layerArrayForDownSide = [];

			switch(layerHere) {
				case "layer0" :
					layerArrayForDownSide = ["layer0", "layer1", "layer2", "layer3"];
					break;
				case "layer1" :
					layerArrayForDownSide = ["layer1", "layer2", "layer3"];
					break;
				case "layer2" :
					layerArrayForDownSide = ["layer2", "layer3"];
					break;
				case "layer3" :
					layerArrayForDownSide = ["layer3"];
					break;
				default : null;
			};

			layerArrayForDownSide.forEach(eachLayer => {
				const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(eachLayer);
				if(childrenLayer != null){
					// layer3이 아닌 경우
					const childrenIdArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
					if(childrenIdArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName_li(childrenLayer, "inactiveCard");
					} else {
						const childrenCardId = idDept.getCardId(childrenLayer);
						if(childrenCardId != "") {
							UIDept.showItOnUI(childrenLayer, childrenCardId);
						} else {
							// 하위카드 '새 리스트 추가' + 상위 카드 '기존 카드 편집'시, 하위 카드의 cardId가 없는 상태로, inactive 처리 필요
							UIDept.setupBtnShowOrHideByClassName_li(childrenLayer, "inactiveCard");
						}
					};
				} else {
					// layer3인 경우
					const idArray = idDept.getEveryIdArrayOfLayer(eachLayer);
					if(idArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName_li(eachLayer, "inactiveCard");
					};
				};
			});


			let layerArrayForUpSide = [];

			switch(layerHere) {
				case "layer0" :
					layerArrayForUpSide = ["layer0"];
					break;
				case "layer1" :
					layerArrayForUpSide = ["layer0", "layer1"];
					break;
				case "layer2" :
					layerArrayForUpSide = ["layer0", "layer1", "layer2"];
					break;
				case "layer3" :
					layerArrayForUpSide = ["layer0", "layer1", "layer2", "layer3"];
					break;
				default : null;
			};

			layerArrayForUpSide.forEach(eachLayer => {
				// layer0인 경우를 제외하고, 상위 카드를 reading으로 바꾸기
				if (eachLayer != "layer0") {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(eachLayer);
					UIDept.setupBtnShowOrHideByClassName_li(parentsLayer, "readCard");
					};
			});

		},
	"setupTextareaBorderColorByClass":
		function setupTextareaBorderColorByClass(layerHere, px, color) {
			setTimeout(()=>{
				const selectorTextareaOnCard = document.getElementsByClassName(layerHere);
				for (let i = 0; i < selectorTextareaOnCard.length; i++) {
					selectorTextareaOnCard[i].parentNode.style.boxShadow = "0 0 0 " + px + color + " inset";
				};
			},1);
		},
	"setupTextareaBorderColorByClass_li":
		function setupTextareaBorderColorByClass_li(idHere, px, color) {
			setTimeout(()=>{
				const selectorTextareaOnCard = document.querySelector("li[id='"+idHere+"']").children[0];
				for (let i = 0; i < selectorTextareaOnCard.length; i++) {
					selectorTextareaOnCard[i].parentNode.style.boxShadow = "0 0 0 " + px + color + " inset";
				};
			},1);
		},
	"resizeTextarea":
		function resizeTextarea() {
			// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
			// [질문] editCard가 늘어난 사이즈에서, 다른 li를 눌러서 내용을 볼 때, 크기가 큰 경우, 줄어들지 않음
			const tx = document.getElementsByTagName("textarea");
			for (let i = 0; i < tx.length; i++) {
				// tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px; overflow-y:auto;");
				tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;");
				tx[i].addEventListener("input", OnInput, false);
			};
			function OnInput() {
				this.style.height = "auto";
				this.style.height = (this.scrollHeight) + "px";
			};
		},
	"showItIfNoCard":
		function showItIfNoCard(layerHere) {
		
			UIDept.showEmptyCard(layerHere);
		
			if(layerHere == "layer0") {
				UIDept.editCard_followup(layerHere);
				UIDept.setupBtnShowOrHideByClassName_li(layerHere,"createFirstCard");
			} else {
				// layer1 카드부터는 부모 레이어가 0이 아닌 경우에만, showEmptyCard(=createFirstCard)를 진행한다.
				const parentLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				const parentsIdArrayLength = idDept.getEveryIdArrayOfLayer(parentLayer).length;
		
				if(parentsIdArrayLength != 0) {
					UIDept.editCard_followup(layerHere);
					UIDept.setupBtnShowOrHideByClassName_li(layerHere,"createFirstCard");
				} else {
					UIDept.setupBtnShowOrHideByClassName_li(layerHere, "inactiveCard");
				};
			};
		},
	"showGuideMessage_forFirstCard":
		function showGuideMessage_forFirstCard() {
			const guideMessage = document.getElementById("guideMessage");
			const guideMessageValue = document.getElementById("guideMessage").innerText;
			if (guideMessageValue == "") {
				guideMessage.style.color = COLOR_FOCUSED_YELLOW;
				guideMessage.innerHTML = "'파란색 네모칸에 내용을 작성해보세요~!'"
			};
		},
	"highLightBorder":
		function highLightBorder(id, color) {
			return document.getElementById(id).style.borderColor = color;
		},
	"showHideDiv": 
		function showHideDiv(layerHere) {
			switch(layerHere) {
				case null :

					UIDept.showUI("list_layer0");
					UIDept.hideUI("list_layer1");
					UIDept.hideUI("list_layer2");
					UIDept.hideUI("list_layer3");

					UIDept.showUI("editCard_layer0");
					UIDept.hideUI("editCard_layer1");
					UIDept.hideUI("editCard_layer2");
					UIDept.hideUI("editCard_layer3");

					break;
				case "layer0" :
					
					UIDept.showUI("list_layer1");
					UIDept.hideUI("list_layer2");
					UIDept.hideUI("list_layer3");

					UIDept.showUI("editCard_layer1");
					UIDept.hideUI("editCard_layer2");
					UIDept.hideUI("editCard_layer3");

					break;
				case "layer1" :

					UIDept.showUI("list_layer2");
					UIDept.hideUI("list_layer3");

					UIDept.showUI("editCard_layer2");
					UIDept.hideUI("editCard_layer3");

					break;
				case "layer2" :
					
					UIDept.showUI("list_layer3");

					UIDept.showUI("editCard_layer3");

					break;
				case "layer3" :

					break;
				default : null;
			};
		},
	"setLiColorByCard":
		function setLiColorByCard(layerHere) {
			const id = idDept.getCardId(layerHere); // first number li로 바꾸기
			const li = document.getElementsByTagName("li");
			for (let i = 0; i < li.length; i++) {
				const idOfLi = li[i].getAttribute("id");
				const layerOfLi = idDept.getLayerById(idOfLi);
				if(layerHere == layerOfLi) {
					li[i].style.background = "";
					if(id == idOfLi) {
						li[i].style.background = COLOR_SELECTED_GRAYGREEN;
						li[i].setAttribute("pointed", "Y");
					} else {
						li[i].style.background = "";
						li[i].setAttribute("pointed", "N");
					};
				};
			};
		},
	"showHideMainImage":
		function showHideMainImage(layerHere){

			UIDept.hideUI("image01");
			UIDept.hideUI("image02");
			UIDept.hideUI("image03");
			UIDept.hideUI("image04");
			UIDept.hideUI("image05");

			switch(layerHere) {
				case undefined :
					UIDept.showUI("image01");
					break;
				case "layer0" :
					UIDept.showUI("image02");
					break;
				case "layer1" :
					UIDept.showUI("image03");
					break;
				case "layer2" :
					UIDept.showUI("image04");
					break;
				case "layer3" :
					UIDept.showUI("image05");
					break;
				default : null;
			};
		},
	"setMainImage":
		function setMainImage() {
			const divSelector = document.getElementsByClassName("girdColumnForLayer");
			for (let i = 0; i < divSelector.length; i++) {
				divSelector[i].addEventListener("mouseover", function (e) {
					const layer = e.currentTarget.getAttribute("id").substr(4);
					UIDept.showHideMainImage(layer);
				});
				divSelector[i].addEventListener("mouseout", function (e) {
					const layer = e.currentTarget.getAttribute("id").substr(4);
					UIDept.showUI("image01");
					UIDept.hideUI("image02");
					UIDept.hideUI("image03");
					UIDept.hideUI("image04");
					UIDept.hideUI("image05");
				});
			};
		},
	"setLayerHighlight":
		function setLayerHighlight(layerHere, trueOrFalseHere) {
			const elementId = "layer_"+layerHere;
			const divSelector = document.getElementById(elementId);
			if(trueOrFalseHere) {
				divSelector.setAttribute("style", "background-color: "+COLOR_FOCUSED_YELLOW+";");
			} else {
				divSelector.setAttribute("style", "background-color: '';");
			}
		}
};

const listDept = { 
	"updateList": 
		function updateList(layerHere) {
			const listId = "list_"+layerHere;
			const list = document.getElementById(listId);
			const liElements = list.getElementsByTagName("LI");
			// list 초기화하기
			for(let i=liElements.length-1; i>=0; i-- ){
				liElements[i].remove();
			};
			// Array 만들기
			const mappedArray = listDept.getMappedObject_idEditedDateContents(layerHere);
			// list 순서 잡기(최근 편집 순서)
			const sortedArray = listDept.sortingArray(mappedArray);
			// li 생성하기
			for (let i = 0; i < sortedArray.length; i++) {
				const liValue = sortedArray[i][layerHere];
				const listItem = document.createElement('li');
				listItem.innerHTML = "<textarea readonly>"+ liValue +"</textarea>";
				list.appendChild(listItem);
				const liId = sortedArray[i].id;
				listItem.setAttribute("id", liId);
				listItem.setAttribute("layer", layerHere);
			};
			listDept.addOpenAddCardLi(layerHere);
			listDept.clickLi(layerHere);
		},
	"addOpenAddCardLi":
		function addOpenAddCardLi(layerHere) {
			const listId = "list_"+layerHere;
			const list = document.getElementById(listId);
			const liValue_addLi = "(+ 새 리스트 추가하기)";
			const listItem = document.createElement('li');
			listItem.innerHTML = "<textarea readonly>"+ liValue_addLi +"</textarea>";
			list.appendChild(listItem);
			const liId_addLi = "addLiBtn_"+layerHere;
			listItem.setAttribute("id", liId_addLi);
			listItem.setAttribute("layer", layerHere);
			listItem.setAttribute("style", COLORSET_ADDLI);
		},
	"getMappedObject_idEditedDateContents":
		function getMappedObject_idEditedDateContents(layerHere) {		
			const returnArray = [];
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			eachIdArrayByLayer.forEach(EachId => {
				let returnObject = {};
				returnObject["id"] = objectById[EachId].id;
				returnObject["editedDate"] = objectById[EachId].editedDate;
				returnObject[layerHere] = objectById[EachId].contents["txt"];
				returnArray.push(returnObject);
			});
			return returnArray;
		},
	"sortingArray":
		function sortingArray(mappedArrayHere){
			mappedArrayHere.sort(
				(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
			);
			return mappedArrayHere;
		},
	"clickLi":
		function clickLi(layerHere) {
			// 참고: https://daisy-mansion.tistory.com/46
			const li = document.getElementById("list_"+layerHere).children;
			
			const liArray = [];
			for (let i = 0; i < li.length; i++) {
				liArray.push(li[i]);
			};

			liArray.forEach((v)=>{

				v.addEventListener("click",(e)=>{

					let id = ""
					const targetTagName = e.target.tagName;

					if(targetTagName == "LI") {
						id = e.target.getAttribute("id");
					} else {
						id = e.target.parentNode.getAttribute("id");	
					};

					const addLiId = "addLiBtn_"+layerHere;
					
					const liElement = document.getElementById(id);
					const textareaElement = liElement.children[0];
					const isEditing = textareaElement.getAttribute("readOnly");
					
					if(!isEditing) {

						if(id != addLiId) {

							UIDept.showItOnUI(layerHere, id);
							UIDept.showItOnUI_followup(layerHere);
							UIDept.showHideDiv(layerHere);
	
						} else {
	
							newCardDept.openNewCard(layerHere);
							const parentLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
							UIDept.showHideDiv(parentLayer);
							UIDept.setLiColorByCard(layerHere);
	
						};
	
						UIDept.resizeTextarea();

					};

				});

				v.addEventListener("dblclick",(e)=>{
					
					const idByLi = e.target.getAttribute("id");
					const idByTextarea = e.target.parentNode.getAttribute("id");					

					let id = ""
					if(idByLi != null) {
						id = idByLi;
					} else {
						id = idByTextarea;
					};

					const liElement = document.getElementById(id);
					const textareaElement = liElement.children[0];
					const layer = liElement.getAttribute("layer");
					const addLiId = "addLiBtn_"+layer;
					const isEditing = textareaElement.getAttribute("readOnly");

					if(isEditing != null && id != addLiId){
						updateLiDept.openEditLi(layer);
					} else if(isEditing != null && id == addLiId){
						newLiDept.openNewLi(layer, id);
					};
				});
			});
		},
	"getLastLi":
		function getLastLi(layerHere) {
			const li = document.getElementById("list_"+layerHere).children;
			
			const liArray = [];
			for (let i = 0; i < li.length; i++) {
				liArray.push(li[i]);
			};

			const last = liArray[liArray.length - 1];
			
			return last;
		}
};

const newLiDept = {
	"saveNewLi":
		function saveNewLi(layerHere) {
			const packagedData = newLiDept.packageNewLi(layerHere);
			if (packagedData != null) {
				newLiDept.requestSetLi(layerHere, packagedData);
				// UIDept.showItOnUI_followup(layerHere);
			};
		},
	"packageNewLi":
		function packageNewLi(layerHere) {
			// const monitorResult = monitorDept.monitorCardBlankOrDuplicates(layerHere);
			// if (monitorResult) {
				const catchedData = newLiDept.catchContentsDataBySwitchLayer(layerHere);
				const idNew = newLiDept.getUuidv4();
				catchedData["id"] = idNew;
				catchedData["children"] = "";
				catchedData["createdDate"] = supportDept.getTimeStamp();
				catchedData["editedDate"] = supportDept.getTimeStamp();
				catchedData["main"] = "";
				catchedData["layer"] = layerHere;
				return catchedData;
			// };
		},
	"catchContentsDataBySwitchLayer":
		function catchContentsDataBySwitchLayer(layerHere) {
			
			const catchContentsData = {};
			catchContentsData["contents"] = {};
			
			if (layerHere == "layer0") {
				catchContentsData["parentsId"] = "";
			} else {
				const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				catchContentsData["parentsId"] = idDept.getLiId(parentsLayer);
			};

			const contents = catchContentsData["contents"];
			const lastLiContents = listDept.getLastLi(layerHere).children[0].value;
			contents["txt"] = lastLiContents.trim();

			return catchContentsData;
		},
	"getUuidv4":
		function getUuidv4() {
			return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},
	"requestSetLi": 
		function requestSetLi(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);

			switchedRef.child(inputId)
			.set(packagedDataHere)
			.then((e) => {
				LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
					alert("저장되었습니다.");
				});
			});

		},
	"openNewLi":
		function openNewLi(layerHere, idHere) {
			UIDept.showEmptyLi(idHere);
			UIDept.setupBtnShowOrHideByClassName_li(layerHere, idHere, "openNewCard");
			// newLiDept.openNewLi_followup(layerHere);
		},
	"openNewLi_followup":
		function openNewLi_followup(layerHere) {			
			switch(layerHere) {
				case "layer0" :
					newLiDept.openNewCard_followupBySwitchLayer("layer1", "layer2", "layer3");
					break;
				case "layer1" :
					newLiDept.openNewCard_followupBySwitchLayer("layer2", "layer3");
					break;
				case "layer2" :
					newLiDept.openNewCard_followupBySwitchLayer("layer3");
					break;
				case "layer3" :
					// 해당없음
					break;
				default : null;
			};
		},
	"openNewCard_followupBySwitchLayer":
		function openNewCard_followupBySwitchLayer(layer1, layer2, layer3, layer4) {
			const idThreadObjectKeysArray = [layer1, layer2, layer3, layer4];
			idThreadObjectKeysArray.forEach(eachLayer => {
				if (eachLayer != undefined) {
					UIDept.showEmptyCard(eachLayer);
					UIDept.setupBtnShowOrHideByClassName_li(eachLayer, "inactiveCard");
					UIDept.hideUI("list_"+eachLayer);
				};
			});
		},
};

const updateLiDept = {
	"saveEditedLi":
		function saveEditedLi(layerHere) {
			const packagedData = updateLiDept.packageEditedLi(layerHere);
			if (packagedData != null) {
				updateLiDept.requestUpdateLi(layerHere, packagedData);
			};
		},
	"packageEditedLi":
		function packageEditedLi(layerHere) {	

			// CRUD 후 진행하기
			// const resultIsChanged = updateLiDept.monitorIfLiChanged(layerHere);
			// const monitorResult = updateLiDept.getMoniterResult(layerHere, resultIsChanged);
			
			// if (monitorResult) {
				const packagedData = {};
				const id = idDept.getLiId(layerHere);
				packagedData["id"] = id;
				if (layerHere == "layer0") {
					packagedData["parentsId"] = "";
				} else {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					packagedData["parentsId"] = idDept.getLiId(parentsLayer);
				}
				packagedData["editedDate"] = supportDept.getTimeStamp();
				packagedData["contents"] = {};
		
				const contents = packagedData["contents"];
				const pointedLi = document.getElementById(id);
				const pointedTextarea = pointedLi.children[0];
				contents["txt"] = pointedTextarea.value.trim();

				return packagedData;
			// };
		},
	"monitorIfLiChanged":
		function monitorIfLiChanged(layerHere) {
			
			// 현재 UI에 띄워진 값 포착하기
			const id = idDept.getLiId(layerHere);
			const value = document.getElementById(layerHere).value.trim();
			const object = {"id": id, [layerHere]: value};

			// 로컬 데이터에 있는 값 포착하기
			const arrayWithId = updateLiDept.getMappedObject_idContents(layerHere);
		
			// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
			for(let i = 0; i < arrayWithId.length; i++) {
				if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
					return false;
				};
			};
			return true;
		},
	"getMappedObject_idContents":
		function getMappedObject_idContents(layerHere) {		
			const returnArray = [];
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			eachIdArrayByLayer.forEach(EachId => {
				const returnObject = {};
				returnObject["id"] = objectById[EachId].id;
				returnObject[layerHere] = objectById[EachId].contents["txt"];
				returnArray.push(returnObject);
			});
			return returnArray;
		},
	"getMoniterResult":
		function getMoniterResult(layerHere, isChangedHere) {
			if (isChangedHere) {
				const monitorResultInFunction = monitorDept.monitorLiBlankOrDuplicates(layerHere);
				return monitorResultInFunction;
			} else {
				return true;
			};
		},
	"requestUpdateLi":
		function requestUpdateLi(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);
			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);
			switchedRef.child(inputId)
			.update(packagedDataHere, (e) => {
				LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
					alert("수정되었습니다.");
				});
				console.log("**update completed = ", e);
			});
		},
	"openEditLi":
		function openEditLi(layerHere) {
			const id = idDept.getLiId(layerHere);
			UIDept.setupBtnShowOrHideByClassName_li(layerHere, id, "editCard");
			// UIDept.editCard_followup(layerHere);
		},
	"cancelEditLi":
		function cancelEditLi(layerHere) {
			const cardId = idDept.getCardId(layerHere);
			if(cardId != ""){
				UIDept.showItOnUI(layerHere, cardId);
				const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(layerHere);
				if (childrenLayer != null) {
					const idArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
					if(idArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName_li(childrenLayer, "createFirstCard");
					};
				};
			} else {
				// 기존 카드가 있는 상태에서, 새 카드 만들기 후, 편집 취소를 할 때의 경우, 최신 lastest 카드를 보여주기
				// 기존 카드가 없는 경우에는 cancelEditCard 버튼이 나타나지 않음.
				const id = idDept.getLatestIdByLayer(layerHere);
				UIDept.showItOnUI(layerHere, id);
			};
		}
};

const removeLiDept = {
	"removeLi":
		function removeLi(layerHere) {
			const removeId = idDept.getLiId(layerHere);
			if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
				removeLiDept.requestRemoveLi(layerHere, removeId);
			};
		},
	"requestRemoveLi":
		function requestRemoveLi(layerHere, idHere) {

			const inputId = idHere;
			const packagedData = objectById[inputId];
			packagedData.editedDate = supportDept.getTimeStamp();

			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedData);
		
			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);
			const idArrayLength = idDept.getEveryIdArrayOfLayer(layerHere).length;
		
			if(layerHere == "layer0" && idArrayLength == 1) {
				// layer0레이어에서 remove진행시, 
				// firebase의 bigPicture 자체가 사라져, 로딩 로직에서 버그가 남.
				// 그래서 예외 처리
				const emptyData = {children: ""};
				const switchedRefForEmptyData = switchedRef.parent;
				switchedRefForEmptyData.set(emptyData, (e) => {
					console.log("**remove completed A = ", e);
					alert("삭제되었습니다.");
					});
			} else {
				switchedRef.child(inputId)
				.remove((e) => {
					LtoSDept.request_followupEditedDate(layerHere, packagedData, function(){
						alert("삭제되었습니다.");
					});
					console.log("**remove completed B = ", e);
					});
			};
		}
};

const monitorDept = {
	"monitorCardBlankOrDuplicates":
		function monitorCardBlankOrDuplicates(layerHere) {
			const cardValue = document.getElementById(layerHere).value.trim();
			if (cardValue != "") {		
				const sameTextArray = monitorDept.getSameTextArray(layerHere, cardValue);
				if (sameTextArray == undefined) {
					return true;
				} else {
					UIDept.highLightBorder(layerHere, "red");
					alert("중복된 카드가 있습니다. 내용을 수정해주시기 바랍니다.");
				};
			} else {
				UIDept.highLightBorder(layerHere, "red");
				alert("카드가 비어있습니다. 내용을 입력해주시기 바랍니다.");
			};
			return false;
		},
	"monitorLiBlankOrDuplicates":
		function monitorLiBlankOrDuplicates(layerHere) {
			const cardValue = document.getElementById(layerHere).value.trim();
			if (cardValue != "") {		
				const sameTextArray = monitorDept.getSameTextArray(layerHere, cardValue);
				if (sameTextArray == undefined) {
					return true;
				} else {
					UIDept.highLightBorder(layerHere, "red");
					alert("중복된 카드가 있습니다. 내용을 수정해주시기 바랍니다.");
				};
			} else {
				UIDept.highLightBorder(layerHere, "red");
				alert("카드가 비어있습니다. 내용을 입력해주시기 바랍니다.");
			};
			return false;
		},
	"getSameTextArray":
		function getSameTextArray(layerHere2, cardValueHere) {
			const idArray = idDept.getEveryIdArrayOfLayer(layerHere2);
			const mappedIdArray = idArray.map( id => {
				const mappingObject = {"id":id};
				mappingObject[layerHere2] = objectById[id].contents["txt"];	
				return mappingObject;
				});
			const valueArray = [];
			for(let i = 0; i < mappedIdArray.length; i++) {
				valueArray.push(mappedIdArray[i][layerHere2]);
			};
			const sameTextArray = monitorDept.filterSameTextArray(cardValueHere, valueArray);
			return sameTextArray;
		},
	"filterSameTextArray":
		function filterSameTextArray(query, valueArray) {
			return valueArray.find(value => query == value);
		}
};

const supportDept = {
	"getTimeStamp":
		function getTimeStamp() {
			const now = new Date();
			const nowString = now.toISOString();
			return nowString;
		},
	"getLayerByEventListenerByButton":
		function getLayerByEventListenerByButton() {
			eventListenerResult = {};
			const inputButtonSelector = document.getElementsByTagName("input");
			for (let i = 0; i < inputButtonSelector.length; i++) {
				inputButtonSelector[i].addEventListener("click", function (e) {

					const returnLayer = e.target
						.parentNode
						.parentNode
						.className;
					const returnId = e.target
						.parentNode
						.parentNode
						.firstElementChild
						.value;

					eventListenerResult = switchDept.getIdThreadObjectById(returnLayer, returnId);

				});
			};
		},
};

const idDept = {
	// **idDept에서는 필요한 id값을 가져온다.
	// **id 값은 대표적으로 parentsId, idTread로 해당한다.
	"getLatestIdByLayer": 
		function getLatestIdByLayer(layerHere) {
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			if(eachIdArrayByLayer.length > 0){
				const latestId = idDept.getLastestEditedId(eachIdArrayByLayer);
				return latestId;
			} else {
				return null;
			};
		},
	"getLastestEditedId":
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
		},
	"getParentsIdfromChildId":
		function getParentsIdfromChildId(childLayerHere, childIdHere) {

			const isNewIdResult = idDept.isNewId(childIdHere);
			
			if(childLayerHere != "layer0" && !isNewIdResult) {
				const everyIdArray = Object.keys(objectById);
				for(let i = 0; i < everyIdArray.length; i++) {
					if(everyIdArray[i] == childIdHere) {
						return objectById[childIdHere].parentsId;
					};
				};
			} else {
				return null;
			};

		},
	"getEveryIdArrayOfLayer":
		function getEveryIdArrayOfLayer(layerHere) {
			const everyIdArray = Object.keys(objectById);
			const everyIdArrayOfLayer = [];
			for(let i = 0; i < everyIdArray.length; i++) {
				if(objectById[everyIdArray[i]].layer == layerHere ) {
					everyIdArrayOfLayer.push(everyIdArray[i]);
				};
			};
			// layer0 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
			if(layerHere != "layer0") {
				const everyIdArrayOfLayerFromSameParents = [];
				for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					const parentsId = idDept.getCardId(parentsLayer);
					if (objectById[everyIdArrayOfLayer[j]].parentsId == parentsId){
						everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
					};
				};
				return everyIdArrayOfLayerFromSameParents;
			};
			return everyIdArrayOfLayer;
		},
	"getEveryIdArrayOfLayerById":
		function getEveryIdArrayOfLayerById(layerHere, idHere) {
			const everyIdArray = Object.keys(objectById);
			const everyIdArrayOfLayer = [];
			for(let i = 0; i < everyIdArray.length; i++) {
				if(objectById[everyIdArray[i]].layer == layerHere ) {
					everyIdArrayOfLayer.push(everyIdArray[i]);
				};
			};
			// layer0 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
			if(layerHere != "layer0") {
				const everyIdArrayOfLayerFromSameParents = [];
				for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
					if (objectById[everyIdArrayOfLayer[j]].parentsId == idDept.getParentsIdfromChildId(layerHere, idHere)){
						everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
					};
				};
				return everyIdArrayOfLayerFromSameParents;
			};
			return everyIdArrayOfLayer;
		},
	"isNewId":
		function isNewId(idHere) {
			const everyIdArray = Object.keys(objectById);
			const checkpoint = everyIdArray.includes(idHere);
			if (checkpoint) {
				return false;
			} else {
				return true;
			};
		},
	"getIdThreadObjectByPackagedData":
		function getIdThreadObjectByPackagedData(layerHere, packagedDataHere) {
			const idThreadObject = {};

			switch(layerHere) {
				case "layer0" :
					// 해당 없음
					break;
				case "layer1" :
					idThreadObject.layer0Id = packagedDataHere.parentsId;
					break;
				case "layer2" :
					const layer1Id = packagedDataHere.parentsId;
					idThreadObject.layer1Id = layer1Id;
					idThreadObject.layer0Id = idDept.getParentsIdfromChildId("layer1", layer1Id);
					break;
				case "layer3" :
					const layer2Id = packagedDataHere.parentsId;
					const layer1Id2 = idDept.getParentsIdfromChildId("layer2", layer2Id);
					idThreadObject.layer2Id = layer2Id;
					idThreadObject.layer1Id = layer1Id2;
					idThreadObject.layer0Id = idDept.getParentsIdfromChildId("layer1", layer1Id2);
					break;
				default : null;
			};
			return idThreadObject;
		},
	"emptyCardId" :
		function emptyCardId(layerHere) {
			const cardElementId = "cardId_"+layerHere;
			document.getElementById(cardElementId).value = "";
			const cardElementParentsId = "cardParentsId_"+layerHere;
			document.getElementById(cardElementParentsId).value = "";
		},
	"getCardId":
		function getCardId(layerHere) {
			const cardElementId = "cardId_"+layerHere;
			const result = document.getElementById(cardElementId).value;
			return result;
		},
	"getLiId":
		function getLiId(layerHere) {

			const listElement = document.getElementById("list_"+layerHere);
			const li = listElement.children;
			
			for (let i = 0; i < li.length; i++) {
				const isPointed = li[i].getAttribute("pointed");
				if (isPointed == "Y") {
					const valueOfLi = li[i].id;
					return valueOfLi;
				};			
			};

		},
	"getLayerById":
		function getLayerById(idHere) {
			const everyIdArray = Object.keys(objectById);
			let layer = "";
			everyIdArray.forEach( eachId => {
				if (eachId == idHere) {
					layer = objectById[idHere].layer;
				};
			})
			return layer;
		}
};

const switchDept = {
	"getRefBySwitchLayer":
		function getRefBySwitchLayer(layerHere, idThreadObjectHere) {
			
			const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
			const parentsId = idThreadObjectHere[parentsLayer+"Id"];

			const userRef = db.ref("users").child(userData.uid);
			const bigPictureRef = userRef.child("bigPicture");
			const layer0Ref = bigPictureRef.child("children");

			switch(layerHere){
				case "layer0" :
					return layer0Ref;
				case "layer1" : 
					const layer0Id = parentsId;

					const layer1Ref = layer0Ref.child(layer0Id).child("children");
					return layer1Ref;

				case "layer2" : 
					const layer1Id = parentsId;
					const layer0Id2 = idDept.getParentsIdfromChildId("layer1", layer1Id);

					const layer1Ref2 = layer0Ref.child(layer0Id2).child("children");
					const layer2Ref = layer1Ref2.child(layer1Id).child("children");
					return layer2Ref;

				case "layer3" : 
					const layer2Id = parentsId;
					const layer1Id2 = idDept.getParentsIdfromChildId("layer2", layer2Id);
					const layer0Id3 = idDept.getParentsIdfromChildId("layer1", layer1Id2);

					const layer1Ref3 = layer0Ref.child(layer0Id3).child("children");
					const layer2Ref2 = layer1Ref3.child(layer1Id2).child("children");
					const layer3Ref = layer2Ref2.child(layer2Id).child("children");
					return layer3Ref;

				default: 
					return null;
			};
		},
	"getIdThreadObjectById":
		function getIdThreadObjectById(layerHere, inputIdhere) {
			const returnObject = {};
			switch(layerHere){
				case "layer0" : 
					returnObject["layer0Id"] = inputIdhere;
					returnObject["layer1Id"] = "";
					returnObject["layer2Id"] = "";
					returnObject["layer3Id"] = "";
					break;
				case "layer1" :
					returnObject["layer0Id"] = idDept.getParentsIdfromChildId("layer1", inputIdhere);
					returnObject["layer1Id"] = inputIdhere;
					returnObject["layer2Id"] = "";
					returnObject["layer3Id"] = "";
					break;
				case "layer2" :
					const layer1Id = idDept.getParentsIdfromChildId("layer2", inputIdhere);
					const layer0Id = idDept.getParentsIdfromChildId("layer1", layer1Id);
					returnObject["layer0Id"] = layer0Id;
					returnObject["layer1Id"] = layer1Id;
					returnObject["layer2Id"] = inputIdhere;
					returnObject["layer3Id"] = "";
					break;
				case "layer3" :
					const layer2Id = idDept.getParentsIdfromChildId("layer3", inputIdhere);
					const direcitonId2 = idDept.getParentsIdfromChildId("layer2", layer2Id);
					const layer0Id2 = idDept.getParentsIdfromChildId("layer1", direcitonId2);
					returnObject["layer0Id"] = layer0Id2;
					returnObject["layer1Id"] = direcitonId2;
					returnObject["layer2Id"] = layer2Id;
					returnObject["layer3Id"] = inputIdhere;
					break;
				default: null;	
			};
			return returnObject;
		},
	"getParentsLayerBySwitchLayer":
		function getParentsLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case "layer0" : 
					return null;
				case "layer1" :
					return "layer0";
				case "layer2" :
					return "layer1";
				case "layer3" :
					return "layer2";
				default : return null; 
			};
		},
	"getChildrenLayerBySwitchLayer":
		function getChildrenLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case "layer0" : 
					return "layer1";
				case "layer1" :
					return "layer2";
				case "layer2" :
					return "layer3";
				case "layer3" :
					return null;
				default : return null; 
			};
		}
};