function saveEditedLi() {
	const layer = selectedLi.layer;
	const packagedData = packageEditedLi(layer);
	if (packagedData != null) {
		requestUpdateLi(packagedData);
	};
};
function packageEditedLi(layerHere) {	

	// CRUD 후 진행하기
	// const resultIsChanged = monitorIfLiChanged(layerHere);
	// const monitorResult = getMoniterResult(layerHere, resultIsChanged);
	
	// if (monitorResult) {
		const packagedData = {};
		// const id = getLiId(layerHere); // [질문] pointed Y, N 중 어떤게 더 좋을까?
		const id = selectedLi.id;
		packagedData["id"] = id;
		if (layerHere == 0) {
			packagedData["parentsId"] = "";
		} else {
			packagedData["parentsId"] = selectedLi.parentsId;
		}
		packagedData["editedDate"] = getTimeStamp();
		packagedData["contents"] = {};

		const contents = packagedData["contents"];
		const pointedLi = document.getElementById(id);
		const pointedTextarea = pointedLi.children[0];
		contents["txt"] = pointedTextarea.value.trim();

		return packagedData;
	// };
};
function monitorIfLiChanged(layerHere) {
	
	// 현재 UI에 띄워진 값 포착하기
	const id = getLiId(layerHere);
	const value = document.getElementById(layerHere).value.trim();
	const object = {"id": id, [layerHere]: value};

	// 로컬 데이터에 있는 값 포착하기
	const arrayWithId = getMappedObject_idContents(layerHere);

	// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
	for(let i = 0; i < arrayWithId.length; i++) {
		if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
			return false;
		};
	};
	return true;
};
function getMappedObject_idContents(layerHere) {		
	const returnArray = [];
	const eachIdArrayByLayer = getEveryIdArrayOfLayer(layerHere);
	eachIdArrayByLayer.forEach(EachId => {
		const returnObject = {};
		returnObject["id"] = objectById[EachId].id;
		returnObject[layerHere] = objectById[EachId].contents["txt"];
		returnArray.push(returnObject);
	});
	return returnArray;
};
function getMoniterResult(layerHere, isChangedHere) {
	if (isChangedHere) {
		const monitorResultInFunction = monitorLiBlankOrDuplicates(layerHere);
		return monitorResultInFunction;
	} else {
		return true;
	};
};
function requestUpdateLi(packagedDataHere) {
	const inputId = packagedDataHere.id;
	const bpRef = db.ref("users")
						.child(userData.uid)
						.child("bigPicture");
	bpRef.child(inputId)
		.update(packagedDataHere, (e) => {
		alert("수정되었습니다.");
		console.log("*keep* update completed = ", e);
	});
};
function openEditLi() {
	const idHere = selectedLi.id;
	setupBtnShowOrHideByClassName("editLi", idHere);
};
function cancelEditLi() {

	const layer = selectedLi.layer;
	updateList(layer);
	setLiColorByLi(layer);

};