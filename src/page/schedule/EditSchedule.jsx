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
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  SaveOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";
import dayjs from "dayjs";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Enums for Location and Room
const LocationEnum = {
  SectionA: 0,
  SectionB: 1,
};

const RoomEnum = {
  R001: 0, R002: 1, R003: 2, R004: 3, R005: 4, R006: 5, R007: 6, R008: 7, R009: 8,
  R101: 9, R102: 10, R103: 11, R104: 12, R105: 13, R106: 14, R107: 15, R108: 16, R109: 17,
  R201: 18, R202: 19, R203: 20, R204: 21, R205: 22, R206: 23, R207: 24, R208: 25, R209: 26,
  R301: 27, R302: 28, R303: 29, R304: 30, R305: 31, R306: 32, R307: 33, R308: 34, R309: 35,
  R401: 36, R402: 37, R403: 38, R404: 39, R405: 40, R406: 41, R407: 42, R408: 43, R409: 44,
  R501: 45, R502: 46, R503: 47, R504: 48, R505: 49, R506: 50, R507: 51, R508: 52, R509: 53,
};

const getLocationName = (value) => Object.keys(LocationEnum).find(key => LocationEnum[key] === value);
const getRoomName = (value) => Object.keys(RoomEnum).find(key => RoomEnum[key] === value);

