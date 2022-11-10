function updateList(layerHere) {
	const listId = "list_layer"+layerHere;
	const list = document.getElementById(listId);
	const liElements = list.getElementsByTagName("LI");
	// list 초기화하기
	for(let i=liElements.length-1; i>=0; i-- ){
		liElements[i].remove();
	};
	// Array 만들기
	const mappedArray = getMappedObject_idEditedDateContents(layerHere);
	// list 순서 잡기(최근 편집 순서)
	const sortedArray = sortingArray(mappedArray);
	// li 생성하기
	for (let i = 0; i < sortedArray.length; i++) {
		const liValue = sortedArray[i][layerHere];
		const listItem = document.createElement('li');
		listItem.innerHTML = "<textarea readonly>"+ liValue +"</textarea>";
		list.appendChild(listItem);
		const liId = sortedArray[i].id;
		listItem.setAttribute("id", liId);
		listItem.setAttribute("layer", layerHere);
	};
	addOpenAddLi(layerHere);
	clickLi(layerHere);
};
function addOpenAddLi(layerHere) {
	const listId = "list_layer"+layerHere;
	const list = document.getElementById(listId);
	const liValue_addLi = "(+ 새 리스트 추가하기)";
	const listItem = document.createElement('li');
	listItem.innerHTML = "<textarea readonly>"+ liValue_addLi +"</textarea>";
	list.appendChild(listItem);
	const liId_addLi = "addLiBtn_"+layerHere;
	listItem.setAttribute("id", liId_addLi);
	listItem.setAttribute("layer", layerHere);
	listItem.setAttribute("style", COLORSET_ADDLI);
};
function getMappedObject_idEditedDateContents(layerHere) {		
	const returnArray = [];
	const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere);
	eachIdArrayByLayer.forEach(EachId => {
		let returnObject = {};
		returnObject["id"] = objectById[EachId].id;
		returnObject["editedDate"] = objectById[EachId].editedDate;
		returnObject[layerHere] = objectById[EachId].contents["txt"];
		returnArray.push(returnObject);
	});
	return returnArray;
};
function sortingArray(mappedArrayHere){
	mappedArrayHere.sort(
		(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
	);
	return mappedArrayHere;
};
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

			selectedLi = objectById[id]; // 수정 필요함 [질문]

			const addLiId = "addLiBtn_"+layerHere;
			
			const liElement = document.getElementById(id);
			const textareaElement = liElement.children[0];
			const isEditing = textareaElement.getAttribute("readOnly");

			console.log("check1");
			
			if(isEditing == null) {

				if(id != addLiId) {

					// 텍스트 에어리어 버그 관련해서는 아랫쪽 부분은 문제가 없는 것으로 보임
					// showItOnUI(layerHere, id);
					// showItOnUI_followup(layerHere);
					// showHideDiv(layerHere);

				} else {

					// 새 리스트 추가하기 버튼을 누른 경우
					openNewLi(layerHere, id);
					const parentLayer = getParentsLayerBySwitchLayer(layerHere);
					showHideDiv(parentLayer);

				};


			};

			setLiColorByLi(layerHere);

			// 선택된 li의 id 넣기
			const seletedLi_layer0 = document.getElementById("seletedLi_layer0");
			seletedLi_layer0.innerHTML = "id:" + id;
			// resizeTextarea();

		});

		v.addEventListener("dblclick",(e)=>{
			
			const idByLi = e.target.getAttribute("id");
			const idByTextarea = e.target.parentNode.getAttribute("id");					

			let dblclickedId = ""
			if(idByLi != null) {
				dblclickedId = idByLi;
			} else {
				dblclickedId = idByTextarea;
			};

			selectedLi = objectById[dblclickedId]; // 수정 필요함 [질문]

			const liElement = document.getElementById(dblclickedId);
			const textareaElement = liElement.children[0];
			const layer = liElement.getAttribute("layer");
			const addLiId = "addLiBtn_"+layer;
			const isEditing = textareaElement.getAttribute("readOnly");

			if( isEditing != null && dblclickedId != addLiId){
				openEditLi(layer, dblclickedId);
			} else if(isEditing != null && dblclickedId == addLiId){
				openNewLi(layer, dblclickedId);
			};

			// 선택된 li의 id 넣기
			const seletedLi_layer0 = document.getElementById("seletedLi_layer0");
			seletedLi_layer0.innerHTML = "id:" + dblclickedId;
			resizeTextarea();

		});
	});
};
function getLastLi(layerHere) {
	const li = document.getElementById("list_layer"+layerHere).children;
	
	const liArray = [];
	for (let i = 0; i < li.length; i++) {
		liArray.push(li[i]);
	};

	const last = liArray[liArray.length - 1];
	
	return last;
};