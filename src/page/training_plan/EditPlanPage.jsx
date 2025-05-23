import { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  DatePicker,
  message,
  Select,
  Spin,
  Card,
  Typography,
  Divider,
  Form,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { trainingPlanService } from "../../services/trainingPlanService";
import { applyTrainingPlanValidation } from "../../../utils/validationSchemas";
import axiosInstance from "../../../utils/axiosInstance";
import { courseService } from "../../services/courseService";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const EditPlanPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch specialties data
  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await axiosInstance.get("Specialty");
      if (response.data.success && response.data.data) {
        setSpecialties(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch specialties:", error);
      message.error("Failed to load specialties");
    } finally {
      setLoadingSpecialties(false);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await courseService.getAllCourses();
        if (response?.data) {
          setCourses(response.data);
        } else {
          setCourses([]);
          message.warning("No courses found. Please create a course first.");
        }
      } catch (error) {
        message.error("Failed to load courses", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        const response = await trainingPlanService.getTrainingPlanById(planId);

        console.log("Fetched training plan response:", response);

        const data = response.plan; // FIXED: access the correct nested object

        form.setFieldsValue({
          planName: data.planName,
          description: data.description,
          courseId: data.courseId,
          startDate: dayjs(data.startDate),
          endDate: dayjs(data.endDate),
          specialtyId: data.specialtyId,
        });
      } catch (error) {
        console.error("Error fetching plan:", error);
        message.error("Failed to load plan data");
        navigate("/plan");
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      console.log("Fetching plan for ID:", planId);
      fetchPlanData();
    }
  }, [planId, form]);

  const disablePastDates = (current) => {
    const today = dayjs().startOf("day");
    return current && current.isBefore(today);
  };

  const handleUpdatePlan = async (values) => {
    try {
      // Validate using Yup schema before submission
      await applyTrainingPlanValidation(values);

      setLoading(true);
      const formattedData = {
        planName: values.planName.trim(),
        description: values.description.trim(),
        courseId: values.courseId,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        specialtyId: values.specialtyId,
      };

      await trainingPlanService.updateTrainingPlan(planId, formattedData);
      message.success("Training plan updated successfully");
      navigate("/plan", { state: { refresh: true } });
    } catch (error) {
      if (error.name === "ValidationError") {
        message.error(`Validation error: ${error.message}`);
      } else {
        console.error("Error details:", error.response?.data || error);
        message.error(
          `Failed to update Training Plan: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const renderSpecialtyOptions = (specialties) => {
    return specialties.map((specialty) => {
      if (specialty.children && specialty.children.length > 0) {
        return (
          <Select.OptGroup
            key={specialty.specialtyId}
            label={specialty.specialtyName}
          >
            <Option key={specialty.specialtyId} value={specialty.specialtyId}>
              {specialty.specialtyName} ({specialty.specialtyId})
            </Option>
            {renderSpecialtyOptions(specialty.children)}
          </Select.OptGroup>
        );
      }
      return (
        <Option key={specialty.specialtyId} value={specialty.specialtyId}>
          {specialty.specialtyName} ({specialty.specialtyId})
        </Option>
      );
    });
  };

  const renderCourseOptions = (courses) => {
    return courses.map((course) => {
      if (course.children && course.children.length > 0) {
        return (
          <Select.OptGroup key={course.courseId} label={course.courseName}>
            <Option key={course.courseId} value={course.courseId}>
              {course.courseName} ({course.courseId})
            </Option>
            {renderCourseOptions(course.children)}
          </Select.OptGroup>
        );
      }
      return (
        <Option key={course.courseId} value={course.courseId}>
          {course.courseName} ({course.courseId})
        </Option>
      );
    });
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <Card
        className="max-w-6xl mx-auto shadow-lg rounded-xl overflow-hidden"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="m-0 text-blue-700">
              Edit Training Plan
            </Title>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/plan")}
              className="flex items-center"
            >
              Back to Plans
            </Button>
          </div>
        }
      >
        <Spin spinning={loading || loadingSpecialties}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdatePlan}
            className="p-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Form.Item
                name="planName"
                label={<Text strong>Plan Name</Text>}
                rules={[
                  { required: true, message: "Plan name is required" },
                  {
                    max: 100,
                    message: "Plan name must not exceed 100 characters",
                  },
                ]}
                className="col-span-2"
              >
                <Input
                  placeholder="Enter plan name"
                  value="planName"
                  className="rounded-lg py-2 px-3 text-base"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<Text strong>Description</Text>}
                rules={[
                  { required: true, message: "Description is required" },
                  {
                    max: 100,
                    message: "Description must not exceed 100 characters",
                  },
                ]}
                className="col-span-2"
              >
                <TextArea
                  rows={5}
                  placeholder="Enter description"
                  className="rounded-lg py-2 px-3 text-base"
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="courseId"
                label={<Text strong>Course</Text>}
                rules={[{ required: true, message: "course Id is required" }]}
              >
                <Select
                  placeholder="Select course"
                  loading={loadingCourses}
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                  dropdownClassName="rounded-lg shadow-md"
                  notFoundContent={
                    loadingCourses ? (
                      <Spin size="small" />
                    ) : (
                      "No specialties found"
                    )
                  }
                >
                  {renderCourseOptions(courses)}
                </Select>
              </Form.Item>

              <Form.Item
                name="specialtyId"
                label={<Text strong>Specialty</Text>}
                rules={[{ required: true, message: "Specialty is required" }]}
              >
                <Select
                  placeholder="Select specialty"
                  loading={loadingSpecialties}
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                  dropdownClassName="rounded-lg shadow-md"
                  notFoundContent={
                    loadingSpecialties ? (
                      <Spin size="small" />
                    ) : (
                      "No specialties found"
                    )
                  }
                >
                  {renderSpecialtyOptions(specialties)}
                </Select>
              </Form.Item>

              <Form.Item
                name="startDate"
                label={<Text strong>Start Date</Text>}
                rules={[
                  { required: true, message: "Start date is required" },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const now = dayjs();
                      if (value.isBefore(now, "minute")) {
                        return Promise.reject(
                          new Error("Start date cannot be in the past")
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="w-full rounded-lg py-2 px-3 text-base"
                  showTime={{
                    format: "HH:mm",
                    minuteStep: 5,
                    showNow: true,
                  }}
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={disablePastDates}
                  disabledTime={(date) => {
                    if (date && date.isSame(dayjs(), "day")) {
                      return {
                        disabledHours: () => {
                          const hours = [];
                          for (let i = 0; i < dayjs().hour(); i++) {
                            hours.push(i);
                          }
                          return hours;
                        },
                        disabledMinutes: (selectedHour) => {
                          if (selectedHour === dayjs().hour()) {
                            const minutes = [];
                            for (let i = 0; i < dayjs().minute(); i++) {
                              minutes.push(i);
                            }
                            return minutes;
                          }
                          return [];
                        },
                      };
                    }
                    return {};
                  }}
                />
              </Form.Item>

              <Form.Item
                name="endDate"
                label={<Text strong>End Date</Text>}
                rules={[
                  { required: true, message: "End date is required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const startDate = getFieldValue("startDate");

                      if (
                        startDate &&
                        (value.isBefore(startDate) || value.isSame(startDate))
                      ) {
                        return Promise.reject(
                          new Error("End date must be after start date")
                        );
                      }

                      if (startDate) {
                        const diffDays = value.diff(startDate, "days");
                        if (diffDays < 1 || diffDays > 365) {
                          return Promise.reject(
                            new Error(
                              "Training plan duration should be between 1 day and 365 days"
                            )
                          );
                        }
                      }

                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="w-full rounded-lg py-2 px-3 text-base"
                  showTime={{
                    format: "HH:mm",
                    minuteStep: 5,
                    showNow: true,
                  }}
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue("startDate");
                    return (
                      disablePastDates(current) ||
                      (startDate &&
                        (current.isBefore(startDate) ||
                          current.isSame(startDate, "day")))
                    );
                  }}
                />
              </Form.Item>
            </div>

            <Divider />

            <div className="flex justify-end space-x-4 mt-6">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => form.resetFields()}
                className="rounded-lg border-gray-300 hover:border-gray-400 hover:text-gray-700"
              >
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="bg-green-500 hover:bg-green-600 rounded-lg border-0 px-6 py-2 h-auto"
              >
                {loading ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default EditPlanPage;
