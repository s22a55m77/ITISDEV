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

if(eafFormattedDate) {
  $('#eaf-updated-time').text("Last update " + eafFormattedDate)
}

if(vaccinationFormattedDate) {
  $('#vaccination-updated-time').text("Last update " + vaccinationFormattedDate)
}

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { success, error } = params; 

if(success) {
  $('#alert').css('background-color', '#00A14A')
  $('#alert').text("Updated")
  $('#alert').show();
  setTimeout(() => {
    $('#alert').hide();
  }, 2000);
}

if(error) {
  $('#alert').css('background-color', '#A70000')
  $('#alert').text("Upload Failed")
  $('#alert').show();
  setTimeout(() => {
    $('#alert').hide();
  }, 2000);
}