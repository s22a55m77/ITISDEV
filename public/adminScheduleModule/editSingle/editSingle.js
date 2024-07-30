function back() {
  history.back()
}

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

// Set line information
const fromTo = lineName[line - 1].from + ' -> ' + lineName[line - 1].to
const toFrom = lineName[line - 1].to + ' -> ' + lineName[line - 1].from
$('.from').text(fromTo)
$('.to').text(toFrom)

scheduleInformation = JSON.parse(scheduleInformation.replaceAll('&#34;', '"'))

// Set fromName
const fromName = $('.from').text().split('->')[0].trim()
const toName = $('.to').text().split('->')[0].trim()

const editInformation = {
  id: id,
  deletedTime: [],
  addedTime: [
    {
      from: fromName,
      to: toName,
      weekdays: [],
      saturdays: [],
    },
    {
      from: toName,
      to: fromName,
      weekdays: [],
      saturdays: [],
    },
  ],
  label: label,
  from: from,
  to: to,
}

// Set Date information
let dateDisplay = moment(from).format('MMM D')

if (to != '') {
  console.log(to)
  dateDisplay += '-' + moment(to).format('MMM D')
}

$('#date').text(dateDisplay)

// Handle delete time
function deleteTime(from, to, time, isWeekday, isLocal) {
  if (!isLocal) {
    editInformation.deletedTime.push({
      from,
      to,
      time,
      isWeekday,
    })
  } else {
    const pointer = from === fromName ? 0 : 1
    if (isWeekday === 'true')
      editInformation.addedTime[pointer].weekdays = editInformation.addedTime[
        pointer
      ].weekdays.filter((e) => e !== time)
    else
      editInformation.addedTime[pointer].saturdays = editInformation.addedTime[
        pointer
      ].saturdays.filter((e) => e !== time)
  }
  let id = (
    '#' +
    from.replaceAll(' ', '') +
    time.replace(':', '\\:')
  ).toString()
  id = isWeekday === 'true' ? id + 'weekday' : id + 'saturday'
  $(id).remove()
}

// Set Time information
// Set From time
const fromTime = scheduleInformation.filter(
  (schedule) => schedule.from === fromName
)
const toTime = scheduleInformation.filter(
  (schedule) => schedule.from === toName
)

const deleteSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <circle cx="8.5" cy="8.5" r="8" stroke="#A70000"/>
                    <rect x="4" y="8" width="9" height="1" fill="#A70000"/>
                  </svg>`

// weekdays
$('#weekdays-from-time-container').append(
  fromTime[0].weekdays.map((time24) => {
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    return `
        <div class="time-item" id="${fromName.replaceAll(
          ' ',
          ''
        )}${time24}weekday">
          ${time12}
          <div onclick="deleteTime('${fromName}', '${toName}', '${time24}', 'true')">${deleteSVG}</div>
        </div>
      `
  })
)
// saturdays
$('#saturdays-from-time-container').append(
  fromTime[0].saturdays.map((time24) => {
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    return `
      <div class="time-item" id="${fromName.replaceAll(
        ' ',
        ''
      )}${time24}saturday">
        ${time12}
        <div onclick="deleteTime('${fromName}', '${toName}', '${time24}', 'false')">${deleteSVG}</div>
      </div>
      `
  })
)

// Set To time
// weekdays
$('#weekdays-to-time-container').append(
  toTime[0]?.weekdays?.map((time24) => {
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    return `
        <div class="time-item" id="${toName.replaceAll(
          ' ',
          ''
        )}${time24}weekday">
          ${time12}
          <div onclick="deleteTime('${toName}', '${fromName}', '${time24}', 'true')">${deleteSVG}</div>
        </div>
      `
  })
)
// saturdays
$('#saturdays-to-time-container').append(
  toTime[0]?.saturdays?.map((time24) => {
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    return `
      <div class="time-item" id="${toName.replaceAll(
        ' ',
        ''
      )}${time24}saturday">
        ${time12}
        <div onclick="deleteTime('${toName}', '${fromName}', '${time24}', 'false')">${deleteSVG}</div>
      </div>
      `
  })
)

// Handle Add time
// Add time week from
// weekday
$('#weekdays-from-time-add').click(() => {
  if ($('#weekdays-from-time-input').length) return
  $('#weekdays-from-time-container').append(
    '<input id="weekdays-from-time-input" type="time" />'
  )
})

$('#weekdays-from-time-container').on(
  'change',
  '#weekdays-from-time-input',
  function () {
    let time24 = $('#weekdays-from-time-input').val()
    let time12 = moment(time24, 'HH:mm').format('hh:mm A')
    $('#weekdays-from-time-container').append(
      `
      <div class="time-item" id="${fromName.replaceAll(
        ' ',
        ''
      )}${time24}weekday">
          ${time12}
          <div onclick="deleteTime('${fromName}', '${toName}', '${time24}', 'true', 'true')">${deleteSVG}</div>
      </div>
      `
    )
    $('#weekdays-from-time-input').remove()
    editInformation.addedTime[0].weekdays.push(time24)
  }
)
// saturday
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
      <div class="time-item" id="${fromName.replaceAll(
        ' ',
        ''
      )}${time24}saturday">
        ${time12}
        <div onclick="deleteTime('${fromName}', '${toName}', '${time24}', 'false', 'true')">${deleteSVG}</div>
      </div>
      `
    )
    $('#saturdays-from-time-input').remove()
    editInformation.addedTime[0].saturdays.push(time24)
  }
)

// Add time week to
// weekday
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
      <div class="time-item" id="${toName.replaceAll(' ', '')}${time24}weekday">
        ${time12}
        <div onclick="deleteTime('${toName}', '${fromName}', '${time24}', 'true', 'true')">${deleteSVG}</div>
      </div>
      `
    )
    $('#weekdays-to-time-input').remove()
    editInformation.addedTime[1].weekdays.push(time24)
  }
)
// saturday
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
      <div class="time-item" id="${toName.replaceAll(
        ' ',
        ''
      )}${time24}saturday">
        ${time12}
        <div onclick="deleteTime('${toName}', '${fromName}', '${time24}', 'false', 'true')">${deleteSVG}</div>
      </div>
      `
    )
    $('#saturdays-to-time-input').remove()
    editInformation.addedTime[1].saturdays.push(time24)
  }
)

// Save
$('#save').click(async function () {
  editInformation.label = $('#label').val()
  console.log(date)
  const res = await fetch(`/admin/schedule/edit/single/${date}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(editInformation),
  })

  const json = await res.json()

  if (json.success) {
    window.location.href = '/admin/schedule?success=true'
  } else {
    window.location.href = `/admin/schedule/edit/${editInformation.id}?error=edit`
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

$('#edit-single').click(() => {
  const date = moment(from).format('YYYY-MM-DD')
  // get the query
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  })
  const { line } = params
  window.location.href = `/admin/schedule/edit/single/${date}?line=${line}`
})
