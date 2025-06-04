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
import { createSubjectSpecialty } from "../../services/subjectSpecialtyServices";
import { getAllSubject } from "../../services/subjectService";
import { specialtyService } from "../../services/specialtyServices";
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
          specialtyService.getAllSpecialties(),
        ]);

        console.log("Raw specialties response:", specialtiesRes);

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
        } else if (specialtiesRes.specialties) {
          specialtiesList = specialtiesRes.specialties;
        } else if (specialtiesRes.data) {
          specialtiesList = specialtiesRes.data;
        }

        console.log("Processed specialties list:", specialtiesList);

        // Check if specialties have the expected properties
        if (specialtiesList.length > 0) {
          console.log("First specialty item:", specialtiesList[0]);
          console.log(
            "specialtyId exists:",
            "specialtyId" in specialtiesList[0]
          );
          console.log(
            "specialtyName exists:",
            "specialtyName" in specialtiesList[0]
          );

          // Try to find the correct property names
          const firstItem = specialtiesList[0];
          const possibleIdKeys = Object.keys(firstItem).filter((key) =>
            key.toLowerCase().includes("id")
          );
          const possibleNameKeys = Object.keys(firstItem).filter((key) =>
            key.toLowerCase().includes("name")
          );

          console.log("Possible ID keys:", possibleIdKeys);
          console.log("Possible Name keys:", possibleNameKeys);
        }

        setSubjects(subjectsList);
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load subjects or specialties");
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
                      allowClear
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
                      allowClear
                      optionFilterProp="children"
                      size="large"
                      className="w-full"
                    >
                      {specialties.length > 0 ? (
                        specialties.map((specialty) => {
                          // Handle different property naming conventions
                          const id =
                            specialty.specialtyId ||
                            specialty.id ||
                            specialty.specialty_id ||
                            "";
                          const name =
                            specialty.specialtyName ||
                            specialty.name ||
                            specialty.specialty_name ||
                            id;

                          return (
                            <Option key={id} value={id}>
                              {name}
                            </Option>
                          );
                        })
                      ) : (
                        <Option value="" disabled>
                          No data
                        </Option>
                      )}
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
