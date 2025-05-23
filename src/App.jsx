import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./component/ProtectedRoute";
import AvatarProvider from "./context/AvatarProvider";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./page/user/HomePage";
import AccountPage from "./page/user/AccountPage";
import Navbar from "./component/NabBar";
import { Layout } from "antd";
import SchedulePage from "./page/schedule/SchedulePage";
import LoginPage from "./page/auth/LoginPage";
import Header from "./component/Header";
import PersonalProfilePage from "./page/user/PersonalProfilePage";
import AccomplishmentsPage from "./page/result/AccomplishmentPage";
import AccomplishmentDetail from "./page/result/AccompishmentDetailPage";
import ImportCandidate from "./page/candidate/ImportCandidatePage";
import Footer from "./component/Footer";
import CandidatePage from "./page/candidate/CandidatePage";
import RequestListPage from "./page/request/RequestPage";
import CandidateDetailPage from "./page/candidate/CandidateDetail";
import RequestDetail from "./page/request/RequestDetailPage";
import ForgotPassword from "./page/auth/ForgotPasswordPage";
import ResetPassword from "./page/auth/ResetPassword";
import AssignTraineePage from "./page/assigned_trainee/AssignTraineePage";
import SubjectPage from "./page/subject/SubjectPage";
import CreateSubjectPage from "./page/subject/CreateSubjectPage";
import SubjectDetailPage from "./page/subject/SubjectDetailPage";
import AssignedTraineePage from "./page/assigned_trainee/AssignedTraineePage";
import CreateCoursePage from "./page/course/CreateCoursePage";
import CoursePage from "./page/course/CoursePage";
import EditCoursePage from "./page/course/EditCoursePage";
import AssignedTraineeDetailPage from "./page/assigned_trainee/AssignedTraineeDetailPage";
import AssignedTraineeCoursePage from "./page/assigned_trainee/AssignedTraineeCoursePage";
import SendRequestPage from "./page/request/SendRequestPage";
import UpdateSubjectPage from "./page/subject/UpdateSubjectPage";
import CreateSchedulePage from "./page/schedule/CreateSchedulePage";
import NotificationPage from "./page/user/NotificationPage";
import ImportCertificatePage from "./page/certificate/ImportCertificatePage";
import CertificateTemplateListPage from "./page/certificate/CertificateTemplatePage";
import UpdateCertificateTemplatePage from "./page/certificate/UpdateCertificateTemplatePage";
import GradeImportPage from "./page/grade/GradeImportPage";
import ViewGradePage from "./page/grade/ViewGradePage";
import CertificateTemplateDetailPage from "./page/certificate/CertificateTemplateDetailPage";
import UpdateGradePage from "./page/grade/UpdateGradePage";
import SpecialtyPage from "./page/specialty/SpecialtyPage";
import EditSpecialtyPage from "./page/specialty/EditSpecialtyPage";
import CreateSpecialtyPage from "./page/specialty/CreateSpecialtyPage";
import SpecialtyTreePage from "./page/specialty/SpecialtyTreePage";
import CertificatePendingPage from "./page/certificate/CertificatePendingPage";
import CertificateDetailPage from "./page/certificate/CertificateDetailPage";
import CertificateActivePage from "./page/certificate/CertificateActivePage";
import RegulationsPage from "./page/Regulations/RegulationsPage";
import CreateExCertificatePage from "./page/candidate/CreateExCertificatePage";
import ImportDecisionPage from "./page/decision/ImportDecisionPage";
import DecisionTemplateListPage from "./page/decision/DecisionTemplatePage";
import UpdateAccountPage from "./page/user/UpdateAccountPage";
import ExportCertificatePage from "./page/report/ExportCertificatePage";
import DecisionTemplateDetailPage from "./page/decision/DecisionTemplateDetailPage";
import UpdateDecisionTemplatePage from "./page/decision/UpdateDecisionTemplatePage";
import DecisionActivePage from "./page/decision/DecisionActivePage";
import DecisionPendingPage from "./page/decision/DecisionPending";
import EditExternalCertiPage from "./page/candidate/EditExternalCertiPage";
import DepartmentPage from "./page/department/DepartmentPage";
import EditDepartmentPage from "./page/department/EditDepartmentPage";
import CreateDepartmentPage from "./page/department/CreateDepartmentPage";
import CertificateRevokedPage from "./page/certificate/CertificateRevokedPage";
import DecisionDetailPage from "./page/decision/DecisionDetailPage";
import AssignDepartmentPage from "./page/department/AssignDepartment";
import TraineeGradePage from "./page/grade/TraineeGradePage";
import EditSchedule from "./page/schedule/EditSchedule";
import ClassroomPage from "./page/classroom/ClassroomPage";
import InstructorAssPage from "./page/instructor_assignment/instructor_assPage";
import CreateAccountPage from "./page/user/CreateAccountPage";
import InstructorAssignmentCreate from "./page/instructor_assignment/InstructorAssignmentCreate";
import InstructorAssignmentEdit from "./page/instructor_assignment/InstructorAssignmentEdit";

