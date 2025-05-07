// src/utils/validationSchemas.jsx
import * as Yup from "yup";
import dayjs from "dayjs";

// Regex patterns
// const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
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
      "Password must be at least 6 characters long, contain letters and numbers, and can include special characters."
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

  // courseId: Yup.string()
  //   .required("Course ID is required")
  //   .max(50, "Course ID must not exceed 50 characters")
  //   .trim(),

  subjectName: Yup.string()
    .required("Subject name is required")
    .min(3, "Subject name must be at least 3 characters")
    .max(255, "Subject name must not exceed 255 characters")
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

// Validation cho Schedule Page
export const SchedulePageValidationSchema = {
  // Validate thời gian lớp học (6:00 - 22:00)
  validateClassTime: (time) => {
    if (!time) return false;
    const hours = time.getHours();
    return hours >= 6 && hours < 22;
  },

  // Validate ngày bắt đầu không được trong quá khứ
  validateStartDate: (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    return startDate >= today;
  },

  // Validate khoảng thời gian khóa học (1-180 ngày)
  validateCourseDuration: (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 1 && diffDays <= 180;
  },

  // Validate ngày kết thúc phải sau ngày bắt đầu
  validateEndDate: (startDate, endDate) => {
    if (!startDate || !endDate) return false;
    return endDate > startDate;
  },

  // Validate định dạng ngày trong tuần
  validateDaysOfWeek: (daysOfWeekString) => {
    if (!daysOfWeekString) return [];
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const days = daysOfWeekString
      .split(",")
      .map((day) => day.trim())
      .filter((day) => validDays.includes(day));
    return days;
  },

  // Validate thời lượng môn học (30 phút đến 5 giờ)
  validateSubjectPeriod: (period) => {
    if (!period) return false;
    const minutes = period.getHours() * 60 + period.getMinutes();
    return minutes >= 30 && minutes <= 300;
  },

  // Format date DD/MM/YYYY
  formatDateFull: (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  },

  // Format date DD/MM
  formatDateShort: (date) => {
    if (!date) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  },

  // Validate và format thời gian
  formatTime: (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    return timeString;
  },
};

// Add these helper functions at the top of validationSchemas.jsx
// const calculateAge = (birthDate) => {
//   const today = new Date();
//   const birth = new Date(birthDate);
//   let age = today.getFullYear() - birth.getFullYear();
//   const monthDiff = today.getMonth() - birth.getMonth();

//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//     age--;
//   }
//   return age;
// };

// Update the CreateAccountSchema validation messages to be more immediate
export const CreateAccountSchema = Yup.object({
  fullName: Yup.string()
    .required("Full name is required")
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must not exceed 50 characters")
    .matches(
      /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s\W|_]+$/,
      "Full name can only contain letters, spaces and diacritics"
    )
    .trim(),

  email: Yup.string()
    .required("Email is required")
    .email("Invalid email format")
    .max(100, "Email must not exceed 100 characters")
    .trim(),

  gender: Yup.string()
    .required("Gender is required")
    .oneOf(["Male", "Female", "Other"], "Invalid gender selection"),

  dateOfBirth: Yup.date()
    .required("Date of birth is required")
    .max(new Date(), "Date of birth cannot be in the future")
    .test("age", "User must be at least 18 years old", (value) => {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age >= 18;
    }),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .trim(),

  address: Yup.string()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters")
    .matches(
      /^[0-9a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾưăạảấầẩẫậắằẳẵặẹẻẽềềểếỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ\s,.-/#]+$/,
      "Address can contain letters, numbers, and special characters (,./-#)"
    )
    .trim(),

  roleId: Yup.number()
    .required("Role is required")
    .test("valid-role", "Invalid role selection", (value) => {
      const validRoles = [2, 3, 4, 5, 6, 8];
      return validRoles.includes(value);
    }),

  specialtyId: Yup.string().required("Specialty is required").trim(),

  departmentId: Yup.string().nullable().trim(),

  status: Yup.number().default(0).oneOf([0, 1], "Invalid status"),

  isAssign: Yup.boolean().required("Assignment status is required"),
});

// Update the validation function to support real-time validation
export const applyCreateAccountValidation = async (
  values,
  validateField = null
) => {
  try {
    if (validateField) {
      // Real-time validation for a single field
      const fieldValue = values[validateField];
      await Yup.reach(CreateAccountSchema, validateField).validate(fieldValue);
      return {
        isValid: true,
        values: { [validateField]: fieldValue },
        errors: null,
      };
    } else {
      // Validate all fields
      const validatedValues = await CreateAccountSchema.validate(values, {
        abortEarly: false,
      });
      return {
        isValid: true,
        values: validatedValues,
        errors: null,
      };
    }
  } catch (error) {
    const errors = {};
    if (error.inner && error.inner.length > 0) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    } else {
      // Single field validation error
      errors[error.path] = error.message;
    }
    return {
      isValid: false,
      values: null,
      errors,
    };
  }
};

// Add a new helper function for real-time field validation
export const validateField = async (fieldName, value) => {
  try {
    await Yup.reach(CreateAccountSchema, fieldName).validate(value);
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};
