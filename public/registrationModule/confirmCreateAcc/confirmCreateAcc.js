const urlParams = new URLSearchParams(window.location.search)
const idToken = urlParams.get('idToken')

function toCreateAccount() {
  window.location.href = `/auth/create?idToken=${idToken}`
}
