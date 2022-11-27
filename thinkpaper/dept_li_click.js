function clickLi(layerHere) {
	// 참고: https://daisy-mansion.tistory.com/46
	const li = document.getElementById("list_layer"+layerHere).children;
	
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

			if(isEditing != null) {

				if(id != addLiId) {

					keepSelectedData(layerHere, id);
					showHideDiv(layerHere);
					setLiColorByLi(layerHere);
					showChildernList(layerHere, id);
					setupBtnShowOrHideByClassName("readLi");

				} else {

					// 새 리스트 추가하기 버튼을 누른 경우
					keepSelectedData(layerHere, "addLiBtn_"+layerHere);
					const parentLayer = layerHere - 1;
					showHideDiv(parentLayer);
					setLiColorByLi(layerHere);
					setupBtnShowOrHideByClassName();

				};
				cancelLiEditModeBack();
			};

			resizeTextarea();

		});

		v.addEventListener("dblclick",(e)=>{
			
			makeEditModeByDbclick(e);
		
		});
	});
};

function keepSelectedData(layerHere, idHere) {
	if(layerHere != undefined) {
		const dataFromObjectById = objectById[idHere];
		if(dataFromObjectById != undefined) {
			selectedLi = dataFromObjectById;
			selectedLiByLayer[layerHere] = dataFromObjectById;
		} else {
			const dataForAddLiBtn = {layer: layerHere, id: idHere, contents:{txt:""}};
			selectedLi = dataForAddLiBtn;
			selectedLiByLayer[layerHere] = dataForAddLiBtn;
		};
	} else {
		selectedLi = {};
		selectedLiByLayer = {0: "", 1:"", 2:""};
	};
	const seletedLi_layer0 = document.getElementById("seletedLi_layer0");
	seletedLi_layer0.innerHTML = "id: " + selectedLi.id;
};

function makeEditModeByDbclick(eHere) {

	let dblclickedId = ""
	const targetTagName = eHere.target.tagName;

	if(targetTagName == "LI") {
		dblclickedId = eHere.target.getAttribute("id");
	} else {
		dblclickedId = eHere.target.parentNode.getAttribute("id");	
	};

	const liElement = document.getElementById(dblclickedId);
	const textareaElement = liElement.children[0];
	const layer = liElement.getAttribute("layer");
	const addLiId = "addLiBtn_"+layer;
	const isEditing = textareaElement.getAttribute("readOnly");

	if(isEditing != null) {

		if(dblclickedId != addLiId){
			keepSelectedData(layer, dblclickedId);
			openEditLi(layer, dblclickedId);
		} else {
			keepSelectedData(layer, "addLiBtn_"+layer);
			textareaElement.readOnly = true;
			openNewLi(dblclickedId);
			textareaElement.style.color = COLOR_TXT_DARKGRAY;
		};
	};

	resizeTextarea();
	setLiColorByLi(layer);

};

function cancelLiEditModeBack() {
	const li = document.getElementsByTagName("li");
	for (let i = 0; i < li.length; i++) {
		const eachTextarea = li[i].children[0];
		const eachValueOfReadOnly = eachTextarea.getAttribute("readOnly");
		if(eachValueOfReadOnly == null){
			if (confirm("편집을 취소하시겠습니까?")) {
				const idOfReadOnly = li[i].getAttribute("id");
				eachTextarea.readOnly = true;
				eachTextarea.setAttribute("style", "");
				const dataFromObjectById = objectById[idOfReadOnly];
				let liValue = "";
				if( dataFromObjectById != undefined){
					liValue = dataFromObjectById.contents.txt;
				} else {
					liValue = "(추가하기: 더블 클릭)";
					eachTextarea.setAttribute("style", "color: "+COLOR_TXT_GRAY);
				};
				eachTextarea.value = liValue;
			};
		};
	};
};
function setLiColorByLi(layerHere, rowEditHere) {
	const selectedId = selectedLi.id;

	setLiBgColor();

	if(rowEditHere == undefined) {
		if(eventListenerBox_selected != "N") {
			setupColorRowEditMode(selectedId, "reading")
		};
	} else {
		setupColorRowEditMode(selectedId, "editing")
	};

	setLiBorderColor(layerHere, rowEditHere);

}; // 수정중

function setLiBgColor() {
	if(selectedLi != undefined) {
        const li = document.getElementsByTagName("li");
        for (let i = 0; i < li.length; i++) {
            const selectedId = selectedLi.id;
            const selectedLayer = selectedLi.layer;
            const eachId = li[i].getAttribute("id");
            const eachLayer = li[i].getAttribute("layer");
            if(selectedLayer == eachLayer) {
                if(selectedId == eachId) {
                    li[i].style.background = COLOR_SELECTED_GRAYGREEN;
                    li[i].setAttribute("pointed", "Y");
                    eventListenerBox_selected = "Y";
                } else {
                    li[i].style.background = "";
                    li[i].setAttribute("pointed", "N");
					if(eachId == "addLiBtn_"+eachLayer) {
						li[i].children[0].style.color = "COLOR_TXT_GRAY";
					};
                };
            };
        };
	};
};

function setLiBorderColor(layerHere, rowEditHere) {
	const dataFromSelectedLi = selectedLi.id;
	const selectedLayer = selectedLi.layer;
	const dataFromSelectedLiByLayer = selectedLiByLayer[layerHere].id;
	if(dataFromSelectedLi == dataFromSelectedLiByLayer) {
		const li = document.getElementsByTagName("li");
		for (let i = 0; i < li.length; i++) {
			const selectedId = selectedLi.id;
			const eachId = li[i].getAttribute("id");
			const eachLayer = li[i].getAttribute("layer");
			if(selectedId == eachId) {
				li[i].style.borderRight = "10px solid" + COLOR_FOCUSED_YELLOW;
				li[i].setAttribute("pointedNow", "Y");
			} else if(rowEditHere !== undefined && selectedLayer == eachLayer) {
				for (let j = 0; j < li.length - 1; j++) {
					li[j].setAttribute("pointedNow", "N");
				};
			} else {
				li[i].style.borderRight = "";
				li[i].setAttribute("pointedNow", "N");
			};
		};	
	};
};

// 배경 클릭하면 취소되는 기능(편의성을 올릴 때 다시 살리기)
// function cancelLiSelected() {
// 	const bg = document.body;
// 	bg.addEventListener("click",(e)=>{
// 		const tagName = e.target.tagName;
// 		let isBg = "";
		
// 		if (tagName == "TEXTAREA" || tagName == "LI" || tagName == "INPUT") {
// 			isBg = false;
// 		} else {
// 			isBg = true;
// 		};

// 		if(isBg) {
// 			if (eventListenerBox_selected == "Y") {
// 				keepSelectedData();
// 				const li = document.getElementsByTagName("li");
// 				for (let i = 0; i < li.length; i++) {
// 					const isPointed = li[i].getAttribute("pointed");
// 					if( isPointed == "Y") {
// 						li[i].style.background = "";
// 						li[i].setAttribute("pointed", "N");
// 						li[i].style.borderRight = "";
// 						li[i].setAttribute("pointedNow", "N");
// 						eventListenerBox_selected = "N";
// 						// cancelEditLi();
// 					};
// 				};
// 			};
// 		};
// 	});
// };