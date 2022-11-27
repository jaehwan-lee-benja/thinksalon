function saveNewLi() {
	const selectedLayer = Number(selectedLi.layer);
	const packagedData = packageNewLi(selectedLayer);
	if (packagedData != null) {

		const packagedEditedIdRowArray = packageEditedIdRowArray_create();

		const idArray = Object.keys(objectById);
		idArray.forEach(eachId => {
			packagedEditedIdRowArray.forEach(eachObject => {
				if(eachId == eachObject.id) {
					requestUpdateRow_createAndDelete(eachObject);
				};
			});
		});

		requestSetLi(packagedData);
		showHideDiv(selectedLayer-1);
		updateList(selectedLayer);
		keepSelectedData(selectedLayer, packagedData.id);
		setLiColorByLi(selectedLayer);
	};
};
function packageNewLi(layerHere) {

	const monitorResult = monitorLiBlankOrDuplicates(layerHere);
	if (monitorResult) {
		const catchedData = catchContentsDataBySwitchLayer(layerHere);
		const idNew = getUuidv4();
		catchedData["id"] = idNew;
		catchedData["createdDate"] = getTimeStamp();
		catchedData["editedDate"] = getTimeStamp();
		catchedData["main"] = "";
		catchedData["layer"] = layerHere;
		catchedData["row"] = 0;
		// catchedData["row"] = countRow(layerHere);
		return catchedData;
	};
};

function monitorIfLiChanged(layerHere) {
	
	// 현재 UI에 띄워진 값 포착하기
	const id = selectedLi.id;
	const value = document.getElementById(id).children[0].value.trim();
	const object = {"id": id, [layerHere]: value};
	
	// 로컬 데이터에 있는 값 포착하기
	const arrayWithId = getMappedObject_idContents(layerHere);

	// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
	for(let i = 0; i < arrayWithId.length; i++) {
		if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
			// 내용이 바뀌지 않았음
			return false;
		};
	};
	// 내용이 바뀌었음
	return true;
};

function catchContentsDataBySwitchLayer(layerHere) {
	
	const catchContentsData = {};
	catchContentsData["contents"] = {};
	
	if (layerHere == 0) {
		catchContentsData["parentsId"] = "";
	} else {
		const parentsLayer = layerHere - 1;
		const parentsId = getLiId(parentsLayer);
		catchContentsData["parentsId"] = parentsId;
	};

	const contents = catchContentsData["contents"];
	const lastLiContents = getLastLi(layerHere).children[0].value;
	contents["txt"] = lastLiContents.trim();

	return catchContentsData;
};
function getUuidv4() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
	(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
};
function requestSetLi(packagedDataHere) {
	const inputId = packagedDataHere.id;

	const bigPictureRef = db.ref("users")
					.child(userData.uid)
					.child("bigPicture");

	bigPictureRef.child(inputId)
	.set(packagedDataHere)
	.then((e) => {
		alert("저장되었습니다.");
	});

};
function openNewLi(idHere) {
	showEmptyLi(idHere);
	setupBtnShowOrHideByClassName("openNewLi", idHere);
};