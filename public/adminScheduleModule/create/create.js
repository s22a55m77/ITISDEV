function back() {
  history.back();
}

$('#date-range').daterangepicker({
  opens: 'left'
});

const lineName = [
  {
    from: "DLSU MNL",
    to: "DLSU LAG"
  },
  {
    from: "PASEO",
    to: "DLSU LAG",
  },
  {
    from: "CARMONA",
    to: "DLSU LAG",
  },
  {
    from: "PAVILION",
    to: "DLSU LAG",
  },
  {
    from: "WALTER",
    to: "DLSU LAG",
  },
]

const scheduleInformation = {
  from: null,
  to: null,
  line: null,
  label: null,
  schedules: [
    {
      from: null,
      to: null,
      weekdays: [],
      saturdays: [],
    },
    {
      from: null,
      to: null,
      weekdays: [],
      saturdays: [],
    }
  ]
}

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { line } = params; 

if(!line) {
  window.location.href = '/admin/schedule/create?line=1'
}

// set line information
const fromTo = lineName[line - 1].from + " -> " + lineName[line - 1].to;
const toFrom = lineName[line - 1].to + " -> " + lineName[line - 1].from;
$('.from').text(fromTo)
$('.to').text(toFrom)

scheduleInformation.line = line;

scheduleInformation.schedules[0].from = lineName[line - 1].from;
scheduleInformation.schedules[0].to = lineName[line - 1].to;
scheduleInformation.schedules[1].from = lineName[line - 1].to;
scheduleInformation.schedules[1].to = lineName[line - 1].from;


// set date information
$('#date-range').on('apply.daterangepicker', function(ev, picker) {
  const { startDate, endDate } = picker;
  scheduleInformation.from = startDate.format('YYYY-MM-DD');
  scheduleInformation.to = endDate.format('YYYY-MM-DD');
});

function deleteTime(from, day, time) {
  let id;
  

  // set pointer
  let pointer;
  if (from === "from")
    pointer = 0
  else 
    pointer = 1

  // remove from scheduleInformation
  if(day === "weekday") {
    id = ('#' + from + time.replace(':', '\\:') + 'weekday').toString()
    scheduleInformation.schedules[pointer].weekdays = scheduleInformation.schedules[pointer].weekdays.filter(e => e !== time)
  }
  else {
    id = ('#' + from + time.replace(':', '\\:') + 'saturday').toString()
    scheduleInformation.schedules[pointer].saturdays = scheduleInformation.schedules[pointer].saturdays.filter(e => e !== time)    
  }
  console.log(id)
  $(id).remove();

}

// Add time week from
$('#weekdays-from-time-add').click(() => {
  if ($('#weekdays-from-time-input').length) return
  $('#weekdays-from-time-container').append(
    '<input id="weekdays-from-time-input" type="time" />'
  )
})

$('#weekdays-from-time-container').on('change', '#weekdays-from-time-input', function() {
  let time24 = $('#weekdays-from-time-input').val()
  let time12 = moment(time24, 'HH:mm').format('hh:mm A')
  $('#weekdays-from-time-container').append(
    '<div id="from' + time24 + 'weekday">'
      + time12
      + '<button onclick="deleteTime(\'from\', \'weekday\' , \'' + time24 + '\')">Delete</button>' +
    '</div>'
  )
  $('#weekdays-from-time-input').remove()
  scheduleInformation.schedules[0].weekdays.push(time24)
})

// Add time week to
$('#weekdays-to-time-add').click(() => {
  if ($('#weekdays-to-time-input').length) return
  $('#weekdays-to-time-container').append(
    '<input id="weekdays-to-time-input" type="time" />'
  )
})

$('#weekdays-to-time-container').on('change', '#weekdays-to-time-input', function() {
  let time24 = $('#weekdays-to-time-input').val()
  let time12 = moment(time24, 'HH:mm').format('hh:mm A')
  $('#weekdays-to-time-container').append(
    '<div id="to' + time24 + 'weekday">'
      + time12
      + '<button onclick="deleteTime(\'to\', \'weekday\' , \'' + time24 + '\')">Delete</button>' +
    '</div>'
  )
  $('#weekdays-to-time-input').remove()
  scheduleInformation.schedules[1].weekdays.push(time24)
})

// Add time saturday from
$('#saturdays-from-time-add').click(() => {
  if ($('#saturdays-from-time-input').length) return
  $('#saturdays-from-time-container').append(
    '<input id="saturdays-from-time-input" type="time" />'
  )
})

$('#saturdays-from-time-container').on('change', '#saturdays-from-time-input', function() {
  let time24 = $('#saturdays-from-time-input').val()
  let time12 = moment(time24, 'HH:mm').format('hh:mm A')
  $('#saturdays-from-time-container').append(
    '<div id="from' + time24 + 'saturday">'
      + time12
      + '<button onclick="deleteTime(\'from\', \'saturday\' , \'' + time24 + '\')">Delete</button>' +
    '</div>'
  )
  $('#saturdays-from-time-input').remove()
  scheduleInformation.schedules[0].saturdays.push(time24)
})

// Add time saturday to
$('#saturdays-to-time-add').click(() => {
  if ($('#saturdays-to-time-input').length) return
  $('#saturdays-to-time-container').append(
    '<input id="saturdays-to-time-input" type="time" />'
  )
})

$('#saturdays-to-time-container').on('change', '#saturdays-to-time-input', function() {
  let time24 = $('#saturdays-to-time-input').val()
  let time12 = moment(time24, 'HH:mm').format('hh:mm A')
  $('#saturdays-to-time-container').append(
    '<div id="to' + time24 + 'saturday">'
      + time12
      + '<button onclick="deleteTime(\'to\', \'saturday\' , \'' + time24 + '\')">Delete</button>' +
    '</div>'
  )
  $('#saturdays-to-time-input').remove()
  scheduleInformation.schedules[1].saturdays.push(time24)
})


// save
$('#save').on('click', function() {
  scheduleInformation.label = $('#label').val();

  // store date from and to
  let dateRangePicker = $('#date-range').data('daterangepicker');
  let startDate = dateRangePicker.startDate.format('YYYY-MM-DD');
  let endDate = dateRangePicker.endDate.format('YYYY-MM-DD');

  scheduleInformation.from = startDate;
  scheduleInformation.to = endDate;

  console.log(scheduleInformation)
})