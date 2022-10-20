function getTimeStamp() {
	const now = new Date();
	const nowString = now.toISOString();
	return nowString;
};
function getLayerByEventListenerByButton() {
	eventListenerResult = {};
	const inputButtonSelector = document.getElementsByTagName("input");
	for (let i = 0; i < inputButtonSelector.length; i++) {
		inputButtonSelector[i].addEventListener("click", function (e) {

			const returnLayer = e.target
				.parentNode
				.parentNode
				.className;
			const returnId = e.target
				.parentNode
				.parentNode
				.firstElementChild
				.value;

			eventListenerResult = getIdThreadObjectById(returnLayer, returnId);

		});
	};
};