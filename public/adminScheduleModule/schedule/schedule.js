const reservationLinks = document.querySelectorAll('.tab > a')

// get the query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
})
let { line, error, success } = params

reservationLinks.forEach((link) => {
  const linkUrlParams = new URLSearchParams(link.search)
  const linkLineParam = linkUrlParams.get('line')

  if (linkLineParam === line) {
    link.classList.add('tab-active')
  }
})

if(success) {
  $('.toast-body').text('Deleted successfully')
  toastBootstrap.show()
}

if(error) {
  if(error == "delete")
    $('.toast-body').text('Failed to delete')
  else if (error == "edit")
    $('.toast-body').text('Failed to edit')
  toastBootstrap.show()
}