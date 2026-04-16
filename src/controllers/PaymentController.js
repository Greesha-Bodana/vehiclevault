const crypto = require("crypto");
const { getRazorpayInstance } = require("../utils/RazorpayConfig");

const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create({
            amount: Number(amount) * 100,
            currency,
            receipt: receipt || `receipt_${Date.now()}`
        });

        res.status(201).json({
            message: "Order created successfully",
            data: order
        });
    } catch (err) {
        res.status(500).json({
            message: "Error creating payment order",
            error: err.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification fields are required"
            });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

        res.status(200).json({
            message: "Payment verified successfully"
        });
    } catch (err) {
        res.status(500).json({
            message: "Error verifying payment",
            error: err.message
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
