import { useParams, useNavigate } from "react-router-dom";
import { Layout, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getSubjectById } from "../../services/subjectService";

const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await getSubjectById(subjectId);
        setSubject(response.subject);
      } catch (error) {
        console.error("Error fetching subject:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  if (loading) {
    return (
      <p className="text-center text-blue-500">Loading subject details...</p>
    );
  }

  if (!subject) {
    return <p className="text-center text-red-500">Subject not found!</p>;
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Layout.Content>
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Navigation */}
          <div className="mb-8">
            <Button
              type="link"
              onClick={() => navigate(-1)}
              icon={<ArrowLeftOutlined />}
              className="flex items-center text-blue-600 hover:text-blue-800 text-lg font-medium 
                       transition-all duration-300 hover:-translate-x-1"
            >
              Back to Subjects
            </Button>
          </div>

          {/* Subject Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {subject.subjectName}
            </h1>

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                Description
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {subject.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-sm text-blue-600 font-semibold mb-2">
                Credits
              </p>
              <p className="text-lg text-gray-800">{subject.credits}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6">
              <p className="text-sm text-purple-600 font-semibold mb-2">
                Passing Score
              </p>
              <p className="text-lg text-gray-800">{subject.passingScore}</p>
            </div>
          </div>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default SubjectDetailPage;
