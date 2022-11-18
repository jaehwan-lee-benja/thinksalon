function clickLi(layerHere) {
	// 참고: https://daisy-mansion.tistory.com/46
	const li = document.getElementById("list_layer"+layerHere).children;
	
	const liArray = [];
	for (let i = 0; i < li.length; i++) {
		liArray.push(li[i]);
	};

	function makeEditModeByDbclick(eHere) {
		const idByLi = eHere.target.getAttribute("id");
		const idByTextarea = eHere.target.parentNode.getAttribute("id");					

		let dblclickedId = ""
		if(idByLi != null) {
			dblclickedId = idByLi;
		} else {
			dblclickedId = idByTextarea;
		};

		const liElement = document.getElementById(dblclickedId);
		const textareaElement = liElement.children[0];
		const layer = liElement.getAttribute("layer");
		const addLiId = "addLiBtn_"+layer;
		const isEditing = textareaElement.getAttribute("readOnly");

		// updateList(layer);

		if( isEditing != null && dblclickedId != addLiId){
			selectedLi = objectById[dblclickedId];
			openEditLi(layer, dblclickedId);
		} else if(isEditing != null && dblclickedId == addLiId){
			selectedLi = {layer: layerHere, id: "addLiBtn_"+layerHere};
			openNewLi(layer, dblclickedId);
		};

		// 선택된 li의 id 넣기
		const seletedLi_layer0 = document.getElementById("seletedLi_layer0");
		seletedLi_layer0.innerHTML = "id:" + dblclickedId;
		resizeTextarea();
		setLiColorByLi();
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

				const li = document.getElementsByTagName("li");
				for (let i = 0; i < li.length; i++) {
					const isEditingEachLi = li[i].getAttribute("readOnly");
					if( isEditingEachLi != null) {
					} else {
						updateList();
					};
				};

				if(id != addLiId) {

					selectedLi = objectById[id];
					showChildernList(layerHere, id);
					showHideDiv(layerHere);

				} else {

					// 새 리스트 추가하기 버튼을 누른 경우
					// openNewLi(layerHere, id);
					// const parentLayer = getParentsLayerBySwitchLayer(layerHere);
					// showHideDiv(parentLayer);
					makeEditModeByDbclick(e);

				};
			};

            setLiColorByLi();

			// 선택된 li의 id 넣기
			const seletedLi_layer0 = document.getElementById("seletedLi_layer0");
			seletedLi_layer0.innerHTML = "id:" + id;
			// resizeTextarea();

			const selectedLiViewer = document.getElementById("selectedLiViewer");
   			selectedLiViewer.innerHTML = JSON.stringify(selectedLi);

		});

		v.addEventListener("dblclick",(e)=>{
			
			makeEditModeByDbclick(e);
		
		});
	});
};

function setLiColorByLi() {
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
                    eventListenerCell = {selected: "Y"};
                } else {
                    li[i].style.background = "";
                    li[i].setAttribute("pointed", "N");
                };
            };
        };
	};
};

function cancelLiSelected() {
	const bg = document.body;
	bg.addEventListener("click",(e)=>{
		const tagName = e.target.tagName;
		let isBg = "";
		
		if (tagName == "TEXTAREA" || tagName == "LI" || tagName == "INPUT") {
			isBg = false;
		} else {
			isBg = true;
		};

		if(isBg) {
			if (eventListenerCell.selected == "Y") {
				const li = document.getElementsByTagName("li");
				for (let i = 0; i < li.length; i++) {
					const isPointed = li[i].getAttribute("pointed");
					if( isPointed == "Y") {
						li[i].style.background = "";
						li[i].setAttribute("pointed", "N");
						eventListenerCell = {selected: "N"};
					};
				};
				cancelEditLi();
			};
		};
	});
};