const EditSchedule = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialSchedule = location.state?.scheduleData;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [instructors, setInstructors] = useState([]);

  // Fetch additional data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Nếu không có initialSchedule, fetch từ API
        let scheduleData = initialSchedule;
        if (!scheduleData) {
          const response =
            await trainingScheduleService.getTrainingScheduleById(id);
          scheduleData = response;
        }

        // Fetch instructors và course subject specialties
        const [instructorsRes] = await Promise.all([
          axiosInstance.get(API.GET_ALL_USER, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            params: { roleName: "Instructor" },
          })
        ]);

        // Process instructors data giống như trong CreateSchedulePage
        if (instructorsRes.data && instructorsRes.data.users) {
          const instructorData = instructorsRes.data.users.filter(
            (user) => user.roleName === "Instructor"
          );
          setInstructors(
            instructorData.map((instructor) => ({
              id: instructor.userId || instructor.id,
              name:
                instructor.fullName || instructor.name || instructor.userName,
              roleName: instructor.roleName,
              specialtyId: instructor.specialtyId,
            }))
          );
        } else if (instructorsRes.data && Array.isArray(instructorsRes.data)) {
          const filteredInstructors = instructorsRes.data.filter(
            (user) => user.roleName === "Instructor"
          );
          setInstructors(
            filteredInstructors.map((instructor) => ({
              id: instructor.userId || instructor.id,
              name:
                instructor.fullName || instructor.name || instructor.userName,
              roleName: instructor.roleName,
              specialtyId: instructor.specialtyId,
            }))
          );
        } else {
          console.warn(
            "Unexpected instructor data format:",
            instructorsRes.data
          );
          setInstructors([]);
        }

        // Set form values từ scheduleData
        if (scheduleData) {
          // Convert daysOfWeek string thành mảng số
          const daysOfWeek = scheduleData.daysOfWeek
            .split(",")
            .map((day) => {
              const dayNumber = {
                Sunday: 0,
                Monday: 1,
                Tuesday: 2,
                Wednesday: 3,
                Thursday: 4,
                Friday: 5,
                Saturday: 6,
              }[day.trim()];
              return dayNumber;
            })
            .filter((day) => day !== undefined);

          form.setFieldsValue({
            courseSubjectSpecialtyId: scheduleData.courseSubjectSpecialtyId,
            instructorID: scheduleData.instructorID,
            location: scheduleData.location,
            room: scheduleData.room,
            notes: scheduleData.notes,
            daysOfWeek: daysOfWeek, // Sử dụng mảng số
            classTime: dayjs(scheduleData.classTime, "HH:mm:ss"),
            subjectPeriod: dayjs(scheduleData.subjectPeriod, "HH:mm:ss"),
            startDateTime: dayjs(scheduleData.startDateTime),
            endDateTime: dayjs(scheduleData.endDateTime),
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error(
          "Unable to load schedule data: " + 
          (error.response?.data?.message || error.message || "Unknown error")
        );
        // Fallback data for instructors in case of error
        setInstructors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, form, initialSchedule]);

  const onFinish = async (values) => {
    try {
      setSubmitting(true);

      const formattedData = {
        classSubjectId: initialSchedule?.classSubjectId,
        location: values.location,
        room: values.room,
        notes: values.notes || "",
        daysOfWeek: values.daysOfWeek,
        classTime: values.classTime.format("HH:mm:ss"),
        subjectPeriod: values.subjectPeriod.format("HH:mm:ss"),
        startDay: values.startDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
        endDay: values.endDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
      };

      const response = await axiosInstance.put(
        `${API.UPDATE_TRAINING_SCHEDULE}/${id}`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        message.success("Schedule updated successfully");
        navigate("/schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);

      // Xử lý và hiển thị lỗi validation
      if (error.response?.data?.errors) {
        const errorData = error.response.data.errors;

        // Hiển thị lỗi cụ thể cho từng trường
        Object.entries(errorData).forEach(([field, messages]) => {
          const fieldName = field.replace("$.", ""); // Loại bỏ tiền tố '$.' nếu có
          const errorMessage = Array.isArray(messages) ? messages[0] : messages;

          message.error(`${fieldName}: ${errorMessage}`);

          // Set lỗi trực tiếp vào form field nếu có
          if (field !== "dto") {
            form.setFields([
              {
                name: fieldName,
                errors: [errorMessage],
              },
            ]);
          }
        });
      } else {
        message.error(
          "Failed to update schedule: " +
            (error.response?.data?.title || error.message)
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getDisabledHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < 7 || i > 20) {
        hours.push(i);
      }
    }
    return hours;
  };

  const getDisabledMinutes = (selectedHour) => {
    if (selectedHour === null || selectedHour === undefined) return [];
    const minutes = [];
    for (let i = 1; i < 60; i++) {
      minutes.push(i);
    }
    return minutes;
  };
  
  const getDisabledSeconds = (selectedHour, selectedMinute) => {
     if (selectedHour === null || selectedMinute === null) return [];
     const seconds = [];
     for (let i = 1; i < 60; i++) {
       seconds.push(i);
     }
     return seconds;
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  const daysOfWeekOptions = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600 rounded-lg">
              <CalendarOutlined className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Edit Schedule
              </h1>
              <p className="text-gray-600">
                {initialSchedule?.subjectName || "Update schedule information"}
              </p>
            </div>
          </div>

          <Spin spinning={loading || submitting}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                startDateTime: dayjs(),
                endDateTime: dayjs().add(30, "day"),
                classTime: dayjs("08:00:00", "HH:mm:ss"),
                subjectPeriod: dayjs("01:30:00", "HH:mm:ss"),
                daysOfWeek: [0, 2, 4], // Default days
              }}
            >
              {/* Subject Information - Readonly */}
              <Row gutter={16} className="mb-6">
                <Col span={24}>
                  <Title level={5}>Subject Information</Title>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p>
                      <strong>Subject:</strong> {initialSchedule?.subjectName}
                    </p>
                    <p>
                      <strong>Current Instructor:</strong>{" "}
                      {initialSchedule?.instructorName}
                    </p>
                    <p>
                      <strong>Status:</strong> {initialSchedule?.status}
                    </p>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select">
                      {Object.entries(LocationEnum).map(([n,v]) => (
                        <Option key={v} value={v}>{n}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="room"
                    label="Room"
                    rules={[{ required: true }]}
                  >
                    <Select placeholder="Select">
                      {Object.entries(RoomEnum).map(([n,v]) => (
                        <Option key={v} value={v}>{n}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="classTime"
                    label="Class Time"
                    rules={[{ required: true }]}
                  >
                    <TimePicker 
                      format="HH:00" 
                      className="w-full"
                      showNow={false}
                      disabledHours={getDisabledHours}
                      disabledMinutes={getDisabledMinutes}
                      disabledSeconds={getDisabledSeconds}
                      hideDisabledOptions
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="subjectPeriod"
                    label="Duration"
                    rules={[{ required: true }]}
                  >
                    <TimePicker 
                      format="HH:mm" 
                      className="w-full" 
                      placeholder="HH:mm (e.g. 01:30)" 
                      showNow={false} 
                      minuteStep={15}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDateTime"
                    label="Start Date"
                    rules={[
                      { required: true, message: "Start date is required" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();
                          if (value.isBefore(dayjs(), "day")) {
                            return Promise.reject(
                              "Start date cannot be in the past"
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      className="w-full"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endDateTime"
                    label="End Date"
                    rules={[
                      { required: true, message: "End date is required" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value) return Promise.resolve();
                          const startDate = getFieldValue("startDateTime");
                          if (startDate && value.isBefore(startDate)) {
                            return Promise.reject(
                              "End date must be after start date"
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      className="w-full"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="daysOfWeek"
                label="Days of Week"
                rules={[
                  { required: true, message: "Please select at least one day" },
                  {
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject("Please select at least one day");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Checkbox.Group
                  options={daysOfWeekOptions}
                  className="grid grid-cols-2 sm:grid-cols-4"
                />
              </Form.Item>

              <Form.Item name="notes" label="Notes">
                <TextArea rows={4} />
              </Form.Item>

              <div className="flex justify-end gap-4">
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => navigate("/schedule")}
                >
                  Back
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Update Schedule
                </Button>
              </div>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default EditSchedule;
