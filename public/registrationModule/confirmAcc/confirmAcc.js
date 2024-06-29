const urlParams = new URLSearchParams(window.location.search)
const idToken = urlParams.get('idToken')

function toSuccess() {
  window.location.href = `/auth/success?idToken=${idToken}`
}
