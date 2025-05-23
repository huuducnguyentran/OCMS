import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout, Typography, Form, Button, Select, Card, Row, Col,
  message, Spin, Divider, Alert
} from "antd";
import {
  ArrowLeftOutlined, SaveOutlined, BookOutlined, TagsOutlined
} from "@ant-design/icons";
import {
  createSubjectSpecialty,
  getSpecialtiesForDropdown,
  getAllSubject
} from "../../services/subjectSpecialtyServices";

const { Title, Text } = Typography;
const { Option } = Select;

const SubjectSpecialtyCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        // Fetch subjects and specialties in parallel
        const [subjectsRes, specialtiesRes] = await Promise.all([
          getAllSubject(),
          getSpecialtiesForDropdown()
        ]);

        console.log('Raw subjects response:', subjectsRes);
        
        // Process subjects data
        let subjectsList = [];
        if (Array.isArray(subjectsRes)) {
          subjectsList = subjectsRes;
        } else if (subjectsRes.data && Array.isArray(subjectsRes.data)) {
          subjectsList = subjectsRes.data;
        } else if (subjectsRes.data?.data && Array.isArray(subjectsRes.data.data)) {
          subjectsList = subjectsRes.data.data;
        } else if (subjectsRes.allSubjects && Array.isArray(subjectsRes.allSubjects)) {
          subjectsList = subjectsRes.allSubjects;
        }
        
        console.log('Processed subjects list:', subjectsList);
        setSubjects(subjectsList);

        // Process specialties data
        let specialtiesList = [];
        if (Array.isArray(specialtiesRes)) {
          specialtiesList = specialtiesRes;
        } else if (specialtiesRes.data && Array.isArray(specialtiesRes.data)) {
          specialtiesList = specialtiesRes.data;
        } else if (specialtiesRes.data?.data && Array.isArray(specialtiesRes.data.data)) {
          specialtiesList = specialtiesRes.data.data;
        }
        setSpecialties(specialtiesList);

        console.log('Subjects:', subjectsList);
        console.log('Specialties:', specialtiesList);
      } catch (error) {
        console.error('Error fetching options:', error);
        message.error('Failed to load subjects or specialties');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      console.log('Form values:', values);
      await createSubjectSpecialty(values);
      message.success('Subject specialty created successfully');
      navigate('/subject-specialty');
    } catch (error) {
      console.error('Error creating subject specialty:', error);
      message.error('Failed to create subject specialty');
    } finally {
      setSubmitting(false);
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
      <div className="w-full px-6 py-8">
        <Card className="shadow-xl rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={2} className="m-0">Create Subject Specialty</Title>
              <Text type="secondary" className="text-lg">
                Associate a subject with a specialty
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/subject-specialty')}
              size="large"
            >
              Back to List
            </Button>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="max-w-3xl mx-auto"
          >
            <Row gutter={24}>
              <Col span={24} md={12}>
                <Card
                  className="mb-6 shadow-md bg-blue-50"
                  title={
                    <div className="flex items-center">
                      <BookOutlined className="mr-2 text-blue-500" />
                      <span>Subject</span>
                    </div>
                  }
                >
                  <Form.Item
                    name="subjectId"
                    label="Select Subject"
                    rules={[{ required: true, message: 'Please select a subject' }]}
                  >
                    <Select
                      placeholder="Select a subject"
                      showSearch
                      optionFilterProp="children"
                      size="large"
                      className="w-full"
                    >
                      {subjects.map(subject => (
                        <Option key={subject.subjectId} value={subject.subjectId}>
                          {subject.subjectName || subject.subjectId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24} md={12}>
                <Card
                  className="mb-6 shadow-md bg-green-50"
                  title={
                    <div className="flex items-center">
                      <TagsOutlined className="mr-2 text-green-500" />
                      <span>Specialty</span>
                    </div>
                  }
                >
                  <Form.Item
                    name="specialtyId"
                    label="Select Specialty"
                    rules={[{ required: true, message: 'Please select a specialty' }]}
                  >
                    <Select
                      placeholder="Select a specialty"
                      showSearch
                      optionFilterProp="children"
                      size="large"
                      className="w-full"
                    >
                      {specialties.map(specialty => (
                        <Option key={specialty.specialtyId} value={specialty.specialtyId}>
                          {specialty.specialtyName || specialty.specialtyId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <div className="flex justify-end mt-6">
              <Button
                type="default"
                onClick={() => navigate('/subject-specialty')}
                className="mr-4"
                size="large"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                size="large"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default SubjectSpecialtyCreate;
