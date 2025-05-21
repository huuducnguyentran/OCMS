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
  Select,
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
        // courseId: values.courseId,
        courseLevel: values.courseLevel,
        // trainingPlanId: values.trainingPlanId,
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
    <Layout className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <Card
        className="max-w-4xl mx-auto shadow-lg rounded-2xl"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="text-gray-800">
              Create New Course
            </Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/all-courses")}
              className="text-gray-600 border-gray-300 hover:text-gray-800 hover:border-gray-400"
            >
              Back to Courses
            </Button>
          </div>
        }
        headStyle={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}
        bodyStyle={{ padding: "32px" }}
      >
        <Spin spinning={loading || loadingCourses} size="large">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateCourse}
            initialValues={{ courseLevel: "Initial" }}
            size="large"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Name */}
              <Form.Item
                name="courseName"
                label={<Text strong>Course Name</Text>}
                rules={[
                  { required: true, message: "Course name is required" },
                  { max: 255, message: "Max 255 characters" },
                ]}
              >
                <Input
                  placeholder="Enter course name"
                  className="rounded-lg py-2 px-4"
                  maxLength={255}
                />
              </Form.Item>

              {/* Course Level */}
              <Form.Item
                name="courseLevel"
                label={<Text strong>Course Level</Text>}
                rules={[
                  { required: true, message: "Course level is required" },
                ]}
              >
                <Select
                  placeholder="Select course level"
                  className="rounded-lg"
                  options={[
                    { value: "Initial", label: "Initial" },
                    { value: "Recurrent", label: "Recurrent" },
                    { value: "Relearn", label: "Relearn" },
                    { value: "Professional", label: "Professional" },
                  ]}
                />
              </Form.Item>

              {/* Course Related ID */}
              <Form.Item
                name="courseRelatedId"
                label={<Text strong>Course Related ID</Text>}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const level = getFieldValue("courseLevel");
                      if (
                        (level === "Recurrent" || level === "Relearn") &&
                        !value
                      ) {
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
                    max: 20,
                    message: "Max 20 characters",
                  },
                ]}
              >
                <AutoComplete
                  placeholder="Select or enter related course ID"
                  className="rounded-lg"
                  style={{ width: "100%" }}
                  options={initialCourses.map((course) => ({
                    value: course.courseId,
                    label: `${course.courseName} (${course.courseId})`,
                  }))}
                  filterOption={(inputValue, option) =>
                    option.value
                      .toLowerCase()
                      .includes(inputValue.toLowerCase()) ||
                    option.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  onChange={(value) =>
                    form.setFieldsValue({ courseRelatedId: value })
                  }
                >
                  <Input className="py-2 px-4" maxLength={100} />
                </AutoComplete>
              </Form.Item>

              {/* Description - spans full width */}
              <Form.Item
                name="description"
                label={<Text strong>Description</Text>}
                rules={[
                  { required: true, message: "Description is required" },
                  { max: 255, message: "Max 255 characters" },
                ]}
                className="md:col-span-2"
              >
                <Input.TextArea
                  placeholder="Enter course description"
                  className="rounded-lg py-2 px-4"
                  autoSize={{ minRows: 3 }}
                  maxLength={255}
                />
              </Form.Item>
            </div>

            <Divider className="my-8 border-gray-200" />

            {/* Action buttons */}
            <div className="flex justify-end gap-4">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => form.resetFields()}
                className="rounded-lg border-gray-300 px-6 py-2 h-auto"
              >
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={loading}
                className="bg-gray-800 hover:bg-gray-900 border-0 rounded-lg px-8 py-2 h-auto"
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
