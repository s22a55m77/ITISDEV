function back() {
  window.location.href = '/admin/schedule'
}

function dateFormat(start, end) {
  $('#date-range span').html(start.format('MMM D') + ' - ' + end.format('MMM D'));
}

$('#date-range').daterangepicker({
  opens: 'left',
}, dateFormat)

dateFormat(moment(), moment())

const lineName = [
  {
    from: 'DLSU MNL',
    to: 'DLSU LAG',
  },
  {
    from: 'PASEO',
    to: 'DLSU LAG',
  },
  {
    from: 'CARMONA',
    to: 'DLSU LAG',
  },
  {
    from: 'PAVILION',
    to: 'DLSU LAG',
  },
  {
    from: 'WALTER',
    to: 'DLSU LAG',
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
    },
  ],
}

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
})
let { line } = params

if (!line) {
  window.location.href = '/admin/schedule/create?line=1'
}

// set line information
const fromTo = lineName[line - 1].from + ' -> ' + lineName[line - 1].to
const toFrom = lineName[line - 1].to + ' -> ' + lineName[line - 1].from
$('.from').text(fromTo)
$('.to').text(toFrom)

scheduleInformation.line = line

scheduleInformation.schedules[0].from = lineName[line - 1].from
scheduleInformation.schedules[0].to = lineName[line - 1].to
scheduleInformation.schedules[1].from = lineName[line - 1].to
scheduleInformation.schedules[1].to = lineName[line - 1].from

// set date information
$('#date-range').on('apply.daterangepicker', function (ev, picker) {
  const { startDate, endDate } = picker
  scheduleInformation.from = startDate.format('YYYY-MM-DD')
  scheduleInformation.to = endDate.format('YYYY-MM-DD')
})

function deleteTime(from, day, time) {
  let id

  // set pointer
  let pointer
  if (from === 'from') pointer = 0
  else pointer = 1

  // remove from scheduleInformation
  if (day === 'weekday') {
    id = ('#' + from + time.replace(':', '\\:') + 'weekday').toString()
    scheduleInformation.schedules[pointer].weekdays =
      scheduleInformation.schedules[pointer].weekdays.filter((e) => e !== time)
  } else {
    id = ('#' + from + time.replace(':', '\\:') + 'saturday').toString()
    scheduleInformation.schedules[pointer].saturdays =
      scheduleInformation.schedules[pointer].saturdays.filter((e) => e !== time)
  }
  $(id).remove()
}

// Add time week from
$('#weekdays-from-time-add').click(() => {
  if ($('#weekdays-from-time-input').length) return
  $('#weekdays-from-time-container').append(
    '<input id="weekdays-from-time-input" type="time" />'
  )
})

const deleteSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <circle cx="8.5" cy="8.5" r="8" stroke="#A70000"/>
                    <rect x="4" y="8" width="9" height="1" fill="#A70000"/>
                  </svg>`

$('#weekdays-from-time-container').on(
  'change',
  '#weekdays-from-time-input',
  function () {
    let time24 = $('#weekdays-from-time-input').val()
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    $('#weekdays-from-time-container').append(
      `
      <div class="time-item" id="from${time24}weekday">
          ${time12}
          <div onclick="deleteTime('from', 'weekday', '${time24}')">${deleteSVG}</div>
      </div>
      `
    )
    $('#weekdays-from-time-input').remove()
    scheduleInformation.schedules[0].weekdays.push(time24)
  }
)

// Add time week to
$('#weekdays-to-time-add').click(() => {
  if ($('#weekdays-to-time-input').length) return
  $('#weekdays-to-time-container').append(
    '<input id="weekdays-to-time-input" type="time" />'
  )
})

$('#weekdays-to-time-container').on(
  'change',
  '#weekdays-to-time-input',
  function () {
    let time24 = $('#weekdays-to-time-input').val()
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    $('#weekdays-to-time-container').append(
      `
      <div class="time-item" id="to${time24}weekday">
          ${time12}
          <div onclick="deleteTime('to', 'weekday', '${time24}')">${deleteSVG}</div>
      </div>
      `
    )
    $('#weekdays-to-time-input').remove()
    scheduleInformation.schedules[1].weekdays.push(time24)
  }
)

// Add time saturday from
$('#saturdays-from-time-add').click(() => {
  if ($('#saturdays-from-time-input').length) return
  $('#saturdays-from-time-container').append(
    '<input id="saturdays-from-time-input" type="time" />'
  )
})

$('#saturdays-from-time-container').on(
  'change',
  '#saturdays-from-time-input',
  function () {
    let time24 = $('#saturdays-from-time-input').val()
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    $('#saturdays-from-time-container').append(
      `
      <div class="time-item" id="from${time24}saturday">
          ${time12}
          <div onclick="deleteTime('from', 'saturday', '${time24}')">${deleteSVG}</div>
      </div>
      `
    )
    $('#saturdays-from-time-input').remove()
    scheduleInformation.schedules[0].saturdays.push(time24)
  }
)

// Add time saturday to
$('#saturdays-to-time-add').click(() => {
  if ($('#saturdays-to-time-input').length) return
  $('#saturdays-to-time-container').append(
    '<input id="saturdays-to-time-input" type="time" />'
  )
})

$('#saturdays-to-time-container').on(
  'change',
  '#saturdays-to-time-input',
  function () {
    let time24 = $('#saturdays-to-time-input').val()
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    $('#saturdays-to-time-container').append(
      `
      <div class="time-item" id="to${time24}saturday">
          ${time12}
          <div onclick="deleteTime('to', 'saturday', '${time24}')">${deleteSVG}</div>
      </div>
      `
    )
    $('#saturdays-to-time-input').remove()
    scheduleInformation.schedules[1].saturdays.push(time24)
  }
)

// save
$('#save').on('click', async function () {
  scheduleInformation.label = $('#label').val()

  if(scheduleInformation.label === '') {
    $('.toast-body').text('Please fill in the label')
    toastBootstrap.show()
    return
  }

  // store date from and to
  let dateRangePicker = $('#date-range').data('daterangepicker')
  let startDate = dateRangePicker.startDate.format('YYYY-MM-DD')
  let endDate = dateRangePicker.endDate.format('YYYY-MM-DD')


  scheduleInformation.from = startDate
  scheduleInformation.to = endDate

  const res = await fetch('/admin/schedule/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scheduleInformation),
  })

  const json = await res.json()

  if (json.success) {
    window.location.href = '/admin/schedule?success=create'
  } else {
    window.location.href = `/admin/schedule/create?error=create&line=${scheduleInformation.line}`
  }

})

const reservationLinks = document.querySelectorAll('.tab > a')

reservationLinks.forEach((link) => {
  const linkUrlParams = new URLSearchParams(link.search)
  const linkLineParam = linkUrlParams.get('line')

  if (linkLineParam === line) {
    link.classList.add('tab-active')
  }
})
