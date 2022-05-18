// const firebase = appFireBase; // firebase 자체의 버전 이슈로 있던 기능

const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";

// --------------------------------------------------
// *** gloabl items
// --------------------------------------------------

// HQ dept.
let userData = {}; // 리뷰: user의 계정 정보를 지니고 있는 오브젝트
let bpDataPool = {}; // 리뷰: 서버의 bpData를 로컬로 그대로 가져온 오브젝트
	// 투두: 오브젝트의 구성을 서버와 동일하게 맞춰야함
let bpTitleArray = []; // 리뷰: bpData에 연동되어 모든 id를 저장하고 있는 오브젝트
	// [이 오브젝트의 역할에 대한 생각정리]
	// 1. 기존에는 어떤 오브젝트에 접근하기 위한 키로 활용하였음
	// 2. 어떤 오브젝트에 접근하기위한 키가 필요한가? 라는 생각이 들었음
	// 3. A방식: 어떤 오브젝트를 불러오기 위해서, 오브젝트 키를 선정하여 데이터를 가져왔다.
	// 4. 이 방식은 아래 세가지 절차로 진행된다.
	//	1) bpDataPool에서 오브젝트의 속성 파악하기 - 예) isMainBp가 있는가?
	//	2) 해당 속성으로 파악된 키 갖기 예) isMainBp가 포함된 id가 무엇인가?
	//	3) 해당 키로 bpDataPool에서 읽어오기 예) 그 id의 bpData를 읽어오기
	// 5. 그런데, 여기서 아래와 같은 방식으로 개선이 가능하다.
	//	1) bpData의 속성을 파악하고, 해당 parent의 데이터를 가져온다.
	// 이렇게되면, global에 memory로 남겨놓고, id 상태값을 비교하여 진행하지 않아도된다.
	// 이렇게 개선되기 위해서는 5-1)의 기능을 구현할 수 있는 로직이 필요하다.
	
	function spoonMainBp() {
		// bpDataPool 중 main 값 포착하기

		// [질문] 오브젝트에서 'main'을 가리킬 수 있는 방법
		for (let key in bpDataPool) {
			console.log(key, ":" ,bpDataPool[key]);
		};

		// main의 parent 값 포착하기
		// parent 값 중 원하는 데이터 오브젝트로 묶기 or 그대로 ui에 뿌리기
		// - 오브젝트, ui에 뿌리기 경우, 데이터 수정시 오브젝트로 묶지 않고, 바로 진행하는 것이 더 깔끔할 것 같다.
	};
	// bpIdArray로 바꾸기, selectbox는 별도로 만들기
let spoonMemory = {}; // 리뷰: 현재 direction, navi, actionPlan의 id값을 지니고 있는 메모리 오브젝트
let mainTagMemory = {};

// stage dept.
let spoonedBpData = {};

// package dept.
let packagedNewBpData = {};
let packagedEditedBpData = {};
let packagedRemoveBpData = {};
let setMainTagMemory = {};
let packagedMemory = {};

(function() {
	logIn();
})();

// --------------------------------------------------
// *** logIn Manager
// --------------------------------------------------
function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestReadUserData(user);
			requestReadBpData(user); // 점검필요
			openEditPaperByDbclick();
		} else {
			window.location.replace("login.html");
		};
	});
}; // 점검중

function logOut() {
	firebase.auth().signOut();
}; // 점검완료

// ==================================================
// *** StoL dept
// ==================================================

// --------------------------------------------------
// *** StoL manager
// --------------------------------------------------

function requestReadUserData(user) {
	const userRef = db.ref("users").child(user.uid).child("user");
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			value["uid"] = childSnap.key;
			userData[key] = value;
		});
		printUserData(userData);
	});
}; // 완료

function requestReadBpData(user) {

	const userRef = db.ref("users").child(user.uid).child("bpData");
	
	userRef.on("value", (snapshot) => {
		// 콜백은 서버에 데이터 변경시 자동으로 작동한다.
		// 참고: https://firebase.google.com/docs/reference/js/v8/firebase.database.Reference#on
		
		// requestUpdatePackagedBpData 진행시 서버에서 삭제되었지만, 로컬에서 삭제가 안되는 경우를 방지
		emptyBpDataPool();

		snapshot.forEach(childSnap => {
			let bpIdsKey = childSnap.key;
			let bpDataValue = childSnap.val();
			// let bpTitle = bpDataValue.bpTitle;
			// bpDataPool[bpTitle] = bpDataValue;
			bpDataPool[bpIdsKey] = bpDataValue;
			bpDataPool[bpIdsKey]["bpId"] = bpIdsKey;
		});

		// [개발] isMainBp에 대한 리뷰구간이 여기서 필요하겠다.
		bpTitleArray = Object.keys(bpDataPool).sort();
		mainTagMemory["bpTitle"] = pointMainBpTitle();

		if (bpTitleArray.length > 0) {
			processSpoonToPrint();
		} else {
			printItIfNoBpData();
		};
	});
}; // 점검중

