function updateList() {
	const layerArray = [0, 1, 2];
	layerArray.forEach(layerHere => {
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
	});
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
	listItem.style.color = COLORSET_ADDLI;
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



function getLastLi(layerHere) {
	const li = document.getElementById("list_layer"+layerHere).children;
	
	const liArray = [];
	for (let i = 0; i < li.length; i++) {
		liArray.push(li[i]);
	};

	const last = liArray[liArray.length - 1];
	
	return last;
};

function showChildernList(layerHere, parentsIdHere) {
	const layer = layerHere + 1;
	const listId = "list_layer"+layer;
	const list = document.getElementById(listId);
	const liElements = list.getElementsByTagName("LI");
	// list 초기화하기
	for(let i=liElements.length-1; i>=0; i-- ){
		liElements[i].remove();
	};
	// Array 만들기
	const mappedArray = getMappedObjectByParentsId(layer, parentsIdHere);

	// list 순서 잡기(최근 편집 순서)
	const sortedArray = sortingArray(mappedArray);
	
	// li 생성하기
	for (let i = 0; i < sortedArray.length; i++) {
		const liValue = sortedArray[i][layer];
		const listItem = document.createElement('li');
		listItem.innerHTML = "<textarea readonly>"+ liValue +"</textarea>";
		list.appendChild(listItem);
		const liId = sortedArray[i].id;
		listItem.setAttribute("id", liId);
		listItem.setAttribute("layer", layer);
	};
	addOpenAddLi(layer);
	clickLi(layer);
};

function getChildrenIdArray(parentsIdHere) {
	const idArray = Object.keys(objectById);
	const childrenIdArray = [];
	idArray.forEach(eachId => {
		const eachParentsIdFromObjectById = objectById[eachId].parentsId;
		if(eachParentsIdFromObjectById == parentsIdHere){
			childrenIdArray.push(eachId);
		};
	});
	return childrenIdArray;
};

function getMappedObjectByParentsId(layerHere, parentsIdHere) {		
	const returnArray = [];
	const eachIdArrayByLayer = getChildrenIdArray(parentsIdHere);
	eachIdArrayByLayer.forEach(EachId => {
		let returnObject = {};
		returnObject["id"] = objectById[EachId].id;
		returnObject["editedDate"] = objectById[EachId].editedDate;
		returnObject[layerHere] = objectById[EachId].contents["txt"];
		returnArray.push(returnObject);
	});
	return returnArray;
};