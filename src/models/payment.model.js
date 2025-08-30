const mongoose = require("mongoose");

const PaymentModel = new mongoose.Schema({}, { timestamps: true });

const Payment = mongoose.model("Payment", PaymentModel);

module.exports = Payment;
