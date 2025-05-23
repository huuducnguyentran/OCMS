// src/pages/instructorAssignment/InstructorAssignmentEdit.jsx
import React, { useEffect, useState } from "react";
import {
  Card, Form, Input, Button, Select, Spin, message, Typography, Layout, Row, Col, Tag, Alert
} from "antd";
import { 
  ArrowLeftOutlined, BookOutlined, TeamOutlined, FormOutlined, EditOutlined, CalendarOutlined
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import InstructorAssService from "../../services/instructorAssServices";
import { getAllSubject } from "../../services/subjectService";

const { Title } = Typography;
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
        // Fetch assignment details first
        const detailRes = await InstructorAssService.getInstructorAssignmentById(id);
        const assignmentData = detailRes.data?.data || detailRes.data || {};
        console.log('Assignment details:', assignmentData);
        
        // Fetch all subjects from subjectService - same as Create component
        const subjRes = await getAllSubject();
        const subjList =
          Array.isArray(subjRes) ? subjRes :
          Array.isArray(subjRes.allSubjects) ? subjRes.allSubjects :
          [];
        setSubjects(subjList);

        // Fetch all users with role=Instructor - same as Create component
        const instrRes = await InstructorAssService.getAllInstructors();
        const raw = Array.isArray(instrRes) ? instrRes : Array.isArray(instrRes.data) ? instrRes.data : [];
        const instrList = raw.filter(u => u.roleName === "Instructor");
        setInstructors(instrList);
        
        // Set form values
        form.setFieldsValue({
          subjectId: assignmentData.subjectId || assignmentData.courseSubjectSpecialtyId,
          instructorId: assignmentData.instructorId,
          notes: assignmentData.notes,
        });
        
        console.log('Form values set:', {
          subjectId: assignmentData.subjectId || assignmentData.courseSubjectSpecialtyId,
          instructorId: assignmentData.instructorId,
          notes: assignmentData.notes,
        });
      } catch (error) {
        console.error('Error loading data:', error);
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
      <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex justify-center items-center h-screen">
          <Spin size="large" tip="Loading assignment data..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-6 py-12">
        <div className="bg-white p-12 shadow-xl rounded-xl min-h-[calc(100vh-200px)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 m-0">
                Edit Instructor Assignment
              </h2>
              <p className="text-gray-500 text-xl mt-2">
                Update the assignment information below
              </p>
              <Tag color="blue" className="mt-2 text-lg px-4 py-1">
                {id}
              </Tag>
            </div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/instructor-assignment")}
              className="text-blue-600 hover:text-blue-800 px-0 text-lg"
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
                <Card className="rounded-xl shadow-md bg-blue-50">
                  <div className="flex items-center mb-2">
                    <BookOutlined className="text-blue-500 mr-2 text-xl" />
                    <span className="text-lg font-medium">Subject Information</span>
                  </div>
                  <Form.Item
                    name="subjectId"
                    label="Subject"
                    rules={[{ required: true, message: "Please select a subject" }]}
                  >
                    <Select 
                      placeholder="Select subject"
                      className="rounded-lg"
                      size="large"
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
              
              <Col xs={24} md={12}>
                <Card className="rounded-xl shadow-md bg-green-50">
                  <div className="flex items-center mb-2">
                    <TeamOutlined className="text-green-500 mr-2 text-xl" />
                    <span className="text-lg font-medium">Instructor Information</span>
                  </div>
                  <Form.Item
                    name="instructorId"
                    label="Instructor"
                    rules={[{ required: true, message: "Please select an instructor" }]}
                  >
                    <Select 
                      placeholder="Select instructor"
                      className="rounded-lg"
                      size="large"
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
                <Card className="rounded-xl shadow-md">
                  <div className="flex items-center mb-2">
                    <FormOutlined className="text-orange-500 mr-2 text-xl" />
                    <span className="text-lg font-medium">Additional Information</span>
                  </div>
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
                icon={<EditOutlined />}
                size="large"
                className="min-w-[150px] bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
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