// ==================================================
// *** LtoS dept
// ==================================================

// --------------------------------------------------
// *** LtoS manager
// --------------------------------------------------

function requestUpdateMainTag() {
	requestUpdateEveryIsMainBpValueToBlank();
	requestUpdateIsMainBpValueToMain();
}; // 점검중

	function requestUpdateEveryIsMainBpValueToBlank() {

		let updatedBpData = {};
		updatedBpData["isMainBp"] = "";

		if (bpTitleArray.length > 0){
			for (let i = 0; i < bpTitleArray.length; i++) {
				let bpIds = bpDataPool[bpTitleArray[i]].bpId;
				db.ref("users")
					.child(userData.uid)
					.child("bpData")
					.child(bpIds)
					.update(updatedBpData, (e) => {
					console.log("** update completed = ", e);
					});
			};
		};
	}; // 점검중

	function requestUpdateIsMainBpValueToMain() {

		let updatedBpData = {};
		updatedBpData["isMainBp"] = "main";

		if (bpTitleArray.length > 0){
			for (let i = 0; i < bpTitleArray.length; i++) {
				if (bpDataPool[bpTitleArray[i]].bpTitle == setMainTagMemory["bpTitle"]) {
					let bpIds = bpDataPool[bpTitleArray[i]].bpId;
					db.ref("users")
						.child(userData.uid)
						.child("bpData")
						.child(bpIds)
						.update(updatedBpData, (e) => {
						console.log("** update completed = ", e);
						}); // [오류 확인하기]
				};
			};
		};

	}; // 점검중

function requestPushPackagedBpData(packagedBpDataHere) {
	console.log("requestPushPackagedBpData start here");
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.push(packagedBpDataHere);
}; // 점검중

function requestPushPackagedNaviCard(packagedBpIdHere, packagedNaviCardHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child(packagedBpIdHere)
	.push(packagedNaviCardHere);
}; // 점검중

function requestUpdatePackagedBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child(packagedBpDataHere.bpId)
	.update(packagedBpDataHere, (e) => {
		console.log("** update completed = ", e);
		});
}; // 점검중

function requestRemovePackagedBpData(packagedBpDataHere) {
	db.ref("users")
	.child(userData.uid)
	.child("bpData")
	.child(packagedBpDataHere.bpId)
	.remove();
}; // 점검중



// --------------------------------------------------
// *** userData Manager
// --------------------------------------------------

function printUserData(userData) {
	let userName = userData.name;
	let userEmail = userData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
}; // 점검중

// --------------------------------------------------
// *** bpDataPool Manager
// --------------------------------------------------

function emptyBpDataPool() {
	for (let i = 0; i < bpTitleArray.length; i++) {
		delete bpDataPool[bpTitleArray[i]];
	};
};

// --------------------------------------------------
// *** bpTitle Manager
// --------------------------------------------------

function pickupBpTitleSpoonBySelectbox() {
	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value;
	if (selectboxBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		return spoonMemory["bpTitle"];
	} else {
		spoonMemory["bpTitle"] = selectboxBpTitleValue;
		return spoonMemory["bpTitle"];
	};
};

function pickupBpTitleSpoon() {
	let selectboxBpTitleValue = selectorById("selectboxBpTitle").value;

	if (selectboxBpTitleValue == SELECTBOX_BPTITLE_VALUE_INIT) {
		// by reloaded or openMainBp_btn(=reloaded)
		console.log("** pickupBpTitleSpoon by reloaded or openMainBp_btn(=reloaded)");
		spoonMemory["bpTitle"] = mainTagMemory["bpTitle"];
		return spoonMemory["bpTitle"];
	} else {
		if (spoonMemory["bpTitle"] != "") {
			if (spoonMemory["bpTitle"] == packagedMemory["bpTitle"]) {
				// by requestRemove - remove 이후, reload를 하기때문에, 당장 작동되는 부분은 아님.
				console.log("** pickupBpTitleSpoon by requestRemove or else");
				spoonMemory["bpTitle"] = mainTagMemory["bpTitle"];
				return spoonMemory["bpTitle"];
			} else {
				// by requestPush or requestUpdate
				console.log("** pickupBpTitleSpoon by requestPush or requestUpdate");
				spoonMemory["bpTitle"] = packagedMemory["bpTitle"];
				return spoonMemory["bpTitle"];
			};
		};
	};
}; // 점검중

