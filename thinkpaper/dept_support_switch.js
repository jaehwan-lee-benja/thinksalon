function getParentsLayerBySwitchLayer(layerHere) {
	if(layerHere > 0){
		const parentsLayer = layerHere - 1;
		return parentsLayer;
	};
};
function getChildrenLayerBySwitchLayer(layerHere) {
	const childrenLayer = layerHere + 1;
	return childrenLayer;
};