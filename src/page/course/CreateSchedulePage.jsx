import React, { useState, useEffect } from "react";
import { 
  Form, Input, Button, DatePicker, Select, 
  Card, message, Spin, TimePicker, Checkbox,
  Row, Col, Typography, Space
} from "antd";
import { useNavigate } from "react-router-dom";
import { 
  CalendarOutlined, SaveOutlined, 
  RollbackOutlined, ClockCircleOutlined 
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";
import dayjs from "dayjs";
import { getTrainingPlanSchema, applyTrainingPlanValidation } from "../../../utils/validationSchemas";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateSchedulePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);

  // Fetch subjects and instructors when component mounts
  useEffect(() => {
    fetchSubjects();
    fetchInstructors();
  }, []);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      // Call API to get list of subjects
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(API.GET_ALL_SUBJECTS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Subject API response:", response.data);

      if (response.data && response.data.subjects) {
        // Process data according to API structure
        const subjectData = response.data.subjects;
        
        // Filter out subjects with subjectId as "string" (invalid data)
        const filteredSubjects = subjectData.filter(subject => 
          subject.subjectId !== "string" && subject.subjectName !== "string"
        );
        
        setSubjects(filteredSubjects.map(subject => ({
          id: subject.subjectId,
          name: subject.subjectName,
          description: subject.description,
          courseId: subject.courseId
        })));
        
        console.log("Processed subjects:", subjects);
      } else if (response.data && Array.isArray(response.data)) {
        // In case API returns array directly
        setSubjects(response.data.map(subject => ({
          id: subject.subjectId || subject.id,
          name: subject.subjectName || subject.name
        })));
      } else {
        console.warn("Unexpected subject data format:", response.data);
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      message.error("Unable to load subject list");
      
      // Sample data based on actual API
      setSubjects([
        { id: "S-0002", name: "Air plane daily journey" },
        { id: "S-0003", name: "Air plane basic rule" },
        { id: "S-0004", name: "Air plane daily journey 2" },
        { id: "Sb-00001", name: "basic step fr dummy" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch instructors from API
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      // Call API to get list of instructors with role "Instructor"
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(API.GET_ALL_USER, {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: "Instructor" }
      });

      console.log("Instructor API response:", response.data);

      if (response.data && response.data.users) {
        const instructorData = response.data.users;
        setInstructors(instructorData.map(instructor => ({
          id: instructor.userId || instructor.id,
          name: instructor.fullName || instructor.name || instructor.userName
        })));
      } else if (response.data && Array.isArray(response.data)) {
        setInstructors(response.data.map(instructor => ({
          id: instructor.userId || instructor.id,
          name: instructor.fullName || instructor.name || instructor.userName
        })));
      } else {
        console.warn("Unexpected instructor data format:", response.data);
        setInstructors([]);
      }
    } catch (error) {
      console.error("Error fetching instructors:", error);
      message.error("Unable to load instructor list");
      
      // Sample data based on actual API
      setInstructors([
        { id: "INST-1", name: "Instructor User" },
      ]);
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
      const subjectPeriod = values.subjectPeriod ? values.subjectPeriod.format("HH:mm:ss") : "01:30:00";
      
      // Convert daysOfWeek to array of integers
      const daysOfWeek = values.daysOfWeek.map(day => parseInt(day));
      
      // Find selected subject information
      const selectedSubject = subjects.find(s => s.id === values.subjectID);
      
      // Create data according to API format
      const scheduleData = {
        subjectID: values.subjectID,
        instructorID: values.instructorID,
        location: values.location,
        room: values.room,
        notes: values.notes || "",
        startDay: `${startDate}T${classTime}`,
        endDay: `${endDate}T${classTime}`,
        daysOfWeek: daysOfWeek,
        classTime: classTime,
        subjectPeriod: subjectPeriod,
        createdBy: localStorage.getItem("userId") // Add creator information
      };
      
      console.log("Submitting schedule data:", scheduleData);
      
      // Call API to create schedule
      const response = await axiosInstance.post(API.CREATE_TRAINING_SCHEDULE, scheduleData);
      
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
                endDate: dayjs().add(30, 'day'),
                classTime: dayjs('08:00:00', 'HH:mm:ss'),
                subjectPeriod: dayjs('01:30:00', 'HH:mm:ss'),
                daysOfWeek: ["0", "2", "4"],
              }}
            >
              <Row gutter={24}>
                {/* Column 1 */}
                <Col xs={24} md={12}>
                  <Title level={4} className="mb-4">General Information</Title>
                  
                  <Form.Item 
                    name="subjectID" 
                    label="Subject"
                    rules={[{ required: true, message: "Please select a subject" }]}
                  >
                    <Select 
                      placeholder="Select subject"
                      loading={loading}
                      showSearch
                      optionFilterProp="children"
                    >
                      {subjects.map(subject => (
                        <Option key={subject.id} value={subject.id}>
                          {subject.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
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
                      {instructors.map(instructor => (
                        <Option key={instructor.id} value={instructor.id}>
                          {instructor.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="location" 
                        label="Location"
                        rules={[{ required: true, message: "Please enter a location" }]}
                      >
                        <Input placeholder="Example: ABC Campus" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="room" 
                        label="Room"
                        rules={[{ required: true, message: "Please enter a room" }]}
                      >
                        <Input placeholder="Example: 101" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item 
                    name="notes" 
                    label="Notes"
                  >
                    <TextArea rows={3} placeholder="Notes about the schedule" />
                  </Form.Item>
                </Col>
                
                {/* Column 2 */}
                <Col xs={24} md={12}>
                  <Title level={4} className="mb-4">Class Schedule</Title>
                  
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
                                return Promise.reject(new Error('Start date and time must be in the future'));
                              }
                              return Promise.resolve();
                            }
                          })
                        ]}
                      >
                        <DatePicker
                          className="w-full rounded-lg py-2 px-3 text-base"
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          disabledDate={(current) => current && current < dayjs().startOf('day')}
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
                              const startDate = getFieldValue('startDate');
                              if (startDate && value.isBefore(startDate)) {
                                return Promise.reject(new Error('End date must be after start date'));
                              }
                              
                              // Check duration is reasonable
                              if (startDate) {
                                const diffDays = value.diff(startDate, 'days');
                                if (diffDays < 1 || diffDays > 365) {
                                  return Promise.reject(new Error('Training plan duration should be between 1 day and 365 days'));
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
                            const startDate = form.getFieldValue('startDate');
                            return current && (current < dayjs().startOf('day') || (startDate && current < startDate));
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
                        rules={[{ required: true, message: "Please select a class time" }]}
                      >
                        <TimePicker className="w-full" format="HH:mm" placeholder="Select class time" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="subjectPeriod" 
                        label="Duration"
                        rules={[{ required: true, message: "Please select a duration" }]}
                      >
                        <TimePicker className="w-full" format="HH:mm" placeholder="Select duration" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item 
                    name="daysOfWeek" 
                    label="Days of Week"
                    rules={[{ required: true, message: "Please select at least one day" }]}
                  >
                    <Checkbox.Group options={daysOfWeekOptions} className="grid grid-cols-2 sm:grid-cols-4" />
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
