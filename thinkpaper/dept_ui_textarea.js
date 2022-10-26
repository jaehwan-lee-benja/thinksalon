function setupTextareaModeByClassName(idHere, liMode) {
	const liElement = document.getElementById(idHere);
	const textareaElement = liElement.children[0];
	console.log("setupTextareaModeByClassName");

	if (liMode == "editing") {
		textareaElement.style.color = COLOR_FOCUSED_YELLOW;
		textareaElement.style.borderColor = COLOR_FOCUSED_YELLOW;
		setupTextareaBorderColorByClass_li(idHere, "2px", COLOR_FOCUSED_YELLOW);
		setupTextareaReadOnly(idHere, false);
	} else {
		textareaElement.style.color = COLOR_TXT_DARKGRAY;
		textareaElement.style.borderColor = COLOR_TXT_DARKGRAY;
		setupTextareaBorderColorByClass_li(idHere, "1px", COLOR_LINE_GRAY);
		setupTextareaReadOnly(idHere, true);
	};
};
function setupTextareaReadOnly(idHere, trueOrFalse){
	const liElement = document.getElementById(idHere);
	const textareaElement = liElement.children[0];
	textareaElement.readOnly = trueOrFalse;
	if(trueOrFalse == false) {
		setTimeout(()=>{
		console.log("setupTextareaReadOnly");
		textareaElement.style.backgroundColor = "#FFF";
		textareaElement.style.border = "solid 2px" + COLOR_SELECTED_GRAYGREEN;
		},1);
	}
};