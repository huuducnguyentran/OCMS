import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import ProtectedRoute from "./component/ProtectedRoute";
import AvatarProvider from "./context/AvatarProvider";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./page/HomePage";
import AccountPage from "./page/user/AccountPage";
import Navbar from "./component/NabBar";
import { Layout } from "antd";
import SchedulePage from "./page/course/SchedulePage";
import LoginPage from "./page/auth/LoginPage";
import Header from "./component/Header";
import PersonalProfilePage from "./page/user/PersonalProfilePage";
import AccomplishmentsPage from "./page/result/AccomplishmentPage";
import AccomplishmentDetail from "./page/result/AccompishmentDetailPage";
import ImportCandidate from "./page/training_plan/ImportCandidatePage";
import Footer from "./component/Footer";
import CandidatePage from "./page/training_plan/CandidatePage";
import RequestListPage from "./page/request/RequestPage";
import CandidateDetailPage from "./page/training_plan/CandidateDetail";
import RequestDetail from "./page/request/RequestDetailPage";
import ForgotPassword from "./page/auth/ForgotPasswordPage";
import ResetPassword from "./page/auth/ResetPassword";
import AssignTraineePage from "./page/assigned_trainee/AssignTraineePage";
import SubjectPage from "./page/subject/SubjectPage";
import CreateSubjectPage from "./page/subject/CreateSubjectPage";
import SubjectDetailPage from "./page/subject/SubjectDetailPage";
import AssignedTraineePage from "./page/assigned_trainee/AssignedTraineePage";
import PlanPage from "./page/training_plan/PlanPage";
import CreateTrainingPlanPage from "./page/training_plan/CreateTrainingPlanPage";
import EditPlanPage from "./page/training_plan/EditPlanPage";
import CreateCoursePage from "./page/course/CreateCoursePage";
import CoursePage from "./page/course/CoursePage";
import EditCoursePage from "./page/course/EditCoursePage";
import AssignedTraineeDetailPage from "./page/assigned_trainee/AssignedTraineeDetailPage";
import AssignedTraineeCoursePage from "./page/assigned_trainee/AssignedTraineeCoursePage";
// import AssignInstructorPage from "./page/assigned_instructor/AssignInstructorPage";
import SendRequestPage from "./page/request/SendRequestPage";
import UpdateSubjectPage from "./page/subject/UpdateSubjectPage";
import CreateSchedulePage from "./page/course/CreateSchedulePage";
import NotificationPage from "./page/user/NotificationPage";
import ImportCertificatePage from "./page/certificate/ImportCertificatePage";
import CertificateTemplateListPage from "./page/certificate/CertificateTemplatePage";
import UpdateCertificateTemplatePage from "./page/certificate/UpdateCertificateTemplatePage";
import GradeImportPage from "./page/grade/GradeImportPage";
import ViewGradePage from "./page/grade/ViewGradePage";

function App() {
  return (
    <Router>
      {/* ✅ Router should wrap AuthProvider */}
      <AuthProvider>
        <AvatarProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
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
                          <Route path="/home" element={<HomePage />} />
                          <Route path="/all courses" element={<CoursePage />} />
                          <Route
                            path="/assigned-trainee-courses/:id"
                            element={<AssignedTraineeCoursePage />}
                          />
                          {/* <Route
                            path="/course/:id"
                            element={<CourseDetailPage />}
                          /> */}
                          <Route path="/schedule" element={<SchedulePage />} />
                          <Route
                            path="/schedule/create"
                            element={<CreateSchedulePage />}
                          />
                          <Route path="/accounts" element={<AccountPage />} />
                          <Route
                            path="/candidates-view"
                            element={<CandidatePage />}
                          />
                          <Route
                            path="/profile/:userId"
                            element={<PersonalProfilePage />}
                          />
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
                            path="/candidates-import"
                            element={<ImportCandidate />}
                          />
                          <Route
                            path="/notifications"
                            element={<NotificationPage />}
                          />
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
                          <Route
                            path="/candidates/:id"
                            element={<CandidateDetailPage />}
                          />
                          <Route
                            path="/import-assign-trainee"
                            element={<AssignTraineePage />}
                          />
                          <Route
                            path="/assigned-trainee"
                            element={<AssignedTraineePage />}
                          />
                          {/* <Route
                            path="/import-assign-instructor"
                            element={<AssignInstructorPage />}
                          /> */}
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
                          <Route path="/plan" element={<PlanPage />} />
                          <Route
                            path="/plan/create"
                            element={<CreateTrainingPlanPage />}
                          />
                          <Route
                            path="/plan/edit/:planId"
                            element={<EditPlanPage />}
                          />
                          <Route
                            path="/course/create"
                            element={<CreateCoursePage />}
                          />
                          <Route path="/course" element={<CoursePage />} />
                          <Route
                            path="/course/edit/:id"
                            element={<EditCoursePage />}
                          />
                          <Route
                            path="/assigned-trainee/:id"
                            element={<AssignedTraineeDetailPage />}
                          />
                          <Route
                            path="/certificate-import"
                            element={<ImportCertificatePage />}
                          />
                          <Route
                            path="/certificate"
                            element={<CertificateTemplateListPage />}
                          />
                          <Route
                            path="/certificate-template/update/:templateId"
                            element={<UpdateCertificateTemplatePage />}
                          />
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
