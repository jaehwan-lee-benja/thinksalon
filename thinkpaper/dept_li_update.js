const updateLiDept = {
	"saveEditedLi":
		function saveEditedLi(layerHere) {
			const packagedData = updateLiDept.packageEditedLi(layerHere);
			if (packagedData != null) {
				updateLiDept.requestUpdateLi(layerHere, packagedData);
			};
		},
	"packageEditedLi":
		function packageEditedLi(layerHere) {	

			// CRUD 후 진행하기
			// const resultIsChanged = updateLiDept.monitorIfLiChanged(layerHere);
			// const monitorResult = updateLiDept.getMoniterResult(layerHere, resultIsChanged);
			
			// if (monitorResult) {
				const packagedData = {};
				const id = idDept.getLiId(layerHere);
				packagedData["id"] = id;
				if (layerHere == 0) {
					packagedData["parentsId"] = "";
				} else {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					packagedData["parentsId"] = idDept.getLiId(parentsLayer);
				}
				packagedData["editedDate"] = supportDept.getTimeStamp();
				packagedData["contents"] = {};
		
				const contents = packagedData["contents"];
				const pointedLi = document.getElementById(id);
				const pointedTextarea = pointedLi.children[0];
				contents["txt"] = pointedTextarea.value.trim();

				return packagedData;
			// };
		},
	"monitorIfLiChanged":
		function monitorIfLiChanged(layerHere) {
			
			// 현재 UI에 띄워진 값 포착하기
			const id = idDept.getLiId(layerHere);
			const value = document.getElementById(layerHere).value.trim();
			const object = {"id": id, [layerHere]: value};

			// 로컬 데이터에 있는 값 포착하기
			const arrayWithId = updateLiDept.getMappedObject_idContents(layerHere);
		
			// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
			for(let i = 0; i < arrayWithId.length; i++) {
				if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
					return false;
				};
			};
			return true;
		},
	"getMappedObject_idContents":
		function getMappedObject_idContents(layerHere) {		
			const returnArray = [];
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			eachIdArrayByLayer.forEach(EachId => {
				const returnObject = {};
				returnObject["id"] = objectById[EachId].id;
				returnObject[layerHere] = objectById[EachId].contents["txt"];
				returnArray.push(returnObject);
			});
			return returnArray;
		},
	"getMoniterResult":
		function getMoniterResult(layerHere, isChangedHere) {
			if (isChangedHere) {
				const monitorResultInFunction = monitorDept.monitorLiBlankOrDuplicates(layerHere);
				return monitorResultInFunction;
			} else {
				return true;
			};
		},
	"requestUpdateLi":
		function requestUpdateLi(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);
			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);
			switchedRef.child(inputId)
			.update(packagedDataHere, (e) => {
				LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
					alert("수정되었습니다.");
				});
				console.log("*keep* update completed = ", e);
			});
		},
	"openEditLi":
		function openEditLi(layerHere) {
			const id = idDept.getLiId(layerHere);
			UIDept.setupBtnShowOrHideByClassName(layerHere, "editLi", id);
			// UIDept.editLi_followup(layerHere);
		},
	"cancelEditLi":
		function cancelEditLi(layerHere) {
			const liId = idDept.getLiId(layerHere);
			if(liId != ""){
				UIDept.showItOnUI(layerHere, liId);
				const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(layerHere);
				if (childrenLayer != null) {
					const idArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
					if(idArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName(childrenLayer, "createFirstLi");
					};
				};
			} else {
				// 기존 카드가 있는 상태에서, 새 카드 만들기 후, 편집 취소를 할 때의 경우, 최신 lastest 카드를 보여주기
				// 기존 카드가 없는 경우에는 cancelEditLi 버튼이 나타나지 않음.
				const id = idDept.getLatestIdByLayer(layerHere);
				UIDept.showItOnUI(layerHere, id);
			};
		}
};