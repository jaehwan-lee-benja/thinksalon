function rowEditStart() {
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
        eventListenerBox_row.before = {id: selectedLi.id, row: selectedLi.row};
        console.log("eventListenerBox_row.before = ", eventListenerBox_row.before, " | txt = ", selectedLi.contents.txt);
        const selectedLayer = selectedLi.layer;
        const everyIdArrayOfLayer = getEveryIdArrayOfLayer(selectedLayer);
        const maxRow = everyIdArrayOfLayer.length - 1;
        const selectedRow = selectedLi.row;
        console.log("selectedRow = ", selectedRow);
        const uppedRow = selectedRow + 1;
        if(uppedRow < maxRow) {
            console.log("uppedRow = ", uppedRow);
            eventListenerBox_row.after = {id: selectedLi.id, row: uppedRow};
        } else {
            console.log("maxRow = ", maxRow);
            eventListenerBox_row.after = {id: selectedLi.id, row: maxRow};
        };
        simulateRow("up");
        console.log("eventListenerBox_row = ", eventListenerBox_row);
    });
};

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