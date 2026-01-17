export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]:;"'<>,.?/~\\`|-])[A-Za-z\d !@#$%^&*()_+={}[\]:;"'<>,.?/~\\`|-]{8,}$/;

export const validateSignup = (
  email: string,
  password: string,
  confirmPassword?: string
) => {
  const errors: string[] = [];

  // Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("Please provide a valid email address.");
  }

  // Password Length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  // Password Check
  if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      "Password must contain an uppercase letter, a lowercase letter, a number, and a special character."
    );
  }

  // Confirm Password Check
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push("Passwords do not match.");
  }

  return errors;
};
