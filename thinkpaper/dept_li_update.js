function saveEditedLi(layerHere) {
	const packagedData = packageEditedLi(layerHere);
	if (packagedData != null) {
		requestUpdateLi(layerHere, packagedData);
	};
};
function packageEditedLi(layerHere) {	

	// CRUD 후 진행하기
	// const resultIsChanged = monitorIfLiChanged(layerHere);
	// const monitorResult = getMoniterResult(layerHere, resultIsChanged);
	
	// if (monitorResult) {
		const packagedData = {};
		const id = getLiId(layerHere);
		packagedData["id"] = id;
		if (layerHere == 0) {
			packagedData["parentsId"] = "";
		} else {
			const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
			packagedData["parentsId"] = getLiId(parentsLayer);
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
function requestUpdateLi(layerHere, packagedDataHere) {
	const inputId = packagedDataHere.id;
	const idThreadObject = getIdThreadObjectByPackagedData(layerHere, packagedDataHere);
	const switchedRef = getRefBySwitchLayer(layerHere, idThreadObject);
	switchedRef.child(inputId)
	.update(packagedDataHere, (e) => {
		LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
			alert("수정되었습니다.");
		});
		console.log("*keep* update completed = ", e);
	});
};
function openEditLi(layerHere) {
	const id = getLiId(layerHere);
	UIDept.setupBtnShowOrHideByClassName(layerHere, "editLi", id);
	// UIDept.editLi_followup(layerHere);
};
function cancelEditLi(layerHere) {
	const liId = getLiId(layerHere);
	if(liId != ""){
		UIDept.showItOnUI(layerHere, liId);
		const childrenLayer = getChildrenLayerBySwitchLayer(layerHere);
		if (childrenLayer != null) {
			const idArray = getEveryIdArrayOfLayer(childrenLayer);
			if(idArray.length == 0) {
				UIDept.setupBtnShowOrHideByClassName(childrenLayer, "createFirstLi");
			};
		};
	} else {
		// 기존 카드가 있는 상태에서, 새 카드 만들기 후, 편집 취소를 할 때의 경우, 최신 lastest 카드를 보여주기
		// 기존 카드가 없는 경우에는 cancelEditLi 버튼이 나타나지 않음.
		const id = getLatestIdByLayer(layerHere);
		UIDept.showItOnUI(layerHere, id);
	};
};