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

  // Notification
  SEND_NOTI: "/notifications/send",
  CHECK_NOTI: "/api/notifications/mark-as-read/",
  VIEW_NOTI_BY_USER_ID: "/api/notifications/",

  //external certificate
  GET_EXTERNAL_CERTIFICATE_BY_ID: "ExternalCertificate/candidate",
  CREATE_EXTERNAL_CERTIFICATE: "ExternalCertificate",
  UPDATE_EXTERNAL_CERTIFICATE: "ExternalCertificate",
  DELETE_EXTERNAL_CERTIFICATE: "ExternalCertificate",

  // Request
  GET_ALL_REQUEST: "Requests",
  GET_REQUEST_BY_ID: "Requests",
  APPROVE_REQUEST: "Requests",
  REJECT_REQUEST: "Requests",
  DELETE_REQUEST: "Requests",
  GET_ALL_EDU_OFFICER_REQUEST: "Requests/edu-officer/requests",
  CREATE_REQUEST: "Requests",

  // User
  GET_ALL_USER: "User",
  GET_USER_BY_ID: "User",
  CREATE_USER: "User",
  GET_USER_PROiLE: "User/profile",
  UPDATE_USER: "User",
  UPDATE_USER_AVATAR: "/User/avatar",
  UPDATE_PASSWORD: "User",
  FORGOT_PASSWORD: "User/forgot-password",
  RESET_PASSWORD: "User/reset-password",

  // Trainee Assign
  ASSIGN_TRAINEE: "TraineeAssign/import",
  ASSIGN_TRAINEE_MANUAL: "TraineeAssign",
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

  // Training Schedule
  GET_ALL_TRAINING_SCHEDULE: "TrainingSchedule",
  GET_TRAINING_SCHEDULE_BY_ID: "TrainingSchedule",
  CREATE_TRAINING_SCHEDULE: "TrainingSchedule",
  UPDATE_TRAINING_SCHEDULE: "TrainingSchedule",
  DELETE_TRAINING_SCHEDULE: "TrainingSchedule",
  GET_INSTRUCTOR_SUBJECTS: "TrainingSchedule/instructor/subjects",
  GET_TRAINEE_SUBJECTS: "TrainingSchedule/trainee/subjects",
  GET_SCHEDULE_BY_SUBJECT: "TrainingSchedule/subject",

  // Grade
  IMPORT_GRADE: "Grade/import",
  GET_ALL_GRADES: "Grade",
  CREATE_GRADE: "Grade",
  GET_PASSED_GRADES: "Grade/passed",
  GET_FAILED_GRADES: "Grade/failed",
  GET_GRADE_BY_ID: "Grade",
  UPDATE_GRADE: "Grade",
  DELETE_GRADE: "Grade",

  // Certificate Template
  IMPORT_CERTIFICATE_TEMPLATE: "CertificateTemplate",
  GET_ALL_CERTIFICATE_TEMPLATE: "CertificateTemplate",
  GET_CERTIFICATE_TEMPLATE_BY_ID: "CertificateTemplate",
  DELETE_CERTIFICATE_TEMPLATE: "CertificateTemplate",
  UPDATE_CERTIFICATE_TEMPLATE: "CertificateTemplate",

  //certificate
  GET_PENDING_CERTIFICATE: "Certificate/pending",
  GET_ACTIVE_CERTIFICATE: "Certificate/active",
  GET_TRAINEE_CERTIFICATE: "Certificate/trainee",
  GET_ALL_CERTIFICATE: "Certificate",
  GET_CERTIFICATE_BY_ID: "Certificate",
  CREATE_CERTIFICATE: "Certificate",
  UPDATE_CERTIFICATE: "Certificate",

  // Specialty APIs
  GET_ALL_SPECIALTY: "Specialty",
  GET_SPECIALTY_BY_ID: "Specialty",
  CREATE_SPECIALTY: "Specialty",
  UPDATE_SPECIALTY: "Specialty",
  DELETE_SPECIALTY: "Specialty",
  GET_SPECIALTY_TREE: "Specialty/tree",

  // digital signature
  SIGN_DIGITAL_SIGNATURE: "PdfSign",

  // decision template
  GET_ALL_DECISION_TEMPLATE: "DecisionTemplate/GetAll",
  GET_DECISION_TEMPLATE_BY_ID: "DecisionTemplate",
  IMPORT_DECISION_TEMPLATE: "DecisionTemplate/Create",
  UPDATE_DECISION_TEMPLATE: "DecisionTemplate/Update",
  DELETE_DECISION_TEMPLATE: "DecisionTemplate/Delete",
};
