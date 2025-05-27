import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Form,
  Button,
  Select,
  Card,
  Row,
  Col,
  message,
  Spin,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  BookOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  createSubjectSpecialty,
  getSpecialtiesForDropdown,
  getAllSubject,
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
        const [subjectsRes, specialtiesRes] = await Promise.all([
          getAllSubject(),
          getSpecialtiesForDropdown(),
        ]);

        let subjectsList = [];
        if (Array.isArray(subjectsRes)) {
          subjectsList = subjectsRes;
        } else if (subjectsRes.data?.data) {
          subjectsList = subjectsRes.data.data;
        } else if (subjectsRes.allSubjects) {
          subjectsList = subjectsRes.allSubjects;
        }

        let specialtiesList = [];
        if (Array.isArray(specialtiesRes)) {
          specialtiesList = specialtiesRes;
        } else if (specialtiesRes.data?.data) {
          specialtiesList = specialtiesRes.data.data;
        }

        setSubjects(subjectsList);
        setSpecialties(specialtiesList);
      } catch (error) {
        message.error("Failed to load subjects or specialties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await createSubjectSpecialty(values);
      message.success("Subject specialty created successfully");
      navigate("/subject-specialty");
    } catch (error) {
      message.error("Failed to create subject specialty", error);
    } finally {
      setSubmitting(false);
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
      <div className="w-full px-6 py-10">
        <Card className="shadow-2xl rounded-2xl p-8 max-w-6xl !mx-auto bg-white">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title level={2} className="!m-0 !text-cyan-700">
                Create Subject Specialty
              </Title>
              <Text type="secondary" className="text-lg">
                Associate a subject with a specialty
              </Text>
            </div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/subject-specialty")}
              size="large"
              className="!border-cyan-600 !text-cyan-600 hover:!border-cyan-800 hover:!text-cyan-800"
            >
              Back to List
            </Button>
          </div>

          <Divider className="!border-cyan-400" />

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="max-w-5xl mx-auto"
          >
            <Row gutter={24}>
              <Col span={24} md={12}>
                <Card
                  className="!mb-6 !shadow-md !bg-cyan-50 !rounded-xl"
                  title={
                    <div className="flex items-center text-cyan-600 font-semibold">
                      <BookOutlined className="!mr-2" />
                      Subject
                    </div>
                  }
                >
                  <Form.Item
                    name="subjectId"
                    label={
                      <span className="text-base font-medium">
                        Select Subject
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select a subject" },
                    ]}
                  >
                    <Select
                      placeholder="Select a subject"
                      showSearch
                      optionFilterProp="children"
                      size="large"
                      className="w-full"
                    >
                      {subjects.map((subject) => (
                        <Option
                          key={subject.subjectId}
                          value={subject.subjectId}
                        >
                          {subject.subjectName || subject.subjectId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24} md={12}>
                <Card
                  className="!mb-6 !shadow-md !bg-cyan-50 !rounded-xl"
                  title={
                    <div className="flex items-center text-cyan-600 font-semibold">
                      <TagsOutlined className="!mr-2" />
                      Specialty
                    </div>
                  }
                >
                  <Form.Item
                    name="specialtyId"
                    label={
                      <span className="text-base font-medium">
                        Select Specialty
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please select a specialty" },
                    ]}
                  >
                    <Select
                      placeholder="Select a specialty"
                      showSearch
                      optionFilterProp="children"
                      size="large"
                      className="w-full"
                    >
                      {specialties.map((specialty) => (
                        <Option
                          key={specialty.specialtyId}
                          value={specialty.specialtyId}
                        >
                          {specialty.specialtyName || specialty.specialtyId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <div className="flex justify-end mt-8">
              <Button
                type="default"
                onClick={() => navigate("/subject-specialty")}
                className="!mr-4 !border-cyan-400 !text-cyan-400 hover:!border-cyan-600 hover:!text-cyan-600 !px-6 "
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
                className="!bg-cyan-600 hover:!bg-cyan-700 !border-none !text-white !shadow-lg !px-6 py-2 rounded-xl"
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
