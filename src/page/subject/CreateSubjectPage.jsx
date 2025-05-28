import { useState } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Form,
  Row,
  Col,
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
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-10 animate__animated animate__fadeIn">
          <div className="flex justify-between items-center mb-8">
            <Title level={3} className="text-cyan-800 m-0">
              Create New Subject
            </Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/subject")}
              className="!text-cyan-600 hover:!text-cyan-800 border !border-cyan-300 rounded-lg"
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
              <Col span={24}>
                <Form.Item
                  name="subjectName"
                  label={
                    <span className="font-medium text-cyan-700">
                      Subject Name
                    </span>
                  }
                  rules={[
                    { required: true, message: "Subject name is required" },
                  ]}
                >
                  <Input
                    placeholder="Enter subject name"
                    className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                    size="large"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="description"
                  label={
                    <span className="font-medium text-cyan-700">
                      Description
                    </span>
                  }
                  rules={[
                    { required: true, message: "Description is required" },
                    { max: 255, message: "Max 255 characters" },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Enter subject description"
                    className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                    size="large"
                    maxLength={255}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <div className="bg-cyan-50 p-4 rounded-xl shadow-sm">
                  <Form.Item
                    name="credits"
                    label={
                      <span className="font-medium text-cyan-700">
                        Credits (1–10)
                      </span>
                    }
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
                      prefix={<BookOutlined className="text-cyan-500" />}
                      className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                      size="large"
                    />
                  </Form.Item>
                </div>
              </Col>

              <Col xs={24} sm={12}>
                <div className="bg-cyan-50 p-4 rounded-xl shadow-sm">
                  <Form.Item
                    name="passingScore"
                    label={
                      <span className="font-medium text-cyan-700">
                        Passing Score (0–10)
                      </span>
                    }
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
                      className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                      size="large"
                    />
                  </Form.Item>
                </div>
              </Col>
            </Row>

            <Form.Item className="pt-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!w-full !h-12 !text-lg !bg-cyan-700 hover:!bg-cyan-800 !border-none !rounded-lg !shadow-md !transition-all !duration-200"
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
