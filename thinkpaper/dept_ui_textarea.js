function setupTextareaModeByClassName(layerHere, liMode) {
	const layer = "layer"+layerHere;
	const elementByClass = document.getElementsByClassName(layer);
	if (liMode == "editing") {
		elementByClass[0].style.color = COLOR_FOCUSED_YELLOW;
		elementByClass[0].style.borderColor = COLOR_FOCUSED_YELLOW;
		setupTextareaBorderColorByClass(layer, "2px", COLOR_FOCUSED_YELLOW);
		// setupTextareaReadOnly(layer, false);
	} else {
		elementByClass[0].style.color = COLOR_TXT_DARKGRAY;
		elementByClass[0].style.borderColor = COLOR_TXT_DARKGRAY;
		setupTextareaBorderColorByClass(layer, "1px", COLOR_LINE_GRAY);
		// setupTextareaReadOnly(layer, true);
	};
};
function setupTextareaModeByClassName_li(idHere, liMode) {
	const liElement = document.getElementById(idHere);
	const textareaElement = liElement.children[0];
	if (liMode == "editing") {
		textareaElement.style.color = COLOR_FOCUSED_YELLOW;
		textareaElement.style.borderColor = COLOR_FOCUSED_YELLOW;
		setupTextareaBorderColorByClass_li(idHere, "2px", COLOR_FOCUSED_YELLOW);
		setupTextareaReadOnly_li(idHere, false);
	} else {
		textareaElement.style.color = COLOR_TXT_DARKGRAY;
		textareaElement.style.borderColor = COLOR_TXT_DARKGRAY;
		setupTextareaBorderColorByClass_li(idHere, "1px", COLOR_LINE_GRAY);
		setupTextareaReadOnly_li(idHere, true);
	};
};
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
};
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
};