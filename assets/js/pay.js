'use strict'

/* global $, jQuery, window */
/* eslint-env es6, quotes:single */

// Handles payment flow communication to Vend via the Payments API.
// Documentation: https://docs.vendhq.com/docs/payments-api-reference

// Permanent AJAX loaders.
$(document)
  .ajaxStart(function () {
    $('#outcomes').hide()
    $('#loader').show()
  })
  .ajaxStop(function () {
    $('#loader').hide()
  })

// Send postMessage JSON payload to the Payments API.
function sendObjectToVend (object) {
  // Define parent/opener window.
  var receiver = window.opener !== null ? window.opener : window.parent
  // Send JSON object to parent/opener window.
  receiver.postMessage(JSON.stringify(object), '*')
}

// Payments API Steps.
// https://docs.vendhq.com/docs/payments-api-reference#section-required
// ACCEPT: Trigger a successful transaction. If the payment type supports
// printing (and it is enabled) an approved transaction receipt will also print.
function acceptStep (receiptHTML) {
  console.log('sending ACCEPT step')
  sendObjectToVend({
    step: 'ACCEPT',
    receipt_html_extra: receiptHTML
  })
}

// DATA: Request additional information from Vend about the sale, payment and
// line items.
function dataStep () {
  console.log('sending DATA step')
  sendObjectToVend({
    step: 'DATA'
  })
}

// DECLINE: Return to pay screen and if enabled a declined transaction receipt
// will also print.
function declineStep (receiptHTML) {
  console.log('sending DECLINE step')
  sendObjectToVend({
    step: 'DECLINE',
    print: true,
    receipt_html_extra: receiptHTML
  })
}

// EXIT: Cleanly exit the process. Does not close the window but closes all
// other dialogs including the payment modal/iFrame and unbinds postMessage
// handling.
function exitStep () {
  console.log('sending EXIT step')
  sendObjectToVend({
    step: 'EXIT'
  })
}

// PRINT: Manually trigger a receipt, including any extra information, which is
// usually used for EMV data.
function printStep (receiptHTML) {
  console.log('sending PRINT step')
  sendObjectToVend({
    step: 'PRINT',
    receipt_html_extra: receiptHTML
  })
}

// SETUP: Customize the payment dialog. At this stage removing close button to
// prevent cashiers from prematurely closing the modal is advised, as it leads
// to interrupted payment flow without a clean exit.
function setupStep () {
  console.log('sending SETUP step')
  sendObjectToVend({
    step: 'SETUP',
    setup: {
      enable_close: false,
      header: 'Pay Example'
    }
  })
}

// Get query parameters from the URL. Vend includes amount, origin, and
// register_id.
function getURLParameters () {
  var pageURL = decodeURIComponent(window.location.search.substring(1)),
    params = pageURL.split('&'),
    paramName,
    parameters = {}

  params.forEach(function (param) {
    paramName = param.split('=')

    console.log(paramName)

    switch (paramName[0]) {
      case 'amount':
        parameters.amount = paramName[1]
        break
      case 'origin':
        parameters.origin = paramName[1]
        break
      case 'register_id':
        parameters.register_id = paramName[1]
        break
    }
  })

  console.log(parameters)

  return parameters
}

// Check response from gateway.
function checkResponse (response) {
  // Check response status field.
  switch (response.status) {
    case 'ACCEPTED':
      console.log('response: accepted')
      $('#statusMessage').empty()
      acceptStep('<div>ACCEPTED</div>')
      break
    case 'CANCELLED':
      console.log('response: cancelled')
      $('#statusMessage').empty()
      $.get('../assets/templates/cancelled.html', function (data) {
        $('#statusMessage').append(data)
      })
      setTimeout(declineStep, 4000, '<div>CANCELLED</div>')
      break
    case 'DECLINED':
      console.log('response: declined')
      $('#statusMessage').empty()
      $.get('../assets/templates/declined.html', function (data) {
        $('#statusMessage').append(data)
      })
      setTimeout(declineStep, 4000, '<div>DECLINED</div>')
      break
    case 'FAILED':
      console.log('response: failed')
      $('#statusMessage').empty()
      $.get('../assets/templates/failed.html', function (data) {
        $('#statusMessage').append(data)
      })
      setTimeout($('#outcomes').show(), 6000)
      break
    case 'UNKNOWN':
      console.log('response: unknown')
      $('#statusMessage').empty()
      $.get('../assets/templates/failed.html', function (data) {
        $('#statusMessage').append(data)
      })
      setTimeout($('#outcomes').show(), 6000)
      break
    default:
      console.log('response: unknown')
      // Do not know what we got, or something went wrong, so log it.
      console.log(response)
      $('#outcomes').show()
      break
  }
}

// sendPayment sends payment context to the gateway to begin processing the
// payment.
function sendPayment (outcome) {
  console.log('sending payment')

  // Show tap insert or swipe card prompt.
  $('#statusMessage').empty()
  $.get('../assets/templates/payment.html', function (data) {
    $('#statusMessage').append(data)
  })

  // Get the payment context from the URL query string.
  var result = {}
  result = getURLParameters()

  // If we did not at least two query params from Vend something is wrong.
  if (Object.keys(result).length < 2) {
    console.log('did not get at least two query results')
    setTimeout(exitStep(), 4000)
  }

  // Request /pay endpoint to send amount to terminal and wait for respnse.
  $.ajax({
    url: 'pay',
    type: 'GET',
    dataType: 'json',
    data: {
      amount: result.amount,
      outcome: outcome,
      origin: result.origin,
      register_id: result.register_id
    }
  })
    .done(function (response) {
      console.log(response)

      // Hide outcome buttons while we handle the response.
      $('#outcomes').hide()

      // Check the response body and act according to the payment status.
      checkResponse(response)
    })
    .fail(function (error) {
      console.log(error)

      // Make sure status text is cleared.
      $('#outcomes').hide()
      $('#statusMessage').empty()
      $.get('../assets/templates/failed.html', function (data) {
        $('#statusMessage').append(data)
      })
      // Quit window, giving cashier chance to try again.
      setTimeout(declineStep, 4000)
    })
}

// Listen for postMessage events from Vend, if requesting extra sale data then
// this is where you can handle the sale JSON.
window.addEventListener(
  'message',
  function (event) {
    console.log('received event from Vend')

    var data
    data = JSON.parse(event.data)
    console.log(data)
  },
  false
)

// On initial load of modal, configure the page settings such as removing the
// close button and setting the header.
$(function () {
  // Send the SETUP step with our configuration values..
  console.log('setting up')
  setupStep()

  $('#statusMessage').empty()
  $.get('../assets/templates/waiting.html', function (data) {
    $('#statusMessage').append(data)
  })

  // Show outcome buttons.
  $('#outcomes').show()
})
