import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getTraineeCertificateById } from "../../services/certificateService";

const AccomplishmentsPage = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchCertificates = async () => {
      const storedUserID = sessionStorage.getItem("userID");
      if (!storedUserID) {
        console.warn("User ID not found in session storage.");
        return;
      }

      try {
        const data = await getTraineeCertificateById(storedUserID); // pass userID to the service
        setCertificates(data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      }
    };

    fetchCertificates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-6">
            <div
              className="p-6 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full 
                          shadow-lg border-2 border-yellow-200 hover:scale-105 transition-transform"
            >
              <TrophyOutlined className="text-5xl text-yellow-500 drop-shadow-md hover:text-yellow-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Accomplishments
              </h1>
              <p className="text-gray-600 mt-2">
                Track your learning journey and achievements
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <div className="space-y-6">
            {certificates.map((item) => (
              <a
                key={item.certificateId}
                href={item.certificateURLwithSas}
                target="_blank"
                rel="noopener noreferrer"
                className="block transform transition-all duration-300 hover:scale-[1.01] focus:outline-none"
              >
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg p-6 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-blue-500 to-indigo-500" />

                  <div className="relative">
                    <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                      <div className="space-y-3 flex-1">
                        <h2 className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-300">
                          {item.courseName || item.courseId}
                        </h2>

                        <div className="flex items-center text-gray-500 gap-2">
                          <CalendarOutlined className="text-blue-500" />
                          <span className="text-sm">
                            {dayjs(item.issueDate).format("MMMM D, YYYY")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md">
                          <CheckCircleOutlined />
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-6 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500 ease-out" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccomplishmentsPage;
