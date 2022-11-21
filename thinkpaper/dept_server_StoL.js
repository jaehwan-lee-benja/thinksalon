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

		const count = Object.keys(objectById).length; 
		const layers = [0, 1, 2];

		if (eventListenerCell.selected == "N") {
			// 첫 on, 아무 li도 선택되지 않은 경우
			layers.forEach(eachLayer => {
				if(count > 0) {
					showItOnUI(eachLayer);
				} else {
					setupBtnShowOrHideByClassName();
					updateList(eachLayer);
				};
			});
			showHideDiv(-1);
		} else {
			setupBtnShowOrHideByClassName("readLi");
			// layers.forEach(eachLayer => {
			// 	showItOnUI(eachLayer);
			// });	
		};

	});
};