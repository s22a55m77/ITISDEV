const statusMessage = result === 'true' ? 'Marked present:': 'No reservation found for:'
$('#status-message').text(statusMessage)

if(invalid === 'true') {
  $('#status-message').text('Invalid QR code. Try again.')
  $('#name').hide()
  $('#id').hide()
  $('#type').hide()
}

// get query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { time, to, from, date } = params;

$('#scan-another').click(() => {
  window.location.href = `/admin/checkin/scan/?from=${from}&to=${to}&time=${time}&date=${date}`;
})

$('#back-to-list').click(() => {
  window.location.href = `/admin/checkin?from=${from}&to=${to}&time=${time}&date=${date}`;
})