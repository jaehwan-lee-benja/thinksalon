function startRowEdit() {

    const selectedId = selectedLi.id;
    const selectedLayer = selectedLi.layer;
    rowBox.before = getIdRowArray(selectedLayer);

    setupBtnShowOrHideByClassName("upDownRow", selectedId);
    setLiColorByLi(selectedLayer, "rowEdit");

};

function simulateUpDownLi(plusOrMinus) {

    const selectedLayer = selectedLi.layer;
    let idRowArray_before = getIdRowArray(selectedLayer);

    // 바뀌는 id row 정립하기
    const everyIdArrayOfLayer = getEveryIdArrayOfLayer(selectedLayer);
    const selectedId = selectedLi.id;
    const selectedRow = selectedLi.row;
    

    // 변경된 row값 idRowArray_after로 묶기
    let idRowArray_after = [];

    if(plusOrMinus == "plus") {
        // plus된 값 맞추기
        const maxRow = everyIdArrayOfLayer.length - 1;
        const uppedRowByPlus = selectedRow + 1;
        let downedIdRowByPlus = {};
        let uppedIdRowByPlus = {};

        // up 버튼에 따라서, 값 올리기
        if(uppedRowByPlus < maxRow) {
            uppedIdRowByPlus = {id: selectedId, row: uppedRowByPlus};
        } else {
            uppedIdRowByPlus = {id: selectedId, row: maxRow};
        };

        // up 버튼에 따라서, 값 내리기
        everyIdArrayOfLayer.forEach(eachId => {
            if(objectById[eachId].row == uppedRowByPlus) {
                downedIdRowByPlus = {id: eachId, row: uppedRowByPlus - 1}
            };
        });

        idRowArray_before.forEach(eachObject => {
            if(eachObject.id == downedIdRowByPlus.id) {
                idRowArray_after.push(downedIdRowByPlus);
            } else if (eachObject.id == uppedIdRowByPlus.id) {
                idRowArray_after.push(uppedIdRowByPlus);
            };
        });

    } else {

        // minus된 값 맞추기
        const downedRowByMinus = selectedRow - 1;
        let downedIdRowByMinus = {};
        let uppedIdRowByMinus = {};

        // down 버튼에 따라서, 값 내리기
        if(downedRowByMinus > 0) {
            downedIdRowByMinus = {id: selectedId, row: downedRowByMinus};
        } else {
            downedIdRowByMinus = {id: selectedId, row: 0};
        };

        // down 버튼에 따라서, 값 올리기
        everyIdArrayOfLayer.forEach(eachId => {
            if(objectById[eachId].row == downedRowByMinus) {
                uppedIdRowByMinus = {id: eachId, row: downedRowByMinus + 1}
            };
        });

        idRowArray_before.forEach(eachObject => {
            if(eachObject.id == uppedIdRowByMinus.id) {
                idRowArray_after.push(uppedIdRowByMinus);
            } else if (eachObject.id == downedIdRowByMinus.id) {
                idRowArray_after.push(downedIdRowByMinus);
            };
        });
    };

    // 변경된 id값 idArrayForm_after로 묶기
    const idArrayForm_after = [];
    idRowArray_after.forEach(eachObject2 => {
        idArrayForm_after.push(eachObject2.id);
    });

    // 변경된 idRowObject idRowArray_before_edited로 묶기
    const idRowArray_before_edited = [];
    idRowArray_before.forEach(eachObject3 => {
        idArrayForm_after.forEach(eachIdFrom_after => {
            if(eachObject3.id == eachIdFrom_after) {
                idRowArray_before_edited.push(eachObject3);
            };
        });
    });
    
    // idRowArray_before에서 idRowArray_before_edited 빼기
    idRowArray_before_edited.forEach(function(item) {
        const index = idRowArray_before.indexOf(item);
        if(index !== -1) {
            idRowArray_before.splice(index, 1);
        };
    });

    // idRowArray_before와  idRowArray_after 더하기
    const idRowArray_result = idRowArray_before.concat(idRowArray_after);
    rowBox.after = idRowArray_result;

    // objectById 업데이트하기
    everyIdArrayOfLayer.forEach(eachId2 => {
        idRowArray_result.forEach(eachObject4 => {
            if(eachId2 == eachObject4.id) {
                objectById[eachId2].row = eachObject4.row;
            };
        });
    });

    // updateList
    updateList(selectedLayer);
    setLiColorByLi(selectedLayer, "rowEdit");

};

