// const firebase = appFireBase;
// [질문] 위 내용이 없으면 어떻게되는가? fireBase.js 연관 생각

const db = firebase.database();
let userInfoData = {};
let bpData = {};
let currentBpData = {};
//let isWebReloadedAnswer = {};

logIn();

// logIn 관리를 위한 함수 세트

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			//isWebReloaded();
			//console.log("isWebReloadedAnswer @ logIn() =", isWebReloadedAnswer.answer);
			requestUserInfoData(user);
			requestBpData(user);
		} else {
			window.location.replace("login.html");
		};
	});
};

function logOut() {
	firebase.auth().signOut();
};

function isWebReloaded() {

	// 참고: https://stackoverflow.com/questions/5004978/check-if-page-gets-reloaded-or-refreshed-in-javascript
	const pageAccessedByReload = (
		(window.performance.navigation && window.performance.navigation.type === 1) ||
		  window.performance
			.getEntriesByType('navigation')
			.map((nav) => nav.type)
			.includes('reload')
	  );
	isWebReloadedAnswer["answer"] = pageAccessedByReload;
	console.log("isWebReloadedAnswer @ isWebReloaded() =", pageAccessedByReload);
	return pageAccessedByReload;
};


// userInfoData 오브젝트 관리를 위한 함수 세트
function requestUserInfoData(user) {
	const userRef = db.ref("users").child(user.uid);
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			value["uid"] = childSnap.key;
			userInfoData[key] = value;
		});
		printUserInfo(userInfoData);
	});
};

function printUserInfo(userInfoData) {
	let userName = userInfoData.name;
	let userEmail = userInfoData.email;
	selectorById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	selectorById("emailChecked").innerHTML = "(" + userEmail + ")"
};

// bpData 오브젝트 관리를 위한 함수 세트

function requestBpData(user) {
	const userRef = db.ref("users").child(user.uid);
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			let key = childSnap.key;
			let value = childSnap.val();
			if(key == "bigPicture") {
				let bigPictures = value;
				let bpIds = Object.keys(bigPictures);
				bpIds.forEach( bpId => {
					let bigPicture = bigPictures[bpId];
					let bpTitle = bigPicture.bpTitle;
					bpData[bpTitle] = bigPicture;
					bpData[bpTitle]["bpId"] = bpId;
				});
			};
		});

		let defaultCurrentBpData = createCurrentBpData(bpData);
		console.log("defaultCurrentBpData = ", defaultCurrentBpData);
		if(defaultCurrentBpData != null){
			printCurrentBpData(defaultCurrentBpData);
			putSelectbox(bpData, "selectboxBpTitle");
			stateHandler("readPaper");
		} else {
			stateHandler("createFirstPaper");
		};
	});
};

function emptyBpData(bpData) {
	let bpTitleList = Object.keys(bpData);
	for (let i = 0; i < bpTitleList.length; i++) {
	delete bpData[bpTitleList[i]];
	};
};

function isEmptyBpData(bpData) {
	let bpTitleList = Object.keys(bpData);
	console.log("bpTitleList.length = ", bpTitleList.length);
	if (bpTitleList.length == 0) {
		return true;
	} else {
		return false;
	};
};

// currentBpData 오브젝트 관리를 위한 함수 세트

function resetCurrentBpData(bpData) {
	let resetCurrentBpData = createCurrentBpData(bpData);
	printCurrentBpData(resetCurrentBpData);
};

function createCurrentBpData(bpData) {
	let isEmptyData = isEmptyBpData(bpData);
	// bpData가 비어있는 경우 처리하기
	if( isEmptyData == Boolean) {
		console.log("bpData is empty");
		currentBpData = null;
	} else {
		console.log("bpData is not empty");
		for (let BpTitle in bpData) {
			console.log("for start @ createCurrentBpData");
			//let isWebReloaded = isWebReloaded();
			let selectboxValue = selectorById("selectboxBpTitle").value;
			if (selectboxValue == "클릭하여 선택") {
				// 첫로딩시에는 mainBpData로 CurrentBpData만들기
				console.log("reloaded @ createCurrentBpData");
				let mainBpTitle = findMainBpTitle(bpData);
				console.log("mainBpTitle @ createCurrentBpData = ", mainBpTitle);
				if(BpTitle == mainBpTitle){
					currentBpData = bpData[BpTitle];
				};
			} else {
				// 첫로딩이 아닌 경우, selectboxValue로 currentBpData만들기
				console.log("No reloaded @ createCurrentBpData");
				let selectboxValue = selectorById("selectboxBpTitle").value;
				console.log("selectboxValue @ createCurrentBpData = ", selectboxValue);
				if(BpTitle == selectboxValue){
					currentBpData = bpData[BpTitle];
				};
			};
		};
	};
	console.log("currentBpData @ createCurrentBpData = ", currentBpData);
	return currentBpData;
};

