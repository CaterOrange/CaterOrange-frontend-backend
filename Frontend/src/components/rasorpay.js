import React, { useState } from "react";
import axios from "axios";

const Razorpay = () => {
  const [amount, setAmount] = useState("");


  const handlePayment = async () => {
    try {
        console.log("entered");

        if (!window.Razorpay) {
            alert("Razorpay SDK failed to load. Check your internet connection.");
            return;
          }

      const { data } = await axios.post('http://localhost:4000/api/create-order', {
        amount: amount,
        currency: "INR",
        corporateorder_id:"id"
      });
      console.log("entered-1");
      const options = {
        key: 'rzp_test_Kt3z43uPYnvC9E', 
        amount: data.amount,
        currency: data.currency,
        name: "CaterOrange",
        description: "Test Payment",
        order_id: data.id,
        handler: async (response) => {
          console.log("response",response);
          const verifyRes = await axios.post('http://localhost:4000/api/verify-payment', response);
          alert(verifyRes.data.message);
          console.log(verifyRes.data.message)
        },
        prefill: {
          name: "Pratap ",
          email: "Pratap@gmail.com",
          contact: "1111111111",
        },
        theme: { color: "#3399cc" },
      };
      console.log("entered-2");
      console.log("create-order",data);
      const razor = new window.Razorpay(options);
      console.log("entered-3");
      razor.open();
    } catch (error) {
      console.error(error);
      alert("Payment Failed!");
    }
  };

  return (
    <div>
      <h2>Razorpay Payment Integration</h2>
      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default Razorpay;
