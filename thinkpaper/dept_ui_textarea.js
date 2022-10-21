function setupTextareaModeByClassName(idHere, liMode) {
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