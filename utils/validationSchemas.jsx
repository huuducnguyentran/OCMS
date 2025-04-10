// src/utils/validationSchemas.jsx
import * as Yup from "yup";
import dayjs from "dayjs";

// Regex patterns
const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
const tokenRegex = /^[A-Za-z0-9-_]{6,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Login Schema
export const LoginSchema = Yup.object({
  username: Yup.string()
    .matches(
      usernameRegex,
      "Username must be 4-16 characters and contain only letters, numbers, and underscores."
    )
    .required("Username is required"),
  password: Yup.string().required("Password is required"),
});

// Reset Password Schema
export const ResetPasswordSchema = Yup.object({
  token: Yup.string()
    .matches(tokenRegex, "Invalid token format.")
    .required("Token is required"),
  newPassword: Yup.string()
    .matches(
      passwordRegex,
      "Password must be at least 6 characters with letters and numbers."
    )
    .required("New password is required"),
});

// Optional: Forgot Password (Email only)
export const EmailSchema = Yup.object({
  email: Yup.string()
    .matches(emailRegex, "Invalid email address.")
    .required("Email is required"),
});

// Helper to check if user is at least 18
const isAtLeast18 = (date) => {
  return dayjs().diff(dayjs(date), "year") >= 18;
};

export const CandidateDetailSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  gender: Yup.string()
    .oneOf(["Male", "Female", "Other"])
    .required("Gender is required"),
  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .test("is-18", "Candidate must be at least 18 years old", (value) => {
      return value ? isAtLeast18(value) : false;
    }),
  address: Yup.string().required("Address is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  phoneNumber: Yup.string().required("Phone number is required"),
  personalID: Yup.string().required("Personal ID is required"),
  note: Yup.string(),
  specialtyId: Yup.string().required("Specialty ID is required"),
});
