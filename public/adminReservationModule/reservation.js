const dateList = [
  '2024-06-29',
  '2024-06-30',
  '2024-07-01',
  '2024-07-02',
  '2024-07-03',
]

  const passengerList = [
    {
      name: 'Parcia, John Ronn',
      id: '12136859',
      designation: 'no LAG classes',
      purpose: 'campus visit',
      status: 'pending'
    },
    {
      name: 'Parcia, John Ronn',
      id: '12136859',
      designation: 'no LAG classes',
      purpose: 'laboratory visit',
      status: 'confirmed'
    },
    {
      name: 'Parcia, John Ronn',
      id: '12136859',
      designation: 'no LAG classes',
      purpose: 'laboratory visit',
      status: 'rejected'
    },
  ]

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { line, selectedDate, selectedTime } = params; 

// Filter popup
function popup() {
  var popup = document.getElementById("popup");
  popup.classList.toggle("show");
}

// Set Date list
const dateListElement = dateList.map(date => {
  let className;
  const position = dateList.indexOf(selectedDate)

  // Set style
  if (date === selectedDate) {
    className = 'main-select'
  } else if (dateList[position - 1] === date || dateList[position + 1] === date) {
    className = 'sub-select'
  } else {
    className = 'not-select'
  }

  return (
    `<div class='${className}'>${moment(date).format('MMM DD').replace(/^(\D*)0/, '$1')}</div>`
  )
})

$('#date-list').append(dateListElement)


// Select Row
let selectedData = {};
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
  const passengerListElement = passengerList.map(passenger => {
    return (
      `
        <tr class="${passenger.status}">
          <td>${passenger.name}</td>
          <td>${passenger.id}</td>
          <td>${passenger.designation}</td>
          <td>${passenger.purpose}</td>
        </tr>
      `
    )
  })

  $('#passenger-list-table').append(passengerListElement)

  // Select Row Hightlight
  $('#passenger-list-table tr').on('click' ,function() {
    // Make sure it is not th
    if($(this).find('th').length > 0)
      return;
    
    $('#passenger-list-table tr').removeClass('selected-row')
    $(this).toggleClass('selected-row')
     selectedData.name = $(this).find('td').eq(0).text();
     selectedData.id = $(this).find('td').eq(1).text();
     selectedData.designation = $(this).find('td').eq(2).text();
     selectedData.purpose = $(this).find('td').eq(3).text();
  })
}

// Set Passenger list
renderPassengerList(passengerList)

// Filter
let filter = ['pending', 'confirmed', 'rejected'];
$('#confirmed').click(function(e) {
  const isChecked = $(e.target).prop('checked');
  if (isChecked) {
    filter.push('confirmed');
  } else {
    filter = filter.filter(status => status !== 'confirmed')
  }
  const filteredPassengerList = passengerList.filter(passenger => filter.includes(passenger.status));
  renderPassengerList(filteredPassengerList)
})

$('#pending').click(function(e) {
  const isChecked = $(e.target).prop('checked');
  if (isChecked) {
    filter.push('pending');
  } else {
    filter = filter.filter(status => status !== 'pending')
  }
  const filteredPassengerList = passengerList.filter(passenger => filter.includes(passenger.status));
  renderPassengerList(filteredPassengerList)
})

$('#rejected').click(function(e) {
  const isChecked = $(e.target).prop('checked');
  if (isChecked) {
    filter.push('rejected');
  } else {
    filter = filter.filter(status => status !== 'rejected')
  }
  const filteredPassengerList = passengerList.filter(passenger => filter.includes(passenger.status));
  renderPassengerList(filteredPassengerList)
})

// Confirm Reservation
$('#confirm').click(function() {
  console.log(selectedData)
})

// Reject Reservation
$('#reject').click(function() {
  console.log(selectedData)
})