function printCurrentBpData(currentBpData) {
	console.log("currentBpData @ printCurrentBpData = ", currentBpData);
	selectorById("dateChecked").innerHTML = currentBpData.editedDate.slice(0, 10);
	selectorById("bpTitle").innerHTML = currentBpData.bpTitle;
	selectorById("direction").innerHTML = currentBpData.direction;
	selectorById("naviArea").innerHTML = currentBpData.naviArea;
	selectorById("naviB").innerHTML = currentBpData.naviB;
	selectorById("naviA").innerHTML = currentBpData.naviA;
	selectorById("actionPlan").innerHTML = currentBpData.actionPlan;
};

// selectBox 관리를 위한 함수 세트

function putSelectbox(bpData, selectboxId) {

	let bpTitleList = Object.keys(bpData);
	let selectbox = selectorById(selectboxId);
	// selectbox 초기화하기
	for (let i = selectbox.options.length - 1; i >= 0; i--) {
		selectbox.remove(i + 1);
	};
	// <option> 만들어서, bpTitleList 넣기
	for (let i = 0; i < bpTitleList.length; i++) {
		let option = document.createElement("OPTION");
		let txt = document.createTextNode(bpTitleList[i]);
		option.appendChild(txt);
		option.setAttribute("value", bpTitleList[i]);
		selectbox.insertBefore(option, selectbox.lastChild);
	};
	// selected 넣기
	printCurrentBpTitleOnSelectbox(bpData, selectboxId);
};

function printCurrentBpTitleOnSelectbox(bpData, selectboxId) {

	let bpTitleList = Object.keys(bpData);
	let currentBpTitle = currentBpData.bpTitle;

	if (currentBpData != null) {
		for (let i = 1; i < bpTitleList.length + 1; i++) {
			if(bpTitleList.length == 0){
				selectorById(selectboxId).options[0].setAttribute("selected", true);
			} else {
				let optionList = selectorById(selectboxId).options[i].value;
				if (optionList == currentBpTitle) {
					selectorById(selectboxId).options[i].setAttribute("selected", true);
				};
			};
		};
	};
};


// mainBpData 관리를 위한 함수 세트

function findMainBpTitle(bpData) {
	console.log("findMainBpTitle started");
	let bpTitleList = Object.keys(bpData);
	for (let i = 0; i < bpTitleList.length; i++) {
		let mainBpValue = bpData[bpTitleList[i]].isMainBp;
		if (mainBpValue == "main") {
			let mainBpTitle = bpData[bpTitleList[i]].bpTitle;
			console.log("mainBpTitle = ", mainBpTitle);
			return mainBpTitle;
		} else {
			let mainBpTitle = bpTitleList[0];
			console.log("mainBpTitle = ", mainBpTitle);
			return mainBpTitle;
		};
	};
};

function setMainBp() {
	
	let updatedBpData = {};

	updatedBpData["isMainBp"] = "main";

	db.ref("users")
		.child(userInfoData.uid)
		.child("bigPicture")
		.child(currentBpData.bpId)
		.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
		});

	unsetMainBp();

	let bpTitleList = Object.keys(bpData);
	if(bpTitleList.length > 1){
		alert("메인 페이퍼로 설정이 완료되었습니다.");
	};

	stateHandler("readPaper");
	location.reload();

};

function unsetMainBp() {

	let updatedBpData = {};
	
	updatedBpData["isMainBp"] = "";

	let bpTitleList = Object.keys(bpData);
	for (let i = 0; i < bpTitleList.length; i++) {
		let bpIds = bpData[bpTitleList[i]].bpId;

		if (bpIds != currentBpData.bpId) {
			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.child(bpIds)
				.update(updatedBpData, (e) => {
				console.log("update completed = ", e);
				});
		};
	};
};

