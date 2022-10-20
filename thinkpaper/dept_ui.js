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