const db = firebase.database();

// 상수 값 설정
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";

// 컬러 값 설정
const COLOR_LINE_GRAY = "#C8C8C8";
const COLOR_TXT_DARKGRAY = "#2A2B2A";
const COLOR_FOCUSED_YELLOW = "#F7DA7B";
const COLOR_SELECTED_GRAYGREEN = "#CFD4C9";
const COLORSET_ADDLI = 
	"color:"+COLOR_LINE_GRAY+";"+ 
	"background: '';"+
	"border: 1px solid "+COLOR_LINE_GRAY+";";

// 오브젝트
const userData = {};
let objectById = {};
let eventListenerResult = {};

// 시작
(function() {
	logIn();
})();

// 유저 정보
const userDept = {
	"showUserData":
	function showUserData(userDataHere) {
		const userName = userDataHere.name;
		const userEmail = userDataHere.email;
		document.getElementById("nameChecked").innerHTML = "방문자: " + userName;
		document.getElementById("emailChecked").innerHTML = "(" + userEmail + ")"+"		";
	}
};

// 서버 통신
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
				console.log("*keep* ===== .on is here =====");
		
				const v = snapshot.val();
				objectById = {};

				function requestReadIdAndObjectFromChildren(o){
					// console.log('*keep* requestReadIdAndObjectFromChildren >>',o)
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
				// console.log('*keep* objectById >>',objectById)
		
				const count = Object.keys(objectById).length; 
				const layers = [0, 1, 2];

				layers.forEach(eachLayer => {

					if(count > 0) {
							UIDept.showItOnUI(eachLayer);
					} else {
							UIDept.setupBtnShowOrHideByClassName(eachLayer, "createFirstLi");
					};

				});


			});
		}
};

