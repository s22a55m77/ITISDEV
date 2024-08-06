let tripStatusDisplay

switch(tripDetail.status) {
  case 'pending':
    tripStatusDisplay = 'Waiting for approval'
    break;
  case 'confirmed':
    tripStatusDisplay = 'Confirmed'
    break;
  case 'rejected':
    tripStatusDisplay = 'Rejected'
    break;
  case 'cancelled':
    tripStatusDisplay = 'Cancelled'
    break;
}

$('#status').text(tripStatusDisplay)

const date = moment(tripDetail.departureDate, "MMM DD").format('MMMM DD')
$('#origin-date').text(date)
$('#destination-date').text(date)
$('#origin-time').text(moment(tripDetail.departureTime, "hh:mm").format('hh:mm A'))

$('#origin-location').text(tripDetail.from)
$('#destination-location').text(tripDetail.to)