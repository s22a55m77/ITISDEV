const qrCodeSuccessCallback = (decodedText, decodedResult) => {
  console.log(decodedText)
}
const fullconfig = {
  formatsToSupport: [
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_93,
  ],
}

const config = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
}

const html5QrCode = new Html5Qrcode('scanner', fullconfig)

html5QrCode.start({ facingMode: 'environment' }, config, qrCodeSuccessCallback)
