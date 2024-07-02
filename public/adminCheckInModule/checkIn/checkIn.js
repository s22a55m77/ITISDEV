const passengerList = [
  {
    name: 'Parcia, John Ronn',
    id: '12136859',
    type: 'present'
  },
  {
    name: 'Parcia, John Ronn',
    id: '12136859',
    type: 'absent'
  },
]

const passengerListElement = passengerList.map((passenger) => {
  return (`
    <div class="passenger-item">
      <div class="${passenger.type}"></div>
      <div>${passenger.name}</div>
      <div>${passenger.id}</div>
    </div>
  `)
})

$('#passenger-list-container').append(passengerListElement)