function pickupNaviIdSpoon() {

	let spoonedKeysArray = Object.keys(bpDataPool[spoonMemory["bpTitle"]]);
	const filterKeys = (query) => {
		return spoonedKeysArray.filter(eachKey => eachKey.indexOf(query) > -1);
	};
	spoonMemory["naviId"] = filterKeys("navi").toString();
	return spoonMemory["naviId"];
};

function pickupActionPlanIdSpoon() {
	let spoonedKeysArray = Object.keys(bpDataPool[spoonMemory["bpTitle"]][spoonMemory["naviId"]]);
	const filterKeys = (query) => {
		return spoonedKeysArray.filter(eachKey => eachKey.indexOf(query) > -1);
	};
	let actionPlanIdSpoon = filterKeys("actionPlan").toString();
	spoonMemory["actionPlanId"] = actionPlanIdSpoon;
	return actionPlanIdSpoon;
};

// --------------------------------------------------
// *** mainTag Manager
// --------------------------------------------------

function pointMainBpTitle() {
	let IsThereAnyMainBpResult = monitorIsThereAnyMainBp();
	if (IsThereAnyMainBpResult == true){
		for (let i = 0; i < bpTitleArray.length; i++) {
			let isMainBpValue = bpDataPool[bpTitleArray[i]].isMainBp;
			let mainBpTitle = bpDataPool[bpTitleArray[i]].bpTitle;
			if (isMainBpValue == "main") {
				mainTagMemory["bpTitle"] = mainBpTitle;
				return mainTagMemory["bpTitle"];
			};
		};
	};
}; // 점검중

// 질문
function monitorIsThereAnyMainBp() {
	
	let isMainBpValueArray = [];

	for (let i = 0; i < bpTitleArray.length; i++) {
		let isMainBpValue = bpDataPool[bpTitleArray[i]].isMainBp;
		isMainBpValueArray.push(isMainBpValue);
	};

	let uniqueIsMainBpValueArray = isMainBpValueArray.filter((element, index) => {
			return isMainBpValueArray.indexOf(element) == index;
		});

	if (uniqueIsMainBpValueArray.length != 0){
		if (uniqueIsMainBpValueArray.length == 1){
			if(uniqueIsMainBpValueArray[0] == ""){
				console.log("** There is no mainBp");
				printItIfNoBpData();
				putSelectbox("selectboxBpTitle");
				return false;
			} else {
				// console.log("** There is mainBp1");
				return true;
			};
		} else {
			// console.log("** There is mainBp2");
			return true;
		};
	};
}; // 점검중

function setMainBp() {
	setMainTagMemory["bpTitle"] = spoonedBpData.bpTitle;
	requestUpdateMainTag();
}; // 점검중

function setAltMainBpTitle(packagedBpDataHere) {
	let filteredBpTitleArray = [];
	for (let i = 0; i < bpTitleArray.length; i++) {
		if (bpTitleArray[i] != packagedBpDataHere.bpTitle) {
			filteredBpTitleArray.push(bpTitleArray[i]);
		};
	};
	filteredBpTitleArray.sort();
	setMainTagMemory["bpTitle"] = filteredBpTitleArray[0];
	requestUpdateIsMainBpValueToMain();
}; // 점검중

function gotoMainBp() {
	spoonMemory["bpTitle"] = mainTagMemory["bpTitle"];
	spoonBpData(mainTagMemory["bpTitle"]);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
}; // 점검중

// --------------------------------------------------
// *** stage Manager
// --------------------------------------------------

