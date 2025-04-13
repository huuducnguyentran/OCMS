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
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

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

// Training Schedule Validation Schema
export const TrainingScheduleSchema = Yup.object({
  // General Information
  subjectID: Yup.string().required("Please select a subject"),

  instructorID: Yup.string().required("Please select an instructor"),

  location: Yup.string()
    .required("Please enter a location")
    .max(100, "Location cannot exceed 100 characters"),

  room: Yup.string()
    .required("Please enter a room")
    .max(50, "Room cannot exceed 50 characters"),

  notes: Yup.string().max(500, "Notes cannot exceed 500 characters"),

  // Class Schedule
  startDate: Yup.date()
    .required("Please select a start date")
    .min(new Date(), "Start date must be from today onwards"),

  endDate: Yup.date()
    .required("Please select an end date")
    .min(Yup.ref("startDate"), "End date must be after start date")
    .test(
      "reasonable-duration",
      "Course duration should be between 1 and 180 days",
      function (endDate) {
        const startDate = this.parent.startDate;
        if (!startDate || !endDate) return true;

        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 1 && diffDays <= 180;
      }
    ),

  classTime: Yup.date()
    .required("Please select a class time")
    .test(
      "valid-class-time",
      "Class time should be between 06:00 and 22:00",
      (value) => {
        if (!value) return false;
        const hours = value.getHours();
        return hours >= 7 && hours < 22;
      }
    ),

  subjectPeriod: Yup.date()
    .required("Please select a duration")
    .test(
      "valid-duration",
      "Duration should be between 30 minutes and 5 hours",
      (value) => {
        if (!value) return false;
        const minutes = value.getHours() * 60 + value.getMinutes();
        return minutes >= 30 && minutes <= 300;
      }
    ),

  daysOfWeek: Yup.array()
    .of(Yup.string())
    .min(1, "Please select at least one day")
    .max(7, "You cannot select more than 7 days")
    .required("Please select days of the week"),
});

// Enhanced validation for dayjs compatibility
export const ScheduleFormSchema = (isCreate = true) => {
  let schema = TrainingScheduleSchema;

  // Additional validation for create mode
  if (isCreate) {
    schema = schema.shape({
      startDate: Yup.date()
        .required("Please select a start date")
        .test("not-in-past", "Start date cannot be in the past", (value) => {
          if (!value) return true;
          // Reset hours to compare only dates
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(value);
          startDate.setHours(0, 0, 0, 0);
          return startDate >= today;
        }),
    });
  }

  return schema;
};

// Helper function to convert dayjs to Date for validation
export const validateDayjsDate = (dayjsDate) => {
  if (!dayjsDate || !dayjsDate.isValid()) {
    return null;
  }
  return dayjsDate.toDate();
};

// Helper to apply validation with dayjs
export const applyScheduleValidation = (values) => {
  // Convert dayjs objects to Date for validation
  const validationValues = {
    ...values,
    startDate: values.startDate
      ? validateDayjsDate(values.startDate)
      : undefined,
    endDate: values.endDate ? validateDayjsDate(values.endDate) : undefined,
    classTime: values.classTime
      ? validateDayjsDate(values.classTime)
      : undefined,
    subjectPeriod: values.subjectPeriod
      ? validateDayjsDate(values.subjectPeriod)
      : undefined,
  };

  return ScheduleFormSchema(true).validate(validationValues, {
    abortEarly: false,
  });
};

