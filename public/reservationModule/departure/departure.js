// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { type } = params; 

if(type === 'one') {
  $('.last').remove()
  $('#departure-header').remove()
}

$('#from').text(from)
$('#to').text(to)

const timeElement = schedules.map((schedule, index) => {
  const className = schedule.slot > 0 ? 'green' : 'red' 
  return (`
    <label for="${index}" class="time-item">
      <input ${schedule.slot <= 0 ? 'disabled': ''} type="radio" id="${index}" name="${index}" value=${schedule.time} />
      <span>
        ${moment(schedule.time, 'HH:mm').format('hh:mm A')}
        <span class="${className}">${schedule.slot} SEATS</span>  
      </span>
    </label>
  `)
})

$('.time-container').append(timeElement)

console.log(schedules)

const getSelectedID = () => {
  const departureIds = [];
  $('.time-container input[type="radio"]:checked').each(function() {
    const schedule = schedules.find(s => s.time === $(this).val());
    schedule.ids.forEach(id => departureIds.push(id))
  });
  return departureIds;
}

$('#next').click(() => {
  const departureIds = getSelectedID();
  if(type === 'round') {
    $.redirect(`/reservation/return`, {from, to, date, departureIds}, "POST");
  }
})