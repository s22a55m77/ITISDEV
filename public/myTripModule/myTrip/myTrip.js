// Render trip list
if(tripList) {
  tripList.forEach((trip) => {
    const hasPassed = moment(`${trip.date} ${trip.time}`, 'YYYY-MM-DD hh:mm').isBefore(moment())
    let tripStatusDisplay

    switch(trip.status) {
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

    const tripElement = `
      <a href="/trip/${trip.id}">
        <div class="status">${tripStatusDisplay}</div>
        <div class="location">
          <div>${trip.from}</div>
          <div>-></div>
          <div>${trip.to}</div>
        </div>
        <div>${moment(`${trip.date} ${trip.time}`, 'YYYY-MM-DD hh:mm').format('MMMM DD, hh:mm A')}</div>
      </a>
    `
    if(hasPassed)
      $('#past-trip-container').append(tripElement)
    else
      $('#recent-trip-container').append(tripElement)
  })
}

// Get query parameters
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { success, error } = params; 

if(success) {
  $('#alert-message').text(success.charAt(0).toUpperCase() + success.slice(1))
  $('#alert-message').show()
}

if(error) {
  $('#alert-message').text(error.charAt(0).toUpperCase() + error.slice(1).replace(/-/g, ' '))
  $('#alert-message').show()
}