function getLatestIdByLayer(layerHere) {
	const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere);
	if(eachIdArrayByLayer.length > 0){
		const latestId = getLastestEditedId(eachIdArrayByLayer);
		return latestId;
	} else {
		return null;
	};
};
function getLastestEditedId(keysArrayHere) {
	const mappedArray = keysArrayHere.map( id => {
		const c = objectById[id];
		return {"id": id, "editedDate": c.editedDate};
	}).sort(
		(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
	);
	if (mappedArray != null) {
		const latestEditedId = mappedArray[0];
		return latestEditedId.id;
	} else {
		return null;
	};
};
function getParentsIdfromChildId(childLayerHere, childIdHere) {

	const isNewIdResult = isNewId(childIdHere);
	
	if(childLayerHere != 0 && !isNewIdResult) {
		const everyIdArray = Object.keys(objectById);
		for(let i = 0; i < everyIdArray.length; i++) {
			if(everyIdArray[i] == childIdHere) {
				return objectById[childIdHere].parentsId;
			};
		};
	} else {
		return null;
	};

};
function getEveryIdArrayOfLayer(layerHere) {
	const everyIdArray = Object.keys(objectById);
	const everyIdArrayOfLayer = [];
	for(let i = 0; i < everyIdArray.length; i++) {
		if(objectById[everyIdArray[i]].layer == layerHere ) {
			everyIdArrayOfLayer.push(everyIdArray[i]);
		};
	};
	// layer0 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
	if(layerHere != 0) {
		const everyIdArrayOfLayerFromSameParents = [];
		for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
			const parentsLayer = layerHere - 1;
			const parentsId = getLiId(parentsLayer);
			if (objectById[everyIdArrayOfLayer[j]].parentsId == parentsId){
				everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
			};
		};
		return everyIdArrayOfLayerFromSameParents;
	};
	return everyIdArrayOfLayer;
};
function getEveryIdArrayOfLayerById(layerHere, idHere) {
	const everyIdArray = Object.keys(objectById);
	const everyIdArrayOfLayer = [];
	for(let i = 0; i < everyIdArray.length; i++) {
		if(objectById[everyIdArray[i]].layer == layerHere ) {
			everyIdArrayOfLayer.push(everyIdArray[i]);
		};
	};
	// layer0 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
	if(layerHere != 0) {
		const everyIdArrayOfLayerFromSameParents = [];
		for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
			if (objectById[everyIdArrayOfLayer[j]].parentsId == getParentsIdfromChildId(layerHere, idHere)){
				everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
			};
		};
		return everyIdArrayOfLayerFromSameParents;
	};
	return everyIdArrayOfLayer;
};
function isNewId(idHere) {
	const everyIdArray = Object.keys(objectById);
	const checkpoint = everyIdArray.includes(idHere);
	if (checkpoint) {
		return false;
	} else {
		return true;
	};
};
function getIdThreadObjectByPackagedData(layerHere, packagedDataHere) {
	const idThreadObject = {};

	switch(layerHere) {
		case 0 :
			// 해당 없음
			break;
		case 1 :
			idThreadObject.layer0Id = packagedDataHere.parentsId;
			break;
		case 2 :
			const layer1Id = packagedDataHere.parentsId;
			idThreadObject.layer1Id = layer1Id;
			idThreadObject.layer0Id = getParentsIdfromChildId(1, layer1Id);
			break;
		case 3 :
			const layer2Id = packagedDataHere.parentsId;
			const layer1Id2 = getParentsIdfromChildId(2, layer2Id);
			idThreadObject.layer2Id = layer2Id;
			idThreadObject.layer1Id = layer1Id2;
			idThreadObject.layer0Id = getParentsIdfromChildId(1, layer1Id2);
			break;
		default : null;
	};
	return idThreadObject;
};
function emptyLiId(layerHere) {
	const liElementId = "liId_layer"+layerHere;
	document.getElementById(liElementId).value = "";
	const liElementParentsId = "liParentsId_"+layerHere;
	document.getElementById(liElementParentsId).value = "";
};
// 	function getLiId(layerHere) {
// 		const liElementId = "liId_layer"+layerHere;
// 		const result = document.getElementById(liElementId).value;
// 		return result;
// 	};
function getLiId(layerHere) {

	const listElement = document.getElementById("list_layer"+layerHere);
	const li = listElement.children;
	
	for (let i = 0; i < li.length; i++) {
		const isPointed = li[i].getAttribute("pointed");
		if (isPointed == "Y") {
			const valueOfLi = li[i].id;
			return valueOfLi;
		};
	};

};
function getLayerById(idHere) {
	const everyIdArray = Object.keys(objectById);
	let layer = "";
	everyIdArray.forEach( eachId => {
		if (eachId == idHere) {
			layer = objectById[idHere].layer;
		};
	})
	return layer;
};
function countRow(layerHere) {
    const layer = layerHere;
	const idArray = Object.keys(objectById);
    const objectArrayFromSameLayer = [];
    idArray.forEach( eachId => {
        const layerOfEachObject = objectById[eachId].layer;
        if(layerOfEachObject == layer) {
            objectArrayFromSameLayer.push(layerOfEachObject);
        };
    });
    const liCount = objectArrayFromSameLayer.length;
    return liCount;
};