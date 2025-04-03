//api/apiUrl.jsx
export const API = {
  LOGIN: "Login/login",
  LOGOUT: "Login/logout",
  IMPORT_CANDIDATE: "Candidate/import",
  CANDIDATE: "Candidate",
  CANDIDATE_BY_ID: "Candidate",
  SEND_NOTI: "/notifications/send",
  CHECK_NOTI: "/api/notifications/mark-as-read/",
  VIEW_NOTI_BY_USER_ID: "/api/notifications/",
  GET_EXTERNAL_CERTIFICATE_BY_ID: "ExternalCertificate/candidate",
  GET_ALL_REQUEST: "Requests",
  GET_REQUEST_BY_ID: "Requests",
  APPROVE_REQUEST: "Requests",
  REJECT_REQUEST: "Requests",
  CREATE_CANDIDATE_ACCOUNT: "User/create-from-candidate",
  
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
  DELETE_SUBJECT: "Subject"
};
