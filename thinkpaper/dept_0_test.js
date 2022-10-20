const testTitleHere = "li row 값 넣기";

//  ========== 테스트 생각 ==========
//  create 쪽을 하고 있다.
//  object에 row 값을 넣어야한다.
//  해당 layer 중, li의 갯수를 새어야한다.
//  
//  =========== 시나리오 ===========
//  [v]  버튼을 누른다.
//  []  row 갯수를 샌다.
//      []  해당하는 레이어로 검색한다.
//  []  row 값이 나온다.
//  []  새로 나오는 row 값이 나온다.
//  []  object에 넣는다.
//  ==============================

(function() {
    const testTitle = document.getElementById("testTitle");
    testTitle.innerHTML = testTitleHere;
})();

// function countRow(layerHere) {
//     const layer = 0; // layerHere 위치
// 	const idArray = Object.keys(objectById);
// 	console.log("idArray = ", idArray);
//     const idArrayLength = idArray.length;
//     console.log("idArrayLength = ", idArrayLength);
//     const objectArrayFromSameLayer = [];
//     idArray.forEach( eachId => {
//         const layerOfEachObject = objectById[eachId].layer;
//         console.log("layerOfEachObject = ", layerOfEachObject);
//         if(layerOfEachObject == layer) {
//             objectArrayFromSameLayer.push(layerOfEachObject);
//         };
//     });
//     const liCount = objectArrayFromSameLayer.length;
//     const newLiRow =  liCount + 1;
//     console.log("newLiRow = ", newLiRow);
//     return newLiRow;
// };