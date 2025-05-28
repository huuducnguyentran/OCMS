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
import { getAllClassSubjects } from "../../services/classSubjectService";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);

  // Fetch subjects and instructors when component mounts
  useEffect(() => {
    fetchInstructors();
    fetchClassSubjects();
  }, []);

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

  // Fetch ClassSubject list
  const fetchClassSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllClassSubjects();
      console.log("ClassSubject API response:", response);

      // Kiểm tra đúng kiểu dữ liệu trả về từ service
      if (Array.isArray(response) && response.length > 0) {
        setClassSubjects(response);
      } else {
        console.warn("Class subjects data is empty or invalid format");
        setClassSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching ClassSubject list:", error);
      message.error("Unable to load ClassSubject list");
      setClassSubjects([]);
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
        classSubjectId: values.classSubjectId,
        instructorID: values.instructorID,
        location: values.location,
        room: values.room,
        notes: values.notes || "",
        startDay: `${startDate}T${classTime}`,
        endDay: `${endDate}T${classTime}`,
        daysOfWeek: daysOfWeek,
        classTime: classTime,
        subjectPeriod: subjectPeriod,
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 sm:p-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-cyan-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-500 rounded-xl shadow-md hover:scale-105 transition-transform duration-300">
              <CalendarOutlined className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-cyan-700">
                Create New Schedule
              </h2>
              <p className="text-gray-600">
                Add a new training schedule to the system
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <Card className="!bg-cyan-50 !rounded-2xl !border !border-cyan-400 !shadow-xl">
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
                  <Title level={4} className="!mb-4 !text-cyan-700">
                    General Information
                  </Title>

                  <Form.Item
                    name="classSubjectId"
                    label="Class Subject"
                    rules={[
                      {
                        required: true,
                        message: "Please select a classSubjectId",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select classSubjectId"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {classSubjects.map((item) => (
                        <Option
                          key={item.classSubjectId}
                          value={item.classSubjectId}
                        >
                          {item.className || item.classId} /{" "}
                          {item.subjectName || item.subjectId}
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
                  <Title level={4} className="!mb-4 !text-cyan-700">
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
                              if (value.isBefore(dayjs())) {
                                return Promise.reject(
                                  new Error("Start date must be in the future")
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          className="w-full rounded-md"
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
                              const startDate = getFieldValue("startDate");
                              if (!value) return Promise.resolve();
                              if (startDate && value.isBefore(startDate)) {
                                return Promise.reject(
                                  new Error("End date must be after start date")
                                );
                              }
                              const diffDays = value.diff(startDate, "days");
                              if (diffDays < 1 || diffDays > 365) {
                                return Promise.reject(
                                  new Error(
                                    "Training plan must be 1–365 days long"
                                  )
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          className="w-full rounded-md"
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
                            message: "Please select class time",
                          },
                        ]}
                      >
                        <TimePicker className="w-full" format="HH:mm" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item name="subjectPeriod" label="Duration">
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          minuteStep={15}
                          placeholder="Select duration"
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
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end mt-6 gap-4">
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => navigate("/schedule")}
                  size="large"
                  className="hover:!border-cyan-600 hover:!text-cyan-900"
                >
                  Back
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="!bg-cyan-600 hover:!bg-cyan-700 !border-none"
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
