function removeLi() {
	const removeId = selectedLi.id;
	const layer = Number(selectedLi.layer);
	
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {

		const packagedEditedIdRowArray = packageEditedIdRowArray_delete();

		const idArray = Object.keys(objectById);
		idArray.forEach(eachId => {
			packagedEditedIdRowArray.forEach(eachObject => {
				if(eachId == eachObject.id) {
					requestUpdateRow_createAndDelete(eachObject);
				};
			});
		});

		requestRemoveLi(removeId);
		const layerArray = [0, 1, 2];
		layerArray.forEach(eachLayer => {
			if (eachLayer >= layer){
				updateList(eachLayer);
			};
		});
		showHideDiv(layer-1);
		setupBtnShowOrHideByClassName();
	};
};
function requestRemoveLi(idHere) {

	const inputId = idHere;
	const layer = objectById[inputId].layer;

	//자식 요소 삭제하기
	let childrenIdArray = [];
	if(layer < 2) {
		const idArray = Object.keys(objectById);

		idArray.forEach(eachId => {
			const childrenFromObjectById = objectById[eachId].parentsId;
			if(childrenFromObjectById == inputId) {
				childrenIdArray.push(eachId);
			};
		});

		if(layer == 0) {

			idArray.forEach(eachId2 => {
				const childrenFromObjectById2 = objectById[eachId2].parentsId;
				childrenIdArray.forEach(eachParentsId => {
					if(childrenFromObjectById2 == eachParentsId) {
						childrenIdArray.push(eachId2);
					};
				});
			});

		};

	};

	const bpRef = db.ref("users")
						.child(userData.uid)
						.child("bigPicture");
						
	bpRef.child(inputId)
	.remove((e) => {
		if(layer < 2) {
			childrenIdArray.forEach(eachChildrenId => {
				bpRef.child(eachChildrenId).remove();
				});
		};
		alert("삭제되었습니다.");
		console.log("*keep* remove completed B = ", e);
		});
};