function App() {
  return (
    <Router>
      {/* ✅ Router should wrap AuthProvider */}
      <AuthProvider>
        <AvatarProvider>
          <Routes>
            {/* 🚪 Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/*  Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute
                  element={
                    <Layout className="min-h-screen flex w-screen">
                      <Navbar />
                      <Layout className="flex flex-col w-full">
                        <Header />
                        <Routes>
                          {/*  Dashboard & User Profile */}
                          <Route path="/home" element={<HomePage />} />
                          <Route path="/accounts" element={<AccountPage />} />
                          <Route
                            path="/account/update/:userId"
                            element={<UpdateAccountPage />}
                          />
                          <Route
                            path="/profile/:userId"
                            element={<PersonalProfilePage />}
                          />
                          <Route
                            path="/create-account"
                            element={<CreateAccountPage />}
                          />
                          <Route
                            path="/notifications"
                            element={<NotificationPage />}
                          />

                          {/* Course Management Routes */}
                          <Route path="/all-courses" element={<CoursePage />} />
                          <Route
                            path="/course/create"
                            element={<CreateCoursePage />}
                          />
                          <Route
                            path="/course/edit/:id"
                            element={<EditCoursePage />}
                          />

                          {/*  Schedule Management */}
                          <Route path="/schedule" element={<SchedulePage />} />
                          <Route
                            path="/schedule/create"
                            element={<CreateSchedulePage />}
                          />
                          <Route
                            path="/schedule/edit/:id"
                            element={<EditSchedule />}
                          />

                          {/*  Candidates */}
                          <Route
                            path="/candidates-import"
                            element={<ImportCandidate />}
                          />
                          <Route
                            path="/candidates-view"
                            element={<CandidatePage />}
                          />
                          <Route
                            path="/candidates/:id"
                            element={<CandidateDetailPage />}
                          />
                          <Route
                            path="/external-certificate/create/:id"
                            element={<CreateExCertificatePage />}
                          />
                          <Route
                            path="/external-certificate/edit/:id"
                            element={<EditExternalCertiPage />}
                          />
                          {/*  Instructor Assignment */}
                          <Route
                            path="/instructor-assignment"
                            element={<InstructorAssPage />}
                          />
                          <Route path="/instructor-assignment/create" element={<InstructorAssignmentCreate />} />
                          <Route path="/instructor-assignment/edit/:id" element={<InstructorAssignmentEdit />} />
                          {/*  Subjects */}
                          <Route path="/subject" element={<SubjectPage />} />
                          <Route
                            path="/subject-create"
                            element={<CreateSubjectPage />}
                          />
                          <Route
                            path="/subject/:subjectId"
                            element={<SubjectDetailPage />}
                          />
                          <Route
                            path="/subject-edit/:subjectId"
                            element={<UpdateSubjectPage />}
                          />

                          {/*  Trainees */}
                          <Route
                            path="/import-assign-trainee"
                            element={<AssignTraineePage />}
                          />
                          <Route
                            path="/assigned-trainee"
                            element={<AssignedTraineePage />}
                          />
                          <Route
                            path="/assigned-trainee/:id"
                            element={<AssignedTraineeDetailPage />}
                          />
                          <Route
                            path="/assigned-trainee-courses"
                            element={<AssignedTraineeCoursePage />}
                          />
                          {/*  Accomplishments & Grades */}
                          <Route
                            path="/accomplishments"
                            element={<AccomplishmentsPage />}
                          />
                          <Route
                            path="/accomplishment/:id"
                            element={<AccomplishmentDetail />}
                          />
                          <Route path="/grade" element={<GradeImportPage />} />
                          <Route
                            path="/grade-view"
                            element={<ViewGradePage />}
                          />
                          <Route
                            path="/trainee-grade"
                            element={<TraineeGradePage />}
                          />
                          <Route
                            path="/grade-update/:id"
                            element={<UpdateGradePage />}
                          />

                          {/*  Requests */}
                          <Route
                            path="/request"
                            element={<RequestListPage />}
                          />
                          <Route
                            path="/requests/:id"
                            element={<RequestDetail />}
                          />
                          <Route
                            path="/send-request"
                            element={<SendRequestPage />}
                          />

                          {/*  Certificates */}
                          <Route
                            path="/certificate-import"
                            element={<ImportCertificatePage />}
                          />
                          <Route
                            path="/certificate"
                            element={<CertificateTemplateListPage />}
                          />
                          <Route
                            path="/certificate-pending"
                            element={<CertificatePendingPage />}
                          />
                          <Route
                            path="/certificate-active"
                            element={<CertificateActivePage />}
                          />
                          <Route
                            path="/certificate-revoked"
                            element={<CertificateRevokedPage />}
                          />
                          <Route
                            path="/certificate/:certificateId"
                            element={<CertificateDetailPage />}
                          />
                          <Route
                            path="/certificate-template"
                            element={<CertificateTemplateListPage />}
                          />
                          <Route
                            path="/certificate-template/update/:templateId"
                            element={<UpdateCertificateTemplatePage />}
                          />
                          <Route
                            path="/certificate-template/:templateId"
                            element={<CertificateTemplateDetailPage />}
                          />

                          {/*  Decision */}
                          <Route
                            path="/decision-template/import"
                            element={<ImportDecisionPage />}
                          />
                          <Route
                            path="/decision-template"
                            element={<DecisionTemplateListPage />}
                          />
                          <Route
                            path="/decision-template/:templateId"
                            element={<DecisionTemplateDetailPage />}
                          />

                          <Route
                            path="/decision-template/update/:templateId"
                            element={<UpdateDecisionTemplatePage />}
                          />
                          <Route
                            path="/decision-pending"
                            element={<DecisionPendingPage />}
                          />
                          <Route
                            path="/decision-active"
                            element={<DecisionActivePage />}
                          />
                          <Route
                            path="/decision/:decisionId"
                            element={<DecisionDetailPage />}
                          />

                          {/*  Specialty */}
                          <Route
                            path="/specialty"
                            element={<SpecialtyPage />}
                          />
                          <Route
                            path="/specialty/edit/:id"
                            element={<EditSpecialtyPage />}
                          />
                          <Route
                            path="/specialty/create"
                            element={<CreateSpecialtyPage />}
                          />
                          <Route
                            path="/specialty/tree"
                            element={<SpecialtyTreePage />}
                          />

                          {/*  Regulations */}
                          <Route
                            path="/regulations"
                            element={<RegulationsPage />}
                          />
                          <Route
                            path="/export-certificate"
                            element={<ExportCertificatePage />}
                          />

                          {/* <Route
                            path="/import-assign-instructor"
                            element={<AssignInstructorPage />}
                          /> */}
                          {/* <Route
                            path="/plan/:planId"
                            element={<TrainingPlanDetailPage />}
                          /> */}
                          {/* <Route
                            path="/course/:id"
                            element={<CourseDetailPage />}
                          /> */}
                          {/* Department */}
                          <Route
                            path="/department"
                            element={<DepartmentPage />}
                          />
                          <Route
                            path="/department/edit/:id"
                            element={<EditDepartmentPage />}
                          />
                          <Route
                            path="/department/create"
                            element={<CreateDepartmentPage />}
                          />
                          <Route
                            path="/department/assign/:departmentId"
                            element={<AssignDepartmentPage />}
                          />
                          <Route path="/class" element={<ClassroomPage />} />
                        </Routes>
                        <Footer />
                      </Layout>
                    </Layout>
                  }
                />
              }
            />
          </Routes>
        </AvatarProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
