// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { type } = params; 

if(type === 'one') {
  $('#trip-type').text('One Way')
  $('.round-trip-information').hide()
}
else {
  $('#trip-type').text('Round Trip')
  $('.round-trip-information').show()
}

const departureText = from + '→' + to
const returnText = to + '→' + from 
$('#departure').text(departureText)
$('#return').text(returnText)

let renderedMonths = {};
$('#selected-dates-container').append(
  selectedDate.map((date) => {
    const date = moment(date).format("DD")
    const month = moment(date).format("MMM")
    const day = moment(date).format("ddd") 
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