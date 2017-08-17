![](https://media.giphy.com/media/oM8CvBlVubezC/giphy.gif)

# P.E.G
Pay Example is a Heroku hosted web service that demonstrates how an in-store cloud payment integration can be built to Vend's Payments API, enabling to be used on both Web and iOS platforms.

This project is intended as a guide for integrators, and includes Vendy styles and images that are free to be used.

## Contains
- Go Webservice
- Vend Payments API JavaScript (`assets/js/pay.js`)
- Vend CSS Styles
- Vend Payment Imagery

## How to use
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Deploy the application to [Heroku](https://www.heroku.com/) so that you have access to the logs, or use the hosted image that can be found at:
https://radiant-everglades-52692.herokuapp.com/

To use it, you need to add a Credit Card payment type in Vend and specify the
Heroku URL as the payment type gateway.

![](https://i.imgur.com/LhGvnZ0.png)

Then visit the Sell Screen, add products, click Pay, and choose "Payment Example (P.E.G)".
This will launch a modal contaning the Heroku content, allowing you to simulate the
payments API flows.

![](https://i.imgur.com/mCjPDZ1.gif)

## Resources
- [Vend Payments API Reference](https://docs.vendhq.com/docs/payments-api-reference)
- [Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

