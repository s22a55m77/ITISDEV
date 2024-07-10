// get idToken from query
const urlParams = new URLSearchParams(window.location.search)
const idToken = urlParams.get('idToken')

// set idToken in hidden input
$(document).ready(() => {
  $('input[name="idToken"]').val(idToken)
})

$('#back').click(() => {
  history.back()
})

$('#eaf').on('change', (e) => {
  const filename = e.target.files[0].name;
  $('#eaf-filename').text(filename)
})

$('#vaccinationRecord').on('change', (e) => {
  const filename = e.target.files[0].name;
  $('#vaccination-filename').text(filename)
})

$('#register').click((event) => {
  const eaf = $('#eaf')[0].files[0] 
  const vaccinationRecord = $('#vaccinationRecord')[0].files[0]
  const id = $('#idNumber').val()
  if((!eaf || !vaccinationRecord) && id != "") {
    event.preventDefault()
    alert('Please upload all required files')
  }
})