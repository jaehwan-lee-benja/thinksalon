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
	setupBtnShowOrHideByClassName("readLi");
	setLiColorByLi(layerHere);
};
function hideUI(idHere) {
	document.getElementById(idHere).style.display = "none";
};
function showUI(idHere) {
	document.getElementById(idHere).style.display = "initial";
};
function setupBtnShowOrHideByClassName(state, idHere) {
		
	hideUI("openEditLi_btn");
	hideUI("cancelEditLi_btn");
	hideUI("saveEditedLi_btn");
	hideUI("saveNewLi_btn");
	hideUI("removeLi_btn");

	// 모드에 따라 설정하기
	switch(state){
		case "createFirstLi" :
			showUI("saveNewLi_btn");
			// setupTextareaModeByClassName(idHere, "editing");
			break;
		case "openNewLi" :
			showUI("saveNewLi_btn");
			showUI("cancelEditLi_btn");
			setupTextareaModeByClassName(idHere, "editing");
			break;
		case "readLi" :
			showUI("openEditLi_btn");
			showUI("removeLi_btn");
			// setupTextareaModeByClassName(idHere, "reading");
			break;
		case "editLi" :
			showUI("saveEditedLi_btn");
			showUI("cancelEditLi_btn");
			showUI("removeLi_btn");
			setupTextareaModeByClassName(idHere, "editing");
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
	console.log("idHere = ", idHere);
	const element = document.getElementById(idHere).children[0];
	console.log("element = ", element);
	element.style.borderColor = color;
};

function showHideDiv(layerHere) {
	switch(layerHere+1) {
		case 0 :
			showUI("list_layer0");
			hideUI("list_layer1");
			hideUI("list_layer2");
			break;
		case 1 :
			showUI("list_layer1");
			hideUI("list_layer2");
			break;
		case 2 :
			showUI("list_layer2");
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