import { useEffect, useState } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Form,
  Tag,
  Row,
  Col,
  Card,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getSubjectById, updateSubject } from "../../services/subjectService";
import { applySubjectValidation } from "../../../utils/validationSchemas";
import { courseService } from "../../services/courseService";
const { TextArea } = Input;
// const { Title, Paragraph, Text } = Typography;
// const { Option } = Select;
const UpdateSubjectPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const data = await getSubjectById(subjectId);
        form.setFieldsValue(data.subject);
      } catch {
        message.error("Failed to load subject data.");
      }
    };
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await courseService.getAllCourses();
        setCourses(response?.data || []);
      } catch {
        setCourses([]);
        message.error("Failed to load courses.");
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchSubject();
    fetchCourses();
  }, [subjectId, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setApiError(null);

      await applySubjectValidation({
        ...values,
        subjectId,
      });

      const subjectData = {
        subjectId: subjectId,
        subjectName: values.subjectName.trim(),
        description: values.description.trim(),
        credits: Number(values.credits),
        passingScore: Number(values.passingScore),
      };

      console.log("Submitting subject data:", subjectData);

      const response = await updateSubject(subjectData);
      console.log("Update response:", response);

      message.success("Subject updated successfully!");
      navigate("/subject");
    } catch (error) {
      console.error("Error updating subject:", error);

      if (error.response && error.response.data) {
        const errorData = error.response.data;
        setApiError(errorData);

        if (errorData.message) {
          message.error(errorData.message);
        } else if (errorData.title) {
          message.error(errorData.title);
        } else if (errorData.errors) {
          const errorMessages = [];
          Object.entries(errorData.errors).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              errorMessages.push(`${key}: ${value.join(", ")}`);
            } else {
              errorMessages.push(`${key}: ${value}`);
            }
          });

          if (errorMessages.length > 0) {
            message.error(errorMessages.join("; "));
          } else {
            message.error("Validation failed. Please check your input.");
          }
        } else {
          message.error("Failed to update subject. Please try again.");
        }
      } else if (error.name === "ValidationError") {
        message.error(error.message);
      } else {
        message.error(
          "Failed to update subject. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Main Content Wrapper */}
      <div className="w-full px-6 py-12">
        <div className="bg-white p-10 shadow-2xl rounded-3xl min-h-[calc(100vh-200px)]">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-cyan-800 m-0">
                Edit Subject
              </h2>
              <p className="text-cyan-600 text-sm mt-2">
                Update the subject information below
              </p>
              <Tag color="cyan" className="!mt-3 text-base !px-4 py-1">
                {subjectId}
              </Tag>
            </div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/subject")}
              className="!text-cyan-500 hover:!text-cyan-700 !border !border-cyan-500 hover:!border-cyan-700  px-0 text-lg font-medium"
            >
              Back to Subjects
            </Button>
          </div>

          {/* Error Alert */}
          {apiError && (
            <Alert
              message={
                apiError.message ? "Course Error" : "Failed to update subject"
              }
              description={
                <div>
                  {apiError.message && (
                    <div className="font-semibold text-red-600">
                      {apiError.message}
                    </div>
                  )}
                  {apiError.errors && (
                    <ul className="mt-2">
                      {Object.entries(apiError.errors).map(([key, value]) => (
                        <li key={key} className="text-red-600">
                          {key}:{" "}
                          {Array.isArray(value) ? value.join(", ") : value}
                        </li>
                      ))}
                    </ul>
                  )}
                  {apiError.traceId && (
                    <p className="mt-2 text-xs text-gray-400">
                      <span className="font-semibold">Trace ID:</span>{" "}
                      {apiError.traceId}
                    </p>
                  )}
                </div>
              }
              type="error"
              showIcon
              closable
              onClose={() => setApiError(null)}
              className="mb-6"
            />
          )}

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="space-y-10"
          >
            {/* Subject Name */}
            <Form.Item
              name="subjectName"
              label={
                <span className="text-cyan-800 font-medium">Subject Name</span>
              }
              rules={[
                { required: true, message: "Subject name is required" },
                {
                  max: 255,
                  message: "Subject name must not exceed 255 characters",
                },
              ]}
            >
              <Input
                placeholder="Enter subject name"
                className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                size="large"
              />
            </Form.Item>

            {/* Description */}
            <Form.Item
              name="description"
              label={
                <span className="text-cyan-800 font-medium">Description</span>
              }
              rules={[
                { required: true, message: "Description is required" },
                {
                  max: 255,
                  message: "Description must not exceed 255 characters",
                },
              ]}
            >
              <TextArea
                rows={6}
                placeholder="Enter subject description"
                className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                size="large"
                maxLength={255}
              />
            </Form.Item>

            {/* Credits and Passing Score */}
            <Row gutter={20} className="mt-4">
              <Col xs={24} sm={12}>
                <Card className="!bg-cyan-50 rounded-xl shadow hover:shadow-lg transition">
                  <Form.Item
                    name="credits"
                    label={
                      <span className="text-cyan-800 font-medium ">
                        Credits (1–10)
                      </span>
                    }
                    rules={[
                      { required: true, message: "Credits are required" },
                      () => ({
                        validator(_, value) {
                          const num = Number(value);
                          if (num < 1 || num > 10 || !Number.isInteger(num)) {
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
                      prefix={
                        <BookOutlined className="!text-cyan-600 text-xl" />
                      }
                      className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card className="!bg-cyan-50 rounded-xl shadow hover:shadow-lg transition">
                  <Form.Item
                    name="passingScore"
                    label={
                      <span className="text-cyan-800 font-medium">
                        Passing Score (0–10)
                      </span>
                    }
                    rules={[
                      { required: true, message: "Passing score is required" },
                      () => ({
                        validator(_, value) {
                          const num = Number(value);
                          if (num < 0 || num > 10) {
                            return Promise.reject(
                              "Score must be between 0 and 10"
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
                      prefix={
                        <TrophyOutlined className="!text-cyan-600 text-xl" />
                      }
                      className="!rounded-lg !shadow-sm !border-cyan-400 focus:!border-cyan-600 focus:!ring-cyan-600"
                      size="large"
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>

            {/* Submit Button */}
            <Form.Item className="mt-10">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!w-full !h-10 text-xl !bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 border-none rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? "Updating..." : "Update Subject"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default UpdateSubjectPage;
