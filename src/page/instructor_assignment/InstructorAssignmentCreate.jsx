import { useEffect, useState } from "react";
import { getAllSubject } from "../../services/subjectService";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Spin,
  message,
  Typography,
  Layout,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TeamOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import InstructorAssService from "../../services/instructorAssServices";

const { Title } = Typography;
const { Option } = Select;

const InstructorAssignmentCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error(error);
        message.error("Failed to load subjects or instructors.");
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, []);

  const onFinish = async (values) => {
    try {
      await InstructorAssService.createInstructorAssignment(values);
      message.success("Assignment created successfully.");
      navigate("/instructor-assignment");
    } catch (error) {
      console.error(error);
      message.error("Failed to create assignment.");
    }
  };

  if (loading) {
    return (
      <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="Loading options..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border border-cyan-400">
          <div className="flex justify-between items-start mb-6">
            <Title level={3} className="!text-cyan-800 !m-0">
              Create New Instructor Assignment
            </Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/instructor-assignment")}
              className="!text-cyan-700 hover:!text-cyan-900 border !border-cyan-600"
            >
              Back to Assignments
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6"
          >
            <Row gutter={24}>
              <Col span={24}>
                <Card className="rounded-xl !bg-cyan-50 border !border-cyan-200 !shadow-sm">
                  <Form.Item
                    name="subjectId"
                    label={
                      <span className="text-cyan-800 font-medium">Subject</span>
                    }
                    rules={[
                      { required: true, message: "Please select a subject" },
                    ]}
                  >
                    <Select
                      placeholder="Select subject"
                      className="rounded-lg"
                      size="large"
                      suffixIcon={<BookOutlined className="!text-cyan-600" />}
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

              <Col span={24} className="mt-4">
                <Card className="rounded-xl !bg-cyan-50 !border !border-cyan-200 !shadow-sm">
                  <Form.Item
                    name="instructorId"
                    label={
                      <span className="!text-cyan-800 font-medium">
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
                      suffixIcon={<TeamOutlined className="!text-cyan-600" />}
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

              <Col span={24} className="mt-4">
                <Card className="rounded-xl !bg-cyan-50 !border !border-cyan-100 !shadow-sm">
                  <Form.Item
                    name="notes"
                    label={
                      <span className="!text-cyan-800 font-medium">Notes</span>
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
                className="!min-w-[100px] !text-cyan-800 !border-cyan-500 hover:!border-cyan-900 mr-4"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<FormOutlined />}
                size="large"
                className="!min-w-[150px] !bg-cyan-700 hover:!bg-cyan-800 border-cyan-700 hover:!border-cyan-800 !text-white"
              >
                Create Assignment
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default InstructorAssignmentCreate;
