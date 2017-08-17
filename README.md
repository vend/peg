![](https://media.giphy.com/media/oM8CvBlVubezC/giphy.gif)

# PEG
Pay Example (peg) is a Heroku hosted web service that demonstrates how an in-store cloud payment integration can be built to Vend's Payments API, enabling to be used on both Web and iOS platforms.

This project is intended as a guide for integrators, and includes Vendy styles and images that are free to be used.

## Contains
- Go Webservice (`main.go`)
- Vend Payments API JavaScript (`assets/js/pay.js`)
- Vend CSS Styles (`assets/sass/app.scss`)
- Vend Payment Imagery (`assets/images/*`)

## How to use
[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

1. Deploy the application to [Heroku](https://www.heroku.com/) so that you have full access to the logs. A current image that can be used, but is not likely to stick around, exists here: https://radiant-everglades-52692.herokuapp.com/
2. Create a trial Vend account, and add a new Credit Card payment type, name it "Pay Example".
3. Edit the Pay Example payment type, and enter the newly created Heroku URL as the payment type gateway address. ![](https://i.imgur.com/LhGvnZ0.png)
4. Go to the Sell Screen on Web or iOS, add a product, click Pay, and choose "Payment Example". This will launch a modal contaning the Pay Example app, allowing you to simulate the payment API flows. 

![](https://i.imgur.com/mCjPDZ1.gif)

## Resources
- [Vend Payments API Reference](https://docs.vendhq.com/docs/payments-api-reference)
- [Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

