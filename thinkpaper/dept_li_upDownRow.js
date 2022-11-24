function rowEditStart() {

    const selectedLayer = selectedLi.layer;
    eventListenerBox_row.before = getIdRowArray(selectedLayer);

	simulateRow();
};

function simulateRow(upOrDownHere) {

	const layer = selectedLi.layer;
    const rowBefore = eventListenerBox_row.before.row;
    const rowAfter = eventListenerBox_row.after.row;
    if(upOrDownHere == "up") {
        objectById[selectedLi.id].row = rowAfter;
        selectedLi.row = rowAfter;
        const everyIdArrayOfLayer = getEveryIdArrayOfLayer(layer);
        everyIdArrayOfLayer.forEach(eachId => {
            const eachRow = objectById[eachId].row;

            console.log("eachRow1 = ", eachRow);
            console.log("rowBefore = ", rowBefore);
            console.log("rowAfter = ", rowAfter);

            if (eachRow == rowAfter) {
                console.log("eachRow2 = ", eachRow);
                objectById[eachId].row = rowAfter - 1;
                console.log("eachRow3 = ", eachRow);
            };
        })
    };
    console.log("it worked!");
    updateList(layer);
    keepSelectedData(layer, selectedLi.id);
    setLiColorByLi(layer);
};

function eventListener_upRow_btn() {
    const upRow_btn = document.getElementById("upRow_btn");
    upRow_btn.addEventListener("click", (e) => {
        
        const selectedLayer = selectedLi.layer;
        eventListenerBox_row.before = getIdRowArray(selectedLayer);

        // 바뀌는 id row 정립하기
        const everyIdArrayOfLayer = getEveryIdArrayOfLayer(selectedLayer);
        const maxRow = everyIdArrayOfLayer.length - 1;
        const selectedId = selectedLi.id;
        const selectedRow = selectedLi.row;
        const uppedRow = selectedRow + 1;
        let downedIdRow = {};
        let uppedIdRow = {};
        
        // 값 내리기
        everyIdArrayOfLayer.forEach(eachId => {
            if(objectById[eachId].row == uppedRow) {
                downedIdRow = {id: eachId, row: uppedRow - 1}
            };
        });
        console.log("downedIdRow = ", downedIdRow);

        // 값 올리기
        if(uppedRow < maxRow) {
            uppedIdRow = {id: selectedId, row: uppedRow};
        } else {
            uppedIdRow = {id: selectedId, row: maxRow};
        };
        console.log("uppedIdRow = ", uppedIdRow);

        // eventListenerBox_row.after 업데이트하기
        let idRowArray_after = [];

        console.log("eventListenerBox_row.before = ", eventListenerBox_row.before);
        eventListenerBox_row.before.forEach(eachObject => {
            if(eachObject.id == downedIdRow.id) {
                console.log("push_downed!");
                idRowArray_after.push(downedIdRow);
            };
            if(eachObject.id == uppedIdRow.id) {
                console.log("push_upped!");
                idRowArray_after.push(uppedRow);
            };
        });

        idRowArray_after.forEach(eachObject_after => {
            eventListenerBox_row.before.forEach(eachObject_before => {
                if(eachObject_before != eachObject_after) {
                    idRowArray_after.push(eachObject_before);
                };
            });
        });

        eventListenerBox_row.after = idRowArray_after;
        console.log("idRowArray_after = ", idRowArray_after);
        // 위 값부터 꼬였음. 확인 필요!
        
        // objectById 업데이트하기
        everyIdArrayOfLayer.forEach(eachId => {
            // console.log("eachRow = ", objectById[eachId].row);
            idRowArray_after.forEach(eachObjectForUpdate => {
                const eachIdFormObject = eachObjectForUpdate.id;
                const eachRowFormObject = eachObjectForUpdate.row;
                // console.log("eachRowFormObject = ", eachRowFormObject);
                if(eachId == eachIdFormObject) {
                    // console.log("checkpoint!");
                    objectById[eachId].row = eachRowFormObject;
                };
            });
        });

        // updateList
        updateList(selectedLayer);
    });
};

function getIdRowArray(layerHere) {
    const everyIdArrayOfLayer = getEveryIdArrayOfLayer(layerHere);
    const idRowArray = [];
    everyIdArrayOfLayer.forEach(eachId => {
        const objectForArray = {id: eachId, row: objectById[eachId].row};
        idRowArray.push(objectForArray);
    });
    return idRowArray;
}

function downRow() {

};

function packageEditedRow(layerHere) {	
	
	if (confirm("변경된 순서를 저장하시겠습니까?")) {

		const packagedRowData = {};
		const id = selectedLi.id;
		const originalRow = selectedLi.row;
		packagedRowData["row"] = originalRow + 1;
		return packagedRowData;

	};

};