function getIdRowArray(layerHere) {
    const everyIdArrayOfLayer = getEveryIdArrayOfLayer(layerHere);
    const idRowArray = [];
    everyIdArrayOfLayer.forEach(eachId => {
        const objectForArray = {id: eachId, row: objectById[eachId].row};
        idRowArray.push(objectForArray);
    });
    
    return idRowArray;
};

function updateRowEdit() {	

    const packagedEditedIdRowArray = packageEditedIdRowArray();

    const isChanged = packagedEditedIdRowArray.length;
    if(isChanged > 0 ) {
        if (confirm("변경된 순서를 저장하시겠습니까?")) {
            const idArray = Object.keys(objectById);
            idArray.forEach(eachId => {
                packagedEditedIdRowArray.forEach(eachObject => {
                    if(eachId == eachObject.id) {
                        requestUpdateRow(eachObject);
                    };
                });
            });
            const layer = selectedLi.layer;
            updateList(layer);
            keepSelectedData(layer, selectedLi.id);
            setLiColorByLi(layer);
            setupBtnShowOrHideByClassName("readLi");
        };
    } else {
        alert("변경된 순서가 없습니다.");
    };
};

function requestUpdateRow(packagedDataHere) {
	const inputId = packagedDataHere.id;
	const bpRef = db.ref("users")
						.child(userData.uid)
						.child("bigPicture");
	bpRef.child(inputId)
		.update(packagedDataHere, (e) => {
		alert("수정되었습니다."); // 최종에만 뜨도록 하기
		console.log("*keep* update completed = ", e);
	});
};

function requestUpdateRow_createAndDelete(packagedDataHere) {
	const inputId = packagedDataHere.id;
	const bpRef = db.ref("users")
						.child(userData.uid)
						.child("bigPicture");
	bpRef.child(inputId)
		.update(packagedDataHere, (e) => {
		console.log("*keep* update completed = ", e);
	});
};

function packageEditedIdRowArray() {
    const idRowArray_before = rowBox.before;
    const idRowArray_after = rowBox.after;
    const idRowArray_edited = [];
    idRowArray_after.forEach((element) => {
        idRowArray_before.forEach(eachObject => {
            if(element.id == eachObject.id && element.row != eachObject.row){
                const editedObject = {id: element.id, row: element.row};
                idRowArray_edited.push(editedObject);
            };
        });
    });

    return idRowArray_edited;
};

function packageEditedIdRowArray_create() {

    const selectedLayer = Number(selectedLi.layer);
    const everyIdArrayOfLayer = getEveryIdArrayOfLayer(selectedLayer);
        
    const idRowArray_edited = [];
    everyIdArrayOfLayer.forEach(eachId => {
        const row_before = objectById[eachId].row;
        idRowArray_edited.push({id: eachId, row: row_before + 1});
    });

    return idRowArray_edited;
};

function packageEditedIdRowArray_delete() {

    const selectedLayer = Number(selectedLi.layer);
    const selectedRow = Number(selectedLi.row);
    const everyIdArrayOfLayer = getEveryIdArrayOfLayer(selectedLayer);
        
    const idRowArray_edited = [];
    everyIdArrayOfLayer.forEach(eachId => {
        const row_before = objectById[eachId].row;
        if(row_before > selectedRow) {
            idRowArray_edited.push({id: eachId, row: row_before - 1});
        };
    });

    return idRowArray_edited;
};

function cancelRowEdit() {
    if (confirm("[순서 변경 취소]를 진행하시겠습니까?")) {
        const selectedLayer = Number(selectedLi.layer);
        const everyIdArrayOfLayer = getEveryIdArrayOfLayer(selectedLayer);
        const idRowArray_before = rowBox.before;

        // objectById before로 재업데이트하기
        everyIdArrayOfLayer.forEach(eachId => {
            idRowArray_before.forEach(eachObject => {
                if(eachId == eachObject.id) {
                    objectById[eachId].row = eachObject.row;
                };
            });
        });

        setupBtnShowOrHideByClassName();
        updateList(selectedLayer);
    };

};

function setupColorRowEditMode(idHere, modeHere) {

	const liElement = document.getElementById(idHere);
	const liArray = liElement.parentNode.childNodes;

    for(let i = 0; i < liArray.length - 1; i++){
        if (modeHere == "editing") {
            liArray[i].style.border = "3px solid" + COLOR_FOCUSED_YELLOW;
        } else {
            liArray[i].style.border = "";
        };
    };

};