function spoonBpData(bpTitleSpoonHere) {

	let bpTitleSpoon = bpTitleSpoonHere; 
	let naviIdSpoon = pickupNaviIdSpoon();
	let actionPlanIdSpoon = pickupActionPlanIdSpoon();

	let spoonedBpDataSet = {};
	spoonedBpDataSet = bpDataPool[bpTitleSpoon];

	let spoonedNaviDataSet = {};
	spoonedNaviDataSet = spoonedBpDataSet[naviIdSpoon];
	
	let spoonedActionPlanDataSet = {};
	spoonedActionPlanDataSet = spoonedNaviDataSet[actionPlanIdSpoon];

	let spoonedBpDataInFunction = {};
	spoonedBpDataInFunction["bpId"] = spoonedBpDataSet["bpId"];
	spoonedBpDataInFunction["createdDate"] = spoonedBpDataSet["createdDate"];
	spoonedBpDataInFunction["editedDate"] = spoonedBpDataSet["editedDate"];
	spoonedBpDataInFunction["bpTitle"] = spoonedBpDataSet["bpTitle"];
	spoonedBpDataInFunction["direction"] = spoonedBpDataSet["direction"];
	spoonedBpDataInFunction[naviIdSpoon] = {};
	spoonedBpDataInFunction[naviIdSpoon]["createdDate"] = spoonedNaviDataSet["createdDate"];
	spoonedBpDataInFunction[naviIdSpoon]["editedDate"] = spoonedNaviDataSet["editedDate"];
	spoonedBpDataInFunction[naviIdSpoon]["naviId"] = naviIdSpoon;
	spoonedBpDataInFunction[naviIdSpoon]["naviArea"] = spoonedNaviDataSet["naviArea"];
	spoonedBpDataInFunction[naviIdSpoon]["naviB"] = spoonedNaviDataSet["naviB"];
	spoonedBpDataInFunction[naviIdSpoon]["naviA"] = spoonedNaviDataSet["naviA"];
	spoonedBpDataInFunction[naviIdSpoon][actionPlanIdSpoon] = {};
	spoonedBpDataInFunction[naviIdSpoon][actionPlanIdSpoon]["createdDate"] = spoonedActionPlanDataSet["createdDate"];
	spoonedBpDataInFunction[naviIdSpoon][actionPlanIdSpoon]["editedDate"] = spoonedActionPlanDataSet["editedDate"];
	spoonedBpDataInFunction[naviIdSpoon][actionPlanIdSpoon]["actionPlanId"] = actionPlanIdSpoon;
	spoonedBpDataInFunction[naviIdSpoon][actionPlanIdSpoon]["actionPlan"] = spoonedActionPlanDataSet["actionPlan"];
	
	spoonedBpData = spoonedBpDataInFunction;

	return spoonedBpDataInFunction;
}; // 점검중

function processSpoonToPrint() {
	let bpTitleSpoon = pickupBpTitleSpoon();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData(); 
	putSelectbox("selectboxBpTitle");
}; // 점검중

function packageNewBpData() {

	console.log("packageNewBpData start here");

	let monitorBpTitleBlankOrDuplicatesResult = monitorBpTitleBlankOrDuplicates();
	if (monitorBpTitleBlankOrDuplicatesResult == true) {
		
		console.log("monitorBpTitleBlankOrDuplicatesResult == true");

		// [질문] id를 미리 받는 방법
		let characterId = "character" + timeStamp().replace(".", ""); 
		let directionId = "direction" + timeStamp().replace(".", "");
		let naviId = "navi" + timeStamp().replace(".", "");
		let actionPlanId = "actionPlan" + timeStamp().replace(".", "");

		console.log("Ids = ", characterId, "|", directionId, "|", naviId, "|", actionPlanId);

		//	밥상
		let packagedBpDataInFunction = {};

			// 1. 큰그릇 이름 붙이기
			packagedBpDataInFunction["character"] = {};

			// 2. Id key만들기
			packagedBpDataInFunction["character"][characterId] = {};
			let characterUnit = packagedBpDataInFunction["character"][characterId]; 
		
				//	3. 작은그릇1(콘테이너)
				characterUnit["container"] = {};
				let characterContainer = characterUnit["container"];
					characterContainer["id"] = characterId;
					characterContainer["createdDate"] = timeStamp();
					characterContainer["editedDate"] = timeStamp();
					characterContainer["main"] = "";
					characterContainer["contents"] = {};
					characterContainer["contents"]["character"] = selectorById("bpTitle").value.trim();

				// 	1. 작은그릇2(하위 큰그릇) 이름 붙이기
				characterUnit["direction"] = {};

				// 	2. Id key만들기
				characterUnit["direction"][directionId] = {};
				let directionUnit = characterUnit["direction"][directionId];

					//	3. 작은그릇1(콘테이너)
					directionUnit["container"] = {};
					let directionContainer = directionUnit["container"];
						directionContainer["id"] = directionId;
						directionContainer["createdDate"] = timeStamp();
						directionContainer["editedDate"] = timeStamp();
						directionContainer["main"] = "";
						directionContainer["contents"] = {};
						directionContainer["contents"]["direction"] = selectorById("direction").value.trim();

					// 	1. 작은그릇2(하위 큰그릇) 이름 붙이기
					directionUnit["navi"] = {};

					// 	2. Id key만들기
					directionUnit["navi"][naviId] = {};
					let naviUnit = directionUnit["navi"][naviId];

						//	3. 작은그릇1(콘테이너)
						naviUnit["container"] = {};
						let naviContainer = naviUnit["container"];
							naviContainer["id"] = naviId;
							naviContainer["createdDate"] = timeStamp();
							naviContainer["editedDate"] = timeStamp();
							naviContainer["main"] = "";
							naviContainer["contents"] = {};
							naviContainer["contents"]["naviArea"] = selectorById("naviArea").value.trim();
							naviContainer["contents"]["naviB"] = selectorById("naviB").value.trim();
							naviContainer["contents"]["naviA"] = selectorById("naviA").value.trim();

						// 	1. 작은그릇2(하위 큰그릇) 이름 붙이기
						naviUnit["actionPlan"] = {};

						// 	2. Id key만들기
						naviUnit["actionPlan"][actionPlanId] = {};
						let actionPlanUnit = naviUnit["actionPlan"][actionPlanId];

							//	3. 작은그릇1(콘테이너)
							actionPlanUnit["container"] = {};
							let actionPlanContainer = actionPlanUnit["container"];
								actionPlanContainer["id"] = directionId;
								actionPlanContainer["createdDate"] = timeStamp();
								actionPlanContainer["editedDate"] = timeStamp();
								actionPlanContainer["main"] = "";
								actionPlanContainer["contents"] = {};
								actionPlanContainer["contents"]["actionPlan"] = selectorById("actionPlan").value.trim();

		// let IsThereAnyMainBpResult = monitorIsThereAnyMainBp();
		// if (IsThereAnyMainBpResult == true) {
		// 	packagedBpDataInFunction["isMainBp"] = ""
		// } else {
		// 	packagedBpDataInFunction["isMainBp"] = "main"
		// };

		packagedNewBpData = packagedBpDataInFunction;

		return packagedNewBpData;

	};

	return null;
}; // 점검중

