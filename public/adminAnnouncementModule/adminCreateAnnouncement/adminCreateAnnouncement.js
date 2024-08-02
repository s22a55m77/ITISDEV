// get query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { error } = params;

if(error) {
  let errorMessage = error.charAt(0).toUpperCase() + error.slice(1);
  errorMessage = errorMessage.split('-').join(' ')
  $('.toast-body').text(errorMessage)
  toastBootstrap.show(errorMessage)
}