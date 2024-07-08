

// Error Handling
if(error) {
  $('.information-container').empty()
  $('.information-container').append('No Schedule Found')
  $('.information-container').show()
}

// Redirect if no date selected
if(!date && !error) {
  window.location.href = '/admin/checkin?date=' + moment().format('YYYY-MM-DD')
}
// Set Date
if(date)
  $('#date').text(moment(date).format('MMMM DD, YYYY'))
else 
  $('#date').text(moment().format('MMMM DD, YYYY'))


// Only work when have data
if(from && to && time) {
  // Set location and time
  $('#from-location').val(from)
  $('#to-location').val(to)
  $('#time-select').append(`<option value="${time}">${moment(time, 'HH:mm').format('hh:mm A')}</option>`)
  $('#time-select').val(time)

  // Show information
  if(slotCount, reservedCount, presentCount, walkInCount) {
    $('#reserved-seats').html(`<span class="bold">${reservedCount}</span> out of ${slotCount} `)
    $('#currently-present').html(`<span class="bold">${presentCount}</span> out of ${reservedCount} `)
    $('#walk-in').html(`<span class="bold">${walkInCount}</span> out of ${slotCount} `)
    $('.information-container').show()
  }

  // Render Passenger List
  function renderPassengerList(passengerList) {
    $('#passenger-list-container').empty()
    const passengerListElement = passengerList.map((passenger) => {
      return `
        <div class="passenger-item">
          <div class="${passenger.status}"></div>
          <div>${passenger.name}</div>
          <div>${passenger.id}</div>
        </div>
      `
    })
    
    $('#passenger-list-container').append(passengerListElement)
  }
  
  renderPassengerList(passengerList)

  // Handle no passenger
  if(passengerList.length === 0) {
    $('#passenger-list-container').append('<div class="no-passenger">No Reserved Passenger</div>')
  }
}

if(passengerList.length === 0 && !from && !to && !time)
  $('#passenger-list-container').append('<div class="no-passenger">Select a trip and time for this date to view list of reservations</div>')

// Handle change date
function changeDate(action){
  const dateNow = date ?? moment().format('YYYY-MM-DD')
  if(action === 'prev')
    window.location.href = `/admin/checkin?date=${moment(dateNow).subtract(1, 'days').format('YYYY-MM-DD')}`
  else if(action === 'next')
    window.location.href = `/admin/checkin?date=${moment(dateNow).add(1, 'days').format('YYYY-MM-DD')}`
}

function checkLocationIsSelected() {
  const fromLocation = $('#from-location').val()
  const toLocation = $('#to-location').val()

  if (fromLocation == null || toLocation === null) {
    return false
  }

  return true
}

async function handleLocationChange() {
  if(checkLocationIsSelected()) {
    const res = await fetch(`/admin/checkin/time?date=${moment().format('YYYY-MM-DD')}&from=${$('#from-location').val()}&to=${$('#to-location').val()}`)
    .then(response => response.json())
    
    if(res.success) {
      res.timeList.map((time) => {
        $('#time-select').empty()
        $('#time-select').append(`<option disabled selected value>Select Time</option>`)
        $('#time-select').append(`<option value="${time}">${ moment(time, 'HH:mm').format('hh:mm A')}</option>`)
      })
    }else {
      $('#time-select').empty()
      $('#time-select').append(`<option disabled selected value>No Available Time</option>`)
    }
  }
}

$('#from-location ').change(() => {
  handleLocationChange()
})

$('#to-location').change(() => {
  handleLocationChange()
})

$('#time-select').change(() => {
  window.location.href = `/admin/checkin?date=${date}&from=${$('#from-location').val()}&to=${$('#to-location').val()}&time=${$('#time-select').val()}`
})

$('#search').on('keyup', function() {
  if($(this).val() === '' || $(this).val() === null) {
    renderPassengerList(passengerList)
    return
  }
  const result = passengerList.filter(passenger => passenger.name.includes($(this).val()) 
                                                || passenger.id.includes($(this).val()))
  renderPassengerList(result)
})