// function packageNewBpData() {

// 	let monitorBpTitleBlankOrDuplicatesResult = monitorBpTitleBlankOrDuplicates();
// 	if (monitorBpTitleBlankOrDuplicatesResult == true) {

// 		let naviId = "navi" + timeStamp().replace(".", "");
// 		let actionPlanId = "actionPlan" + timeStamp().replace(".", "");

// 		// 적혀있는 내용들로 패키징하기
// 		let packagedBpDataInFunction = {};
// 		packagedBpDataInFunction["createdDate"] = timeStamp(); // new에만 해당함
// 		packagedBpDataInFunction["editedDate"] = timeStamp();
// 		packagedBpDataInFunction["bpTitle"] = selectorById("bpTitle").value.trim();
// 		packagedBpDataInFunction["direction"] = selectorById("direction").value.trim();
// 		packagedBpDataInFunction[naviId] = {};
// 		packagedBpDataInFunction[naviId]["createdDate"] = timeStamp(); // new에만 해당함
// 		packagedBpDataInFunction[naviId]["editedDate"] = timeStamp();
// 		packagedBpDataInFunction[naviId]["naviId"] = naviId;
// 		packagedBpDataInFunction[naviId]["naviArea"] = selectorById("naviArea").value.trim();
// 		packagedBpDataInFunction[naviId]["naviB"] = selectorById("naviB").value.trim();
// 		packagedBpDataInFunction[naviId]["naviA"] = selectorById("naviA").value.trim();
// 		packagedBpDataInFunction[naviId][actionPlanId] = {};
// 		packagedBpDataInFunction[naviId][actionPlanId]["createdDate"] = timeStamp(); // new에만 해당함
// 		packagedBpDataInFunction[naviId][actionPlanId]["editedDate"] = timeStamp();
// 		packagedBpDataInFunction[naviId][actionPlanId]["actionPlanId"] = actionPlanId;
// 		packagedBpDataInFunction[naviId][actionPlanId]["actionPlan"] = selectorById("actionPlan").value.trim();

// 		let IsThereAnyMainBpResult = monitorIsThereAnyMainBp();
// 		if (IsThereAnyMainBpResult == true) {
// 			packagedBpDataInFunction["isMainBp"] = ""
// 		} else {
// 			packagedBpDataInFunction["isMainBp"] = "main"
// 		};

// 		packagedNewBpData = packagedBpDataInFunction;

// 		return packagedNewBpData;

// 	};

// 	return null;
// }; // 점검중

