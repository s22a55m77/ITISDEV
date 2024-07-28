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

// Set Time list
function fromTimeRender(timeList) {
  $('#from-location-time-container').empty()
  $('#from-location-time-container').append(
    '<div id="from-location-name"></div>'
  )
  $('#from-location-name').text(fromTo)
  const fromTimeListElement = timeList?.map((time) => {
    return ` 
    <a id="${
      time.id
    }" href="/admin/reservation?line=${line}&selectedDate=${selectedDate}&selectedTime=${
      time.id
    }">
      ${moment(time.time, 'HH:mm').format('hh:mm A')}
      ${
        time.slot > 0
          ? `<span class="green-slot">${time.slot} SEATS LEFT</span>`
          : `<span class="red-slot">${time.slot} SEATS LEFT</span>`
      }
    </a>`
  })
  $('#from-location-time-container').append(fromTimeListElement)
}

function toTimeRender(timeList) {
  $('#to-location-time-container').empty()
  $('#to-location-time-container').append('<div id="to-location-name"></div>')
  $('#to-location-name').text(toFrom)
  const toTimeListElement = timeList?.map((time) => {
    return `
      <a id="${
        time.id
      }" href="/admin/reservation?line=${line}&selectedDate=${selectedDate}&selectedTime=${
      time.id
    }">
        ${moment(time.time, 'HH:mm').format('hh:mm A')}
        ${
          time.slot > 0
            ? `<span class="green-slot">${time.slot} SEATS LEFT</span>`
            : `<span class="red-slot">${time.slot} SEATS LEFT</span>`
        }
      </a>
    `
  })
  $('#to-location-time-container').append(toTimeListElement)
}

fromTimeRender(timeList[0])
toTimeRender(timeList[1])

$('#popup-btn').click(function () {
  var popup = document.getElementById('popup')
  popup.classList.toggle('show')
})

const dateListElement = []

if (dateList.length === 0) {
  dateListElement.push(`<div class='main-select'>No Schedule</div>`)
}

// Set Date list
dateList.forEach((date) => {
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

  if (date) {
    dateListElement.push(
      `<div><a class='${className}' href="/admin/reservation?line=${line}&selectedDate=${date}">${moment(
        date
      )
        .format('MMM DD')
        .replace(/^(\D*)0/, '$1')}</a></div>`
    )
  } else {
    dateListElement.push(`<div class='${className}'>No Schedule</div>`)
  }
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

// Get Stats
function displayStats() {
  const pending = passengerList.filter(
    (passenger) => passenger.status === 'pending'
  ).length
  const confirmed = passengerList.filter(
    (passenger) => passenger.status === 'confirmed'
  ).length
  const rejected = passengerList.filter(
    (passenger) => passenger.status === 'rejected'
  ).length

  $('#pending-count').text(pending)
  $('#confirmed-count').text(confirmed)
  $('#rejected-count').text(rejected)
}

// Set Passenger list
renderPassengerList(passengerList)
displayStats()

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

    if (timeList[0]) {
      let index = timeList[0].findIndex((time) => time.id === json.id)
      if (index != -1) {
        timeList[0][index].slot = json.slot
        fromTimeRender(timeList[0])
      }
    }

    if (timeList[1]) {
      index = timeList[1].findIndex((time) => time.id === json.id)
      if (index != -1) {
        timeList[1][index].slot = json.slot
        toTimeRender(timeList[1])
      }
    }

    renderPassengerList(passengerList)
    displayStats()
  }
})

// Reject Reservation
$('#reject').click(async function () {
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

    if (timeList[0]) {
      let index = timeList[0].findIndex((time) => time.id === json.id)
      if (index != -1) {
        timeList[0][index].slot = json.slot
        fromTimeRender(timeList[0])
      }
    }

    if (timeList[1]) {
      index = timeList[1].findIndex((time) => time.id === json.id)
      if (index != -1) {
        timeList[1][index].slot = json.slot
        toTimeRender(timeList[1])
      }
    }

    renderPassengerList(passengerList)
    displayStats()
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

    let index = timeList[0].findIndex((time) => time.id === json.id)
    if (index != -1) {
      timeList[0][index].slot = json.slot
      fromTimeRender(timeList[0])
    }
    index = timeList[1].findIndex((time) => time.id === json.id)
    if (index != -1) {
      timeList[1][index].slot = json.slot
      toTimeRender(timeList[1])
    }
    renderPassengerList(newPassengerList)
    displayStats()
  }
})

$('#prev-date').click(function () {
  const prevDate = dateList[dateList.indexOf(selectedDate) - 1]
  if (prevDate) {
    window.location.href = `/admin/reservation?line=${line}&selectedDate=${prevDate}`
  }
})

$('#next-date').click(function () {
  const nextDate = dateList[dateList.indexOf(selectedDate) + 1]
  if (nextDate) {
    window.location.href = `/admin/reservation?line=${line}&selectedDate=${nextDate}`
  }
})

const reservationLinks = document.querySelectorAll('.tab > a')

reservationLinks.forEach((link) => {
  const linkUrlParams = new URLSearchParams(link.search)
  const linkLineParam = linkUrlParams.get('line')

  if (linkLineParam === line) {
    link.classList.add('tab-active')
  }
})