const LtoSDept = {
	"request_followupEditedDate":
		function request_followupEditedDate(layerHere, packagedDataHere, cb) {

			let idThreadObjectKeysArray = [];
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

			switch(layerHere) {
				case 0 :
					// 해당 없음
					break;
				case 1 :
					idThreadObjectKeysArray = [0];
					break;
				case 2 :
					idThreadObjectKeysArray = [0, 1];
					break;
				default : null;
			};

			if (layerHere != 0) {
				const lastCount = idThreadObjectKeysArray.length;
				if(lastCount != 0) {
					let counter = 0;
					idThreadObjectKeysArray.forEach(eachLayer => {
						const editedDateForParents = {"editedDate": packagedDataHere.editedDate};
						const eachId = idThreadObject[eachLayer+"Id"];
						const switchedRef = switchDept.getRefBySwitchLayer(eachLayer, idThreadObject);
						switchedRef.child(eachId)
						.update(editedDateForParents, (e) => {
							console.log("*keep* followupEditedDate completed = ", e);
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


// UI 다루기
const UIDept = {
	"showEmptyLi": 
		function showEmptyLi(layerHere) {
			document.getElementById(layerHere).value = "";
		},
	// "showEmptyLi": 
	// 	function showEmptyLi(idHere) {
	// 		const liElement = document.getElementById(idHere);
	// 		const textareaElement = liElement.children[0];
	// 		textareaElement.value = "";
	// 	},
	"showItOnUI": 
		function showItOnUI(layerHere) {
			UIDept.setupBtnShowOrHideByClassName(layerHere, "readLi");
			UIDept.setLiColorByLi(layerHere);
		},
	"showItOnUI_followup":
		function showItOnUI_followup(layerHere) {
			let idThreadObjectKeysArray = [];
			switch(layerHere) {
				case 0 :
					idThreadObjectKeysArray = [1, 2, 3];
					break;
				case 1 :
					idThreadObjectKeysArray = [2, 3];
					break;
				case 2 :
					idThreadObjectKeysArray = [3];
					break;
				default : null;
			};
			idThreadObjectKeysArray.forEach(eachLayer => {
				const latestIdOfEachLayer = idDept.getLatestIdByLayer(eachLayer);
				if(latestIdOfEachLayer != null) {
					UIDept.showItOnUI(eachLayer, latestIdOfEachLayer);
				} else {
					UIDept.showItIfNoLi(eachLayer);
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
		function setupBtnShowOrHideByClassName(layerHere, state, idHere) {

			// 모든 버튼 지우기
			// UIDept.hideUI("openEditLi_btn_layer"+layerHere);
			// UIDept.hideUI("cancelEditLi_btn_layer"+layerHere);
			// UIDept.hideUI("saveEditedLi_btn_layer"+layerHere);
			// UIDept.hideUI("saveNewLi_btn_layer"+layerHere);
			// UIDept.hideUI("removeLi_btn_layer"+layerHere);
			// UIDept.hideUI("openNewLi_btn_layer"+layerHere);

			// 모드에 따라 설정하기
			switch(state){
				case "createFirstLi" :
					// idDept.emptyLiId(layerHere);
					UIDept.showUI("saveNewLi_btn_layer"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					// listDept.startList(layerHere);
					listDept.updateList(layerHere);
					break;
				case "openNewLi" :
					UIDept.showUI("saveNewLi_btn_layer"+layerHere);
					UIDept.showUI("cancelEditLi_btn_layer"+layerHere);
					UIDept.setupTextareaModeByClassName_li(idHere, "editing");
					break;
				case "readLi" :
					UIDept.showUI("openEditLi_btn_layer"+layerHere);
					UIDept.showUI("openNewLi_btn_layer"+layerHere);
					UIDept.showUI("removeLi_btn_layer"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "reading");
					break;
				case "editLi" :
					UIDept.showUI("saveEditedLi_btn_layer"+layerHere);
					UIDept.showUI("cancelEditLi_btn_layer"+layerHere);
					UIDept.showUI("saveNewLi_btn_layer"+layerHere);
					UIDept.showUI("removeLi_btn_layer"+layerHere);
					UIDept.setupTextareaModeByClassName_li(idHere, "editing");
					UIDept.editLi_followup(layerHere);
					break;
				case "inactiveLi" :
					// const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					// const isReadingMode = document.getElementById(parentsLayer).readOnly;
					// if (isReadingMode) {
						// case "createFirstLi"의 변형 버전
						// idDept.emptyLiId(layerHere);
						// UIDept.showUI("saveNewLi_btn_layer"+layerHere);
						// UIDept.setupTextareaModeByClassName(layerHere, "editing");
					// } else {
						// idDept.emptyLiId(layerHere);
						UIDept.setupTextareaModeByClassName(layerHere, "reading");
						document.getElementById("alert_txt_"+layerHere).innerHTML = "(상위 카드 작성 후, 작성 가능)";
					// };
					break;
				default:
					const state = null;
			};

			UIDept.resizeTextarea();
		},
	"setupTextareaModeByClassName":
		function setupTextareaModeByClassName(layerHere, liMode) {
			const elementByClass = document.getElementsByClassName(layerHere);
			if (liMode == "editing") {
				elementByClass[0].style.color = COLOR_FOCUSED_YELLOW;
				elementByClass[0].style.borderColor = COLOR_FOCUSED_YELLOW;
				UIDept.setupTextareaBorderColorByClass(layerHere, "2px", COLOR_FOCUSED_YELLOW);
				// UIDept.setupTextareaReadOnly(layerHere, false);
			} else {
				elementByClass[0].style.color = COLOR_TXT_DARKGRAY;
				elementByClass[0].style.borderColor = COLOR_TXT_DARKGRAY;
				UIDept.setupTextareaBorderColorByClass(layerHere, "1px", COLOR_LINE_GRAY);
				// UIDept.setupTextareaReadOnly(layerHere, true);
			};
		},
	"setupTextareaModeByClassName_li":
		function setupTextareaModeByClassName_li(idHere, liMode) {
			const liElement = document.getElementById(idHere);
			const textareaElement = liElement.children[0];
			if (liMode == "editing") {
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
			console.log("textareaElement = ", textareaElement);
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
	"editLi_followup":
		function editLi_followup(layerHere) {

			// 카드 갯수가 0이면, inactive / 있으면, read로 읽기

			let layerArrayForDownSide = [];

			switch(layerHere) {
				case 0 :
					layerArrayForDownSide = [0, 1, 2, 3];
					break;
				case 1 :
					layerArrayForDownSide = [1, 2, 3];
					break;
				case 2 :
					layerArrayForDownSide = [2, 3];
					break;
				default : null;
			};

			layerArrayForDownSide.forEach(eachLayer => {
				const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(eachLayer);
				if(childrenLayer != null){
					// layer3이 아닌 경우 - 221019 리뷰 필요
					const childrenIdArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
					if(childrenIdArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName(childrenLayer, "inactiveLi");
					} else {
						const childrenLiId = idDept.getLiId(childrenLayer);
						if(childrenLiId != "") {
							UIDept.showItOnUI(childrenLayer, childrenLiId);
						} else {
							// 하위카드 '새 리스트 추가' + 상위 카드 '기존 카드 편집'시, 하위 카드의 liId가 없는 상태로, inactive 처리 필요
							UIDept.setupBtnShowOrHideByClassName(childrenLayer, "inactiveLi");
						}
					};
				} else {
					// layer3인 경우 - 221019 리뷰 필요
					const idArray = idDept.getEveryIdArrayOfLayer(eachLayer);
					if(idArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName(eachLayer, "inactiveLi");
					};
				};
			});


			let layerArrayForUpSide = [];

			switch(layerHere) {
				case 0 :
					layerArrayForUpSide = [0];
					break;
				case 1 :
					layerArrayForUpSide = [0, 1];
					break;
				case 2 :
					layerArrayForUpSide = [0, 1, 2];
					break;
				default : null;
			};

			layerArrayForUpSide.forEach(eachLayer => {
				// layer0인 경우를 제외하고, 상위 카드를 reading으로 바꾸기
				if (eachLayer != 0) {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(eachLayer);
					UIDept.setupBtnShowOrHideByClassName(parentsLayer, "readLi");
					};
			});

		},
	"setupTextareaBorderColorByClass":
		function setupTextareaBorderColorByClass(layerHere, px, color) {
			setTimeout(()=>{
				const selectorTextareaOnLi = document.getElementsByClassName(layerHere);
				for (let i = 0; i < selectorTextareaOnLi.length; i++) {
					selectorTextareaOnLi[i].parentNode.style.boxShadow = "0 0 0 " + px + color + " inset";
				};
			},1);
		},
	"setupTextareaBorderColorByClass_li":
		function setupTextareaBorderColorByClass_li(idHere, px, color) {
			setTimeout(()=>{
				const selectorTextareaOnLi = document.querySelector("li[id='"+idHere+"']").children[0];
				for (let i = 0; i < selectorTextareaOnLi.length; i++) {
					selectorTextareaOnLi[i].parentNode.style.boxShadow = "0 0 0 " + px + color + " inset";
				};
			},1);
		},
	"resizeTextarea":
		function resizeTextarea() {
			// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
			// [질문] editLi가 늘어난 사이즈에서, 다른 li를 눌러서 내용을 볼 때, 크기가 큰 경우, 줄어들지 않음
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
	"showItIfNoLi":
		function showItIfNoLi(layerHere) {
		
			UIDept.showEmptyLi(layerHere);
		
			if(layerHere == 0) {
				UIDept.editLi_followup(layerHere);
				UIDept.setupBtnShowOrHideByClassName(layerHere,"createFirstLi");
			} else {
				// layer1 카드부터는 부모 레이어가 0이 아닌 경우에만, showEmptyLi(=createFirstLi)를 진행한다.
				const parentLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				const parentsIdArrayLength = idDept.getEveryIdArrayOfLayer(parentLayer).length;
		
				if(parentsIdArrayLength != 0) {
					UIDept.editLi_followup(layerHere);
					UIDept.setupBtnShowOrHideByClassName(layerHere,"createFirstLi");
				} else {
					UIDept.setupBtnShowOrHideByClassName(layerHere, "inactiveLi");
				};
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

					UIDept.showUI("editLi_layer0");
					UIDept.hideUI("editLi_layer1");
					UIDept.hideUI("editLi_layer2");

					break;
				case 0 :
					
					UIDept.showUI("list_layer1");
					UIDept.hideUI("list_layer2");

					UIDept.showUI("editLi_layer1");
					UIDept.hideUI("editLi_layer2");

					break;
				case 1 :

					UIDept.showUI("list_layer2");

					UIDept.showUI("editLi_layer2");

					break;
				case 2 :
					
					break;
				case 3 :

					break;
				default : null;
			};
		},
	"setLiColorByLi":
		function setLiColorByLi(layerHere) {
			const id = idDept.getLiId(layerHere); // first number li로 바꾸기
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
			// UIDept.hideUI("image02");
			// UIDept.hideUI("image03");
			// UIDept.hideUI("image04");

			switch(layerHere) {
				case undefined :
					UIDept.showUI("image01");
					break;
				case 0 :
					UIDept.showUI("image02");
					break;
				case 1 :
					UIDept.showUI("image03");
					break;
				case 2 :
					UIDept.showUI("image04");
					break;
				case 3 :
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

// li 다루기
const listDept = { 
	"startList":
		function startList(layerHere) {
			const listId = "list_layer"+layerHere;
			const list = document.getElementById(listId);
			const liElements = list.getElementsByTagName("LI");
		},
	"updateList": 
		function updateList(layerHere) {
			const listId = "list_layer"+layerHere;
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
			listDept.addOpenAddLiLi(layerHere);
			listDept.clickLi(layerHere);
		},
	"addOpenAddLiLi":
		function addOpenAddLiLi(layerHere) {
			const listId = "list_layer"+layerHere;
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
			const li = document.getElementById("list_layer"+layerHere).children;
			
			const liArray = [];
			for (let i = 0; i < li.length; i++) {
				liArray.push(li[i]);
			};

			liArray.forEach((v)=>{

				// v.addEventListener("click",(e)=>{

				// 	let id = ""
				// 	const targetTagName = e.target.tagName;

				// 	if(targetTagName == "LI") {
				// 		id = e.target.getAttribute("id");
				// 	} else {
				// 		id = e.target.parentNode.getAttribute("id");	
				// 	};

				// 	const addLiId = "addLiBtn_"+layerHere;
					
				// 	const liElement = document.getElementById(id);
				// 	const textareaElement = liElement.children[0];
				// 	const isEditing = textareaElement.getAttribute("readOnly");
					
				// 	if(!isEditing) {

				// 		if(id != addLiId) {

				// 			UIDept.showItOnUI(layerHere, id);
				// 			UIDept.showItOnUI_followup(layerHere);
				// 			UIDept.showHideDiv(layerHere);
	
				// 		} else {
	
				// 			newLiDept.openNewLi(layerHere);
				// 			const parentLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				// 			UIDept.showHideDiv(parentLayer);
				// 			UIDept.setLiColorByLi(layerHere);
	
				// 		};
	
				// 		UIDept.resizeTextarea();

				// 	};

				// });

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
			const li = document.getElementById("list_layer"+layerHere).children;
			
			const liArray = [];
			for (let i = 0; i < li.length; i++) {
				liArray.push(li[i]);
			};

			const last = liArray[liArray.length - 1];
			
			return last;
		}
};

// li 다루기(2)
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
			// const monitorResult = monitorDept.monitorLiBlankOrDuplicates(layerHere);
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
			
			if (layerHere == 0) {
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
			// UIDept.showEmptyLi(idHere);
			UIDept.setupBtnShowOrHideByClassName(layerHere, "openNewLi", idHere);
			// newLiDept.openNewLi_followup(layerHere);
		},
	"openNewLi_followup":
		function openNewLi_followup(layerHere) {			
			switch(layerHere) {
				case 0 :
					newLiDept.openNewLi_followupBySwitchLayer(1, 2, 3);
					break;
				case 1 :
					newLiDept.openNewLi_followupBySwitchLayer(2, 3);
					break;
				case 2 :
					newLiDept.openNewLi_followupBySwitchLayer(3);
					break;
				default : null;
			};
		},
	"openNewLi_followupBySwitchLayer":
		function openNewLi_followupBySwitchLayer(layer1, layer2) {
			const idThreadObjectKeysArray = [layer1, layer2];
			idThreadObjectKeysArray.forEach(eachLayer => {
				if (eachLayer != undefined) {
					UIDept.showEmptyLi(eachLayer);
					UIDept.setupBtnShowOrHideByClassName(eachLayer, "inactiveLi");
					UIDept.hideUI("list_"+eachLayer);
				};
			});
		},
};

// li 업데이트
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
				if (layerHere == 0) {
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
				console.log("*keep* update completed = ", e);
			});
		},
	"openEditLi":
		function openEditLi(layerHere) {
			const id = idDept.getLiId(layerHere);
			UIDept.setupBtnShowOrHideByClassName(layerHere, "editLi", id);
			// UIDept.editLi_followup(layerHere);
		},
	"cancelEditLi":
		function cancelEditLi(layerHere) {
			const liId = idDept.getLiId(layerHere);
			if(liId != ""){
				UIDept.showItOnUI(layerHere, liId);
				const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(layerHere);
				if (childrenLayer != null) {
					const idArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
					if(idArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName(childrenLayer, "createFirstLi");
					};
				};
			} else {
				// 기존 카드가 있는 상태에서, 새 카드 만들기 후, 편집 취소를 할 때의 경우, 최신 lastest 카드를 보여주기
				// 기존 카드가 없는 경우에는 cancelEditLi 버튼이 나타나지 않음.
				const id = idDept.getLatestIdByLayer(layerHere);
				UIDept.showItOnUI(layerHere, id);
			};
		}
};

// li 지우기
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
		
			if(layerHere == 0 && idArrayLength == 1) {
				// layer0레이어에서 remove진행시, 
				// firebase의 bigPicture 자체가 사라져, 로딩 로직에서 버그가 남.
				// 그래서 예외 처리
				const emptyData = {children: ""};
				const switchedRefForEmptyData = switchedRef.parent;
				switchedRefForEmptyData.set(emptyData, (e) => {
					console.log("*keep* remove completed A = ", e);
					alert("삭제되었습니다.");
					});
			} else {
				switchedRef.child(inputId)
				.remove((e) => {
					LtoSDept.request_followupEditedDate(layerHere, packagedData, function(){
						alert("삭제되었습니다.");
					});
					console.log("*keep* remove completed B = ", e);
					});
			};
		}
};

// 모니터링하기
const monitorDept = {
	"monitorLiBlankOrDuplicates":
		function monitorLiBlankOrDuplicates(layerHere) {
			const liValue = document.getElementById(layerHere).value.trim();
			if (liValue != "") {		
				const sameTextArray = monitorDept.getSameTextArray(layerHere, liValue);
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
			const liValue = document.getElementById(layerHere).value.trim();
			if (liValue != "") {		
				const sameTextArray = monitorDept.getSameTextArray(layerHere, liValue);
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
		function getSameTextArray(layerHere2, liValueHere) {
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
			const sameTextArray = monitorDept.filterSameTextArray(liValueHere, valueArray);
			return sameTextArray;
		},
	"filterSameTextArray":
		function filterSameTextArray(query, valueArray) {
			return valueArray.find(value => query == value);
		}
};

// 기타 지원하기
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

// id 정리하기
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
			
			if(childLayerHere != 0 && !isNewIdResult) {
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
			if(layerHere != 0) {
				const everyIdArrayOfLayerFromSameParents = [];
				for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					const parentsId = idDept.getLiId(parentsLayer);
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
			if(layerHere != 0) {
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
				case 0 :
					// 해당 없음
					break;
				case 1 :
					idThreadObject.layer0Id = packagedDataHere.parentsId;
					break;
				case 2 :
					const layer1Id = packagedDataHere.parentsId;
					idThreadObject.layer1Id = layer1Id;
					idThreadObject.layer0Id = idDept.getParentsIdfromChildId(1, layer1Id);
					break;
				case 3 :
					const layer2Id = packagedDataHere.parentsId;
					const layer1Id2 = idDept.getParentsIdfromChildId(2, layer2Id);
					idThreadObject.layer2Id = layer2Id;
					idThreadObject.layer1Id = layer1Id2;
					idThreadObject.layer0Id = idDept.getParentsIdfromChildId(1, layer1Id2);
					break;
				default : null;
			};
			return idThreadObject;
		},
	"emptyLiId" :
		function emptyLiId(layerHere) {
			const liElementId = "liId_layer"+layerHere;
			document.getElementById(liElementId).value = "";
			const liElementParentsId = "liParentsId_"+layerHere;
			document.getElementById(liElementParentsId).value = "";
		},
	// "getLiId":
	// 	function getLiId(layerHere) {
	// 		const liElementId = "liId_layer"+layerHere;
	// 		const result = document.getElementById(liElementId).value;
	// 		return result;
	// 	},
	"getLiId":
		function getLiId(layerHere) {

			const listElement = document.getElementById("list_layer"+layerHere);
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

// switch 다루기
const switchDept = {
	"getRefBySwitchLayer":
		function getRefBySwitchLayer(layerHere, idThreadObjectHere) {
			
			const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
			const parentsId = idThreadObjectHere[parentsLayer+"Id"];

			const userRef = db.ref("users").child(userData.uid);
			const bigPictureRef = userRef.child("bigPicture");
			const layer0Ref = bigPictureRef.child("children");

			switch(layerHere){
				case 0 :
					return layer0Ref;
				case 1 : 
					const layer0Id = parentsId;

					const layer1Ref = layer0Ref.child(layer0Id).child("children");
					return layer1Ref;

				case 2 : 
					const layer1Id = parentsId;
					const layer0Id2 = idDept.getParentsIdfromChildId(1, layer1Id);

					const layer1Ref2 = layer0Ref.child(layer0Id2).child("children");
					const layer2Ref = layer1Ref2.child(layer1Id).child("children");
					return layer2Ref;

				default: 
					return null;
			};
		},
	"getIdThreadObjectById":
		function getIdThreadObjectById(layerHere, inputIdhere) {
			const returnObject = {};
			switch(layerHere){
				case 0 : 
					returnObject["layer0Id"] = inputIdhere;
					returnObject["layer1Id"] = "";
					returnObject["layer2Id"] = "";
					break;
				case 1 :
					returnObject["layer0Id"] = idDept.getParentsIdfromChildId(1, inputIdhere);
					returnObject["layer1Id"] = inputIdhere;
					returnObject["layer2Id"] = "";
					break;
				case 2 :
					const layer1Id = idDept.getParentsIdfromChildId(2, inputIdhere);
					const layer0Id = idDept.getParentsIdfromChildId(1, layer1Id);
					returnObject["layer0Id"] = layer0Id;
					returnObject["layer1Id"] = layer1Id;
					returnObject["layer2Id"] = inputIdhere;
					break;
				default: null;	
			};
			return returnObject;
		},
	"getParentsLayerBySwitchLayer":
		function getParentsLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case 0 : 
					return null;
				case 1 :
					return 0;
				case 2 :
					return 1;
				default : return null; 
			};
		},
	"getChildrenLayerBySwitchLayer":
		function getChildrenLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case 0 : 
					return 1;
				case 1 :
					return 2;
				case 2 :
					return 3;
				default : return null; 
			};
		}
};