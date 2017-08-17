// package main is a simple webservice for hosting the payment flow screens.
package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const (
	statusAccepted  = "ACCEPTED"
	statusCancelled = "CANCELLED"
	statusDeclined  = "DECLINED"
	statusFailed    = "FAILED"
	statusUnknown   = "UNKNOWN"
)

func main() {
	fileServer := http.FileServer(http.Dir("assets"))
	http.Handle("/assets/", http.StripPrefix("/assets/", fileServer))

	http.HandleFunc("/", Index)
	http.HandleFunc("/pay", PaymentHandler)

	port := "5000"
	if os.Getenv("PORT") != "" {
		port = os.Getenv("PORT")
	}

	log.Printf("Starting webserver on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

// Index displays the main payment processing page.
func Index(w http.ResponseWriter, r *http.Request) {
	template, err := template.ParseFiles("./assets/templates/index.html")
	if err != nil {
		log.Fatal(err)
	}

	err = template.Execute(w, nil)
	if err != nil {
		log.Fatal(err)
	}
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
	// "outcome" is the desired outcome of the payment flow. IMPORTANT: this is
	// only applies to this package and is not sent in production.
	r.ParseForm()
	amount := r.Form.Get("amount")
	outcome := r.Form.Get("outcome")
	origin := r.Form.Get("origin")
	registerID := r.Form.Get("register_id")

	// Reject requests with required arguments that are empty.
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
	// request to an external payment gateway to process the transaction amount.
	// Simulate waiting for a payment completion, this is generally the time it
	// takes the gateway to send the request to the terminal, the buyer to
	// complete the transaction, and the result to be returned again via the
	// gateway.
	delay := 4 * time.Second
	log.Printf("Waiting for %d seconds", delay/time.Second)
	time.Sleep(delay)

	type Response struct {
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
	default:
		status = statusUnknown
	}

	// Fake successful response. Can also send, CANCELLED, DECLINED, etc
	response := Response{
		Amount:     amountFloat,
		Status:     status,
		RegisterID: registerID,
	}
	responseJSON, err := json.Marshal(response)
	if err != nil {
		log.Println("failed to marshal response json: ", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	log.Printf("Response: %s", responseJSON)

	w.WriteHeader(http.StatusCreated)
	w.Write(responseJSON)
}
