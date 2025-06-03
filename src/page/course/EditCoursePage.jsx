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
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { courseService } from "../../services/courseService";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const disabledDate = (current) => {
  return current && current < dayjs().startOf("day");
};

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
          startDate: response.data.startDate
            ? dayjs(response.data.startDate)
            : null,
          endDate: response.data.endDate ? dayjs(response.data.endDate) : null,
        });
      } else {
        message.error(response?.message || "Failed to load course data");
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load course data"
      );
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
      message.error("Failed to load courses for dropdown");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleUpdateCourse = async (values) => {
    try {
      setLoading(true);
      const formattedData = {
        description: values.description?.trim() || null,
        courseName: values.courseName?.trim(),
        courseRelatedId: values.courseRelatedId || null,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.endDate ? values.endDate.toISOString() : null,
      };

      if (
        formattedData.startDate &&
        formattedData.endDate &&
        dayjs(formattedData.startDate).isAfter(dayjs(formattedData.endDate))
      ) {
        message.error("End Date must be after Start Date.");
        setLoading(false);
        return;
      }

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
        className="!max-w-5xl !mx-auto !rounded-xl !border !border-cyan-600 !shadow-lg"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="!text-cyan-800 !m-0">
              Edit Course: {id}
            </Title>
            <Button
              size="middle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/all-courses")}
              className="!text-cyan-700 hover:!text-cyan-900 border border-cyan-300 hover:!border-cyan-400"
            >
              Back to Courses
            </Button>
          </div>
        }
        bodyStyle={{ padding: "24px" }}
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

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="startDate"
                  label={
                    <Text strong className="!text-cyan-700">
                      Start Date
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Start date is required" },
                  ]}
                >
                  <DatePicker
                    className="w-full rounded-lg py-3 px-4 text-base"
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="endDate"
                  label={
                    <Text strong className="!text-cyan-700">
                      End Date
                    </Text>
                  }
                  rules={[
                    { required: true, message: "End date is required" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || !getFieldValue("startDate")) {
                          return Promise.resolve();
                        }
                        if (
                          dayjs(value).isBefore(
                            dayjs(getFieldValue("startDate"))
                          )
                        ) {
                          return Promise.reject(
                            new Error(
                              "End Date must be on or after Start Date!"
                            )
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    className="w-full rounded-lg py-3 px-4 text-base"
                    format="YYYY-MM-DD"
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="courseRelatedId"
              label={
                <Text strong className="!text-cyan-700">
                  Related Course (Optional)
                </Text>
              }
            >
              <Select
                placeholder="Select a related course"
                loading={loadingCourses}
                showSearch
                allowClear
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()) ||
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                className="rounded-lg"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                notFoundContent={
                  loadingCourses ? (
                    <div className="text-center py-4">
                      <Spin size="small" />
                      <div className="mt-2">Loading...</div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      No other courses found
                    </div>
                  )
                }
              >
                {courses.map((courseItem) => (
                  <Option
                    key={courseItem.courseId}
                    value={courseItem.courseId}
                    label={courseItem.courseName}
                  >
                    {courseItem.courseName} ({courseItem.courseId})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider className="!border-cyan-200" />

            <div className="flex justify-end gap-4 mt-6">
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchCourseData}
                disabled={loading || loadingCourse}
                className="!rounded-lg !border-cyan-400 hover:!border-cyan-600 !text-cyan-700 hover:!text-cyan-900 !px-6 !py-2"
              >
                Reset Form
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
