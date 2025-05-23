import React, { useEffect, useState } from "react";
import { getAllSubject } from "../../services/subjectService";
import { 
  Card, Form, Input, Select, Button, Spin, message, Typography, Layout, Row, Col, Alert
} from "antd";
import { 
  ArrowLeftOutlined, BookOutlined, TeamOutlined, FormOutlined
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
        // Fetch all subjects from subjectService
        const subjRes = await getAllSubject();
        const subjList =
          Array.isArray(subjRes) ? subjRes :
          Array.isArray(subjRes.allSubjects) ? subjRes.allSubjects :
          [];
        setSubjects(subjList);

        // Fetch all users with role=Instructor
        const instrRes = await InstructorAssService.getAllInstructors();
        const raw = Array.isArray(instrRes) ? instrRes : Array.isArray(instrRes.data) ? instrRes.data : [];
        const instrList = raw.filter(u => u.roleName === "Instructor");
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
      <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="Loading options..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <Title level={3} className="text-gray-800 m-0">
              Create New Instructor Assignment
            </Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/instructor-assignment")}
              className="text-blue-600"
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
                <Card className="rounded-xl shadow-sm bg-blue-50">
                  <Form.Item
                    name="subjectId"
                    label="Subject"
                    rules={[{ required: true, message: "Please select a subject" }]}
                  >
                    <Select 
                      placeholder="Select subject"
                      className="rounded-lg"
                      size="large"
                      suffixIcon={<BookOutlined className="text-blue-500" />}
                      showSearch
                      optionFilterProp="children"
                    >
                      {subjects.map(s => (
                        <Option key={s.subjectId} value={s.subjectId}>
                          {s.subjectName || s.subjectId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24} className="mt-4">
                <Card className="rounded-xl shadow-sm bg-green-50">
                  <Form.Item
                    name="instructorId"
                    label="Instructor"
                    rules={[{ required: true, message: "Please select an instructor" }]}
                  >
                    <Select 
                      placeholder="Select instructor"
                      className="rounded-lg"
                      size="large"
                      suffixIcon={<TeamOutlined className="text-green-500" />}
                      showSearch
                      optionFilterProp="children"
                    >
                      {instructors.map(i => (
                        <Option key={i.userId || i.instructorId} value={i.userId || i.instructorId}>
                          {i.fullName || i.username || i.userId || i.instructorId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24} className="mt-4">
                <Card className="rounded-xl shadow-sm">
                  <Form.Item name="notes" label="Notes">
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
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<FormOutlined />}
                size="large"
                className="min-w-[150px] bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 m-6"
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
