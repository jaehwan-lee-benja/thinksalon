function saveNewLi() {
	const selectedLayer = Number(selectedLi.layer);
	const packagedData = packageNewLi(selectedLayer);
	if (packagedData != null) {
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
		catchedData["row"] = countRow(layerHere);
		return catchedData;
	};
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