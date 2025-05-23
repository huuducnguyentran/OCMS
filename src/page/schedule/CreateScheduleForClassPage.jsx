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
  Alert,
  Space,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  CalendarOutlined,
  RollbackOutlined,
  UserOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";
import { getAllSubject } from "../../services/subjectService"; // Đảm bảo đường dẫn đúng
import { getAllInstructorAssignments } from "../../services/instructorAssignmentService"; // Đảm bảo đường dẫn đúng
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess()); // Optional: set default timezone if needed

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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

const CreateScheduleForClassPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState({
    page: true,
    subjects: false,
    instructors: false,
    instructorSchedules: false,
  });
  const [submitting, setSubmitting] = useState(false); // Mặc dù không có nút submit, vẫn giữ state này cho tương lai

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);

  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null); // Store full instructor object
  
  const [instructorExistingSchedules, setInstructorExistingSchedules] = useState([]);
  const [conflictMessages, setConflictMessages] = useState([]);

  useEffect(() => {
    if (classId) {
      form.setFieldsValue({ classId: classId });
      setLoading(prev => ({ ...prev, page: false }));
    }
    fetchSubjects();
  }, [classId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchInstructorsForSubject(selectedSubjectId);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    if (selectedInstructor && selectedInstructor.id) {
      fetchInstructorSchedules(selectedInstructor.id);
    } else {
      setInstructorExistingSchedules([]);
      setConflictMessages([]);
    }
  }, [selectedInstructor]);

  const fetchSubjects = async () => {
    setLoading(prev => ({ ...prev, subjects: true }));
    try {
      const fetchedSubjects = await getAllSubject();
      if (Array.isArray(fetchedSubjects)) {
        setSubjects(fetchedSubjects);
      } else if (fetchedSubjects && Array.isArray(fetchedSubjects.allSubjects)) {
        setSubjects(fetchedSubjects.allSubjects);
      }
       else if (fetchedSubjects && Array.isArray(fetchedSubjects.subjects)) {
        setSubjects(fetchedSubjects.subjects);
      }
       else {
        console.warn("Unexpected format for subjects:", fetchedSubjects);
        setSubjects([]);
        message.error("Could not load subjects in expected format.");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      message.error("Failed to load subjects.");
      setSubjects([]);
    } finally {
      setLoading(prev => ({ ...prev, subjects: false }));
    }
  };

  const fetchInstructorsForSubject = async (subjectId) => {
    setLoading(prev => ({ ...prev, instructors: true }));
    setSelectedInstructor(null); 
    form.setFieldsValue({ instructorId: null });
    try {
      // Lấy danh sách assignments
      const allAssignments = await getAllInstructorAssignments();
      // Lấy danh sách schedules để map tên giảng viên
      const scheduleResponse = await trainingScheduleService.getAllTrainingSchedules();
      
      if (allAssignments && Array.isArray(allAssignments)) {
        // Lọc assignments theo subject
        const filteredInstructorIds = allAssignments
          .filter(assign => assign.courseSubjectSpecialtyId === subjectId)
          .map(assign => assign.instructorId || assign.instructorID);
e
        // Tạo map tên giảng viên từ scheduls
        const instructorNamesMap = {};
        if (scheduleResponse && scheduleResponse.schedules && Array.isArray(scheduleResponse.schedules)) {
          scheduleResponse.schedules.forEach(schedule => {
            if (schedule.instructorID && schedule.instructorName) {
              instructorNamesMap[schedule.instructorID] = schedule.instructorName;
            }
          });
        }

        // Map instructor information
        const instructors = filteredInstructorIds.map(id => ({
          id: id,
          instructorName: instructorNamesMap[id] || `Instructor ${id}`
        }));

        // Remove duplicates
        const uniqueInstructors = Array.from(
          new Map(instructors.map(item => [item.id, item])).values()
        );

        setAvailableInstructors(uniqueInstructors);
        if (uniqueInstructors.length === 0) {
            message.info("No instructors found for the selected subject.");
        }
      } else {
        console.warn("Unexpected format for instructor assignments:", allAssignments);
        setAvailableInstructors([]);
        message.error("Could not load instructors for the subject.");
      }
    } catch (error) {
      console.error("Error fetching instructors for subject:", error);
      message.error("Failed to load instructors.");
      setAvailableInstructors([]);
    } finally {
      setLoading(prev => ({ ...prev, instructors: false }));
    }
  };
  
  const fetchInstructorSchedules = async (instructorId) => {
    setLoading(prev => ({ ...prev, instructorSchedules: true }));
    setConflictMessages([]); // Reset old messages
    try {
      const response = await trainingScheduleService.getAllTrainingSchedules(); 
      // API response: { message: "...", schedules: [...] }
      let currentSchedules = [];
      if (response && response.schedules && Array.isArray(response.schedules)) {
        currentSchedules = response.schedules.filter(s => s.instructorID === instructorId);
      } else {
        console.warn("Unexpected format for getAllTrainingSchedules:", response);
      }
      setInstructorExistingSchedules(currentSchedules);

      if (currentSchedules.length > 0) {
        const today = dayjs();
        const newConflictMessages = [];
        currentSchedules.forEach(sch => {
          const endDate = dayjs(sch.endDateTime);
          if (today.isSameOrBefore(endDate, 'day')) {
            const startTime = dayjs(sch.classTime, "HH:mm:ss");
            let endTime = startTime;
            if (sch.subjectPeriod) {
              const [h, m, s] = sch.subjectPeriod.split(':').map(Number);
              endTime = startTime.add(h, 'hours').add(m, 'minutes').add(s, 'seconds');
            }
            newConflictMessages.push(
              `Instructor ${sch.instructorName || `ID: ${sch.instructorID}`} already has schedule for "${sch.subjectName}" ` +
              `at ${getLocationName(sch.location) || sch.location} (Room: ${getRoomName(sch.room) || sch.room}), ` +
              `from ${dayjs(sch.startDateTime).format("YYYY-MM-DD")} to ${endDate.format("YYYY-MM-DD")}, ` +
              `on ${sch.daysOfWeek} from ${startTime.format("HH:mm")} to ${endTime.format("HH:mm")}.`
            );
          }
        });
        setConflictMessages(newConflictMessages);
        if (newConflictMessages.length > 0) {
            message.warning("Selected instructor has existing schedules. Please check carefully.", 5);
        }
      } else {
        message.info("Selected instructor has no existing schedules.");
      }

    } catch (error) {
      console.error("Error fetching instructor schedules:", error);
      message.error("Failed to load instructor's existing schedules.");
      setInstructorExistingSchedules([]);
    } finally {
      setLoading(prev => ({ ...prev, instructorSchedules: false }));
    }
  };

  const handleSubjectChange = (value) => {
    setSelectedSubjectId(value);
  };

  const handleInstructorChange = (value, option) => {
    if(option && option.key){
        const instructor = availableInstructors.find(inst => inst.id === option.key) || {
          id: option.key,
          name: option.children
        };
        setSelectedInstructor(instructor); 
    } else {
        setSelectedInstructor(null);
    }
  };

    // Logic kiểm tra xung đột (ví dụ đơn giản, cần làm phức tạp hơn)
  const isSlotFree = (date, timeRange) => {
    if (!selectedInstructor || instructorExistingSchedules.length === 0) {
      return true; 
    }

    const targetDayOfWeek = date.day(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const targetStartTime = dayjs(timeRange[0]); // Giả sử timeRange là [startTime, endTime] của TimePicker.RangePicker
    const targetEndTime = dayjs(timeRange[1]);

    for (const schedule of instructorExistingSchedules) {
      // Cần parse 'daysOfWeek' từ string "Monday,Tuesday" thành mảng số [1, 2]
      const scheduleDays = (schedule.daysOfWeek || "")
        .toLowerCase()
        .split(',')
        .map(dayName => {
            switch(dayName.trim()){
                case "sunday": return 0;
                case "monday": return 1;
                case "tuesday": return 2;
                case "wednesday": return 3;
                case "thursday": return 4;
                case "friday": return 5;
                case "saturday": return 6;
                default: return -1; // Hoặc ném lỗi nếu tên ngày không hợp lệ
            }
        })
        .filter(dayNum => dayNum !== -1);

      if (!scheduleDays.includes(targetDayOfWeek)) {
        continue; // Khác ngày trong tuần, bỏ qua
      }

      const scheduleStartTime = dayjs(schedule.classTime, "HH:mm:ss"); // classTime từ API
      const schedulePeriod = schedule.subjectPeriod; // Ví dụ "01:30:00"
      
      let scheduleEndTime = scheduleStartTime;
      if (schedulePeriod) {
        const [h, m, s] = schedulePeriod.split(':').map(Number);
        scheduleEndTime = scheduleStartTime.add(h, 'hours').add(m, 'minutes').add(s, 'seconds');
      }
      
      // Kiểm tra ngày bắt đầu và kết thúc của lịch hiện có
      const existingSchStartDate = dayjs(schedule.startDateTime || schedule.startDay); // API có thể trả về startDay
      const existingSchEndDate = dayjs(schedule.endDateTime || schedule.endDay); // API có thể trả về endDay

      if (!(date.isSame(existingSchStartDate, 'day') || date.isAfter(existingSchStartDate, 'day')) || 
          !(date.isSame(existingSchEndDate, 'day') || date.isBefore(existingSchEndDate, 'day'))) {
          continue; // Ngày chọn nằm ngoài khoảng của lịch hiện có
      }


      // Kiểm tra chồng chéo thời gian
      // (StartA <= EndB) and (EndA >= StartB)
      if (targetStartTime.isBefore(scheduleEndTime) && targetEndTime.isAfter(scheduleStartTime)) {
        message.warning(`Time conflict with existing schedule: ${schedule.subjectName} on ${date.format("YYYY-MM-DD")} from ${scheduleStartTime.format("HH:mm")} to ${scheduleEndTime.format("HH:mm")}`);
        return false; // Xung đột
      }
    }
    return true; // Không xung đột
  };

  const disabledDate = (current) => {
    // Logic cơ bản: không cho chọn quá khứ
    // Có thể thêm logic dựa trên instructorExistingSchedules nếu cần vô hiệu hóa cả ngày
    return current && current < dayjs().startOf("day");
  };
  
  // Ví dụ cho disabledTime - cần TimePicker.RangePicker để có range
  const disabledTime = (now, type) => {
    // const currentSelectedDate = form.getFieldValue('startDate'); // Hoặc ngày cụ thể đang được chọn
    // if (!currentSelectedDate || !selectedInstructorId || instructorExistingSchedules.length === 0) {
    //   return {};
    // }
    // if (type === 'start') {
    //   return {
    //     disabledHours: () => [], // Trả về mảng giờ bị vô hiệu hóa
    //   };
    // }
    // return {
    //   disabledHours: () => [], // Trả về mảng giờ bị vô hiệu hóa
    // };
    // Phần này rất phức tạp và phụ thuộc vào cách bạn muốn hiển thị + kiểm tra xung đột.
    // Hiện tại để trống để tránh lỗi.
    return {};
  };


  const daysOfWeekOptions = [
    { label: "Monday", value: "1" },
    { label: "Tuesday", value: "2" },
    { label: "Wednesday", value: "3" },
    { label: "Thursday", value: "4" },
    { label: "Friday", value: "5" },
    { label: "Saturday", value: "6" },
    { label: "Sunday", value: "0" }, // Theo chuẩn JS Date.getDay()
  ];

  if (loading.page) {
    return (
      <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-purple-600 rounded-xl shadow-lg">
              <CalendarOutlined className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create Schedule for Class: {classId}
              </h2>
              <p className="text-gray-600">
                Plan and schedule training sessions.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl rounded-2xl">
          <Spin spinning={submitting || loading.subjects || loading.instructors || loading.instructorSchedules}>
            <Form form={form} layout="vertical" initialValues={{
                startDate: dayjs().startOf('day'),
                endDate: dayjs().add(7, 'day').startOf('day'),
            }} >
              <Row gutter={24}>
                {/* Column 1: Subject and Instructor Selection */}
                <Col xs={24} md={8}>
                  <Title level={4} className="mb-4 flex items-center">
                    <BookOutlined className="mr-2" /> Selection
                  </Title>
                  <Form.Item
                    name="subjectId"
                    label="Subject"
                    rules={[{ required: true, message: "Please select a subject" }]}
                  >
                    <Select
                      placeholder="Select subject"
                      loading={loading.subjects}
                      onChange={handleSubjectChange}
                      showSearch
                      optionFilterProp="children"
                    >
                      {subjects.map((subject) => (
                        <Option key={subject.subjectId} value={subject.subjectId}>
                          {subject.subjectName} ({subject.subjectId})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="instructorId"
                    label="Instructor"
                    rules={[{ required: true, message: "Please select an instructor" }]}
                  >
                    <Select
                      placeholder="Select instructor"
                      loading={loading.instructors}
                      onChange={handleInstructorChange}
                      showSearch
                      optionFilterProp="children"
                    >
                      {availableInstructors.map((instructor) => (
                        <Option key={instructor.id} value={instructor.id}>
                          {instructor.instructorName} ({instructor.id})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                  {conflictMessages.length > 0 && (
                     <Alert
                        message={<><InfoCircleOutlined className="mr-2" />Instructor's Existing Schedules</>}
                        description={
                            <Space direction="vertical">
                                {conflictMessages.map((msg, index) => (
                                    <Paragraph key={index} style={{fontSize: '12px', marginBottom: '8px'}}>
                                       {msg}
                                    </Paragraph>
                                ))}
                            </Space>
                        }
                        type="warning"
                        showIcon={false} // Icon is in message
                        className="mb-4 p-3"
                    />
                  )}
                </Col>

                {/* Column 2: Schedule Details */}
                <Col xs={24} md={16}>
                  <Title level={4} className="mb-4 flex items-center">
                    <CalendarOutlined className="mr-2" /> Schedule Details
                  </Title>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item name="location" label="Location" rules={[{ required: true, message: "Please enter location" }]}>
                        <Select 
                          placeholder="Select location"
                          showSearch
                          optionFilterProp="children"
                        >
                          {Object.entries(LocationEnum).map(([name, value]) => (
                            <Option key={value} value={value}>{name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item name="room" label="Room / Platform" rules={[{ required: true, message: "Please enter room or platform" }]}>
                         <Select 
                           placeholder="Select room"
                           showSearch
                           optionFilterProp="children"
                         >
                          {Object.entries(RoomEnum).map(([name, value]) => (
                            <Option key={value} value={value}>{name}</Option>
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
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          format="YYYY-MM-DD"
                          disabledDate={disabledDate}
                          onChange={(date, dateString) => {
                            // Khi ngày thay đổi, set thời gian về 00:00
                            // Tuy nhiên, DatePicker chỉ chọn ngày sẽ tự động có time là 00:00:00 của timezone hiện tại
                            // nếu cần UTC 00:00:00 thì cần xử lý thêm.
                            // form.setFieldsValue({ startDate: date ? date.startOf('day') : null });
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="endDate"
                        label="End Date"
                        rules={[
                          { required: true, message: "End date is required" },
                           ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || !getFieldValue('startDate')) {
                                return Promise.resolve();
                              }
                              if (value.isBefore(getFieldValue('startDate'))) {
                                return Promise.reject(new Error('End date must be after start date'));
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          className="w-full"
                          format="YYYY-MM-DD"
                          disabledDate={disabledDate}
                           onChange={(date, dateString) => {
                            // form.setFieldsValue({ endDate: date ? date.startOf('day') : null });
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                   <Row gutter={16}>
                     <Col xs={24} sm={12}>
                        <Form.Item
                            name="classTime"
                            label="Class Start Time"
                            rules={[{ required: true, message: "Please select a class time" }]}
                        >
                            <TimePicker className="w-full" format="HH:mm" placeholder="Select class time" minuteStep={1} secondStep={1} />
                        </Form.Item>
                     </Col>
                     <Col xs={24} sm={12}>
                        <Form.Item name="subjectPeriod" label="Class Duration">
                            <TimePicker
                            className="w-full"
                            format="HH:mm"
                            placeholder="Select duration (e.g., 01:30)"
                            showNow={false}
                            minuteStep={1} 
                            secondStep={1}
                            />
                        </Form.Item>
                     </Col>
                   </Row>
                  <Form.Item
                    name="daysOfWeek"
                    label="Recurring Days of Week"
                    rules={[{ required: true, message: "Select at least one day" }]}
                  >
                    <Checkbox.Group options={daysOfWeekOptions} className="grid grid-cols-2 sm:grid-cols-4 gap-2"/>
                  </Form.Item>
                  <Form.Item name="notes" label="Notes">
                    <TextArea rows={3} placeholder="Any additional notes for this schedule" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex justify-end mt-6 gap-4">
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => navigate("/class")} // Quay lại trang Classroom
                  size="large"
                >
                  Back to Classrooms
                </Button>
                {/* Nút Submit bị ẩn theo yêu cầu */}
                {/* 
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Schedule (DEV)
                </Button>
                */}
              </div>
            </Form>
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default CreateScheduleForClassPage;

// Helper để parse daysOfWeek từ API (nếu nó là chuỗi "Monday,Tuesday")
// Chuyển sang dạng số [1,2] (Monday=1, Sunday=0 hoặc 7 tùy chuẩn)
// function parseDaysOfWeek(daysString) {
//   if (!daysString) return [];
//   const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
//   return daysString.toLowerCase().split(',').map(day => dayMap[day.trim()]).filter(day => day !== undefined);
// } 