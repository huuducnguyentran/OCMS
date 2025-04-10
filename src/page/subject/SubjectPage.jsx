import {
  Card,
  Empty,
  Modal,
  message,
  Spin,
  Input,
  Tag,
  Typography,
  Tooltip,
  Badge,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import "animate.css";
import { getAllSubject, deleteSubject } from "../../services/subjectService";

const { Title, Paragraph } = Typography;

const SubjectPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubject();
        const subjectsList = data.subjects || [];
        setSubjects(subjectsList);
        setFilteredSubjects(subjectsList);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const filtered = subjects.filter(
      (subject) =>
        subject.subjectName.toLowerCase().includes(searchText.toLowerCase()) ||
        subject.subjectId.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchText, subjects]);

  // Handle delete subject
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Confirm Delete",
      content:
        "Are you sure you want to delete this subject? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      icon: <QuestionCircleOutlined style={{ color: "red" }} />,
      okButtonProps: {
        className:
          "bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600",
      },
      onOk: async () => {
        try {
          await deleteSubject(id);
          setSubjects(subjects.filter((subject) => subject.subjectId !== id));
          message.success("Subject deleted successfully!");
        } catch (error) {
          console.error("Error deleting subject:", error);
          message.error("Failed to delete subject.");
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate__animated animate__fadeIn">
            <BookOutlined className="text-5xl mb-4" />
            <h1 className="text-4xl font-bold mb-4">Training Subjects</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore our comprehensive collection of training subjects designed
              to enhance your learning journey
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate__animated animate__fadeInDown">
          <div className="max-w-xl mx-auto">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search subjects by name or ID..."
              onChange={(e) => setSearchText(e.target.value)}
              className="text-lg rounded-lg"
              allowClear
              size="large"
            />
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading subjects..." />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center space-y-4">
                <p className="text-gray-500 text-lg">
                  {searchText
                    ? `No subjects matching "${searchText}"`
                    : "No subjects available"}
                </p>
                <button
                  onClick={() => navigate("/subject-create")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create your first subject
                </button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate__animated animate__fadeInUp">
            {filteredSubjects.map((subject) => (
              <Card
                key={subject.subjectId}
                className="hover:shadow-xl transition-shadow duration-300 rounded-xl border-none bg-white overflow-hidden"
                actions={[
                  <Tooltip title="View Details">
                    <EyeOutlined
                      key="view"
                      className="text-blue-500 text-lg hover:text-blue-700"
                      onClick={() => navigate(`/subject/${subject.subjectId}`)}
                    />
                  </Tooltip>,
                  <Tooltip title="Edit Subject">
                    <EditOutlined
                      key="edit"
                      className="text-green-500 text-lg hover:text-green-700"
                      onClick={() =>
                        navigate(`/subject-edit/${subject.subjectId}`)
                      }
                    />
                  </Tooltip>,
                  <Tooltip title="Delete Subject">
                    <DeleteOutlined
                      key="delete"
                      className="text-red-500 text-lg hover:text-red-700"
                      onClick={() => handleDelete(subject.subjectId)}
                    />
                  </Tooltip>,
                ]}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Title
                        level={4}
                        className="text-xl font-bold text-gray-800 mb-2"
                      >
                        {subject.subjectName}
                      </Title>
                      <Tag color="blue" className="mb-2">
                        {subject.subjectId}
                      </Tag>
                    </div>
                    <BookOutlined className="text-2xl text-blue-500" />
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    className="text-gray-600 mb-4"
                  >
                    {subject.description || "No description provided"}
                  </Paragraph>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <Tooltip title="Credits">
                      <Tag
                        color={
                          subject.credits <= 3
                            ? "success"
                            : subject.credits <= 6
                            ? "warning"
                            : "error"
                        }
                        className="px-3 py-1 flex items-center gap-1"
                      >
                        <BookOutlined /> {subject.credits} Credits
                      </Tag>
                    </Tooltip>
                    <Tooltip title="Passing Score">
                      <Tag
                        color={
                          subject.passingScore <= 4
                            ? "success"
                            : subject.passingScore <= 7
                            ? "warning"
                            : "error"
                        }
                        className="px-3 py-1 flex items-center gap-1"
                      >
                        <TrophyOutlined /> Pass: {subject.passingScore}
                      </Tag>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Tooltip title="Create New Subject" placement="left">
          <button
            onClick={() => navigate("/subject-create")}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 animate__animated animate__bounceIn"
          >
            <PlusOutlined className="text-xl" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default SubjectPage;
