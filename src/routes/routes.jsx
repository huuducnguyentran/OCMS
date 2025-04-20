import { Navigate } from "react-router-dom";
import LoginPage from "../page/auth/LoginPage";
import RegisterPage from "../page/auth/RegisterPage";
import ForgotPasswordPage from "../page/auth/ForgotPasswordPage";
import ResetPasswordPage from "../page/auth/ResetPasswordPage";
import HomePage from "../page/home/HomePage";
import AccountPage from "../page/user/AccountPage";
import AccountUpdatePage from "../page/user/AccountUpdatePage";
import ProfilePage from "../page/user/ProfilePage";
import SubjectPage from "../page/subject/SubjectPage";
import SubjectUpdatePage from "../page/subject/SubjectUpdatePage";
import SubjectCreatePage from "../page/subject/SubjectCreatePage";
import CoursePage from "../page/course/CoursePage";
import CourseUpdatePage from "../page/course/CourseUpdatePage";
import CourseCreatePage from "../page/course/CreateCoursePage";
import PlanPage from "../page/training_plan/PlanPage";
import PlanUpdatePage from "../page/training_plan/PlanUpdatePage";
import PlanCreatePage from "../page/training_plan/PlanCreatePage";
import CandidatePage from "../page/training_plan/CandidatePage";
import CandidateDetail from "../page/training_plan/CandidateDetail";
import RequestPage from "../page/request/RequestPage";
import ViewGradePage from "../page/grade/ViewGradePage";
import GradeUpdatePage from "../page/grade/GradeUpdatePage";
import ImportGradePage from "../page/grade/GradeImportPage";
import ImportCandidatePage from "../page/candidate/ImportCandidatePage";
import ImportDecisionPage from "../page/decision/ImportDecisionPage";
import ImportCertificatePage from "../page/certificate/ImportCertificatePage";
import ExpiredCertificatesPage from "../page/report/ExpiredCertificatesPage";
import ProtectedRoute from "../component/ProtectedRoute";

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/account",
    element: (
      <ProtectedRoute>
        <AccountPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/account/update/:id",
    element: (
      <ProtectedRoute>
        <AccountUpdatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subject",
    element: (
      <ProtectedRoute>
        <SubjectPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subject/update/:id",
    element: (
      <ProtectedRoute>
        <SubjectUpdatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/subject/create",
    element: (
      <ProtectedRoute>
        <SubjectCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/course",
    element: (
      <ProtectedRoute>
        <CoursePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/course/update/:id",
    element: (
      <ProtectedRoute>
        <CourseUpdatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/course/create",
    element: (
      <ProtectedRoute>
        <CourseCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/plan",
    element: (
      <ProtectedRoute>
        <PlanPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/plan/update/:id",
    element: (
      <ProtectedRoute>
        <PlanUpdatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/plan/create",
    element: (
      <ProtectedRoute>
        <PlanCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/candidate",
    element: (
      <ProtectedRoute>
        <CandidatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/candidate/:id",
    element: (
      <ProtectedRoute>
        <CandidateDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/request",
    element: (
      <ProtectedRoute>
        <RequestPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/grade",
    element: (
      <ProtectedRoute>
        <ViewGradePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/grade-update/:id",
    element: (
      <ProtectedRoute>
        <GradeUpdatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/grade-import",
    element: (
      <ProtectedRoute>
        <ImportGradePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/candidate-import",
    element: (
      <ProtectedRoute>
        <ImportCandidatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/decision-import",
    element: (
      <ProtectedRoute>
        <ImportDecisionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/certificate-import",
    element: (
      <ProtectedRoute>
        <ImportCertificatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/expired-certificates",
    element: (
      <ProtectedRoute>
        <ExpiredCertificatesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
];

export default routes; 