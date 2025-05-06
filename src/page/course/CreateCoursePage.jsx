import { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Form,
  Spin,
  Card,
  Typography,
  Divider,
  AutoComplete,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";

const { Title, Text } = Typography;

const CreateCoursePage = () => {
  // State management
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // const [courseLevel, setCourseLevel] = useState(0);
  const [initialCourses, setInitialCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch training plans and initial courses
  useEffect(() => {
    fetchInitialCourses();
  }, []);

  const fetchInitialCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getAllCourses();
      if (response.data) {
        // Lọc các khóa học có courseLevel: "Initial" và progress: "Completed"
        const filteredCourses = response.data.filter(
          (course) =>
            course.courseLevel === "Initial" && course.progress !== "Pending"
        );
        setInitialCourses(filteredCourses);
      }
    } catch (error) {
      console.error("Failed to fetch initial courses:", error);
      message.error("Failed to load initial courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  // const handleCourseLevelChange = (value) => {
  //   setCourseLevel(value);
  //   if (value === 0) {
  //     form.setFieldValue("courseRelatedId", "");
  //   }
  // };

  // Form submission
  const handleCreateCourse = async (values) => {
    try {
      setLoading(true);

      const formattedData = {
        courseId: values.courseId,
        courseLevel: values.courseLevel,
        trainingPlanId: values.trainingPlanId,
        courseName: values.courseName,
        description: values.description,
        courseRelatedId: values.courseRelatedId || "",
      };

      console.log("Sending course data:", formattedData);

      await courseService.createCourse(formattedData);
      message.success("Course created successfully!");
      form.resetFields();
      navigate("/all-courses", { state: { refresh: true } });
    } catch (error) {
      console.error("Failed to create course:", error);

      // Hiển thị thông báo lỗi từ API
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        if (errorData.message && errorData.error) {
          message.error(`${errorData.message} ${errorData.error}`);
        } else if (errorData.message) {
          message.error(errorData.message);
        } else if (errorData.error) {
          message.error(errorData.error);
        } else {
          message.error("Failed to create course");
        }
      } else {
        message.error(
          `Failed to create course: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50 p-8 sm:p-10">
      <Card
        className="max-w-5xl mx-auto shadow-xl rounded-xl overflow-hidden border-0"
        title={
          <div className="flex items-center justify-between py-2">
            <Title level={2} className="m-0 text-gray-800">
              Create New Course
            </Title>
            <Button
              size="large"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/all-courses")}
              className="flex items-center text-gray-600 hover:text-gray-800 border-gray-300"
            >
              Back to Courses
            </Button>
          </div>
        }
        headStyle={{ borderBottom: "2px solid #f0f0f0", padding: "16px 24px" }}
        bodyStyle={{ padding: "32px" }}
      >
        <Spin spinning={loading || loadingCourses} size="large">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateCourse}
            initialValues={{ courseLevel: 0 }}
            className="p-2"
            size="large"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Form.Item
                name="courseId"
                label={
                  <Text strong className="text-lg">
                    Course ID
                  </Text>
                }
                rules={[
                  { required: true, message: "Course ID is required" },
                  {
                    max: 50,
                    message: "Course ID must not exceed 50 characters",
                  },
                ]}
              >
                <Input
                  placeholder="e.g., C-0001"
                  className="rounded-lg py-3 px-4 text-lg"
                  size="large"
                  maxLength={50}
                />
              </Form.Item>

              <Form.Item
                name="courseLevel"
                label={
                  <Text strong className="text-lg">
                    Course Level
                  </Text>
                }
                rules={[
                  { required: true, message: "Course level is required" },
                ]}
              >
                <Input
                  placeholder="e.g., Initial"
                  className="rounded-lg py-3 px-4 text-lg"
                  size="large"
                  maxLength={50}
                />
              </Form.Item>

              <Form.Item
                name="courseName"
                label={
                  <Text strong className="text-lg">
                    Course Name
                  </Text>
                }
                rules={[
                  { required: true, message: "Course name is required" },
                  {
                    max: 100,
                    message: "Course name must not exceed 100 characters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter course name"
                  className="rounded-lg py-3 px-4 text-lg"
                  size="large"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="courseRelatedId"
                label={
                  <Text strong className="text-lg">
                    Course Related ID
                  </Text>
                }
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const level = getFieldValue("courseLevel");
                      if (level > 0 && !value) {
                        return Promise.reject(
                          new Error(
                            "Course Related ID is required for Recurrent/Relearn courses"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                  {
                    max: 100,
                    message: "Course Related ID must not exceed 100 characters",
                  },
                ]}
              >
                <AutoComplete
                  placeholder="Select or enter Course Related ID"
                  className="rounded-lg"
                  size="large"
                  style={{ width: "100%" }}
                  options={initialCourses.map((course) => ({
                    value: course.courseId,
                    label: `${course.courseName} (${course.courseId})`,
                  }))}
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1 ||
                    option.label
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) !== -1
                  }
                  onChange={(value) =>
                    form.setFieldsValue({ courseRelatedId: value })
                  }
                >
                  <Input className="py-3 px-4 text-lg" maxLength={100} />
                </AutoComplete>
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Text strong className="text-lg">
                    Description
                  </Text>
                }
                rules={[
                  { required: true, message: "Description is required" },
                  {
                    max: 100,
                    message: "Description must not exceed 100 characters",
                  },
                ]}
              >
                <Input.TextArea
                  placeholder="Enter course description"
                  className="rounded-lg py-3 px-4 text-lg"
                  size="large"
                  maxLength={100}
                />
              </Form.Item>
            </div>

            <Divider className="my-8 border-gray-200" />

            <div className="flex justify-end space-x-6 mt-8">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => form.resetFields()}
                className="rounded-lg border-gray-300 hover:border-gray-400 hover:text-gray-700 px-6 py-3 h-auto text-base flex items-center"
                size="large"
              >
                Reset Form
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={loading}
                className="bg-gray-700 hover:bg-gray-800 rounded-lg border-0 px-8 py-3 h-auto text-base flex items-center shadow-md"
                size="large"
              >
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default CreateCoursePage;
