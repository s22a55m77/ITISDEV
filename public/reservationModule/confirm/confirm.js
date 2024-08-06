// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { type } = params; 

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="#417845"/>
            </svg>`

if(type === 'one') {
  $('#trip-type').text('One Way')
  $('.round-trip-information').hide()
  $('#from').text(from)
  $('#to').text(to)
  const departureTimeText = moment(departureTime, 'HH:mm').format('hh:mm A')
  $('#one-way-departure-time').text(departureTimeText)
}
else {
  $('#trip-type').text('Round Trip')
  $('.round-trip-information').show()
  $('.one-way-information').hide()
  $('.one-way-information-time').hide()
  const departureText = from + svg + to
  const returnText = to + svg + from 
  $('#departure').html(departureText)
  $('#return').html(returnText)
  $('#departure-time').text(moment(departureTime, 'HH:mm').format('hh:mm A'))
  $('#return-time').text(moment(returnTime, 'HH:mm').format('hh:mm A'))
}

let renderedMonths = {};
$('#selected-dates-container').append(
  date.map((selecteddate) => {
    const date = moment(selecteddate).format("DD")
    const month = moment(selecteddate).format("MMM")
    const day = moment(selecteddate).format("ddd") 
    let monthDiv = "<div><br/></div>";
    if (month && !renderedMonths[month]) {
      monthDiv = '<div>' + month + '</div>';
      renderedMonths[month] = true;
  }
    return (
      `
        <div class="date-container">
          <div class="month-display">${monthDiv}</div>
          <div for="${date + month}" class="day">
          <span>${day}</span>
           <span class="date-display">${date}</span>
          </div>
        </div>
      `
    )
  })
)

$('#reserve').click(() => {
  const ids = departureIds.concat(returnIds)
  $.redirect(`/reservation/success`, {ids, purpose}, "POST");
})