function packageNewNaviCard() {

	let monitorBpTitleBlankOrDuplicatesResult = monitorBpTitleBlank();
	if (monitorBpTitleBlankOrDuplicatesResult == true) {

		let actionPlanId = "actionPlan" + timeStamp().replace(".", "");

		// 적혀있는 내용들로 패키징하기
		packagedNewNaviCardInFunction = {};
		packagedNewNaviCardInFunction["createdDate"] = timeStamp(); // new에만 해당함
		packagedNewNaviCardInFunction["editedDate"] = timeStamp();
		packagedNewNaviCardInFunction["naviArea"] = selectorById("naviArea").value.trim();
		packagedNewNaviCardInFunction["naviB"] = selectorById("naviB").value.trim();
		packagedNewNaviCardInFunction["naviA"] = selectorById("naviA").value.trim();
		packagedNewNaviCardInFunction[actionPlanId] = {};
		packagedNewNaviCardInFunction[actionPlanId]["createdDate"] = timeStamp(); // new에만 해당함
		packagedNewNaviCardInFunction[actionPlanId]["editedDate"] = timeStamp();
		packagedNewNaviCardInFunction[actionPlanId]["actionPlanId"] = actionPlanId;
		packagedNewNaviCardInFunction[actionPlanId]["actionPlan"] = selectorById("actionPlan").value.trim();

		let IsThereAnyMainBpResult = monitorIsThereAnyMainBp();
		if (IsThereAnyMainBpResult == true) {
			packagedNewNaviCardInFunction["isMainBp"] = ""
		} else {
			packagedNewNaviCardInFunction["isMainBp"] = "main"
		};

		// packagedNewBpData = packagedBpDataInFunction;

		return packagedNewNaviCardInFunction;

	};

	return null;
}; // 점검중

function packageEditedBpData() {
	let monitorBpTitleBlankResult = monitorBpTitleBlank();

	if (monitorBpTitleBlankResult == true) {

		let naviId = spoonMemory["naviId"];
		let actionPlanId = spoonMemory["actionPlanId"];

		// 적혀있는 내용들로 패키징하기
		let packagedBpDataInFunction = {};
		packagedBpDataInFunction["createdDate"] = spoonedBpData["createdDate"];
		packagedBpDataInFunction["bpId"] = spoonedBpData["bpId"]; // edited에만 해당함
		packagedBpDataInFunction["editedDate"] = timeStamp();
		packagedBpDataInFunction["bpTitle"] = selectorById("bpTitle").value.trim();
		packagedBpDataInFunction["direction"] = selectorById("direction").value.trim();
		packagedBpDataInFunction[naviId] = {};
		packagedBpDataInFunction[naviId]["createdDate"] = spoonedBpData[naviId]["createdDate"];
		packagedBpDataInFunction[naviId]["editedDate"] = timeStamp();
		packagedBpDataInFunction[naviId]["naviId"] = naviId;
		packagedBpDataInFunction[naviId]["naviArea"] = selectorById("naviArea").value.trim();
		packagedBpDataInFunction[naviId]["naviB"] = selectorById("naviB").value.trim();
		packagedBpDataInFunction[naviId]["naviA"] = selectorById("naviA").value.trim();
		packagedBpDataInFunction[naviId][actionPlanId] = {};
		packagedBpDataInFunction[naviId][actionPlanId]["createdDate"] = spoonedBpData[naviId][actionPlanId]["createdDate"];
		packagedBpDataInFunction[naviId][actionPlanId]["editedDate"] = timeStamp();
		packagedBpDataInFunction[naviId][actionPlanId]["actionPlanId"] = actionPlanId;
		packagedBpDataInFunction[naviId][actionPlanId]["actionPlan"] = selectorById("actionPlan").value.trim();
		
		packagedEditedBpData = packagedBpDataInFunction;

		return packagedEditedBpData;

	};
}; // 점검중

// --------------------------------------------------
// *** UI Manager
// --------------------------------------------------

function printSpoonedBpData() {
	selectorById("dateChecked").innerHTML = spoonedBpData.editedDate.slice(0, 10); // editedDate중 가장 최근 것
	selectorById("bpTitle").value = spoonedBpData["bpTitle"];
	selectorById("direction").value = spoonedBpData["direction"];
	selectorById("naviArea").value = spoonedBpData[spoonMemory["naviId"]]["naviArea"];
	selectorById("naviB").value = spoonedBpData[spoonMemory["naviId"]]["naviB"];
	selectorById("naviA").value = spoonedBpData[spoonMemory["naviId"]]["naviA"];
	selectorById("actionPlan").value = spoonedBpData[spoonMemory["naviId"]][spoonMemory["actionPlanId"]]["actionPlan"];
	btnShowHideHandler("readPaper");
}; // 점검중

function printEmptySpoonedBpData() {
	selectorById("dateChecked").innerHTML = timeStamp().slice(0, 10);
	selectorById("bpTitle").value = "";
	selectorById("direction").value = "";
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";
	btnShowHideHandler("createFirstPaper");
}; // 점검중

function printEmptyNaviCard() {
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";
	btnShowHideHandler("createFirstPaper");
}; // 점검중

function uiHide(id) {
	selectorById(id).style.display = "none";
}; // 점검중

function uiShow(id) {
	selectorById(id).style.display = "initial";
}; // 점검중

