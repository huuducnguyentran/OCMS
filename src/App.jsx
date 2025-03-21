import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./page/HomePage";
import CoursePage from "./page/course/CoursePage";
import AccountPage from "./page/AccountPage";
import Navbar from "./component/NabBar";
import { Layout } from "antd";
import SchedulePage from "./page/SchedulePage";
import CourseDetailPage from "./page/course/CourseDetailPage";
import LoginPage from "./page/auth/LoginPage";
import Header from "./component/Header";
import PersonalProfilePage from "./page/PersonalProfilePage";
import AccomplishmentsPage from "./page/AccomplishmentPage";
import AccomplishmentDetail from "./page/AccompishmentDetailPage";
import CreateNewCoursePage from "./page/course/CreateNewCoursePage";
import ImportCandidate from "./page/training_plan/ImportCandidatePage";
import Footer from "./component/Footer";
import GradeImportPage from "./page/result/GradeImportPage";
import CandidateInfoPage from "./page/training_plan/CandidateInfoPage";
import CandidatePage from "./page/training_plan/CandidatePage";
import RequestListPage from "./page/request/RequestPage";
import AvatarProvider from "./context/AvatarProvider";
import AuthProvider from "./context/AuthContext";

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
                          path="/candidate-info/:candidateId"
                          element={<CandidateInfoPage />}
                        />
                        <Route
                          path="/candidates-import"
                          element={<ImportCandidate />}
                        />
                        <Route path="/request" element={<RequestListPage />} />
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