// 반복되는 것 줄여쓰기위한 함수 세트

function selectorById(id) {
	return document.getElementById(id);
};

// UI 관리를 위한 함수 세트

function stateHandler(state) {

	function hide(id) {
		selectorById(id).style.display = "none";
	};
	
	function show(id) {
		selectorById(id).style.display = "initial";
	};
	
	hide("openEditPaper_btn");
	hide("cancelEditPaper_btn");
	hide("saveEditedPaper_btn");
	hide("saveNewPaper_btn");
	hide("removePaper_btn");
	hide("openNewPaper_btn");

	switch(state){
		case "createFirstPaper" :
			selectorById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
			show("saveNewPaper_btn");
			hide("setMainBp_btn");
			paperModeHandler("editing");
			break;
		case "openNewPaper" :
			show("saveNewPaper_btn");
			show("cancelEditPaper_btn")
			paperModeHandler("editing");
			break;
		case "readPaper" :
			show("openEditPaper_btn");
			show("openNewPaper_btn");
			show("removePaper_btn");
			paperModeHandler("reading");
			break;
		case "editPaper" :
			show("saveEditedPaper_btn");
			show("cancelEditPaper_btn");
			show("saveNewPaper_btn");
			show("removePaper_btn");
			paperModeHandler("editing");
			break;
		default:
			let state = null;
	}

	

	resizeTextarea();
};

function setMainBpHandler() {

	console.log("currentBpData.isMainBp = ", currentBpData.isMainBp);
	// console.log(currentBpData.isMainBp);
	// if (currentBpData.isMainBp == "main") {
	// 	hide("setMainBp_btn");
	// 	show("setMainBp_txt");
	// } else {
	// 	if(state != "createFirstPaper") {
	// 		show("setMainBp_btn");
	// 	};
	// 	hide("setMainBp_txt");

	// 	let bpTitleList = Object.keys(bpData);
	// 	if(bpTitleList.length == 1){
	// 		setMainBp();
	// 		location.reload();
	// 	};

	// };

}

// ---이상 리뷰 완료---





function paperModeHandler(paperMode) {

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
	} else {
		selectorById("divPaperMode").innerHTML = "읽기모드";
		selectorById("gridMainFrame").style.color = "#424242";
		textareaReadOnly("bpTitle", true);
		textareaReadOnly("direction", true);
		textareaReadOnly("naviArea", true);
		textareaReadOnly("naviB", true);
		textareaReadOnly("naviA", true);
		textareaReadOnly("actionPlan", true);
	};
};

function moduleModeHandler(id, paperMode) {
	if (paperMode == "editing") {
		selectorById("divPaperMode").innerHTML = "작성모드";

		let module = selectorById(id).parentNode.parentNode;
		module.style.color = "#9CC0E7";

		selectorById(id).readOnly = false;
	} else {
		selectorById("divPaperMode").innerHTML = "읽기모드";
		selectorById(parentDiv).style.color = "#424242";
		selectorById(id).readOnly = true;
	};
};

function selectBpTitle() {

	let selectedBpTitleValue = selectorById("selectboxBpTitle").value;

	if (selectedBpTitleValue == "클릭하여 선택") {

		let bpTitleList = Object.keys(bpData);
		selectedBpTitleValue = bpTitleList[0];

		let selectedBpData = bpData[selectedBpTitleValue];

		selectorById("dateChecked").innerHTML = selectedBpData.editedDate.slice(0, 10);
		selectorById("bpTitle").value = selectedBpData.bpTitle;
		selectorById("direction").value = selectedBpData.direction;
		selectorById("naviArea").value = selectedBpData.naviArea;
		selectorById("naviB").value = selectedBpData.naviB;
		selectorById("naviA").value = selectedBpData.naviA;
		selectorById("actionPlan").value = selectedBpData.actionPlan;
	
		createCurrentBpData(bpData);
		console.log("check");
		stateHandler("readPaper");

	} else {
		// 이부분부터 수정시작하기
		let selectedBpData = bpData[selectedBpTitleValue];
		resetCurrentBpData();
		console.log("check");
		stateHandler("readPaper");
	};
};

// function selectBpTitle() {

// 	let selectedBpTitleValue = selectorById("selectboxBpTitle").value;

// 	if (selectedBpTitleValue == "클릭하여 선택") {