function btnShowHideHandler(state) {

	uiHide("openEditPaper_btn");
	uiHide("cancelEditPaper_btn");
	uiHide("saveEditedPaper_btn");
	uiHide("saveNewPaper_btn");
	uiHide("removePaper_btn");
	uiHide("openNewPaper_btn");

	switch(state){
		case "createFirstPaper" :
			uiShow("saveNewPaper_btn");
			editModeHandler("editing");
			break;
		case "openNewPaper" :
			uiShow("saveNewPaper_btn");
			uiShow("cancelEditPaper_btn")
			editModeHandler("editing");
			break;
		case "readPaper" :
			uiHide("guideMessage");
			uiShow("openEditPaper_btn");
			uiShow("openNewPaper_btn");
			uiShow("removePaper_btn");
			editModeHandler("reading");
			break;
		case "editPaper" :
			uiShow("saveEditedPaper_btn");
			uiShow("cancelEditPaper_btn");
			uiShow("saveNewPaper_btn");
			uiShow("removePaper_btn");
			editModeHandler("editing");
			break;
		default:
			let state = null;
	}
	btnShowHideHandler_mainBp(state);
	resizeTextarea();
}; // 점검중

function editModeHandler(paperMode) {
	function textareaReadOnly(id, check){
		selectorById(id).readOnly = check;
	};
	if (paperMode == "editing") {
		selectorById("divPaperMode").innerHTML = "작성모드";
		selectorById("gridMainFrame").style.color = "#9CC0E7";
		textareaReadOnly("bpTitle", false);
		textareaReadOnly("direction", false);
		textareaReadOnly("naviArea", false);
		textareaReadOnly("naviB", false);
		textareaReadOnly("naviA", false);
		textareaReadOnly("actionPlan", false);
		textareaBorderColorHandler("2px", "#9CC0E7");
	} else {
		selectorById("divPaperMode").innerHTML = "읽기모드";
		selectorById("gridMainFrame").style.color = "#424242";
		textareaReadOnly("bpTitle", true);
		textareaReadOnly("direction", true);
		textareaReadOnly("naviArea", true);
		textareaReadOnly("naviB", true);
		textareaReadOnly("naviA", true);
		textareaReadOnly("actionPlan", true);
		textareaBorderColorHandler("1px", "#c8c8c8");
	};
}; // 점검중

function textareaBorderColorHandler(px, color) {
    setTimeout(()=>{
		// console.log("textareaBorderColorHandler |"+ px +" "+ color +"|");
		const selectorTextareaOnCard = document.getElementsByTagName("textarea");
		for (let i = 0; i < selectorTextareaOnCard.length; i++) {
			selectorTextareaOnCard[i].style.border = "solid " + px + color;
		};
	},1);
};

function btnShowHideHandler_mainBp(state) {
	uiHide("setMainBp_btn");
	uiHide("openMainBp_btn");
	uiHide("setMainBp_txt");
	if (spoonedBpData.isMainBp == "main") {
		uiShow("setMainBp_txt");
	} else {
		if(state != "createFirstPaper") {
			uiShow("openMainBp_btn");
			uiShow("setMainBp_btn");
		};
	};
}; // 점검중

function highLightBorder(id, color) {
	//return selectorById(id).style.borderColor = color;
}; // 점검중

function resizeTextarea() {
	// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
	const tx = document.getElementsByTagName("textarea");
	for (let i = 0; i < tx.length; i++) {
		tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		tx[i].addEventListener("input", OnInput, false);
	};

	function OnInput() {
		this.style.height = "auto";
		this.style.height = (this.scrollHeight) + "px";
	};
}; // 점검중

function printItIfNoBpData() {
	printEmptySpoonedBpData();
	selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
}; // 점검중

// --------------------------------------------------
// *** selectbox Manager
// --------------------------------------------------

function putSelectbox(selectboxId) {

	let selectbox = selectorById(selectboxId);
	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	// <option> 만들어서, bpTitleArray 넣기
	for (let i = 0; i < bpTitleArray.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(bpTitleArray[i]);
		let mainBpTitle = mainTagMemory["bpTitle"];
		let bpTitle = bpDataPool[bpTitleArray[i]].bpTitle;
		if(mainBpTitle == bpTitle){
			let mainBpTitleOptionMark = bpTitle + " ★";
			let mainTxt = document.createTextNode(mainBpTitleOptionMark);
			option.appendChild(mainTxt);
		} else {
			option.appendChild(txt);
		};
		option.setAttribute("value", bpTitleArray[i]);
		selectbox.insertBefore(option, selectbox.lastChild);
	};
	printBpTitleSpoonOnSelectbox();
}; // 점검중

