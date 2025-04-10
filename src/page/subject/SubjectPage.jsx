import { Card, Empty, Dropdown, Menu, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import "animate.css";
import { getAllSubject, deleteSubject } from "../../services/subjectService";

const SubjectPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getAllSubject();
        setSubjects(data.subjects || []);
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  // Handle delete subject
  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center text-center mb-10">
          <h2 className="text-4xl font-extrabold text-indigo-900 animate__animated animate__fadeInDown">
            Training Subjects
          </h2>
          <p className="text-lg text-gray-700 mt-2">
            Explore our available subjects.
          </p>
        </div>

        {/* Add Subject Button */}
        <button
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg animate__animated animate__bounceIn"
          onClick={() => navigate("/subject-create")}
        >
          <PlusOutlined className="text-xl" />
        </button>

        {/* Subjects List */}
        {loading ? (
          <div className="text-lg text-gray-700">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="flex justify-center items-center h-96 animate__animated animate__fadeIn">
            <Empty
              description={
                <span className="text-lg text-gray-600">
                  No subjects available
                </span>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full animate__animated animate__fadeInUp">
            {subjects.map((subject) => (
              <Card
                key={subject.subjectId}
                hoverable
                className="rounded-xl shadow-xl overflow-hidden flex flex-col transform transition duration-500 hover:scale-105 bg-white relative"
              >
                {/* Clickable Icon for Dropdown */}
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="edit"
                        onClick={(e) => {
                          e.domEvent.stopPropagation();
                          navigate(`/subject-edit/${subject.subjectId}`);
                        }}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        key="delete"
                        danger
                        onClick={(e) => {
                          e.domEvent.stopPropagation();
                          handleDelete(subject.subjectId);
                        }}
                      >
                        Delete
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <MoreOutlined
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-3 right-3 text-xl text-gray-600 cursor-pointer hover:text-gray-900"
                  />
                </Dropdown>

                {/* Subject Info with click handler */}
                <div
                  className="flex flex-col flex-grow p-5 cursor-pointer"
                  onClick={() => navigate(`/subject/${subject.subjectId}`)}
                >
                  <h3 className="text-xl font-bold text-indigo-900">
                    {subject.subjectName}
                  </h3>
                  <p className="text-gray-700 mt-1">
                    <strong>Description:</strong>{" "}
                    {subject.description || "Not specified"}
                  </p>
                  <p className="text-gray-600 mt-1">
                    <strong>Credits:</strong>{" "}
                    {subject.credits || "Not specified"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Passing Score:</strong>{" "}
                    {subject.passingScore || "Not specified"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectPage;
