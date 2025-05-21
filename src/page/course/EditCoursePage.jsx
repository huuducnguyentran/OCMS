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
  Select,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { courseService } from "../../services/courseService";

const { Option } = Select;
const { Title, Text } = Typography;

const EditCoursePage = () => {
  // State management
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch course and training plans data
  useEffect(() => {
    fetchCourseData();
    fetchTrainingPlans();
    fetchCourses();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoadingCourse(true);
      const response = await courseService.getCourseById(id);
      console.log("Course data:", response);

      if (response && response.success && response.data) {
        // Set form values với đầy đủ các trường
        form.setFieldsValue({
          description: response.data.description,
          courseName: response.data.courseName,
          courseRelatedId: response.data.courseRelatedId || "",
        });
      } else {
        message.error("Failed to load course data");
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
      message.error("Failed to load course data");
    } finally {
      setLoadingCourse(false);
    }
  };

  const fetchTrainingPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await trainingPlanService.getAllTrainingPlans();
      setTrainingPlans(response.plans || []);
    } catch (error) {
      console.error("Failed to fetch training plans:", error);
      message.error("Failed to load training plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getAllCourses();
      if (response?.data) {
        // Lọc ra các khóa học khác với khóa học hiện tại
        const filteredCourses = response.data.filter(course => course.courseId !== id);
        setCourses(filteredCourses);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  // Form submission
  const handleUpdateCourse = async (values) => {
    try {
      setLoading(true);

      // Đảm bảo gửi đúng format data theo API
      const formattedData = {
        description: values.description?.trim() || "",
        courseName: values.courseName?.trim() || "",
        courseRelatedId: values.courseRelatedId || "",
      };


      // Đảm bảo gọi đúng endpoint với đúng format
      await courseService.updateCourse(id, formattedData);
      message.success("Course updated successfully!");
      navigate("/all-courses", { state: { refresh: true } });
    } catch (error) {
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.message && errorData.error) {
          message.error(`${errorData.message} ${errorData.error}`);
        } else if (errorData.message) {
          message.error(errorData.message);
        } else if (errorData.error) {
          message.error(errorData.error);
        } else {
          message.error("Failed to update course");
        }
      } else {
        message.error(
          `Failed to update course: ${error.message || "Unknown error"}`
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
              Edit Course
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
        styles={{
          header: { borderBottom: "1px solid #f0f0f0" },
          body: { padding: "16px" },
        }}
      >
        <Spin spinning={loading || loadingCourse || loadingPlans || loadingCourses} size="large">
         
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateCourse}
            className="p-2"
            size="large"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Form.Item
                name="courseName"
                label={
                  <Text strong className="text-lg">
                    Course Name
                  </Text>
                }
                rules={[{ required: true, message: "Course name is required" }]}
                className="col-span-2"
              >
                <Input
                  placeholder="Enter course name"
                  className="rounded-lg py-3 px-4 text-lg"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Text strong className="text-lg">
                    Description
                  </Text>
                }
                rules={[{ required: true, message: "Description is required" }]}
                className="col-span-2"
              >
                <Input.TextArea
                  placeholder="Enter course description"
                  className="rounded-lg py-3 px-4 text-lg"
                  size="large"
                  rows={4}
                />
              </Form.Item>

              <Form.Item
                name="courseRelatedId"
                label={
                  <Text strong className="text-lg">
                    Related Course
                  </Text>
                }
                className="col-span-2"
              >
                <Select
                  placeholder="Select a related course"
                  loading={loadingCourses}
                  className="rounded-lg"
                  size="large"
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  notFoundContent={
                    loadingCourses ? (
                      <div className="text-center py-4">
                        <Spin size="small" />
                        <div className="mt-2">Loading courses...</div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <div>No courses found</div>
                      </div>
                    )
                  }
                >
                  {courses.map((course) => (
                    <Option key={course.courseId} value={course.courseId}>
                      {course.courseName} ({course.courseId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Divider className="my-8 border-gray-200" />

            <div className="flex justify-end space-x-6 mt-8">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCourseData}
                className="rounded-lg border-gray-300 hover:border-gray-400 hover:text-gray-700 px-6 py-3 h-auto text-base flex items-center"
                size="large"
              >
                Reset Changes
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="bg-gray-700 hover:bg-gray-800 rounded-lg border-0 px-8 py-3 h-auto text-base flex items-center shadow-md"
                size="large"
              >
                {loading ? "Updating..." : "Update Course"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default EditCoursePage;
