$('#eaf-upload').on('change', function() {
  $('#eaf-upload-form').submit();
})

$('#vaccination-upload').on('change', function() {
  $('#vaccination-upload-form').submit();
})


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