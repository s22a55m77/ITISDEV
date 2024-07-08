// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { type } = params; 

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
  const departureText = from + '→' + to
  const returnText = to + '→' + from 
  $('#departure').text(departureText)
  $('#return').text(returnText)
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
      '<div class="date-container">' 
        + monthDiv +
        '<div for="' + date + month + '" class="day">' + 
          '<span>' + day + '</span>' + 
          date + 
        '</div>'+
      '</div>'
    )
  })
)

$('#reserve').click(() => {
  const ids = departureIds.concat(returnIds)
  $.redirect(`/reservation/success`, {ids, purpose}, "POST");
})