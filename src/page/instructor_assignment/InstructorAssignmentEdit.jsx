// src/pages/instructorAssignment/InstructorAssignmentEdit.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Spin,
  message,
  Layout,
  Row,
  Col,
  Tag,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TeamOutlined,
  FormOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import InstructorAssService from "../../services/instructorAssServices";
import { getAllSubject } from "../../services/subjectService";

const { Option } = Select;

const InstructorAssignmentEdit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const detailRes =
          await InstructorAssService.getInstructorAssignmentById(id);
        const assignmentData = detailRes.data?.data || detailRes.data || {};

        const subjRes = await getAllSubject();
        const subjList = Array.isArray(subjRes)
          ? subjRes
          : Array.isArray(subjRes.allSubjects)
          ? subjRes.allSubjects
          : [];
        setSubjects(subjList);

        const instrRes = await InstructorAssService.getAllInstructors();
        const raw = Array.isArray(instrRes)
          ? instrRes
          : Array.isArray(instrRes.data)
          ? instrRes.data
          : [];
        const instrList = raw.filter((u) => u.roleName === "Instructor");
        setInstructors(instrList);

        form.setFieldsValue({
          subjectId:
            assignmentData.subjectId || assignmentData.courseSubjectSpecialtyId,
          instructorId: assignmentData.instructorId,
          notes: assignmentData.notes,
        });
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Failed to load assignment data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, form]);

  const onFinish = async (vals) => {
    try {
      await InstructorAssService.updateInstructorAssignment(id, vals);
      message.success("Assignment updated");
      navigate("/instructor-assignment");
    } catch {
      message.error("Update failed");
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="Loading assignment data..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <div className="w-full px-6 py-12">
        <div className="bg-white border border-cyan-400 p-10 shadow-xl rounded-2xl min-h-[calc(100vh-200px)]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-4xl font-bold text-cyan-900 m-0">
                Edit Instructor Assignment
              </h2>
              <p className="text-cyan-700 text-lg mt-2">
                Update the assignment information below
              </p>
              <Tag color="cyan" className="mt-2 text-base px-4 py-1 rounded-md">
                ID: {id}
              </Tag>
            </div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/instructor-assignment")}
              className="!text-cyan-600 !hover:text-cyan-800  hover:!border-cyan-800 font-medium rounded-lg transition-colors duration-300"
            >
              Back to Assignments
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-10 max-w-full"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Card className="!rounded-2xl !shadow-md !bg-cyan-50 !border !border-cyan-400 !mb-4">
                  <div className="flex items-center mb-2">
                    <BookOutlined className="!text-cyan-600 !mr-2 !text-xl" />
                    <span className="text-lg font-semibold text-cyan-800">
                      Subject Information
                    </span>
                  </div>
                  <Form.Item
                    name="subjectId"
                    label={
                      <span className="text-cyan-900 font-medium">Subject</span>
                    }
                    rules={[
                      { required: true, message: "Please select a subject" },
                    ]}
                  >
                    <Select
                      placeholder="Select subject"
                      className="rounded-lg"
                      size="large"
                      showSearch
                      optionFilterProp="children"
                    >
                      {subjects.map((s) => (
                        <Option key={s.subjectId} value={s.subjectId}>
                          {s.subjectName || s.subjectId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card className="!rounded-2xl !shadow-md !bg-cyan-50 !border !border-cyan-400 !mb-4">
                  <div className="flex items-center mb-2">
                    <TeamOutlined className="!text-cyan-700 !mr-2 !text-xl" />
                    <span className="text-lg font-semibold text-cyan-900">
                      Instructor Information
                    </span>
                  </div>
                  <Form.Item
                    name="instructorId"
                    label={
                      <span className="text-cyan-900 font-medium">
                        Instructor
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please select an instructor",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select instructor"
                      className="rounded-lg"
                      size="large"
                      showSearch
                      optionFilterProp="children"
                    >
                      {instructors.map((i) => (
                        <Option
                          key={i.userId || i.instructorId}
                          value={i.userId || i.instructorId}
                        >
                          {i.fullName ||
                            i.username ||
                            i.userId ||
                            i.instructorId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24}>
                <Card className="!rounded-2xl !shadow-md !bg-cyan-50 !border !border-cyan-400">
                  <div className="flex items-center mb-2">
                    <FormOutlined className="!text-cyan-600 !mr-2 !text-xl" />
                    <span className="text-lg font-semibold text-cyan-800">
                      Additional Notes
                    </span>
                  </div>
                  <Form.Item
                    name="notes"
                    label={
                      <span className="text-cyan-900 font-medium">Notes</span>
                    }
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Enter any additional notes about this assignment"
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <Form.Item className="flex justify-end gap-4 mt-8">
              <Button
                onClick={() => navigate(-1)}
                size="large"
                className="!min-w-[100px] !text-cyan-700 !border-cyan-600 !mr-2"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<EditOutlined />}
                size="large"
                className="!min-w-[160px] !bg-cyan-700 hover:!bg-cyan-800 !border-cyan-700 hover:!border-cyan-800 !text-white"
              >
                Update Assignment
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorAssignmentEdit;
