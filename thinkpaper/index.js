const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
const userData = {};
let objectById = {};
let selectedLi = {};
let selectedLiByLayer = {0: "", 1:"", 2:""};
let eventListenerBox_selected = "N";
let eventListenerBox_row = {before:[], after:[]};

(function() {
	logIn();
})();

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestReadUserData(user);
			requestReadBigPicture(user);
			eventListener_upRow_btn();
			// eventListener_downRow_btn();
			// cancelLiSelected(); 향후 편의성 올릴 때 다시 살리기
		} else {
			window.location.replace("login.html");
		};
	});
};

function logOut() {
	firebase.auth().signOut();
};