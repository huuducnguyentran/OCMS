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

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classSubjects, setClassSubjects] = useState([]);

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  const fetchClassSubjects = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await axiosInstance.get(API.GET_ALL_CLASS_SUBJECT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        setClassSubjects(response.data);
      } else if (response.data && Array.isArray(response.data.classSubjects)) {
        setClassSubjects(response.data.classSubjects);
      } else {
        setClassSubjects([]);
      }
    } catch (error) {
      message.error("Unable to load class subjects");
      setClassSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const recurringDayOptions = [
    { label: "Monday - Thursday", value: "1-4", days: [1, 4] },
    { label: "Tuesday - Friday", value: "2-5", days: [2, 5] },
    { label: "Wednesday - Saturday", value: "3-6", days: [3, 6] },
    { label: "Sunday", value: "0", days: [0] },
  ];

  const getRecurringDayValueFromDays = (daysArr) => {
    if (!Array.isArray(daysArr)) return daysArr;
    const found = recurringDayOptions.find(opt =>
      Array.isArray(opt.days) &&
      opt.days.length === daysArr.length &&
      opt.days.every((d, i) => d === daysArr[i])
    );
    return found ? found.value : daysArr.join('-');
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
  const getDisabledMinutesForHalfHour = () => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      if (i !== 0 && i !== 30) arr.push(i);
    }
    return arr;
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      // Validate daysOfWeek
      let daysOfWeekArr = [];
      const opt = recurringDayOptions.find(o => o.value === values.daysOfWeek);
      if (opt) daysOfWeekArr = opt.days;
      else if (Array.isArray(values.daysOfWeek)) daysOfWeekArr = values.daysOfWeek;
      else if (typeof values.daysOfWeek === 'string') daysOfWeekArr = values.daysOfWeek.split('-').map(Number);
      // Format
      const scheduleData = {
        classSubjectId: values.classSubjectId,
        location: values.location,
        room: values.room,
        notes: values.notes || "",
        startDay: values.startDate?.toISOString(),
        endDay: values.endDate?.toISOString(),
        daysOfWeek: daysOfWeekArr,
        classTime: values.classTime?.format("HH:00:00"),
        subjectPeriod: values.subjectPeriod?.format("HH:mm:ss"),
      };
      const response = await axiosInstance.post(
        API.CREATE_TRAINING_SCHEDULE,
        scheduleData
      );
      if (response.data) {
        message.success("Schedule created successfully!");
        navigate("/schedule", { state: { viewMode: "created" } });
      }
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error("Unable to create schedule. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-[1200px] mx-auto">
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
        <Card className="shadow-xl rounded-2xl">
          <Spin spinning={loading || submitting}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                startDate: dayjs().startOf('day'),
                endDate: dayjs().add(7, 'day').startOf('day'),
                daysOfWeek: recurringDayOptions[0].value
              }}
            >
              <Row gutter={24}>
                <Col xs={24} md={24}>
                  <Title level={4} className="mb-4">
                    Schedule Details
                  </Title>
                  <Form.Item
                    name="classSubjectId"
                    label="Class Subject"
                    rules={[
                      { required: true, message: "Please select a class subject" },
                    ]}
                  >
                    <Select
                      placeholder="Select class subject"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {classSubjects.map((item) => (
                        <Option key={item.classSubjectId} value={item.classSubjectId}>
                          {item.subjectName || item.classSubjectId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="location"
                        label="Location"
                        rules={[
                          { required: true, message: "Location is required" },
                        ]}
                      >
                        <Select placeholder="Select">
                          {Object.entries(LocationEnum).map(([n, v]) => (
                            <Option key={v} value={v}>{n}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="room"
                        label="Room/Platform"
                        rules={[
                          { required: true, message: "Room is required" },
                        ]}
                      >
                        <Select
                          placeholder="Select"
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {Object.entries(RoomEnum).map(([n, v]) => (
                            <Option key={v} value={v}>{n}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[
                          { required: true, message: "Start date is required" },
                          {
                            validator(_, value) {
                              if (!value) return Promise.resolve();
                              if (value.isBefore(dayjs(), 'minute')) {
                                return Promise.reject(new Error('Start date must be in the future'));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          format="YYYY-MM-DD HH:mm"
                          showTime={{ format: "HH:mm" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[
                          { required: true, message: "End date is required" },
                          {
                            validator(_, value) {
                              const start = form.getFieldValue('startDate');
                              if (!value || !start) return Promise.resolve();
                              if (value.isSameOrBefore(start, 'minute')) {
                                return Promise.reject(new Error('End date must be after start date'));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          format="YYYY-MM-DD HH:mm"
                          showTime={{ format: "HH:mm" }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="classTime"
                        label="Start Time"
                        rules={[
                          { required: true, message: "Start time is required" },
                        ]}
                      >
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          disabledHours={getDisabledHours}
                          disabledMinutes={getDisabledMinutesForHalfHour}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="subjectPeriod"
                        label="Duration"
                        rules={[]}
                      >
                        <TimePicker
                          className="w-full"
                          format="HH:mm"
                          minuteStep={15}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item
                    name="daysOfWeek"
                    label="Recurring Days"
                    rules={[
                      { required: true, message: "Select recurring days" },
                    ]}
                  >
                    <Select
                      placeholder="Select recurring days"
                      options={recurringDayOptions}
                    />
                  </Form.Item>
                  <Form.Item
                    name="notes"
                    label="Notes"
                    rules={[
                      { required: true, message: "please enter some notes" },
                    ]}
                  >
                    <TextArea rows={3} placeholder="Notes for this class" />
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