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

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditSchedule = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialSchedule = location.state?.scheduleData;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [courseSubjectSpecialties, setCourseSubjectSpecialties] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // Fetch additional data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Nếu không có initialSchedule, fetch từ API
        let scheduleData = initialSchedule;
        if (!scheduleData) {
          const response = await trainingScheduleService.getTrainingScheduleById(id);
          scheduleData = response;
        }

        // Fetch instructors và course subject specialties
        const [instructorsRes, courseSubjectSpecialtiesRes] = await Promise.all([
          axiosInstance.get(API.GET_ALL_USER, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            params: { roleName: "Instructor" },
          }),
          learningMatrixService.getAllCourseSubjectSpecialties()
        ]);

        // Process instructors data giống như trong CreateSchedulePage
        if (instructorsRes.data && instructorsRes.data.users) {
          const instructorData = instructorsRes.data.users.filter(
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
        } else if (instructorsRes.data && Array.isArray(instructorsRes.data)) {
          const filteredInstructors = instructorsRes.data.filter(
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
          console.warn("Unexpected instructor data format:", instructorsRes.data);
          setInstructors([]);
        }

        // Process course subject specialties data
        if (courseSubjectSpecialtiesRes && courseSubjectSpecialtiesRes.data) {
          setCourseSubjectSpecialties(courseSubjectSpecialtiesRes.data);
        }

        // Set form values từ scheduleData
        if (scheduleData) {
          // Convert daysOfWeek string thành mảng số
          const daysOfWeek = scheduleData.daysOfWeek
            .split(",")
            .map(day => {
              const dayNumber = {
                "Sunday": 0,
                "Monday": 1,
                "Tuesday": 2,
                "Wednesday": 3,
                "Thursday": 4,
                "Friday": 5,
                "Saturday": 6
              }[day.trim()];
              return dayNumber;
            })
            .filter(day => day !== undefined);

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
            endDateTime: dayjs(scheduleData.endDateTime)
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Unable to load schedule data");
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

      // Format daysOfWeek thành mảng số nguyên
      const daysOfWeekNumbers = values.daysOfWeek.map(day => parseInt(day));

      const formattedData = {
        scheduleID: id,
        courseSubjectSpecialtyId: values.courseSubjectSpecialtyId,
        instructorID: values.instructorID,
        location: values.location,
        room: values.room,
        notes: values.notes || "",
        daysOfWeek: daysOfWeekNumbers,
        classTime: values.classTime.format("HH:mm:ss"),
        subjectPeriod: values.subjectPeriod.format("HH:mm:ss"),
        startDay: values.startDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
        endDay: values.endDateTime.format("YYYY-MM-DDTHH:mm:ss.SSS"),
        status: initialSchedule?.status || "Pending"
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
          const fieldName = field.replace('$.', ''); // Loại bỏ tiền tố '$.' nếu có
          const errorMessage = Array.isArray(messages) ? messages[0] : messages;
          
          message.error(`${fieldName}: ${errorMessage}`);
          
          // Set lỗi trực tiếp vào form field nếu có
          if (field !== 'dto') {
            form.setFields([{
              name: fieldName,
              errors: [errorMessage]
            }]);
          }
        });
      } else {
        message.error("Failed to update schedule: " + (error.response?.data?.title || error.message));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Cập nhật options cho daysOfWeek để sử dụng số thay vì chuỗi
  const daysOfWeekOptions = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 0 }
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
              <h1 className="text-2xl font-bold text-gray-800">Edit Schedule</h1>
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
                    <p><strong>Subject:</strong> {initialSchedule?.subjectName}</p>
                    <p><strong>Current Instructor:</strong> {initialSchedule?.instructorName}</p>
                    <p><strong>Status:</strong> {initialSchedule?.status}</p>
                  </div>
                </Col>
              </Row>

              {/* Editable Fields */}
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="courseSubjectSpecialtyId"
                    label="Course Subject Specialty"
                    rules={[{ required: true, message: "Please select a course subject specialty" }]}
                  >
                    <Select
                      placeholder="Select course subject specialty"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {courseSubjectSpecialties.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.course?.courseName || item.courseId} / {item.subject?.subjectName || item.subjectId} / {item.specialty?.specialtyId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="instructorID"
                    label="Instructor"
                    rules={[{ required: true, message: "Please select an instructor" }]}
                  >
                    <Select
                      placeholder="Select instructor"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {instructors.map((instructor) => (
                        <Option key={instructor.id} value={instructor.id}>
                          {instructor.name} {instructor.specialtyId ? `(${instructor.specialtyId})` : ""}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="room"
                    label="Room"
                    rules={[{ required: true }]}
                  >
                    <Input />
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
                    <TimePicker format="HH:mm" className="w-full" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="subjectPeriod"
                    label="Duration"
                    rules={[{ required: true }]}
                  >
                    <TimePicker format="HH:mm" className="w-full" />
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
                          if (value.isBefore(dayjs(), 'day')) {
                            return Promise.reject('Start date cannot be in the past');
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
                          const startDate = getFieldValue('startDateTime');
                          if (startDate && value.isBefore(startDate)) {
                            return Promise.reject('End date must be after start date');
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
                      // Kiểm tra xem tất cả các giá trị có phải là số không
                      const allNumbers = value.every(v => !isNaN(parseInt(v)));
                      if (!allNumbers) {
                        return Promise.reject("Days of week must be numbers");
                      }
                      return Promise.resolve();
                    }
                  }
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
