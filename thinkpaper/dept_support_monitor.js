function monitorLiBlankOrDuplicates(layerHere) {
	const liId = selectedLi.id;
	const liValue = document.getElementById(liId).children[0].value.trim();
	if (liValue != "") {		
		const sameTextArray = getSameTextArray(layerHere, liValue);
		if (sameTextArray == undefined) {
			return true;
		} else {
			highLightBorder(liId, "red");
			alert("중복된 카드가 있습니다. 내용을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder(liId, "red");
		alert("카드가 비어있습니다. 내용을 입력해주시기 바랍니다.");
	};
	return false;
};
function getSameTextArray(layerHere2, liValueHere) {
	const idArray = getEveryIdArrayOfLayer(layerHere2);
	const mappedIdArray = idArray.map( eachId => {
		const mappingObject = {"id":eachId};
		mappingObject[layerHere2] = objectById[eachId].contents["txt"];	
		return mappingObject;
		});
	const valueArray = [];
	for(let i = 0; i < mappedIdArray.length; i++) {
		valueArray.push(mappedIdArray[i][layerHere2]);
	};
	const sameTextArray = filterSameTextArray(liValueHere, valueArray);
	return sameTextArray;
};
function filterSameTextArray(query, valueArray) {
	return valueArray.find(value => query == value);
};