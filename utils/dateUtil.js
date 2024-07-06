const moment = require('moment-timezone')

/**
 *
 * @param {String} firstDate - YYYY-MM-DD
 * @param {String} lastDate - YYYY-MM-DD
 * @returns {Array} - [YYYY-MM-DD, YYYY-MM-DD, ...]
 */
function getSaturdays(firstDate, lastDate) {
  const saturdays = []
  let currentDate = new Date(firstDate)
  const endDate = new Date(lastDate)

  while (currentDate <= endDate) {
    // Check if the current day is a Saturday (6)
    if (currentDate.getDay() === 6) {
      saturdays.push(currentDate.toISOString().slice(0, 10))
    }
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return saturdays
}

/**
 *
 * @param {String} firstDate - YYYY-MM-DD
 * @param {String} lastDate - YYYY-MM-DD
 * @returns {Array} - [YYYY-MM-DD, YYYY-MM-DD, ...]
 */
function getWeekdays(firstDate, lastDate) {
  const weekdays = []
  let currentDate = new Date(firstDate)
  const endDate = new Date(lastDate)

  while (currentDate <= endDate) {
    // Check if the current day is a weekday (Monday to Friday)
    if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
      weekdays.push(currentDate.toISOString().slice(0, 10))
    }
    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return weekdays
}

/**
 *
 * @param {Array} dates [YYYY-MM-DD, YYYY-MM-DD]
 * @param {Array} times [HH:mm, HH:mm]
 * @returns {Array} - [YYYY-MM-DDTHH:mm:ss+08:00, YYYY-MM-DDTHH:mm:ss+08:00, ...]
 */
const mergeDateAndTime = (dates, times) => {
  const mergedDates = []

  dates.forEach((date) => {
    times.forEach((time) => {
      mergedDates.push(moment(`${date} ${time}`).tz('Asia/Manila').format())
    })
  })

  return mergedDates
}

function getDateRange(startDate, endDate) {
  let dateArray = []
  let currentDate = moment(startDate)
  const end = moment(endDate)

  while (currentDate <= end) {
    dateArray.push(currentDate.format('YYYY-MM-DD'))
    currentDate = currentDate.add(1, 'days')
  }
  return dateArray
}

function getDateChanges(oldStart, oldEnd, newStart, newEnd) {
  const oldStartDate = moment(oldStart)
  const oldEndDate = moment(oldEnd)
  const newStartDate = moment(newStart)
  const newEndDate = moment(newEnd)

  const dateObjects = []

  const newDates = getDateRange(newStartDate, newEndDate)
  const oldDates = getDateRange(oldStartDate, oldEndDate)

  newDates.forEach((date) => {
    const momentDate = moment(date)
    if (momentDate.isBefore(oldStartDate) || momentDate.isAfter(oldEndDate)) {
      dateObjects.push({ type: 'add', date: date })
    }
  })

  oldDates.forEach((date) => {
    const momentDate = moment(date)
    if (momentDate.isAfter(newEndDate) || momentDate.isBefore(newStartDate)) {
      dateObjects.push({ type: 'delete', date: date })
    }
  })

  return dateObjects
}

function findNearestAndSurrounding(times, target) {
  // sort times format 'YYYY-MM-DD'
  times.sort((a, b) => moment(a).diff(b))

  const result = []

  let minDiff = Infinity
  let minIndex = -1
  // get the nearest time
  for (let i = 0; i < times.length; i++) {
    // to positive diff
    const diff =
      moment(target).diff(times[i]) > 0
        ? moment(target).diff(times[i])
        : moment(times[i]).diff(target)
    if (diff < minDiff) {
      minDiff = diff
      minIndex = i
    }
  }

  result[0] = times[minIndex - 2]
  result[1] = times[minIndex - 1]
  result[2] = times[minIndex]
  result[3] = times[minIndex + 1]
  result[4] = times[minIndex + 2]

  return result
}

module.exports = {
  getSaturdays,
  getWeekdays,
  mergeDateAndTime,
  getDateChanges,
  findNearestAndSurrounding,
}
