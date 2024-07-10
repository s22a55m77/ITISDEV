const role = 'admin'

if (role === 'dispatcher') {
  $('.dispatcher-container').show()
  $('.tab').show()
  $('.admin-container').hide()
}
else {
  $('.dispatcher-container').hide()
  $('.tab').hide()
  $('.admin-container').show()
}