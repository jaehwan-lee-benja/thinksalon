const newLiDept = {
	"saveNewLi":
		function saveNewLi(layerHere) {
			const packagedData = newLiDept.packageNewLi(layerHere);
			if (packagedData != null) {
				newLiDept.requestSetLi(layerHere, packagedData);
				// UIDept.showItOnUI_followup(layerHere);
			};
		},
	"packageNewLi":
		function packageNewLi(layerHere) {
			// const monitorResult = monitorDept.monitorLiBlankOrDuplicates(layerHere);
			// if (monitorResult) {
				const catchedData = newLiDept.catchContentsDataBySwitchLayer(layerHere);
				const idNew = newLiDept.getUuidv4();
				catchedData["id"] = idNew;
				catchedData["children"] = "";
				catchedData["createdDate"] = supportDept.getTimeStamp();
				catchedData["editedDate"] = supportDept.getTimeStamp();
				catchedData["main"] = "";
				catchedData["layer"] = layerHere;
				return catchedData;
			// };
		},
	"catchContentsDataBySwitchLayer":
		function catchContentsDataBySwitchLayer(layerHere) {
			
			const catchContentsData = {};
			catchContentsData["contents"] = {};
			
			if (layerHere == 0) {
				catchContentsData["parentsId"] = "";
			} else {
				const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				catchContentsData["parentsId"] = idDept.getLiId(parentsLayer);
			};

			const contents = catchContentsData["contents"];
			const lastLiContents = listDept.getLastLi(layerHere).children[0].value;
			contents["txt"] = lastLiContents.trim();

			return catchContentsData;
		},
	"getUuidv4":
		function getUuidv4() {
			return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},
	"requestSetLi": 
		function requestSetLi(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);

			switchedRef.child(inputId)
			.set(packagedDataHere)
			.then((e) => {
				LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
					alert("저장되었습니다.");
				});
			});

		},
	"openNewLi":
		function openNewLi(layerHere, idHere) {
			// UIDept.showEmptyLi(idHere);
			UIDept.setupBtnShowOrHideByClassName(layerHere, "openNewLi", idHere);
			// newLiDept.openNewLi_followup(layerHere);
		},
	"openNewLi_followup":
		function openNewLi_followup(layerHere) {			
			switch(layerHere) {
				case 0 :
					newLiDept.openNewLi_followupBySwitchLayer(1, 2, 3);
					break;
				case 1 :
					newLiDept.openNewLi_followupBySwitchLayer(2, 3);
					break;
				case 2 :
					newLiDept.openNewLi_followupBySwitchLayer(3);
					break;
				default : null;
			};
		},
	"openNewLi_followupBySwitchLayer":
		function openNewLi_followupBySwitchLayer(layer1, layer2) {
			const idThreadObjectKeysArray = [layer1, layer2];
			idThreadObjectKeysArray.forEach(eachLayer => {
				if (eachLayer != undefined) {
					UIDept.showEmptyLi(eachLayer);
					UIDept.setupBtnShowOrHideByClassName(eachLayer, "inactiveLi");
					UIDept.hideUI("list_"+eachLayer);
				};
			});
		},
};