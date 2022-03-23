const firebase = appFireBase;
const db = firebase.database();

let userInfoData = {};
let bpData = {};
let currentBpData = {};

(function () {
		firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			readUser(user);
		} else {
			window.location.replace("login.html");
		};
	});
})();

function logOut() {
	firebase.auth().signOut();
};

function refreshBpData() {
	let bpTitleList = Object.keys(bpData);
	for (let i = 0; i < bpTitleList.length; i++) {
	delete bpData[bpTitleList[i]];
	};
	console.log("bpData after refreshBpData = ", bpData);
};

function readUser(user) {
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
			}else{
				value["uid"] = childSnap.key;
				userInfoData[key] = value;
			};
		});
		readCurrentBpData();
		printUserInfo();
	});
};

function readCurrentBpData() {
	let bpTitleList = Object.keys(bpData);
	console.log("bpTitleList at readCurrentBpData= ", bpTitleList);
	if(bpTitleList.length > 0) {
		createSelectbox(bpTitleList);
		//let selectboxBpTitleValue = document.getElementById("selectboxBpTitle").value;
		//if(selectboxBpTitleValue == "클릭하여 선택"){
			let mainBpTitle = getMainBpTitle(bpTitleList);
			createCurrentBpData(mainBpTitle);
		//} else {
			//createCurrentBpData(someTitle);
		//};
	} else {
		stateHandler("createFirstPaper");
	};
};

function getMainBpTitle(bpTitleList) {
	for (let i = 0; i < bpTitleList.length; i++) {
		let setMainBpValue = bpData[bpTitleList[i]].setMainBp;
		if (setMainBpValue == "main") {
			let mainBpTitle = bpData[bpTitleList[i]].bpTitle;
			return mainBpTitle;
		};
	};
	let mainBpTitle = bpTitleList[0];
	return mainBpTitle;
};

function createSelectbox(bpTitleList) {

	let selectboxBpTitle = document.getElementById("selectboxBpTitle");

	// selectboxBpTitle 초기화하기
	for (let i = selectboxBpTitle.options.length - 1; i >= 0; i--) {
		selectboxBpTitle.remove(i + 1);
	};

	// seletbox에 <option> 만들어서, bpTitle값 넣기
	for (let i = 0; i < bpTitleList.length; i++) {
		let option = document.createElement("OPTION"),
			txt = document.createTextNode(bpTitleList[i]);
			option.appendChild(txt);
		//if (bpData[bpTitleList[i]].setMainBp == "main") {
			// let mainBpTitle = bpTitleList[i] + "[메인]";
			// option.setAttribute("value", mainBpTitle);
			// console.log("bpTitleList[메인] = ", mainBpTitle);
		//} else {
			option.setAttribute("value", bpTitleList[i]);
		//}
		selectboxBpTitle.insertBefore(option, selectboxBpTitle.lastChild);
	};
};

function printCurrentBpTitleOnSelectbox(bpTitleList) {

	let currentBpTitle = currentBpData.bpTitle;

	for (let i = 1; i < bpTitleList.length + 1; i++) {

		let optionBpTitleList = document.getElementById("selectboxBpTitle").options[i].value;

		if (optionBpTitleList == currentBpTitle) {
			document.getElementById("selectboxBpTitle").options[i].setAttribute("selected", true);
		};
	};
};

function createCurrentBpData(currentBpTitle) {
	for (let key in bpData) {
		if(key == currentBpTitle){
			let bpDataSet = bpData[key];
			for (let key in bpDataSet) {
				currentBpData[key] = bpDataSet[key];
			};
		};
	};
	printCurrentBpData();
};

function printCurrentBpData() {


	document.getElementById("dateChecked").innerHTML = currentBpData.editedDate.slice(0, 10);
	document.getElementById("bpTitle").innerHTML = currentBpData.bpTitle;
	document.getElementById("direction").innerHTML = currentBpData.contents.direction;
	document.getElementById("naviA").innerHTML = currentBpData.contents.naviA;
	document.getElementById("naviB").innerHTML = currentBpData.contents.naviB;
	document.getElementById("actionPlan").innerHTML = currentBpData.contents.actionPlan;

	let bpTitleList = Object.keys(bpData);
	printCurrentBpTitleOnSelectbox(bpTitleList);

	stateHandler("readPaper");

};

