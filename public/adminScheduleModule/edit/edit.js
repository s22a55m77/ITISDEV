function back() {
  history.back();
}

$('#date-range').daterangepicker({
  opens: 'left',
  startDate: moment('2024-06-01'),
  endDate: moment('2024-06-30'),
});

function edit() {
  $('#date').hide();
  $('#date-range').show();
}