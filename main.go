// package main is a simple webservice for hosting Pay Example flow screens.
package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

// These are the possible sale statuses.
const (
	statusAccepted  = "ACCEPTED"
	statusCancelled = "CANCELLED"
	statusDeclined  = "DECLINED"
	statusFailed    = "FAILED"
	statusTimeout   = "TIMEOUT"
	statusUnknown   = "UNKNOWN"
)

func main() {
	// We are hosting all of the content in ./assets, as the resources are
	// required by the frontend.
	fileServer := http.FileServer(http.Dir("assets"))
	http.Handle("/assets/", http.StripPrefix("/assets/", fileServer))

	http.HandleFunc("/", Index)
	http.HandleFunc("/pay", PaymentHandler)

	// The default port is 500, but one can be specified as an env var if needed.
	port := "5000"
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}

	log.Printf("Starting webserver on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// Index displays the main payment processing page, giving the user options of
// which outcome they would like the Pay Example to simulate.
func Index(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./assets/templates/index.html")
}

// PaymentHandler receives the payment request from Vend and sends it to the
// payment gateway.
func PaymentHandler(w http.ResponseWriter, r *http.Request) {
	// Vend sends multiple arguments for use by the gateway.
	// "amount" is the subtotal of the sale including tax.
	// "origin" is the Vend store URL that the transaction came from.
	//
	// optional:
	// "register_id" is the ID of the Vend register that sent the transaction.
	// "outcome" is the desired outcome of the payment flow.
	r.ParseForm()
	amount := r.Form.Get("amount")
	outcome := r.Form.Get("outcome") // IMPORTANT: this only applies to this package and is never sent in production.
	origin := r.Form.Get("origin")
	registerID := r.Form.Get("register_id")

	// Reject requests with required arguments that are empty. By default Vend
	// on both Web and iOS will always send at least amount and origin values.
	// The "DATA" step can be used to obtain extra details like register_id,
	// that should be used to associate a register with a payment terminal.
	if amount == "" || origin == "" {
		log.Printf("received empty param value. required: amount %s origin %s optional: register_id %s outcome %s", amount, origin, registerID, outcome)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// If no outcome was specified, then just follow the happy transaction flow.
	if outcome == "" {
		outcome = statusAccepted
	}

	// Convert the amount string to a float.
	amountFloat, err := strconv.ParseFloat(amount, 64)
	if err != nil {
		log.Println("failed to convert amount string to float: ", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// Reject zero amounts.
	if amountFloat == 0 {
		log.Println("zero amount received")
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	log.Printf("Received %f from %s for register %s", amountFloat, origin, registerID)

	// Here is the point where you have all the information you need to send a
	// request to your payment gateway or terminal to process the transaction
	// amount.
	//
	// To suggest this, we simulate waiting for a payment completion for a few
	// seconds. In reality this step can take much longer as the buyer completes
	// the terminal instruction, and the amount is sent to the processor for
	// approval.
	delay := 4 * time.Second
	log.Printf("Waiting for %d seconds", delay/time.Second)
	time.Sleep(delay)

	// We build a JSON response object that contains important information for
	// which step we should send back to Vend to guide the payment flow.
	type Response struct {
		ID         int     `json:"id"`
		Amount     float64 `json:"amount"`
		RegisterID string  `json:"register_id"`
		Status     string  `json:"status"`
	}

	var status string
	switch strings.ToUpper(outcome) {
	case "ACCEPT":
		status = statusAccepted
	case "CANCEL":
		status = statusCancelled
	case "DECLINE":
		status = statusDeclined
	case "FAIL":
		status = statusFailed
	case "TIMEOUT":
		status = statusTimeout
	default:
		status = statusUnknown
	}

	// NOTE: This is a future state, Vend does not currently accept a this value
	// through the ACCEPT step of the Payments API.
	// Specify an external transaction ID. This value can be sent back to Vend with
	// the "ACCEPT" step as the JSON key "transaction_id".
	shortID := rand.Intn(1000000000)

	// Build our response content, including the amount approved and the Vend
	// register that originally sent the payment.
	response := Response{
		ID:         shortID,
		Amount:     amountFloat,
		Status:     status,
		RegisterID: registerID,
	}

	// Marshal our response into JSON.
	responseJSON, err := json.Marshal(response)
	if err != nil {
		log.Println("failed to marshal response json: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Printf("Response: %s", responseJSON)

	// Respond with status created (201), as we are returning a description of
	// the created object, rather than a representation of it.
	// https://tools.ietf.org/html/rfc7231#section-6.3.2
	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}
