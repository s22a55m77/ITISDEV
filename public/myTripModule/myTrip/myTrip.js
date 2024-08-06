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
        <div class="trip-container">
          <div class="${trip.status}">${tripStatusDisplay}</div>
            <div class="information-container">
              <div class="location-header">
                <div>Origin</div>
                <div>Destination</div>
              </div>
              <div class="location">
                <div>${trip.from}</div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3.33331L8.82504 4.50831L13.475 9.16665H3.33337V10.8333H13.475L8.82504 15.4916L10 16.6666L16.6667 9.99998L10 3.33331Z" fill="#417845"/>
                  </svg>
                </div>
                <div>${trip.to}</div>
              </div>
            </div>          
          <div class="time-container">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M6.99413 1.16669C3.77413 1.16669 1.16663 3.78002 1.16663 7.00002C1.16663 10.22 3.77413 12.8334 6.99413 12.8334C10.22 12.8334 12.8333 10.22 12.8333 7.00002C12.8333 3.78002 10.22 1.16669 6.99413 1.16669ZM6.99996 11.6667C4.42163 11.6667 2.33329 9.57835 2.33329 7.00002C2.33329 4.42169 4.42163 2.33335 6.99996 2.33335C9.57829 2.33335 11.6666 4.42169 11.6666 7.00002C11.6666 9.57835 9.57829 11.6667 6.99996 11.6667ZM7.29163 4.08335H6.41663V7.58335L9.47913 9.42085L9.91663 8.70335L7.29163 7.14585V4.08335Z" fill="#4B5563"/>
            </svg>
            ${moment(`${trip.date} ${trip.time}`, 'YYYY-MM-DD hh:mm').format('MMMM DD, hh:mm A')}
          </div>
        </div>
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
  $('.toast-body').text(success.charAt(0).toUpperCase() + success.slice(1))
  toastBootstrap.show()
}

if(error) {
  $('.toast-body').text(error.charAt(0).toUpperCase() + error.slice(1).replace(/-/g, ' '))
  toastBootstrap.show()
}