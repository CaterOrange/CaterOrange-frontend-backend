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
  
  module.exports = { loginSchema };
  