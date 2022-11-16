const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
const userData = {};
let objectById = {};
let selectedLi = {};
let eventListenerCell = {selected: "N"};

(function() {
	logIn();
})();

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			requestReadUserData(user);
			requestReadBigPicture(user);
			showHideDiv(null);
			cancelLiSelected();
		} else {
			window.location.replace("login.html");
		};
	});
};

function logOut() {
	firebase.auth().signOut();
};