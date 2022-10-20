const switchDept = {
	"getRefBySwitchLayer":
		function getRefBySwitchLayer(layerHere, idThreadObjectHere) {
			
			const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
			const parentsId = idThreadObjectHere[parentsLayer+"Id"];

			const userRef = db.ref("users").child(userData.uid);
			const bigPictureRef = userRef.child("bigPicture");
			const layer0Ref = bigPictureRef.child("children");

			switch(layerHere){
				case 0 :
					return layer0Ref;
				case 1 : 
					const layer0Id = parentsId;

					const layer1Ref = layer0Ref.child(layer0Id).child("children");
					return layer1Ref;

				case 2 : 
					const layer1Id = parentsId;
					const layer0Id2 = idDept.getParentsIdfromChildId(1, layer1Id);

					const layer1Ref2 = layer0Ref.child(layer0Id2).child("children");
					const layer2Ref = layer1Ref2.child(layer1Id).child("children");
					return layer2Ref;

				default: 
					return null;
			};
		},
	"getIdThreadObjectById":
		function getIdThreadObjectById(layerHere, inputIdhere) {
			const returnObject = {};
			switch(layerHere){
				case 0 : 
					returnObject["layer0Id"] = inputIdhere;
					returnObject["layer1Id"] = "";
					returnObject["layer2Id"] = "";
					break;
				case 1 :
					returnObject["layer0Id"] = idDept.getParentsIdfromChildId(1, inputIdhere);
					returnObject["layer1Id"] = inputIdhere;
					returnObject["layer2Id"] = "";
					break;
				case 2 :
					const layer1Id = idDept.getParentsIdfromChildId(2, inputIdhere);
					const layer0Id = idDept.getParentsIdfromChildId(1, layer1Id);
					returnObject["layer0Id"] = layer0Id;
					returnObject["layer1Id"] = layer1Id;
					returnObject["layer2Id"] = inputIdhere;
					break;
				default: null;	
			};
			return returnObject;
		},
	"getParentsLayerBySwitchLayer":
		function getParentsLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case 0 : 
					return null;
				case 1 :
					return 0;
				case 2 :
					return 1;
				default : return null; 
			};
		},
	"getChildrenLayerBySwitchLayer":
		function getChildrenLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case 0 : 
					return 1;
				case 1 :
					return 2;
				case 2 :
					return 3;
				default : return null; 
			};
		}
};