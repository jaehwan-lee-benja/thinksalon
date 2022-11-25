function rowEditStart() {

    const selectedLayer = selectedLi.layer;
    eventListenerBox_row.before = getIdRowArray(selectedLayer);
    
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
        eventListenerBox_row.after = idRowArray_result;

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
        setLiColorByLi(selectedLayer);
}

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