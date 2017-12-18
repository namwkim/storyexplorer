// function for getting URL parameters
function gup(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if(results == null)
		return "";
	else return unescape(results[1]);
}

function turkify(form_selector){
  // is assigntmentId is a URL parameter
	if((aid = gup("assignmentId"))!="" && $(form_selector).length>0) {

		// If the HIT hasn't been accepted yet, disabled the form fields.
		if(aid == "ASSIGNMENT_ID_NOT_AVAILABLE") {
		    $('input,textarea,select').attr("DISABLED", "disabled");
		}

		// Add a new hidden input element with name="assignmentId" that
		// with assignmentId as its value.
		var aid_input = $("<input type='hidden' name='assignmentId' value='" + aid + "'>").appendTo($(form_selector));

		// Make sure the submit form's method is POST
		$(form_selector).attr('method', 'POST');

		// Set the Action of the form to the provided "turkSubmitTo" field
		if((submit_url=gup("turkSubmitTo"))!="") {
	  		$(form_selector).attr('action', submit_url + '/mturk/externalSubmit');
		}
	}
}
