//api/apiUrl.jsx
export const API = {
  LOGIN: "Login/login",
  LOGOUT: "Login/logout",

  IMPORT_CANDIDATE: "Candidate/import",
  CANDIDATE: "Candidate",
  CANDIDATE_BY_ID: "Candidate",
  CREATE_CANDIDATE_ACCOUNT: "User/create-from-candidate",
  UPDATE_CANDIDATE: "Candidate",
  DELETE_CANDIDATE: "Candidate",

  SEND_NOTI: "/notifications/send",
  CHECK_NOTI: "/api/notifications/mark-as-read/",
  VIEW_NOTI_BY_USER_ID: "/api/notifications/",
  GET_EXTERNAL_CERTIFICATE_BY_ID: "ExternalCertificate/candidate",

  // Request
  GET_ALL_REQUEST: "Requests",
  GET_REQUEST_BY_ID: "Requests",
  APPROVE_REQUEST: "Requests",
  REJECT_REQUEST: "Requests",
  DELETE_REQUEST: "Requests",
  GET_ALL_EDU_OFFICER_REQUEST: "Requests/edu-officer/requests",
  CREATE_REQUEST: "Requests",

  GET_ALL_USER: "User",
  GET_USER_BY_ID: "User",
  UPDATE_USER: "User",
  UPDATE_PASSWORD: "User",
  FORGOT_PASSWORD: "User/forgot-password",
  RESET_PASSWORD: "User/reset-password",

  // Trainee Assign
  ASSIGN_TRAINEE: "TraineeAssign/import",
  GET_ALL_ASSIGNED_TRAINEE: "TraineeAssign",
  GET_ASSIGNED_TRAINEE_BY_ID: "TraineeAssign",
  UPDATE_ASSIGNED_TRAINEE: "TraineeAssign",
  GET_ASSIGNED_TRAINEE_COURSE: "TraineeAssign/trainee",

  // Training Plan
  GET_ALL_TRAINING_PLANS: "TrainingPlan",
  GET_TRAINING_PLAN_BY_ID: "TrainingPlan",
  CREATE_TRAINING_PLAN: "TrainingPlan",
  UPDATE_TRAINING_PLAN: "TrainingPlan",
  DELETE_TRAINING_PLAN: "TrainingPlan",

  // Subject
  GET_ALL_SUBJECTS: "Subject",
  GET_SUBJECT_BY_ID: "Subject",
  CREATE_SUBJECT: "Subject",
  UPDATE_SUBJECT: "Subject",
  DELETE_SUBJECT: "Subject",

  // Course
  GET_ALL_COURSES: "Course/all",
  GET_COURSE_BY_ID: "Course",
  CREATE_COURSE: "Course/create",
  UPDATE_COURSE: "Course/update",
  DELETE_COURSE: "Course",
  GET_COURSE_SUBJECTS: "Course/subjects",
  ASSIGN_TRAINEE_TO_COURSE: "Course/assign-trainee",
  ADD_SUBJECT_TO_COURSE: "Course/add-subject",
};