// Training Plan Validation Schema
export const TrainingPlanSchema = Yup.object({
  planName: Yup.string()
    .required("Plan name is required")
    .min(3, "Plan name must be at least 3 characters")
    .max(100, "Plan name must not exceed 100 characters")
    .trim(),

  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters")
    .trim(),

  planLevel: Yup.number()
    .required("Plan level is required")
    .oneOf(
      [0, 1, 2],
      "Plan level must be one of: Initial (0), Recurrent (1), Relearn (2)"
    ),

  specialtyId: Yup.string().required("Specialty is required"),

  startDate: Yup.date()
    .required("Start date is required")
    .test("not-in-past", "Start date cannot be in the past", function (value) {
      if (!value) return true;
      const now = new Date();
      // Set seconds and milliseconds to 0 for both dates to allow current minute
      now.setSeconds(0, 0);
      const startDate = new Date(value);
      startDate.setSeconds(0, 0);
      // Allow same minute or future
      return startDate >= now;
    }),

  endDate: Yup.date()
    .required("End date is required")
    .test(
      "after-start-date",
      "End date must be after start date",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;

        // Sử dụng phép so sánh cơ bản
        return new Date(value) > new Date(startDate);
      }
    )
    .test(
      "reasonable-duration",
      "Training plan duration should be between 1 day and 365 days",
      function (value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;

        const diffTime = Math.abs(new Date(value) - new Date(startDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 1 && diffDays <= 365;
      }
    ),
});

// Helper for applying validation with dayjs in Training Plan form
export const applyTrainingPlanValidation = (values) => {
  // Convert dayjs objects to Date for validation
  const validationValues = {
    ...values,
    startDate: values.startDate
      ? validateDayjsDate(values.startDate)
      : undefined,
    endDate: values.endDate ? validateDayjsDate(values.endDate) : undefined,
  };

  return TrainingPlanSchema.validate(validationValues, { abortEarly: false });
};

// Create or Update Training Plan Schema with additional checks
export const getTrainingPlanSchema = (isCreate = true) => {
  let schema = TrainingPlanSchema;

  if (isCreate) {
    schema = schema.shape({
      startDate: Yup.date()
        .required("Start date is required")
        .test(
          "not-in-past",
          "Start date cannot be in the past",
          function (value) {
            if (!value) return true;
            const now = new Date();
            const startDate = new Date(value);
            // Set seconds and milliseconds to 0 for both dates
            now.setSeconds(0, 0);
            startDate.setSeconds(0, 0);
            // Allow same minute or future
            return startDate >= now;
          }
        ),
    });
  } else {
    // For update mode, different rules might apply
    // For example, may allow start date to be in the past if plan already started
    schema = schema.shape({
      startDate: Yup.date().required("Start date is required"),
    });
  }

  return schema;
};

// Subject Validation Schema
export const SubjectSchema = Yup.object({
  subjectId: Yup.string()
    .required("Subject ID is required")
    .max(50, "Subject ID must not exceed 50 characters")
    .trim(),

  courseId: Yup.string()
    .required("Course ID is required")
    .max(50, "Course ID must not exceed 50 characters")
    .trim(),

  subjectName: Yup.string()
    .required("Subject name is required")
    .min(3, "Subject name must be at least 3 characters")
    .max(100, "Subject name must not exceed 100 characters")
    .trim(),

  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters")
    .trim(),

  credits: Yup.number()
    .required("Credits are required")
    .typeError("Credits must be a number")
    .test(
      "is-positive-integer",
      "Credits must be between 1 and 10",
      (value) => {
        // Chỉ hiển thị thông báo lỗi khi giá trị < 1 hoặc > 10 hoặc không phải số nguyên
        if (value === undefined || value === null) return true; // Đã có validation required
        return value >= 1 && value <= 10 && Number.isInteger(value);
      }
    ),

  passingScore: Yup.number()
    .required("Passing score is required")
    .typeError("Passing score must be a number")
    .test(
      "is-valid-score",
      "Passing score must be between 0 and 10",
      (value) => {
        // Chỉ hiển thị thông báo lỗi khi giá trị < 0 hoặc > 10
        if (value === undefined || value === null) return true; // Đã có validation required
        return value >= 0 && value <= 10;
      }
    ),
});

// Helper function to apply validation for Subject
export const applySubjectValidation = (values) => {
  return SubjectSchema.validate(values, { abortEarly: false });
};

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
