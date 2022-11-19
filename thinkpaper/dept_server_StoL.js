function requestReadUserData(user) {
	const userRef = db.ref("users")
					.child(user.uid)
					.child("user");
	userRef.on("value", (snapshot) => {
		snapshot.forEach(childSnap => {
			const key = childSnap.key;
			const value = childSnap.val();
			value["uid"] = childSnap.key;
			userData[key] = value;
		});
		showUserData(userData);
	});
};

function requestReadBigPicture(user) {

	const bpRef = db.ref("users")
					.child(user.uid)
					.child("bigPicture");
	
	bpRef.on("value", (snapshot) => {
		console.log("*keep* ===== .on is here =====");

		objectById = {};

		snapshot.forEach(childSnap => {
			const key = childSnap.key;
			const value = childSnap.val();
			objectById[key] = value;
		});

		if (eventListenerCell.selected == "N") {
			// 첫 on, 아무 li도 선택되지 않은 경우
			const count = Object.keys(objectById).length; 
			const layers = [0, 1, 2];
			layers.forEach(eachLayer => {
				if(count > 0) {
					showItOnUI(eachLayer);
					setupBtnShowOrHideByClassName(eachLayer, "createFirstLi");
				} else {
					setupBtnShowOrHideByClassName(eachLayer, "createFirstLi");
				};
			});
			showHideDiv(-1);
		} else {
			// 두번째 이후 on, li가 기존에 선택되어 있는 경우
		};

	});
};