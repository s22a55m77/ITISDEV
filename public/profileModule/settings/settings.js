// handle file upload
$('#eaf-upload').on('change', function() {
  $('#eaf-upload-form').submit();
})

$('#vaccination-upload').on('change', function() {
  $('#vaccination-upload-form').submit();
})


// handle date formatting
const eafDate = new Date(eafTime);
const options = { month: 'long', day: '2-digit' };
const eafFormattedDate = eafDate.toLocaleDateString('en-US', options);
const vaccinationDate = new Date(vaccinationTime);
const vaccinationFormattedDate = vaccinationDate.toLocaleDateString('en-US', options);
const designationDate = new Date(designationTime);
const designationFormattedDate = designationDate.toLocaleDateString('en-US', options);

if(eafFormattedDate != 'Invalid Date') {
  $('#eaf-updated-time').text("Last update " + eafFormattedDate)
}

if(vaccinationFormattedDate != 'Invalid Date') {
  $('#vaccination-updated-time').text("Last update " + vaccinationFormattedDate)
}

if(designationFormattedDate != 'Invalid Date') {
  $('#designation-updated-time').text("Last update " + designationFormattedDate)
}

// Designation initialize
$(`#designation option[value="${designation}"]`).attr('selected', 'selected');

// Handle update designation
$("#designation").on('change', function() {
  $('#designation-form').submit();
})

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { success, error } = params; 

if(success) {
  $('.toast-body').text("Updated")
  toastBootstrap.show()
}

if(error) {
  $('.toast-body').text("Upload failed")
  toastBootstrap.show()
}