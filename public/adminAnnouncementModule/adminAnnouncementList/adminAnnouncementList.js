function popup(id) {
  var popup = document.getElementById(`popup-${id}`);
  popup.classList.toggle("show");
}

function deleteAnnouncement() {
  console.log("clicked");
}

function editAnnouncement() {
  console.log("clicked");
}

function create() {
  console.log("created");
}

// get query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { success, error } = params;

if(success) {
  let successMessage = success.charAt(0).toUpperCase() + success.slice(1);
  successMessage = successMessage.split('-').join(' ')
  $('.toast-body').text(successMessage)
  toastBootstrap.show()
}

if(error) {
  let errorMessage = error.charAt(0).toUpperCase() + error.slice(1);
  errorMessage = errorMessage.split('-').join(' ')
  $('.toast-body').text(errorMessage)
  toastBootstrap.show()
}