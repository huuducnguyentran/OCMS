import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
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
import GradeImportPage from "./page/result/GradeImportPage";
import CandidatePage from "./page/training_plan/CandidatePage";
import RequestListPage from "./page/request/RequestPage";
import AvatarProvider from "./context/AvatarProvider";
import AuthProvider from "./context/AuthContext";
import CandidateDetailPage from "./page/training_plan/CandidateDetail";
import RequestDetail from "./page/request/RequestDetailPage";
import PlanPage from "./page/training_plan/PlanPage";
import CreateTrainingPlanPage from "./page/training_plan/CreateTrainingPlanPage";
import EditPlanPage from "./page/training_plan/EditPlanPage";
import CreateCoursePage from "./page/course/CreateCoursePage";
import CoursePage from "./page/course/CoursePage";
import EditCoursePage from "./page/course/EditCoursePage";

function App() {
  return (
    <AvatarProvider>
      <Router>
        <Layout className="min-h-screen flex w-screen">
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <AuthProvider>
                  <>
                    <Navbar />
                    <Layout className="flex flex-col w-full">
                      <Header />
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/plan" element={<PlanPage />} />
                        <Route
                          path="/plan/create"
                          element={<CreateTrainingPlanPage />}
                        />
                        <Route
                          path="/plan/edit/:planId"
                          element={<EditPlanPage />}
                        />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/accounts" element={<AccountPage />} />
                        <Route
                          path="/candidates-view"
                          element={
                            <AuthProvider roles={["admin"]}>
                              <CandidatePage />
                            </AuthProvider>
                          }
                        />
                        <Route
                          path="/profile"
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
                        <Route path="/request" element={<RequestListPage />} />
                        <Route
                          path="/requests/:id"
                          element={<RequestDetail />}
                        />
                        <Route
                          path="/candidates/:id"
                          element={<CandidateDetailPage />}
                        />
                        <Route path="/course/create" element={<CreateCoursePage />} />
                        <Route path="/course" element={<CoursePage />} />
                         <Route path="/course/edit/:id" element={<EditCoursePage />} />
                      </Routes>
                      <Footer />
                    </Layout>
                  </>
                </AuthProvider>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AvatarProvider>
  );
}

export default App;
