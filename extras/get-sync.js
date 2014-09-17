function get(url) {
	var request = new XMLHttpRequest();
	request.open('GET', url, false);
	request.send();
	if ((request.status/100)^2) {
		return null;
	}
	return request.responseText;
}