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