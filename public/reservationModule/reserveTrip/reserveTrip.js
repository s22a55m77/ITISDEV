function renderTimeSlotWeekdays(weekdays) {
  let renderedMonths = {};
  $('#weekdays-container').empty()
  $('#weekdays-container').append(
    weekdays.map((weekday) => {
      const date = moment(weekday).format("DD")
      const month = moment(weekday).format("MMM")
      const day = moment(weekday).format("ddd") 
      let monthDiv = "<div><br/></div>";
      if (month && !renderedMonths[month]) {
        monthDiv = '<div>' + month + '</div>';
        renderedMonths[month] = true;
    }
      return (
        '<div class="date-container">' 
          + monthDiv +
          '<input type="checkbox" id="' + date + month + '" value="'+ weekday +'" />' +
          '<label for="' + date + month + '" class="day">' + 
            '<span>' + day + '</span>' + 
            date + 
          '</label>'+
        '</div>'
      )
    })
  )
}

function renderTimeSlotSaturdays(saturdays) {
  let renderedMonths = {};
  $('#saturdays-container').empty()
  $('#saturdays-container').append(
    saturdays.map((saturday) => {
      const date = moment(saturday).format("DD")
      const month = moment(saturday).format("MMM")
      const day = moment(saturday).format("ddd") 
      let monthDiv = "<div><br/></div>";
      if (month && !renderedMonths[month]) {
        monthDiv = '<div>' + month + '</div>';
        renderedMonths[month] = true;
      }
      return (
        '<div class="date-container">' 
          + monthDiv +
          '<input type="checkbox" id="' + date + month + '" value="'+ saturday +'" />' +
          '<label for="' + date + month + '" class="day">' + 
            '<span>' + day + '</span>' + 
            date + 
          '</label>'+
        '</div>'
      )
    })
  )
}

// Default Round Trip
$('#round-trip').prop('checked', true)

// Handle Change trip type
$('#round-trip').click(() => {
  if(!$('#one-way').is(':checked')) {
    $('.step-container').append('<div class="step last"></div>')
    $('#round-trip-arrow').show()
    $('#one-way-arrow').hide()
  }
})

$('#one-way').click(() => {
  if(!$('#round-trip').is(':checked')) {
    $('.last').remove()
    $('#one-way-arrow').show()
    $('#round-trip-arrow').hide()
  }
})

function checkLocationIsSelected() {
  const fromLocation = $('#from').val()
  const toLocation = $('#to').val()

  if (fromLocation == null || toLocation === null) {
    return false
  }

  return true
}

async function handleLocationChange() {
  let weekdays = []
  let saturdays = []
  if(checkLocationIsSelected()) {
    const res = await fetch(`/reservation/date?from=${$('#from').val()}&to=${$('#to').val()}`)
    .then(response => response.json())

    if(res.weekdays || res.saturdays) {
      weekdays = res.weekdays
      saturdays = res.saturdays
    }

    renderTimeSlotWeekdays(weekdays)
    renderTimeSlotSaturdays(saturdays)
  }
}

// Handle Location
$('#from').change(() => {
  handleLocationChange()
})

$('#to').change(() => {
  handleLocationChange()
})

const getSelectedDates = () => {
  const selectedDates = [];
  $('#saturdays-container input[type="checkbox"]:checked').each(function() {
    selectedDates.push($(this).val());
  });

  $('#weekdays-container input[type="checkbox"]:checked').each(function() {
    selectedDates.push($(this).val());
  });
  return selectedDates;
};

// Handle Next
$('#next').click(() => {
  const type = $('#round-trip').is(':checked') ? 'round' : 'one'
  const from = $('#from').val()
  const to = $('#to').val()
  const date = getSelectedDates()
  if(date.length === 0) {
    alert('Please select a date')
    return
  }

  $.redirect(`/reservation/departure?type=${type}`, {from, to, date}, "POST");
})