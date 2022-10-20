const StoLDept = {
	"requestReadUserData": 
		function requestReadUserData(user) {
			const userRef = db.ref("users").child(user.uid).child("user");
			userRef.on("value", (snapshot) => {
				snapshot.forEach(childSnap => {
					const key = childSnap.key;
					const value = childSnap.val();
					value["uid"] = childSnap.key;
					userData[key] = value;
				});
				userDept.showUserData(userData);
			});
		},
	"requestReadBigPicture":
		function requestReadBigPicture(user) {

			const userRef = db.ref("users")
							.child(user.uid)
							.child("bigPicture");
			
			userRef.on("value", (snapshot) => {
				console.log("*keep* ===== .on is here =====");
		
				const v = snapshot.val();
				objectById = {};

				function requestReadIdAndObjectFromChildren(o){
					// console.log('*keep* requestReadIdAndObjectFromChildren >>',o)
					const c = o.children;
					if(!c) return;
				
					const ids = Object.keys(c);
					if(ids.length == undefined) return;
				
					ids.forEach( id => {
						const v = c[id];
						objectById[id] = v;
						requestReadIdAndObjectFromChildren(v);
					});
				};

				requestReadIdAndObjectFromChildren(v);
				// console.log('*keep* objectById >>',objectById)
		
				const count = Object.keys(objectById).length; 
				const layers = [0, 1, 2];

				layers.forEach(eachLayer => {

					if(count > 0) {
							UIDept.showItOnUI(eachLayer);
					} else {
							UIDept.setupBtnShowOrHideByClassName(eachLayer, "createFirstLi");
					};

				});


			});
		}
};