// get query
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let { time, to, from, date } = params;

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

const qrCodeSuccessCallback = (() => {
  const actualCallback = (decodedText) => {
    window.location.href = `/admin/checkin/result/?from=${from}&to=${to}&time=${time}&date=${date}&passengerId=${decodedText}`;
    console.log(`Scan result: ${decodedText}`);
  };

  return debounce(actualCallback, 300);
})();

const fullconfig = { 
  formatsToSupport: [ Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_93],
};

const screenWidth = window.innerWidth;
const qrBoxSize = screenWidth * 0.4;
const config = {
  fps: 10, 
  qrbox: { width: qrBoxSize, height: qrBoxSize },
}

const html5QrCode = new Html5Qrcode("reader", fullconfig);

// If you want to prefer front camera
html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback);