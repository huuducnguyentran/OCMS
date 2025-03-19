import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./page/HomePage";
import CoursePage from "./page/CoursePage";
import AccountPage from "./page/AccountPage";
import Navbar from "./component/NabBar";
import { Layout } from "antd";
import SchedulePage from "./page/SchedulePage";
import CourseDetailPage from "./page/CourseDetailPage";
import LoginPage from "./page/LoginPage";
import Header from "./component/Header";
import PersonalProfilePage from "./page/PersonalProfilePage";
import { AvatarProvider } from "./context/AvatarContext";
import AccomplishmentsPage from "./page/AccomplishmentPage";
import AccomplishmentDetail from "./page/AccompishmentDetailPage";
import CreateNewCoursePage from "./page/CreateNewCoursePage";
import ImportCandidate from "./page/ImportCandidatePage";
import Footer from "./component/Footer";
import ProtectedRoute from "./component/ProtectedRoute";
import GradeImportPage from "./page/GradeImportPage";
import CandidateInfoPage from "./page/CandidateInfoPage";
import CandidatePage from "./page/CandidatePage";

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
                <ProtectedRoute>
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
                          path="/candidates"
                          element={
                            <ProtectedRoute roles={["admin"]}>
                              <CandidatePage />
                            </ProtectedRoute>
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
                      </Routes>
                      <Footer />
                    </Layout>
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AvatarProvider>
  );
}

export default App;
