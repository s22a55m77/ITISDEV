const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let value = params.type; 

if (value === 'create') {
  $('#header-message').text('Create your account');
}else {
  $('#header-message').text('Sign In');
}