// 		let bpTitleList = Object.keys(bpData);
// 		selectedBpTitleValue = bpTitleList[0];

// 		let selectedBpData = bpData[selectedBpTitleValue];

// 		selectorById("dateChecked").innerHTML = selectedBpData.editedDate.slice(0, 10);
// 		selectorById("bpTitle").value = selectedBpData.bpTitle;
// 		selectorById("direction").value = selectedBpData.direction;
// 		selectorById("naviArea").value = selectedBpData.naviArea;
// 		selectorById("naviB").value = selectedBpData.naviB;
// 		selectorById("naviA").value = selectedBpData.naviA;
// 		selectorById("actionPlan").value = selectedBpData.actionPlan;
	
// 		createCurrentBpData(bpData);
// 		console.log("check");
// 		stateHandler("readPaper");

// 	} else {
// 		let selectedBpData = bpData[selectedBpTitleValue];

// 		selectorById("dateChecked").innerHTML = selectedBpData.editedDate.slice(0, 10);
// 		selectorById("bpTitle").value = selectedBpData.bpTitle;
// 		selectorById("direction").value = selectedBpData.direction;
// 		selectorById("naviArea").value = selectedBpData.naviArea;
// 		selectorById("naviB").value = selectedBpData.naviB;
// 		selectorById("naviA").value = selectedBpData.naviA;
// 		selectorById("actionPlan").value = selectedBpData.actionPlan;
	
// 		createCurrentBpData(bpData);
// 		console.log("check");
// 		stateHandler("readPaper");
// 	};
// };

// function selectCurrentBpData(bpTitle) {
// 	let selectedBpData = bpData[bpTitle];

// 	selectorById("dateChecked").innerHTML = selectedBpData.editedDate.slice(0, 10);
// 	selectorById("bpTitle").value = selectedBpData.bpTitle;
// 	selectorById("direction").value = selectedBpData.direction;
// 	selectorById("naviArea").value = selectedBpData.naviArea;
// 	selectorById("naviB").value = selectedBpData.naviB;
// 	selectorById("naviA").value = selectedBpData.naviA;
// 	selectorById("actionPlan").value = selectedBpData.actionPlan;

// 	createCurrentBpData(selectedBpData.bpTitle);
// 	let bpTitleList = Object.keys(bpData);
// 	//printCurrentBpTitleOnSelectbox(bpTitleList);
// 	stateHandler("readPaper");
// };

function openNewPaper() {

	selectorById("dateChecked").innerHTML = timeStamp().slice(0, 10);
	selectorById("bpTitle").value = "";
	selectorById("direction").value = "";
	selectorById("naviArea").value = "";
	selectorById("naviB").value = "";
	selectorById("naviA").value = "";
	selectorById("actionPlan").value = "";

	stateHandler("openNewPaper");

};

function openEditPaper() {

	stateHandler("editPaper");

};

function openEditModule() {
	moduleModeHandler("direction", "editing");
};

function cancelEditPaper() {

	//selectCurrentBpData(currentBpData.bpTitle);
	createCurrentBpData(bpData);
	highLightBorder("bpTitle", "rgb(200, 200, 200)");
	stateHandler("readPaper");

};

function saveEditedPaper() {
	
	let updatedBpData = {
		contents: {}
	};

	updatedBpData["editedDate"] = timeStamp();
	updatedBpData["bpTitle"] = selectorById("bpTitle").value.trim();
	updatedBpData["direction"] = selectorById("direction").value.trim();
	updatedBpData["naviArea"] = selectorById("naviArea").value.trim();
	updatedBpData["naviB"] = selectorById("naviB").value.trim();
	updatedBpData["naviA"] = selectorById("naviA").value.trim();
	updatedBpData["actionPlan"] = selectorById("actionPlan").value.trim();

	emptyBpData(bpData);

	db.ref("users")
		.child(userInfoData.uid)
		.child("bigPicture")
		.child(currentBpData.bpId)
		.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
		});

	const currentUser = firebase.auth().currentUser;
	requestBpData(currentUser);

	//selectCurrentBpData(updatedBpData.bpTitle);
	//createCurrentBpData(bpData);
	stateHandler("readPaper");
	alert("저장되었습니다.");
};

