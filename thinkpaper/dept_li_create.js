function saveNewLi(layerHere) {
	const packagedData = packageNewLi(layerHere);
	if (packagedData != null) {
		requestSetLi(layerHere, packagedData);
		// showItOnUI_followup(layerHere);
	};
};
function packageNewLi(layerHere) {
	// const monitorResult = monitorLiBlankOrDuplicates(layerHere);
	// if (monitorResult) {
		const catchedData = catchContentsDataBySwitchLayer(layerHere);
		const idNew = getUuidv4();
		catchedData["id"] = idNew;
		catchedData["children"] = "";
		catchedData["createdDate"] = getTimeStamp();
		catchedData["editedDate"] = getTimeStamp();
		catchedData["main"] = "";
		catchedData["layer"] = layerHere;
		catchedData["row"] = countRow(layerHere);
		return catchedData;
	// };
};
function catchContentsDataBySwitchLayer(layerHere) {
	
	const catchContentsData = {};
	catchContentsData["contents"] = {};
	
	if (layerHere == 0) {
		catchContentsData["parentsId"] = "";
	} else {
		const parentsLayer = getParentsLayerBySwitchLayer(layerHere);
		catchContentsData["parentsId"] = getLiId(parentsLayer);
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
function requestSetLi(layerHere, packagedDataHere) {
	const inputId = packagedDataHere.id;
	const idThreadObject = getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

	const switchedRef = getRefBySwitchLayer(layerHere, idThreadObject);

	switchedRef.child(inputId)
	.set(packagedDataHere)
	.then((e) => {
		request_followupEditedDate(layerHere, packagedDataHere, function(){
			alert("저장되었습니다.");
		});
	});

};
function openNewLi(layerHere, idHere) {
	showEmptyLi(idHere);
	// addOpenAddLi(layerHere);
	setupBtnShowOrHideByClassName(layerHere, "openNewLi", idHere);
	// openNewLi_followup(layerHere);
};
function openNewLi_followup(layerHere) {			
	switch(layerHere) {
		case 0 :
			openNewLi_followupBySwitchLayer(1, 2, 3);
			break;
		case 1 :
			openNewLi_followupBySwitchLayer(2, 3);
			break;
		case 2 :
			openNewLi_followupBySwitchLayer(3);
			break;
		default : null;
	};
};
function openNewLi_followupBySwitchLayer(layer1, layer2) {
	const idThreadObjectKeysArray = [layer1, layer2];
	idThreadObjectKeysArray.forEach(eachLayer => {
		if (eachLayer != undefined) {
			showEmptyLi(eachLayer);
			setupBtnShowOrHideByClassName(eachLayer, "inactiveLi");
			hideUI("list_"+eachLayer);
		};
	});
};