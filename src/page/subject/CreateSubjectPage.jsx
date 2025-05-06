import { useState } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Form,
  Card,
  Row,
  Col,
  Breadcrumb,
  Typography,
} from "antd";
import { createSubject } from "../../services/subjectService";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { applySubjectValidation } from "../../../utils/validationSchemas";

const { TextArea } = Input;
const { Title } = Typography;

const CreateSubjectPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSubject = async (values) => {
    try {
      setLoading(true);
      await applySubjectValidation(values);

      await createSubject({
        ...values,
        credits: Number(values.credits),
        passingScore: Number(values.passingScore),
      });

      message.success("Subject created successfully!");
      navigate("/subject");
    } catch (error) {
      if (error.name === "ValidationError") {
        message.error(error.message);
      } else {
        message.error("Failed to create subject");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Breadcrumb className="mb-4">
                <Breadcrumb.Item>
                  <a
                    onClick={() => navigate("/subject")}
                    className="text-blue-600"
                  >
                    <BookOutlined className="mr-1" />
                    Subjects
                  </a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>Create New Subject</Breadcrumb.Item>
              </Breadcrumb>
              <Title level={2} className="mb-2">
                Create New Subject
              </Title>
            </div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/subject")}
              className="text-blue-600"
            >
              Back to Subjects
            </Button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateSubject}
            className="space-y-6"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="subjectId"
                  label="Subject ID"
                  rules={[
                    { required: true, message: "Subject ID is required" },
                    { max: 100, message: "Max 100 characters" },
                  ]}
                >
                  <Input
                    prefix={<BookOutlined className="text-gray-400" />}
                    placeholder="Enter subject ID"
                    className="rounded-lg"
                    size="large"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="subjectName"
                  label="Subject Name"
                  rules={[
                    { required: true, message: "Subject name is required" },
                    { max: 100, message: "Max 100 characters" },
                  ]}
                >
                  <Input
                    placeholder="Enter subject name"
                    className="rounded-lg"
                    size="large"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[
                    { required: true, message: "Description is required" },
                    { max: 100, message: "Max 100 characters" },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter subject description"
                    className="rounded-lg"
                    size="large"
                    maxLength={100}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Card className="rounded-xl shadow-md">
                  <Form.Item
                    name="credits"
                    label="Credits (1-10)"
                    rules={[
                      { required: true, message: "Credits are required" },
                      () => ({
                        validator(_, value) {
                          const num = Number(value);
                          if (
                            !value ||
                            num < 1 ||
                            num > 10 ||
                            !Number.isInteger(num)
                          ) {
                            return Promise.reject(
                              "Credits must be between 1 and 10"
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    className="mb-0"
                  >
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="Enter credits"
                      prefix={<BookOutlined className="text-gray-400" />}
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>

              <Col xs={24} sm={12}>
                <Card className="rounded-xl shadow-md">
                  <Form.Item
                    name="passingScore"
                    label="Passing Score (0-10)"
                    rules={[
                      { required: true, message: "Passing score is required" },
                      () => ({
                        validator(_, value) {
                          const num = Number(value);
                          if ((!value && value !== 0) || num < 0 || num > 10) {
                            return Promise.reject(
                              "Passing score must be between 0 and 10"
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                    className="mb-0"
                  >
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      placeholder="Enter passing score"
                      prefix={<TrophyOutlined className="text-yellow-500" />}
                      className="rounded-lg"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            <Form.Item className="mt-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 border-0 rounded-lg shadow-md"
              >
                {loading ? "Creating..." : "Create Subject"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateSubjectPage;
