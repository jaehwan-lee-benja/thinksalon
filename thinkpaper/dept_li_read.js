function updateList(layerHere) {
	console.log("layerHere @updateList= ", layerHere);
	const listId = "list_layer"+layerHere;
	const list = document.getElementById(listId);
	const liElements = list.getElementsByTagName("LI");

	// list 초기화하기
	for(let i=liElements.length-1; i>=0; i-- ){
		liElements[i].remove();
	};

	const liArray = getLiArray(layerHere);
	const sortedArray = sortingArray(liArray);

	// li 생성하기
	for (let i = 0; i < sortedArray.length; i++) {
		const liValue = sortedArray[i].txt;
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

function getLiArray(layerHere) {
	const liArray = [];
	const idArray = Object.keys(objectById);
	idArray.forEach(eachId => {

		let parentsId = "";
		let parentsIdFromObjectById = objectById[eachId].parentsId;

		if(layerHere > 0) {
			if (eventListenerCell.selected == "Y") {
				let parentsLayer = layerHere - 1;
				const li = document.getElementsByTagName("li");
				for (let i = 0; i < li.length; i++) {
					const isPointed = li[i].getAttribute("pointed");
					const layerFromLi = li[i].getAttribute("layer");
					if(layerFromLi == parentsLayer && isPointed == "Y") {
						parentsId = li[i].getAttribute("id");
					};
				};
			};
		} else {
			// layer = 0 인 경우 예외처리
			parentsIdFromObjectById = "";
		};
		
		const layerFromObjectById = objectById[eachId].layer;
		if (layerHere == layerFromObjectById && parentsId == parentsIdFromObjectById) {
			const eachObjects = {};
			eachObjects.id = objectById[eachId].id;
			eachObjects.layer = objectById[eachId].layer;
			eachObjects.row = objectById[eachId].row;
			eachObjects.txt = objectById[eachId].contents.txt;
			liArray.push(eachObjects);
		};
	});
	return liArray;
}
function addOpenAddLi(layerHere) {
	const listId = "list_layer"+layerHere;
	const list = document.getElementById(listId);
	const liValue_addLi = "(추가하기: 더블 클릭)";
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
function sortingArray(arrayHere){
	arrayHere.sort(
		(a,b) => b.row - a.row
	);
	return arrayHere;
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
	if(layerHere < 2) {
		console.log("layerHere = ", layerHere);
		const layer = layerHere + 1;
		const listId = "list_layer"+layer;
		console.log("listId = ", listId);
		const list = document.getElementById(listId);
		console.log("list = ", list);
		const liElements = list.getElementsByTagName("LI");
		// list 초기화하기
		for(let i=liElements.length-1; i>=0; i-- ){
			liElements[i].remove();
		};
		// Array 만들기
		const mappedArray = getMappedObjectByParentsId(parentsIdHere);

		// list 순서 잡기(최근 편집 순서)
		const sortedArray = sortingArray(mappedArray);

		// li 생성하기
		for (let i = 0; i < sortedArray.length; i++) {
			const liValue = sortedArray[i].txt;
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

function getMappedObjectByParentsId(parentsIdHere) {		
	const returnArray = [];
	const eachIdArrayByLayer = getChildrenIdArray(parentsIdHere);
	eachIdArrayByLayer.forEach(eachId => {
		let returnObject = {};
		returnObject.id = objectById[eachId].id;
		returnObject.layer = objectById[eachId].layer;
		returnObject.row = objectById[eachId].row;
		returnObject.txt = objectById[eachId].contents.txt;
		returnArray.push(returnObject);
	});
	return returnArray;
};