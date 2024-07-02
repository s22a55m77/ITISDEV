import { lineName } from '../../lineInformation.js'

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
})
let { line, selectedDate, selectedTime } = params

// If no line information
if (!line) {
  window.location.href = `/admin/reservation?line=1&selectedDate=${selectedDate}&selectedTime=${selectedTime}`
}

// set line information
const fromTo = lineName[line - 1].from + ' -> ' + lineName[line - 1].to
const toFrom = lineName[line - 1].to + ' -> ' + lineName[line - 1].from
$('#from-location-name').text(fromTo)
$('#to-location-name').text(toFrom)

// Set Time list
const fromTimeListElement = timeList[0].map((time) => {
  return ` 
  <a id="${
    time.id
  }" href="/admin/reservation?line=${line}&selectedDate=${selectedDate}&selectedTime=${
    time.id
  }">
    ${moment(time.time, 'HH:mm').format('hh:mm a')}
    ${time.slot}
  </a>`
})
function fromTimeRender(timeList) {
  const fromTimeListElement = timeList.map((time) => {
    return ` 
    <a id="${
      time.id
    }" href="/admin/reservation?line=${line}&selectedDate=${selectedDate}&selectedTime=${
      time.id
    }">
      ${moment(time.time, 'HH:mm').format('hh:mm a')}
      ${time.slot}
    </a>`
  })
  $('#from-location-time-container').append(fromTimeListElement)
}

const toTimeListElement = timeList[1].map((time) => {
  return `
    <a id="${
      time.id
    }" href="/admin/reservation?line=${line}&selectedDate=${selectedDate}&selectedTime=${
    time.id
  }">
      ${moment(time.time, 'HH:mm').format('hh:mm a')}
      ${time.slot}
    </a>
  `
})

$('#from-location-time-container').append(fromTimeListElement)
$('#to-location-time-container').append(toTimeListElement)
function toTimeRender(timeList) {
  const toTimeListElement = timeList.map((time) => {
    return `
      <a id="${
        time.id
      }" href="/admin/reservation?line=${line}&selectedDate=${selectedDate}&selectedTime=${
      time.id
    }">
        ${moment(time.time, 'HH:mm').format('hh:mm a')}
        ${time.slot}
      </a>
    `
  })
  $('#to-location-time-container').append(toTimeListElement)
}

fromTimeRender(timeList[0])
toTimeRender(timeList[1])

// Filter popup
function popup() {
  var popup = document.getElementById('popup')
  popup.classList.toggle('show')
}

// Set Date list
const dateListElement = dateList.map((date) => {
  let className
  const position = dateList.indexOf(selectedDate)

  // Set style
  if (date === selectedDate) {
    className = 'main-select'
  } else if (
    dateList[position - 1] === date ||
    dateList[position + 1] === date
  ) {
    className = 'sub-select'
  } else {
    className = 'not-select'
  }

  return `<div class='${className}'>${moment(date)
    .format('MMM DD')
    .replace(/^(\D*)0/, '$1')}</div>`
})

$('#date-list').append(dateListElement)

// Select Row
let selectedData = {}
function renderPassengerList(passengerList) {
  $('#passenger-list-table').empty()
  $('#passenger-list-table').append(`
    <tr>
      <th>Name</th>
      <th>ID Number</th>
      <th>Designation</th>
      <th>Purpose</th>
    </tr>
  `)
  const passengerListElement = passengerList.map((passenger) => {
    return `
        <tr class="${passenger.status}">
          <td style="display: none">${passenger._id}</td>
          <td>${passenger.name}</td>
          <td>${passenger.id}</td>
          <td>${passenger.designation}</td>
          <td>${passenger.purpose}</td>
        </tr>
      `
  })

  $('#passenger-list-table').append(passengerListElement)

  // Select Row Hightlight
  $('#passenger-list-table tr').on('click', function () {
    // Make sure it is not th
    if ($(this).find('th').length > 0) return

    $('#passenger-list-table tr').removeClass('selected-row')
    $(this).toggleClass('selected-row')
    selectedData._id = $(this).find('td').eq(0).text()
    selectedData.name = $(this).find('td').eq(1).text()
    selectedData.id = $(this).find('td').eq(2).text()
    selectedData.designation = $(this).find('td').eq(3).text()
    selectedData.purpose = $(this).find('td').eq(4).text()
  })
}

// Set Passenger list
renderPassengerList(passengerList)

// Filter
let filter = ['pending', 'confirmed', 'rejected']
$('#confirmed').click(function (e) {
  const isChecked = $(e.target).prop('checked')
  if (isChecked) {
    filter.push('confirmed')
  } else {
    filter = filter.filter((status) => status !== 'confirmed')
  }
  const filteredPassengerList = passengerList.filter((passenger) =>
    filter.includes(passenger.status)
  )
  renderPassengerList(filteredPassengerList)
})

$('#pending').click(function (e) {
  const isChecked = $(e.target).prop('checked')
  if (isChecked) {
    filter.push('pending')
  } else {
    filter = filter.filter((status) => status !== 'pending')
  }
  const filteredPassengerList = passengerList.filter((passenger) =>
    filter.includes(passenger.status)
  )
  renderPassengerList(filteredPassengerList)
})

$('#rejected').click(function (e) {
  const isChecked = $(e.target).prop('checked')
  if (isChecked) {
    filter.push('rejected')
  } else {
    filter = filter.filter((status) => status !== 'rejected')
  }
  const filteredPassengerList = passengerList.filter((passenger) =>
    filter.includes(passenger.status)
  )
  renderPassengerList(filteredPassengerList)
})

// Confirm Reservation
$('#confirm').click(async function () {
  const id = selectedData._id

  const res = await fetch('/admin/reservation/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  const json = await res.json()

  if (json.success) {
    passengerList.find((passenger) => passenger._id === id).status = 'confirmed'
    renderPassengerList(passengerList)
  }
})

// Reject Reservation
$('#reject').click(async function () {
  console.log(selectedData)
  const id = selectedData._id

  const res = await fetch('/admin/reservation/reject', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  })

  const json = await res.json()

  if (json.success) {
    passengerList.find((passenger) => passenger._id === id).status = 'rejected'
    renderPassengerList(passengerList)
  }
})

// Confirm All
$('#confirm-all').click(async function () {
  const ids = passengerList.map((item) => item._id)

  const res = await fetch('/admin/reservation/confirm/all', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  })

  const json = await res.json()

  if (json.success) {
    const newPassengerList = passengerList.map((passenger) => {
      passenger.status = 'confirmed'
      return passenger
    })

    renderPassengerList(newPassengerList)
  }
})