function printBpTitleSpoonOnSelectbox() {

	for (let i = 0; i <= bpTitleArray.length; i++) {
		if(bpTitleArray.length == 0){
			selectorById("selectboxBpTitle").options[0].setAttribute("selected", true);
		} else {
			let selectorOption = selectorById("selectboxBpTitle").options[i];
			let optionValue = selectorOption.value;
			selectorOption.removeAttribute("selected");
			if (optionValue == spoonMemory["bpTitle"]) {
				selectorOption.setAttribute("selected", true);
			};
		};
	};

}; // 점검중

function selectBpTitleBySelectbox() {
	let bpTitleSpoon = pickupBpTitleSpoonBySelectbox();
	spoonBpData(bpTitleSpoon);
	printSpoonedBpData();
}; // testing..

// --------------------------------------------------
// *** CRUD Manager
// --------------------------------------------------

function saveNewPaper() {
	console.log("saveNewPaper start");
	let packagedBpData = packageNewBpData();
	console.log("packagedBpData @saveNewPaper  = ",packagedBpData);

	//sync Global packagedMemory["bpTitle"]
	if (packagedBpData != null) {
		console.log("packagedBpData != null");
		packagedMemory["bpTitle"] = packagedBpData.bpTitle;
		requestPushPackagedBpData(packagedBpData);
		alert("저장되었습니다.");
	};
}; // 점검중

function saveEditedPaper() {
	let packagedBpData = packageEditedBpData();

	//sync Global packagedMemory["bpTitle"]
	packagedMemory["bpTitle"] = packagedBpData.bpTitle;

	requestUpdatePackagedBpData(packagedBpData);
	alert("저장되었습니다.");

}; // 점검중


function removePaper() {
	packagedRemoveBpData = spoonedBpData;

	//sync Global packagedMemory["bpTitle"]
	packagedMemory["bpTitle"] = packagedRemoveBpData.bpTitle;
	
	if (packagedRemoveBpData.bpTitle == mainTagMemory["bpTitle"]) {
		setAltMainBpTitle(packagedRemoveBpData);
	};

	if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
		requestRemovePackagedBpData(packagedRemoveBpData);
		alert("삭제되었습니다.");
		location.reload();
	};
}; // 점검중

function openNewPaper() {
	printEmptySpoonedBpData();
	btnShowHideHandler("openNewPaper");
}; // 점검중

function openEditPaperByDbclick() {
	const TextareaOnCard = document.getElementsByTagName("textarea");
	for (let i = 0; i < TextareaOnCard.length; i++) {
		TextareaOnCard[i].addEventListener("dblclick", function (e) {
			if(bpTitleArray.length > 0){
				openEditPaper();
			};
		});
	};
}; // 점검중

function openEditPaper() {
	btnShowHideHandler("editPaper");
}; // 점검중

function openNewNaviCard() {
	printEmptyNaviCard();
	btnShowHideHandler("openNewPaper");
}; // 점검중

function saveNewNaviCard() {
	let packagedNewNaviCard = packageNewNaviCard();

	//sync Global packagedMemory["bpTitle"]
	if (packagedNewNaviCard != null) {
		// packagedMemory["bpTitle"] = packagedNewNaviCard.bpTitle;
		requestPushPackagedNaviCard(spoonedBpData.bpId, packagedNewNaviCard);
		alert("저장되었습니다.");
	};
}; // 점검중

function cancelEditPaper() {
	spoonBpData(spoonedBpData.bpTitle);
	printSpoonedBpData();
	putSelectbox("selectboxBpTitle");
}; // 점검중

// --------------------------------------------------
// *** monitor Manager
// --------------------------------------------------

function monitorBpTitleBlankOrDuplicates() {
	let packagedBpTitle = selectorById("bpTitle").value.trim();
	if (packagedBpTitle != "") {
		let sameBpTitleArray = getSameBpTitleArray(packagedBpTitle);
		if (sameBpTitleArray == undefined) {
			return true;
		} else {
			highLightBorder("bpTitle", "red");
			alert("중복된 페이퍼 제목이 있습니다. 페이퍼 제목을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
	return false;
}; // 점검중

function monitorBpTitleBlank() {
	let packagedBpTitle = selectorById("bpTitle").value.trim();
	if (packagedBpTitle != "") {
		return true;
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};
}; // 점검중

function getSameBpTitleArray(packagedBpTitle) {
	let filterSameIndexArray = (query) => {
		return bpTitleArray.find(packagedBpTitle => query == packagedBpTitle);
	};
	let sameBpTitleArray = filterSameIndexArray(packagedBpTitle);
	return sameBpTitleArray;
}; // 점검중

// --------------------------------------------------
// *** general Supporter
// --------------------------------------------------

function selectorById(id) {
	return document.getElementById(id);
}; // 점검중

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
}; // 점검중