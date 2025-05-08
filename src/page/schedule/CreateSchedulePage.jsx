import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Card,
  message,
  Spin,
  TimePicker,
  Checkbox,
  Row,
  Col,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";
import dayjs from "dayjs";
import { learningMatrixService } from "../../services/learningMatrixService";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [courseSubjectSpecialties, setCourseSubjectSpecialties] = useState([]);

  // Fetch subjects and instructors when component mounts
  useEffect(() => {
    fetchInstructors();
    fetchCourseSubjectSpecialties();
  }, []);

  // Fetch subjects from API
  // Fetch instructors from API
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axiosInstance.get(API.GET_ALL_USER, {
        headers: { Authorization: `Bearer ${token}` },
        params: { roleName: "Instructor" },
      });

      console.log("Instructor API response:", response.data);

      if (response.data && response.data.users) {
        const instructorData = response.data.users.filter(
          (user) => user.roleName === "Instructor"
        );
        setInstructors(
          instructorData.map((instructor) => ({
            id: instructor.userId || instructor.id,
            name: instructor.fullName || instructor.name || instructor.userName,
            roleName: instructor.roleName,
            specialtyId: instructor.specialtyId,
          }))
        );
      } else if (response.data && Array.isArray(response.data)) {
        const filteredInstructors = response.data.filter(
          (user) => user.roleName === "Instructor"
        );
        setInstructors(
          filteredInstructors.map((instructor) => ({
            id: instructor.userId || instructor.id,
            name: instructor.fullName || instructor.name || instructor.userName,
            roleName: instructor.roleName,
            specialtyId: instructor.specialtyId,
          }))
        );
      } else {
        console.warn("Unexpected instructor data format:", response.data);
        setInstructors([]);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      message.error("Unable to load instructor list");
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch CourseSubjectSpecialtyId list
  const fetchCourseSubjectSpecialties = async () => {
    try {
      setLoading(true);
      const response = await learningMatrixService.getAllCourseSubjectSpecialties();
      if (response && response.data) {
        setCourseSubjectSpecialties(response.data);
      } else {
        setCourseSubjectSpecialties([]);
      }
    } catch (error) {
      console.error("Error fetching CourseSubjectSpecialty list:", error);
      message.error("Unable to load Course-Subject-Specialty list");
      setCourseSubjectSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      // Format dates to ISO string
      const startDate = values.startDate.format("YYYY-MM-DD");
      const endDate = values.endDate.format("YYYY-MM-DD");

      // Format time to string
      const classTime = values.classTime.format("HH:mm:ss");

      // Format subjectPeriod để lưu chính xác thời gian học
      const subjectPeriod = values.subjectPeriod
        ? values.subjectPeriod.format("HH:mm:ss")
        : "01:30:00"; // Mặc định 1 tiếng 30 phút

      // Convert daysOfWeek to array of integers
      const daysOfWeek = values.daysOfWeek.map((day) => parseInt(day));

      // Create data according to API format
      const scheduleData = {
        subjectID: values.subjectID,
        courseSubjectSpecialtyId: values.courseSubjectSpecialtyId,
        instructorID: values.instructorID,
        location: values.location,
        room: values.room,
        notes: values.notes || "",
        startDay: `${startDate}T${classTime}`,
        endDay: `${endDate}T${classTime}`,
        daysOfWeek: daysOfWeek,
        classTime: classTime,
        subjectPeriod: subjectPeriod,
        createdBy: sessionStorage.getItem("userId"), // Add creator information
      };

      console.log("Submitting schedule data:", scheduleData);

      // Call API to create schedule
      const response = await axiosInstance.post(
        API.CREATE_TRAINING_SCHEDULE,
        scheduleData
      );

      if (response.data) {
        message.success("Schedule created successfully!");
        // Navigate to "created" view in SchedulePage
        navigate("/schedule", { state: { viewMode: "created" } });
      }
    } catch (error) {
      console.error("Error creating schedule:", error);

      if (error.response?.data?.message) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error("Unable to create schedule. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const daysOfWeekOptions = [
    { label: "Monday", value: "1" },
    { label: "Tuesday", value: "2" },
    { label: "Wednesday", value: "3" },
    { label: "Thursday", value: "4" },
    { label: "Friday", value: "5" },
    { label: "Saturday", value: "6" },
    { label: "Sunday", value: "0" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-indigo-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
              <CalendarOutlined className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Create New Schedule
              </h2>
              <p className="text-gray-600">
                Add a new training schedule to the system
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <Card className="shadow-xl rounded-2xl">
          <Spin spinning={loading || submitting}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                startDate: dayjs(),
                endDate: dayjs().add(30, "day"),
                classTime: dayjs("08:00:00", "HH:mm:ss"),
                subjectPeriod: dayjs("01:30:00", "HH:mm:ss"),
                daysOfWeek: ["0", "2", "4"],
              }}
            >
              <Row gutter={24}>
                {/* Column 1 */}
                <Col xs={24} md={12}>
                  <Title level={4} className="mb-4">
                    General Information
                  </Title>

                  <Form.Item
                    name="courseSubjectSpecialtyId"
                    label="CourseSubjectSpecialtyId"
                    rules={[
                      { required: true, message: "Please select a courseSubjectSpecialtyId" },
                    ]}
                  >
                    <Select
                      placeholder="Select courseSubjectSpecialtyId"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {courseSubjectSpecialties.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.course?.courseName || item.courseId} / {item.subject?.subjectName || item.subjectId} / {item.specialty?.specialtyName || item.specialtyId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="instructorID"
                    label="Instructor"
                    rules={[
                      {
                        required: true,
                        message: "Please select an instructor",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select instructor"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {instructors.map((instructor) => (
                        <Option key={instructor.id} value={instructor.id}>
                          {instructor.name}{" "}
                          {instructor.specialtyId
                            ? `(${instructor.specialtyId})`
                            : ""}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="location"
                        label="Location"
                        rules={[
                          {
                            required: true,
                            message: "Please enter a location",
                          },
                        ]}
                      >
                        <Input placeholder="Example: ABC Campus" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="room"
                        label="Room"
                        rules={[
                          { required: true, message: "Please enter a room" },
                        ]}
                      >
                        <Input placeholder="Example: 101" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="notes" label="Notes">
                    <TextArea rows={3} placeholder="Notes about the schedule" />
                  </Form.Item>
                </Col>

                {/* Column 2 */}
                <Col xs={24} md={12}>
                  <Title level={4} className="mb-4">
                    Class Schedule
                  </Title>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="startDate"
                        label={<Text strong>Start Date</Text>}
                        rules={[
                          { required: true, message: "Start date is required" },
                          () => ({
                            validator(_, value) {
                              if (!value) return Promise.resolve();
                              const now = new Date();
                              if (value.isBefore(dayjs(now))) {
                                return Promise.reject(
                                  new Error(
                                    "Start date and time must be in the future"
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          className="w-full rounded-lg py-2 px-3 text-base"
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          disabledDate={(current) =>
                            current && current < dayjs().startOf("day")
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="endDate"
                        label={<Text strong>End Date</Text>}
                        rules={[
                          { required: true, message: "End date is required" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value) return Promise.resolve();

                              // Check if end date is after start date
                              const startDate = getFieldValue("startDate");
                              if (startDate && value.isBefore(startDate)) {
                                return Promise.reject(
                                  new Error("End date must be after start date")
                                );
                              }

                              // Check duration is reasonable
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
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          disabledDate={(current) => {
                            const startDate = form.getFieldValue("startDate");
                            return (
                              current &&
                              (current < dayjs().startOf("day") ||
                                (startDate && current < startDate))
                            );
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="classTime"
                        label="Class Time"
                        rules={[
                          {
                            required: true,
                            message: "Please select a class time",
                          },
                        ]}
                      >
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          placeholder="Select class time"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="subjectPeriod" label="Duration">
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          placeholder="Select duration"
                          showNow={false}
                          minuteStep={15} // Cho phép chọn thời gian theo bước 15 phút
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="daysOfWeek"
                    label="Days of Week"
                    rules={[
                      {
                        required: true,
                        message: "Please select at least one day",
                      },
                    ]}
                  >
                    <Checkbox.Group
                      options={daysOfWeekOptions}
                      className="grid grid-cols-2 sm:grid-cols-4"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end mt-6 gap-4">
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => navigate("/schedule")}
                  size="large"
                >
                  Back
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="bg-blue-600"
                >
                  Create Schedule
                </Button>
              </div>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default CreateSchedulePage;
