$('#from').text(from)
$('#to').text(to)

const timeElement = schedules.map((schedule, index) => {
  const className = schedule.slot > 0 ? 'green' : 'red' 
  return (`
    <label for="${index}" class="time-item">
      <input ${schedule.slot <= 0 ? 'disabled': ''} type="radio" id="${index}" name="time" value=${schedule.time} />
      <span>
        ${moment(schedule.time, 'HH:mm').format('hh:mm A')}
        <span class="${className}">${schedule.slot} SEATS</span>  
      </span>
    </label>
  `)
})

$('.time-container').append(timeElement)

const getSelectedID = () => {
  const departureIds = [];
  $('.time-container input[type="radio"]:checked').each(function() {
    const schedule = schedules.find(s => s.time === $(this).val());
    schedule.ids.forEach(id => departureIds.push(id))
  });
  return departureIds;
}

$('#next').click(() => {
  const returnIds = getSelectedID();
  const returnTime = $('input[type="radio"]:checked').val()
  $.redirect(`/reservation/confirm?type=round`, {from, to, date, departureIds, returnIds, departureTime, returnTime}, "POST");
})