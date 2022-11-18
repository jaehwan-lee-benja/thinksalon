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

	const bpRef = db.ref("users")
						.child(userData.uid)
						.child("bigPicture");
						
	bpRef.child(inputId)
	.remove((e) => {
		request_followupEditedDate(layerHere, packagedData, function(){
			alert("삭제되었습니다.");
		});
		console.log("*keep* remove completed B = ", e);
		});
};