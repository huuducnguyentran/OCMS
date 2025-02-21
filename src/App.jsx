import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./page/HomePage";
import CoursePage from "./page/CoursePage";
import AccountPage from "./page/AccountPage";
import Navbar from "./component/NabBar";

import { Layout } from "antd";
import SchedulePage from "./page/SchedulePage";
import CourseDetailPage from "./page/CourseDetailPage";
import LoginPage from "./page/LoginPage";
import Header from "./component/header";

function App() {
  return (
    <Router>
      <Layout className="min-h-screen flex w-screen">
        <Routes>
          {/* Exclude Navbar for Login Page */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Layout className="flex flex-col w-full">
                  <Header />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/course" element={<CoursePage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/accounts" element={<AccountPage/>}/>
                    <Route path="/course/:id" element={<CourseDetailPage />} />
                  </Routes>
                </Layout>
              </>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
