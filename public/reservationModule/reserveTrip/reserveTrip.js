
const weekdays = [
  {day: 'MON', date: '1', month: 'July'},
  {day: 'TUE', date: '2', month: 'July'},
];
const weekends = [
  {day: 'MON', date: '6', month: 'July'},
  {day: 'MON', date: '13', month: 'July'},
];

let renderedMonths = {};

$('#weekdays-container').append(
  weekdays.map((weekday) => {
    let monthDiv = "<div><br/></div>";
    if (weekday.month && !renderedMonths[weekday.month]) {
      monthDiv = '<div>' + weekday.month + '</div>';
      renderedMonths[weekday.month] = true;
  }
    return (
      '<div class="date-container">' 
        + monthDiv +
        '<input type="checkbox" id="' + weekday.date + weekday.month + '" />' +
        '<label for="' + weekday.date + weekday.month + '" class="day">' + 
          '<span>' + weekday.day + '</span>' + 
          weekday.date + 
        '</label>'+
      '</div>'
    )
  })
)

renderedMonths = {};
$('#saturdays-container').append(
  weekends.map((weekend) => {
    let monthDiv = "<div><br/></div>";
    if (weekend.month && !renderedMonths[weekend.month]) {
      monthDiv = '<div>' + weekend.month + '</div>';
      renderedMonths[weekend.month] = true;
    }
    return (
      '<div class="date-container">' 
        + monthDiv +
        '<input type="checkbox" id="' + weekend.date + weekend.month + '" />' +
        '<label for="' + weekend.date + weekend.month + '" class="day">' + 
          '<span>' + weekend.day + '</span>' + 
          weekend.date + 
        '</label>'+
      '</div>'
    )
  })
)