function stateHandler(state) {

	function hide(id) {
		document.getElementById(id).style.display = "none";
	};
	
	function show(id) {
		document.getElementById(id).style.display = "initial";
	};
	
	hide("openEditPaper_btn");
	hide("cancelEditPaper_btn");
	hide("saveEditedPaper_btn");
	hide("saveNewPaper_btn");
	hide("removePaper_btn");
	hide("openNewPaper_btn");

	switch(state){
		case "createFirstPaper" :
			document.getElementById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
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


	if (currentBpData.setMainBp == "main") {
		hide("setMainBp_btn");
		show("setMainBp_txt");
	} else {
		if(state != "createFirstPaper") {
			show("setMainBp_btn");
		};
		hide("setMainBp_txt");

		let bpTitleList = Object.keys(bpData);
		if(bpTitleList.length == 1){
			setMainBp();
			location.reload();
		};

	};

	resizeTextarea();
	console.log("state = ", state);
};

function printUserInfo() {
	document.getElementById("nameChecked").innerHTML = "생각 설계자: " + userInfoData.name + " 대표"
	document.getElementById("emailChecked").innerHTML = "(" + userInfoData.email + ")"
};

function paperModeHandler(paperMode) {

	function textareaReadOnly(id, check){
		document.getElementById(id).readOnly = check;
	};

	if (paperMode == "editing") {
		document.getElementById("divPaperMode").innerHTML = "작성모드";
		document.getElementById("gridMainFrame").style.color = "#9CC0E7";
		textareaReadOnly("bpTitle", false);
		textareaReadOnly("direction", false);
		textareaReadOnly("naviA", false);
		textareaReadOnly("naviB", false);
		textareaReadOnly("actionPlan", false);
	} else {
		document.getElementById("divPaperMode").innerHTML = "읽기모드";
		document.getElementById("gridMainFrame").style.color = "#424242";
		textareaReadOnly("bpTitle", true);
		textareaReadOnly("direction", true);
		textareaReadOnly("naviA", true);
		textareaReadOnly("naviB", true);
		textareaReadOnly("actionPlan", true);
	};
};

function moduleModeHandler(id, paperMode) {
	if (paperMode == "editing") {
		document.getElementById("divPaperMode").innerHTML = "작성모드";

		let module = document.getElementById(id).parentNode.parentNode;
		module.style.color = "#9CC0E7";

		document.getElementById(id).readOnly = false;
	} else {
		document.getElementById("divPaperMode").innerHTML = "읽기모드";
		document.getElementById(parentDiv).style.color = "#424242";
		document.getElementById(id).readOnly = true;
	};
};

function selectBpTitle() {

	let selectedBpTitleValue = document.getElementById("selectboxBpTitle").value;

	if (selectedBpTitleValue != "클릭하여 선택") {
		
		let selectedBpData = bpData[selectedBpTitleValue];

		document.getElementById("dateChecked").innerHTML = selectedBpData.editedDate.slice(0, 10);
		document.getElementById("bpTitle").value = selectedBpData.bpTitle;
		document.getElementById("direction").value = selectedBpData.contents.direction;
		document.getElementById("naviA").value = selectedBpData.contents.naviA;
		document.getElementById("naviB").value = selectedBpData.contents.naviB;
		document.getElementById("actionPlan").value = selectedBpData.contents.actionPlan;
	
		let currentBpTitle = selectedBpData.bpTitle;
		createCurrentBpData(currentBpTitle);
		stateHandler("readPaper");
	};
};

function selectCurrentBpData(bpTitle) {
	let selectedBpData = bpData[bpTitle];

	document.getElementById("dateChecked").innerHTML = selectedBpData.editedDate.slice(0, 10);
	document.getElementById("bpTitle").value = selectedBpData.bpTitle;
	document.getElementById("direction").value = selectedBpData.contents.direction;
	document.getElementById("naviA").value = selectedBpData.contents.naviA;
	document.getElementById("naviB").value = selectedBpData.contents.naviB;
	document.getElementById("actionPlan").value = selectedBpData.contents.actionPlan;

	createCurrentBpData(selectedBpData.bpTitle);
	let bpTitleList = Object.keys(bpData);
	printCurrentBpTitleOnSelectbox(bpTitleList);
	stateHandler("readPaper");
};

function openNewPaper() {

	document.getElementById("dateChecked").innerHTML = timeStamp().slice(0, 10);
	document.getElementById("bpTitle").value = "";
	document.getElementById("direction").value = "";
	document.getElementById("naviA").value = "";
	document.getElementById("naviB").value = "";
	document.getElementById("actionPlan").value = "";

	stateHandler("openNewPaper");

};

function openEditPaper() {

	stateHandler("editPaper");

};

function openEditModule() {
	moduleModeHandler("direction", "editing");
};

function cancelEditPaper() {

	selectCurrentBpData(currentBpData.bpTitle);
	highLightBorder("bpTitle", "rgb(200, 200, 200)");
	stateHandler("readPaper");

};

function saveEditedPaper() {
	
	let updatedBpData = {
		contents: {}
	};

	updatedBpData["editedDate"] = timeStamp();
	updatedBpData["bpTitle"] = document.getElementById("bpTitle").value;
	updatedBpData.contents["direction"] = document.getElementById("direction").value;
	updatedBpData.contents["naviA"] = document.getElementById("naviA").value;
	updatedBpData.contents["naviB"] = document.getElementById("naviB").value;
	updatedBpData.contents["actionPlan"] = document.getElementById("actionPlan").value;

	refreshBpData();

	db.ref("users")
		.child(userInfoData.uid)
		.child("bigPicture")
		.child(currentBpData.bpId)
		.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
		});

	let currentUser = firebase.auth().currentUser;
	readUser(currentUser);
	console.log("bpTitleList after readUser= ", Object.keys(bpData));

	selectCurrentBpData(updatedBpData.bpTitle);
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
	newBpData["setMainBp"] = "";
	newBpData.contents["direction"] = document.getElementById("direction").value;
	newBpData.contents["naviA"] = document.getElementById("naviA").value;
	newBpData.contents["naviB"] = document.getElementById("naviB").value;
	newBpData.contents["actionPlan"] = document.getElementById("actionPlan").value;

	let newBpTitle = document.getElementById("bpTitle").value;
	let sameBpTitle = getSameBpTitle(newBpTitle);
	if (newBpTitle != "") {
		if (sameBpTitle == undefined) {
			newBpData["bpTitle"] = newBpTitle;
			db.ref("users")
			.child(userInfoData.uid)
			.child("bigPicture")
			.push(newBpData);
	
			selectCurrentBpData(newBpTitle);
			stateHandler("readPaper");
			highLightBorder("bpTitle", "rgb(200, 200, 200)");
			alert("저장되었습니다.");
			
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
	return document.getElementById(id).style.borderColor = color;
};

function setMainBp() {
	
	let updatedBpData = {};

	updatedBpData["setMainBp"] = "main";

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
	updatedBpData["setMainBp"] = "";

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
	let selectorDarkMode = document.getElementById("darkMode")
	let selectorGridIndex = document.getElementById("gridIndex")
	let selectordivContentsControl = document.getElementById("divContentsControl")
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