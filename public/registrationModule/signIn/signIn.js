// Get error from param
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let value = params.error; 


// Show error
if (value) {
  // Remove - and Capitalize first letter
  let errorResult = value.split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

  $('#error').text(errorResult);
  $('#error').css('display', 'block');
}