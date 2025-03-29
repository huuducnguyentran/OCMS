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
import CoursePage from "./page/course/CoursePage";
import AccountPage from "./page/user/AccountPage";
import Navbar from "./component/NabBar";
import { Layout } from "antd";
import SchedulePage from "./page/course/SchedulePage";
import CourseDetailPage from "./page/course/CourseDetailPage";
import LoginPage from "./page/auth/LoginPage";
import Header from "./component/Header";
import PersonalProfilePage from "./page/user/PersonalProfilePage";
import AccomplishmentsPage from "./page/result/AccomplishmentPage";
import AccomplishmentDetail from "./page/result/AccompishmentDetailPage";
import CreateNewCoursePage from "./page/course/CreateNewCoursePage";
import ImportCandidate from "./page/training_plan/ImportCandidatePage";
import Footer from "./component/Footer";
import GradeImportPage from "./page/result/GradeImportPage";
import CandidatePage from "./page/training_plan/CandidatePage";
import RequestListPage from "./page/request/RequestPage";
import CandidateDetailPage from "./page/training_plan/CandidateDetail";
import RequestDetail from "./page/request/RequestDetailPage";
import ForgotPassword from "./page/auth/ForgotPasswordPage";
import ResetPassword from "./page/auth/ResetPassword";

function App() {
  return (
    <AuthProvider>
      <AvatarProvider>
        <Router>
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
                          <Route path="/course" element={<CoursePage />} />
                          <Route
                            path="/course/create"
                            element={<CreateNewCoursePage />}
                          />
                          <Route
                            path="/course/:id"
                            element={<CourseDetailPage />}
                          />
                          <Route path="/schedule" element={<SchedulePage />} />
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
                            path="/candidates-import"
                            element={<ImportCandidate />}
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
                            path="/candidates/:id"
                            element={<CandidateDetailPage />}
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
        </Router>
      </AvatarProvider>
    </AuthProvider>
  );
}

export default App;
