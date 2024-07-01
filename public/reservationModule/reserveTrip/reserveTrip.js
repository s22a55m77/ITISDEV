
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
        '<div class="day" onclick="dateSelect(\'' + weekday.date + '\', \'' + weekday.month + '\')">' + 
          '<span>' + weekday.day + '</span>' + 
          weekday.date + 
        '</div>'+
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
        '<div class="day" onclick="dateSelect(\'' + weekend.date + '\', \'' + weekend.month + '\')">' + 
          '<span>' + weekend.day + '</span>' + 
          weekend.date + 
        '</div>'+
      '</div>'
    )
  })
)

function dateSelect(date, month) {
  console.log('date selected', date, month);
}