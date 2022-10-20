function showEmptyLi(idHere) {
	const liElement = document.getElementById(idHere);
	const textareaElement = liElement.children[0];
	textareaElement.value = "";
}
function showNewLi(idHere) {
	const liElement = document.getElementById(idHere);
	const textareaElement = liElement.children[0];
	textareaElement.value = "";
}
function showItOnUI(layerHere) {
	setupBtnShowOrHideByClassName(layerHere, "readLi");
	setLiColorByLi(layerHere);
};
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
		const latestIdOfEachLayer = getLatestIdByLayer(eachLayer);
		if(latestIdOfEachLayer != null) {
			showItOnUI(eachLayer, latestIdOfEachLayer);
		} else {
			showItIfNoLi(eachLayer);
		};
		updateList(eachLayer);
	});
};
function hideUI(idHere) {
	document.getElementById(idHere).style.display = "none";
};
function showUI(idHere) {
	document.getElementById(idHere).style.display = "initial";
};
function setupBtnShowOrHideByClassName(layerHere, state, idHere) {

	// 모드에 따라 설정하기
	switch(state){
		case "createFirstLi" :
			// emptyLiId(layerHere);
			showUI("saveNewLi_btn_layer"+layerHere);
			// setupTextareaModeByClassName(idHere, "editing");
			// startList(layerHere);
			updateList(layerHere);
			break;
		case "openNewLi" :
			showUI("saveNewLi_btn_layer"+layerHere);
			showUI("cancelEditLi_btn_layer"+layerHere);
			setupTextareaModeByClassName(idHere, "editing");
			break;
		case "readLi" :
			showUI("openEditLi_btn_layer"+layerHere);
			showUI("openNewLi_btn_layer"+layerHere);
			showUI("removeLi_btn_layer"+layerHere);
			// setupTextareaModeByClassName(idHere, "reading");
			break;
		case "editLi" :
			showUI("saveEditedLi_btn_layer"+layerHere);
			showUI("cancelEditLi_btn_layer"+layerHere);
			showUI("saveNewLi_btn_layer"+layerHere);
			showUI("removeLi_btn_layer"+layerHere);
			setupTextareaModeByClassName(idHere, "editing");
			editLi_followup(layerHere);
			break;
		case "inactiveLi" :
			// const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
			// const isReadingMode = document.getElementById(parentsLayer).readOnly;
			// if (isReadingMode) {
				// case "createFirstLi"의 변형 버전
				// emptyLiId(layerHere);
				// showUI("saveNewLi_btn_layer"+layerHere);
				// setupTextareaModeByClassName(idHere, "editing");
			// } else {
				// emptyLiId(layerHere);
				setupTextareaModeByClassName(idHere, "reading");
				document.getElementById("alert_txt_"+layerHere).innerHTML = "(상위 카드 작성 후, 작성 가능)";
			// };
			break;
		default:
			const state = null;
	};

	resizeTextarea();
};
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
		const childrenLayer = getChildrenLayerBySwitchLayer(eachLayer);
		if(childrenLayer != null){
			// layer3이 아닌 경우 - 221019 리뷰 필요
			const childrenIdArray = getEveryIdArrayOfLayer(childrenLayer);
			if(childrenIdArray.length == 0) {
				setupBtnShowOrHideByClassName(childrenLayer, "inactiveLi");
			} else {
				const childrenLiId = getLiId(childrenLayer);
				if(childrenLiId != "") {
					showItOnUI(childrenLayer, childrenLiId);
				} else {
					// 하위카드 '새 리스트 추가' + 상위 카드 '기존 카드 편집'시, 하위 카드의 liId가 없는 상태로, inactive 처리 필요
					setupBtnShowOrHideByClassName(childrenLayer, "inactiveLi");
				}
			};
		} else {
			// layer3인 경우 - 221019 리뷰 필요
			const idArray = getEveryIdArrayOfLayer(eachLayer);
			if(idArray.length == 0) {
				setupBtnShowOrHideByClassName(eachLayer, "inactiveLi");
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
			const parentsLayer = getParentsLayerBySwitchLayer(eachLayer);
			setupBtnShowOrHideByClassName(parentsLayer, "readLi");
			};
	});

};
function setupTextareaBorderColorByClass(layerHere, px, color) {
	setTimeout(()=>{
		const selectorTextareaOnLi = document.getElementsByClassName(layerHere);
		for (let i = 0; i < selectorTextareaOnLi.length; i++) {
			selectorTextareaOnLi[i].parentNode.style.boxShadow = "0 0 0 " + px + color + " inset";
		};
	},1);
};
function setupTextareaBorderColorByClass_li(idHere, px, color) {
	setTimeout(()=>{
		const selectorTextareaOnLi = document.querySelector("li[id='"+idHere+"']").children[0];
		for (let i = 0; i < selectorTextareaOnLi.length; i++) {
			selectorTextareaOnLi[i].parentNode.style.boxShadow = "0 0 0 " + px + color + " inset";
		};
	},1);
};
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
};
function showItIfNoLi(layerHere) {

	showEmptyLi(layerHere);

	if(layerHere == 0) {
		editLi_followup(layerHere);
		setupBtnShowOrHideByClassName(layerHere,"createFirstLi");
	} else {
		// layer1 카드부터는 부모 레이어가 0이 아닌 경우에만, showEmptyLi(=createFirstLi)를 진행한다.
		const parentLayer = getParentsLayerBySwitchLayer(layerHere);
		const parentsIdArrayLength = getEveryIdArrayOfLayer(parentLayer).length;

		if(parentsIdArrayLength != 0) {
			editLi_followup(layerHere);
			setupBtnShowOrHideByClassName(layerHere,"createFirstLi");
		} else {
			setupBtnShowOrHideByClassName(layerHere, "inactiveLi");
		};
	};
};
function highLightBorder(id, color) {
	return document.getElementById(id).style.borderColor = color;
};
function showHideDiv(layerHere) {
	switch(layerHere) {
		case null :

			showUI("list_layer0");
			hideUI("list_layer1");
			hideUI("list_layer2");

			showUI("editLi_layer0");
			hideUI("editLi_layer1");
			hideUI("editLi_layer2");

			break;
		case 0 :
			
			showUI("list_layer1");
			hideUI("list_layer2");

			showUI("editLi_layer1");
			hideUI("editLi_layer2");

			break;
		case 1 :

			showUI("list_layer2");

			showUI("editLi_layer2");

			break;
		case 2 :
			
			break;
		case 3 :

			break;
		default : null;
	};
};
function setLiColorByLi(layerHere) {
	const id = getLiId(layerHere); // first number li로 바꾸기
	const li = document.getElementsByTagName("li");
	for (let i = 0; i < li.length; i++) {
		const idOfLi = li[i].getAttribute("id");
		const layerOfLi = getLayerById(idOfLi);
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
};
function showHideMainImage(layerHere){

	hideUI("image01");
	// hideUI("image02");
	// hideUI("image03");
	// hideUI("image04");

	switch(layerHere) {
		case undefined :
			showUI("image01");
			break;
		case 0 :
			showUI("image02");
			break;
		case 1 :
			showUI("image03");
			break;
		case 2 :
			showUI("image04");
			break;
		case 3 :
			showUI("image05");
			break;
		default : null;
	};
};
function setMainImage() {
	const divSelector = document.getElementsByClassName("girdColumnForLayer");
	for (let i = 0; i < divSelector.length; i++) {
		divSelector[i].addEventListener("mouseover", function (e) {
			const layer = e.currentTarget.getAttribute("id").substr(4);
			showHideMainImage(layer);
		});
		divSelector[i].addEventListener("mouseout", function (e) {
			const layer = e.currentTarget.getAttribute("id").substr(4);
			showUI("image01");
			hideUI("image02");
			hideUI("image03");
			hideUI("image04");
		});
	};
};
function setLayerHighlight(layerHere, trueOrFalseHere) {
	const elementId = "layer_"+layerHere;
	const divSelector = document.getElementById(elementId);
	if(trueOrFalseHere) {
		divSelector.setAttribute("style", "background-color: "+COLOR_FOCUSED_YELLOW+";");
	} else {
		divSelector.setAttribute("style", "background-color: '';");
	}
};