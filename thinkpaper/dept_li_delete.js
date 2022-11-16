function removeLi(layerHere) {
	// const removeId = getLiId(layerHere);
	const removeId = selectedLi.id;
	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemoveLi(layerHere, removeId);
	};
};
function requestRemoveLi(layerHere, idHere) {

	const inputId = idHere;
	const packagedData = objectById[inputId];
	packagedData.editedDate = getTimeStamp();

	const idThreadObject = getIdThreadObjectByPackagedData(layerHere, packagedData);

	const switchedRef = db.ref("users")
						.child(userData.uid)
						.child("bigPicture");
						
	const idArrayLength = getEveryIdArrayOfLayer(layerHere).length;

	if(layerHere == 0 && idArrayLength == 1) {
		// layer0레이어에서 remove진행시, 
		// firebase의 bigPicture 자체가 사라져, 로딩 로직에서 버그가 남.
		// 그래서 예외 처리
		const emptyData = {children: ""};
		const switchedRefForEmptyData = switchedRef.parent;
		switchedRefForEmptyData.set(emptyData, (e) => {
			console.log("*keep* remove completed A = ", e);
			alert("삭제되었습니다.");
			});
	} else {
		switchedRef.child(inputId)
		.remove((e) => {
			request_followupEditedDate(layerHere, packagedData, function(){
				alert("삭제되었습니다.");
			});
			console.log("*keep* remove completed B = ", e);
			});
	};
};