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

		if( isEditing != null && dblclickedId != addLiId){
			selectedLi = objectById[dblclickedId];
			openEditLi(layer, dblclickedId);
		} else if(isEditing != null && dblclickedId == addLiId){
			selectedLi = {layer: layerHere};
			openNewLi(layer, dblclickedId);
		};

		// 선택된 li의 id 넣기
		const seletedLi_layer0 = document.getElementById("seletedLi_layer0");
		seletedLi_layer0.innerHTML = "id:" + dblclickedId;
		resizeTextarea();
	};

	liArray.forEach((v)=>{
		v.addEventListener("click",(e)=>{

            // console.log("==========li clicked! - 0 ==========")

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

                // console.log("==========li clicked! - 1 ==========")

				if(id != addLiId) {

                    // console.log("==========li clicked! - 2 ==========")

					selectedLi = objectById[id];
					showChildernList(layerHere, id);
					showHideDiv(layerHere);

				} else {

                    // console.log("==========li clicked! - 3 ==========")

					// 새 리스트 추가하기 버튼을 누른 경우
					// openNewLi(layerHere, id);
					// const parentLayer = getParentsLayerBySwitchLayer(layerHere);
					// showHideDiv(parentLayer);
					selectedLi = {layer: layerHere};
					makeEditModeByDbclick(e);

				};
			};

            setLiColorByLi(layerHere);

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
		console.log("cancelLiSelected here");
		const tagName = e.target.tagName;
		let isBg = "";
		
		if (tagName == "TEXTAREA" || tagName == "LI" || tagName == "INPUT") {
			isBg = false;
		} else {
			isBg = true;
		};

		if(isBg) {
			console.log("isBg = true");
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
		} else { console.log("isBg = false")};
	});
};