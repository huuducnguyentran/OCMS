import { Card, Empty, message, Spin, Modal, Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "animate.css";
import { courseService } from "../../services/courseService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { UpdateAssignedTrainee } from "../../services/traineeService"; // You’ll need to create this service

const AssignedTraineeCoursePage = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const storedUserID = localStorage.getItem("userID");
    try {
      const data = await courseService.getAssignedTraineeCourse(storedUserID);
      setCourses(data);
    } catch {
      message.error("Failed to fetch assigned courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trainee, courseId) => {
    setSelectedTrainee({ ...trainee, courseId });
    form.setFieldsValue({
      traineeId: trainee.traineeId,
      courseId,
      notes: trainee.notes || "",
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      await UpdateAssignedTrainee(selectedTrainee.traineeAssignId, values);
      message.success("Trainee assignment updated.");
      setIsModalVisible(false);
      fetchCourses(); // Refresh the list
    } catch {
      message.error("Failed to update trainee assignment.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <ArrowLeftOutlined />
            Back
          </button>
        </div>

        <h2 className="text-3xl font-bold text-indigo-900 mb-4">
          Assigned Courses
        </h2>

        {loading ? (
          <Spin size="large" />
        ) : courses.length === 0 ? (
          <Empty description="No assigned courses found." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.courseId}
                title={course.courseName}
                bordered
                hoverable
                className="rounded-xl shadow-md bg-white"
              >
                <p>
                  <strong>Course ID:</strong> {course.courseId}
                </p>
                <p>
                  <strong>Level:</strong> {course.courseLevel}
                </p>
                <p>
                  <strong>Status:</strong> {course.status}
                </p>
                <p>
                  <strong>Progress:</strong> {course.progress}
                </p>
                <p>
                  <strong>Created By:</strong> {course.createdByUserId}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(course.createdAt).toLocaleString()}
                </p>

                {course.trainees.map((t) => (
                  <div
                    key={t.traineeAssignId}
                    className="mt-4 border-t pt-2 relative"
                  >
                    <p>
                      <strong>Trainee ID:</strong> {t.traineeId}
                    </p>
                    <p>
                      <strong>Request Status:</strong> {t.requestStatus}
                    </p>
                    <p>
                      <strong>Notes:</strong> {t.notes ?? "No notes provided"}
                    </p>
                    <p>
                      <strong>Assigned By:</strong> {t.assignByUserId}
                    </p>
                    <p>
                      <strong>Assigned Date:</strong>{" "}
                      {new Date(t.assignDate).toLocaleString()}
                    </p>
                    <p>
                      <strong>Approved By:</strong>{" "}
                      {t.approveByUserId ?? "Not approved"}
                    </p>
                    <p>
                      <strong>Approval Date:</strong>{" "}
                      {t.approvalDate
                        ? new Date(t.approvalDate).toLocaleString()
                        : "Not approved"}
                    </p>
                    <p>
                      <strong>Request ID:</strong> {t.requestId}
                    </p>

                    <Button
                      type="link"
                      className="absolute top-2 right-2"
                      onClick={() => handleEdit(t, course.courseId)}
                    >
                      Edit
                    </Button>
                  </div>
                ))}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="Update Trainee Assignment"
        visible={isModalVisible}
        onOk={handleUpdate}
        onCancel={() => setIsModalVisible(false)}
        okText="Update"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Trainee ID"
            name="traineeId"
            rules={[{ required: true, message: "Trainee ID is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Course ID"
            name="courseId"
            rules={[{ required: true, message: "Course ID is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignedTraineeCoursePage;
