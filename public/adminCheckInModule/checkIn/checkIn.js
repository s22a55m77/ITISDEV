const passengerList = [
  {
    name: 'Parcia, John Ronn',
    id: '12136859',
    status: 'present',
  },
  {
    name: 'Parcia, John Ronn',
    id: '12136859',
    status: 'absent',
  },
]

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