function removePaper() {

	if (confirm("정말 삭제하시겠습니까?")) {
		db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.child(currentBpData.bpId)
			.remove();
		alert("삭제되었습니다.");
		location.reload();
	};

	stateHandler("readPaper");

};

function getSameBpTitle(newBpTitle) {
	let bpTitleList = Object.keys(bpData);
	let filterSameBpTitleList = (query) => {
		return bpTitleList.find(newBpTitle => query == newBpTitle);
	};
	let sameBpTitleList = filterSameBpTitleList(newBpTitle);
	return sameBpTitleList;
};

function saveNewPaper() {

	let newBpData = {
		contents: {}
	};

	newBpData["editedDate"] = timeStamp();
	newBpData["createdDate"] = timeStamp();
	newBpData["direction"] = selectorById("direction").value.trim();
	newBpData["naviArea"] = selectorById("naviArea").value.trim();
	newBpData["naviB"] = selectorById("naviB").value.trim();
	newBpData["naviA"] = selectorById("naviA").value.trim();
	newBpData["actionPlan"] = selectorById("actionPlan").value.trim();

	let newBpTitle = selectorById("bpTitle").value.trim();
	let sameBpTitle = getSameBpTitle(newBpTitle);
	if (newBpTitle != "") {
		if (sameBpTitle == undefined) {
			newBpData["bpTitle"] = newBpTitle;

			let bpTitleList = Object.keys(bpData);

			// 첫 bpData인 경우, 메인페이지로 셋팅되게하기
			if (bpTitleList.length == 0){
				newBpData["isMainBp"] = "main";
			} else {
				newBpData["isMainBp"] = "";
			};

			db.ref("users")
				.child(userInfoData.uid)
				.child("bigPicture")
				.push(newBpData);
	

			const currentUser = firebase.auth().currentUser;
			requestBpData(currentUser);

			//selectCurrentBpData(newBpTitle);
			//createCurrentBpData(bpData);
			stateHandler("readPaper");
			highLightBorder("bpTitle", "rgb(200, 200, 200)");
			alert("저장되었습니다.");

			if (bpTitleList.length == 1){
				location.reload();
			};

		} else {
			highLightBorder("bpTitle", "red");
			alert("중복된 페이퍼 제목이 있습니다. 페이퍼 제목을 수정해주시기 바랍니다.");
		};
	} else {
		highLightBorder("bpTitle", "red");
		alert("페이퍼 제목이 비어있습니다. 페이퍼 제목을 입력해주시기 바랍니다.");
	};


};

function highLightBorder(id, color) {
	return selectorById(id).style.borderColor = color;
};

function timeStamp() {
	let now = new Date();
	let nowString = now.toISOString();
	return nowString;
};

function resizeTextarea() {
	// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
	const tx = document.getElementsByTagName("textarea");
	for (let i = 0; i < tx.length; i++) {
		//console.log("tx[i].scrollHeight = ", tx[i].scrollHeight);
		tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
		tx[i].addEventListener("input", OnInput, false);
	};
	
	function OnInput() {
		this.style.height = "auto";
		this.style.height = (this.scrollHeight) + "px";
	};
};

// [향후 개선하기] 더블클릭시 작성모드로 설정되기
// [버그] direction에 있는 textarea만 선택이 되고 있음
// const card = document.querySelector("textarea");

// card.addEventListener("dblclick", function (e) {
// 	openEditPaper();
// });

function darkmode() {
	let selectorBody = document.querySelector("body")
	let selectorDarkMode = selectorById("darkMode")
	let selectorGridIndex = selectorById("gridIndex")
	let selectordivContentsControl = selectorById("divContentsControl")
	if (selectorDarkMode.value === "다크모드 켜기") {
		selectorBody.style.backgroundColor = "#1E1E1E";
		selectorBody.style.color = "white";
		selectorDarkMode.value = "다크모드 끄기";

		let alist = document.querySelectorAll("a");
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = "powderblue";
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = "#333333";
		selectordivContentsControl.style.backgroundColor = "#333333";

	} else {
		selectorBody.style.backgroundColor = "white";
		selectorBody.style.color = "black";
		selectorDarkMode.value = "다크모드 켜기";

		let alist = document.querySelectorAll("a");
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = "blue";
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = "rgb(240, 240, 240)";
		selectordivContentsControl.style.backgroundColor = "rgb(240, 240, 240)";

	}
};