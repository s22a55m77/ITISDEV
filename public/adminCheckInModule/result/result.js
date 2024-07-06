const result = {
  status: 'sucess',
  student: 'Parcia, John Ronn P.',
  id: 12136859,
  type: 'Student'
}

const statusMessage = result.status === 'sucess' ? 'Marked present:': 'No reservation found for:'
$('#status-message').text(statusMessage)
$('#name').text(result.student)
$('#id').text(result.id)
$('#type').text(result.type)