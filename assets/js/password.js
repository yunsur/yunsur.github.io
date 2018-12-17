$(function () {
	// auto generate after loaded
	generate();

	$("#password-generate-submit").click(function (e) {
		generate();
	});

	new ClipboardJS('.ui.copy');

	$('.ui.copy')
	  .popup({
		on: 'click'
	});
});

var generate = function () {
	var length = $('#password-generate-length').val();
	var readable = $('#password-option-readable').prop("checked");
	length = parseInt(length) || 0;
	if (length < 1) {
		return true;
	}
	var digitArray = "0123456789";
	var lowerArray = "abcdefghijklmnopqrstuvwxyz";
	var upperArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var specialArray = "+=-@#~,.[]()!%^*$";
	var tmpArray = "";
	if ($("#password-option-digit").prop("checked")) {
		tmpArray += digitArray;
	}
	if ($("#password-option-lower").prop("checked")) {
		tmpArray += lowerArray;
	}
	if ($("#password-option-upper").prop("checked")) {
		tmpArray += upperArray;
	}
	if ($("#password-option-special").prop("checked")) {
		tmpArray += specialArray;
	}
	if (tmpArray.length === 0) {
		tmpArray = "0123456789";
	}
	if (readable) {
		tmpArray = tmpArray.replace(/[OIlj\s]/g, '');
	}
	var result = "";
	for (var i = 0; i < length; i++) {
		result += tmpArray[Math.floor(Math.random() * tmpArray.length)];
	}
	$('#password-generate-result').val(result);
};