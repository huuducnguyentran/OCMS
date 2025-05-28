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
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    fetchCourseData();
    fetchCourses();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoadingCourse(true);
      const response = await courseService.getCourseById(id);
      if (response?.success && response.data) {
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

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getAllCourses();
      const filteredCourses = response?.data?.filter(
        (course) => course.courseId !== id
      );
      setCourses(filteredCourses || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      message.error("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleUpdateCourse = async (values) => {
    try {
      setLoading(true);
      const formattedData = {
        description: values.description?.trim() || "",
        courseName: values.courseName?.trim() || "",
        courseRelatedId: values.courseRelatedId || "",
      };
      await courseService.updateCourse(id, formattedData);
      message.success("Course updated successfully!");
      navigate("/all-courses", { state: { refresh: true } });
    } catch (error) {
      const errorData = error?.response?.data || {};
      message.error(
        errorData.message || errorData.error || "Failed to update course"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100 !p-6 !sm:p-8">
      <Card
        className="!min-w-5xl !mx-auto !rounded-xl !border !border-cyan-600 !shadow-lg"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="!text-cyan-800 !m-0">
              Edit Course
            </Title>
            <Button
              size="middle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/all-courses")}
              className="!text-cyan-700 hover:!text-cyan-900 border border-cyan-300 hover:!border-cyan-400"
            >
              Back
            </Button>
          </div>
        }
        bodyStyle={{ padding: 24 }}
      >
        <Spin spinning={loading || loadingCourse || loadingCourses}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateCourse}
            className="!space-y-6"
            size="large"
          >
            <Form.Item
              name="courseName"
              label={
                <Text strong className="!text-cyan-700">
                  Course Name
                </Text>
              }
              rules={[{ required: true, message: "Course name is required" }]}
            >
              <Input
                placeholder="Enter course name"
                className="rounded-lg py-3 px-4 text-base"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <Text strong className="!text-cyan-700">
                  Description
                </Text>
              }
              rules={[{ required: true, message: "Description is required" }]}
            >
              <Input.TextArea
                placeholder="Enter course description"
                rows={4}
                className="rounded-lg py-3 px-4 text-base"
              />
            </Form.Item>

            <Form.Item
              name="courseRelatedId"
              label={
                <Text strong className="!text-cyan-700">
                  Related Course
                </Text>
              }
            >
              <Select
                placeholder="Select a related course"
                loading={loadingCourses}
                showSearch
                allowClear
                optionFilterProp="children"
                className="rounded-lg"
                notFoundContent={
                  loadingCourses ? (
                    <div className="text-center py-4">
                      <Spin size="small" />
                      <div className="mt-2">Loading...</div>
                    </div>
                  ) : (
                    <div className="text-center py-4">No courses found</div>
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

            <Divider className="!border-cyan-200" />

            <div className="flex justify-end gap-4 mt-6">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCourseData}
                className="!rounded-lg !border-cyan-400 hover:!border-cyan-600 !text-cyan-700 hover:!text-cyan-900 !px-6 !py-2"
              >
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="!bg-cyan-600 hover:!bg-cyan-700 !border-none !text-white !rounded-lg !px-8 !py-2 !shadow-md"
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
