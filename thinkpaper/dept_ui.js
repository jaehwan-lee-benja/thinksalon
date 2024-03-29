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
	updateList(layerHere);
	setLiColorByLi(layerHere);
};
function hideUI(idHere) {
	document.getElementById(idHere).style.display = "none";
};
function showUI(idHere) {
	document.getElementById(idHere).style.display = "initial";
};
function setupBtnShowOrHideByClassName(state, idHere) {
		
	hideUI("guideMessage");
	hideUI("openEditLi_btn");
	hideUI("cancelEditLi_btn");
	hideUI("saveEditedLi_btn");
	hideUI("saveNewLi_btn");
	hideUI("removeLi_btn");

	hideUI("startRowEdit_btn");
	hideUI("upRow_btn");
	hideUI("downRow_btn");
	hideUI("updateRowEdit_btn");
	hideUI("cancelRowEdit_btn");

	// 모드에 따라 설정하기
	switch(state){
		case undefined :
			showUI("guideMessage");
			const guideMessage = document.getElementById("guideMessage");
			guideMessage.innerHTML = "화면 블럭을 클릭/더블클릭하여 내용을 작성할 수 있습니다.";
			break;
		case "createFirstLi" :
			showUI("saveNewLi_btn");
			break;
		case "openNewLi" :
			showUI("saveNewLi_btn");
			showUI("cancelEditLi_btn");
			setupTextareaModeByClassName(idHere, "editing");
			break;
		case "readLi" :
			showUI("openEditLi_btn");
			showUI("removeLi_btn");
			showUI("startRowEdit_btn");
			break;
		case "editLi" :
			showUI("saveEditedLi_btn");
			showUI("cancelEditLi_btn");
			showUI("removeLi_btn");
			setupTextareaModeByClassName(idHere, "editing");
			break;
		case "upDownRow" :
			showUI("upRow_btn");
			showUI("downRow_btn");
			showUI("updateRowEdit_btn");
			showUI("cancelRowEdit_btn");
			setupColorRowEditMode(idHere, "editing");
			break;
		default:
			const state = null;
	};

	resizeTextarea();
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

function highLightBorder(idHere, color) {
	const element = document.getElementById(idHere).children[0];
	element.style.borderColor = color;
};

function showHideDiv(layerHere) {
	switch(layerHere+1) {
		case 0 :
			showUI("list_layer0");
			hideUI("list_layer1");
			hideUI("list_layer2");

			showUI("div_layer0");
			hideUI("div_layer1");
			hideUI("div_layer2");

			break;
		case 1 :
			showUI("list_layer1");
			hideUI("list_layer2");

			showUI("div_layer1");
			hideUI("div_layer2");
			break;
		case 2 :
			showUI("list_layer2");

			showUI("div_layer2");
			break;
		case 3 :
			break;
		default : null;
	};
};

function setLayerHighlight(layerHere, trueOrFalseHere) {
	const elementId = "layer_"+layerHere;
	const divSelector = document.getElementById(elementId);
	if(trueOrFalseHere) {
		divSelector.style.backgroundColor = COLOR_FOCUSED_YELLOW;
		// divSelector.style.backgroundColor = "'"+ COLOR_FOCUSED_YELLOW +"'" ;
		// divSelector.setAttribute("style", "background-color: "+COLOR_FOCUSED_YELLOW+";");
	} else {
		divSelector.style.backgroundColor ="";
	}
};