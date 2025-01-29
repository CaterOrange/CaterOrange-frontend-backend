const customerSchema = {
    type: "object",
    properties: {
      customer_name: {
        type: "string",
        pattern: "^[A-Za-z\\s]+$", // Allows only alphabets and spaces
        minLength: 1,
      },
      customer_email: {
        type: "string",
        format: "email", // Validates email format
      },
      customer_password: {
        type: "string",
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$", // At least one uppercase, one lowercase, one digit, and minimum 8 characters
      },
      customer_phonenumber: {
        type: "string",
        pattern: "^\\d{10}$", // Exactly 10 digits
      },
      confirm_password: {
        type: "string",
        const: { $data: "1/customer_password" }, // Confirms it matches customer_password
      },
    },
    required: [
      "customer_name",
      "customer_email",
      "customer_password",
      "customer_phonenumber",
      "confirm_password",
    ],
    additionalProperties: false,
  };

  const loginSchema = {
    type: "object",
    properties: {
      customer_email: {
        type: "string",
        format: "email", // Validates the email format
      },
      customer_password: {
        type: "string",
        pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$", // At least one uppercase letter, one lowercase letter, one digit, and a minimum of 8 characters
      },
    },
    required: ["customer_email", "customer_password"], // Both fields are mandatory
    additionalProperties: false, // No additional properties are allowed
  };
  
  
  module.exports = { customerSchema ,
    loginSchema
  };
  