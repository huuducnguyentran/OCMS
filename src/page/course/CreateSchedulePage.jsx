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

  // Lấy danh sách môn học và giảng viên khi component mount
  useEffect(() => {
    fetchSubjects();
    fetchInstructors();
  }, []);

  // Lấy danh sách môn học từ API
  const fetchSubjects = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách môn học
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(API.GET_ALL_SUBJECTS, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Subject API response:", response.data);

      if (response.data && response.data.subjects) {
        // Xử lý dữ liệu theo cấu trúc API thực tế
        const subjectData = response.data.subjects;
        
        // Lọc bỏ các môn học có subjectId là "string" (dữ liệu không hợp lệ)
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
        // Phòng trường hợp API trả về mảng trực tiếp
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
      message.error("Không thể tải danh sách môn học");
      
      // Dữ liệu mẫu dựa trên API thực tế
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

  // Lấy danh sách giảng viên từ API
  const fetchInstructors = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách giảng viên có role là Instructor
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
      message.error("Không thể tải danh sách giảng viên");
      
      // Dữ liệu mẫu dựa trên API thực tế
      setInstructors([
        { id: "INST-1", name: "Instructor User" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi submit form
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Format dates to ISO string
      const startDate = values.startDate.format("YYYY-MM-DD");
      const endDate = values.endDate.format("YYYY-MM-DD");
      
      // Format time to string
      const classTime = values.classTime.format("HH:mm:ss");
      const subjectPeriod = values.subjectPeriod ? values.subjectPeriod.format("HH:mm:ss") : "01:30:00";
      
      // Chuyển đổi daysOfWeek thành mảng số nguyên
      const daysOfWeek = values.daysOfWeek.map(day => parseInt(day));
      
      // Tìm thông tin subject được chọn
      const selectedSubject = subjects.find(s => s.id === values.subjectID);
      
      // Tạo dữ liệu theo định dạng API yêu cầu
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
        createdBy: localStorage.getItem("userId") // Thêm thông tin người tạo
      };
      
      console.log("Submitting schedule data:", scheduleData);
      
      // Gọi API tạo lịch trình
      const response = await axiosInstance.post(API.CREATE_TRAINING_SCHEDULE, scheduleData);
      
      if (response.data) {
        message.success("Tạo lịch trình thành công!");
        // Chuyển về view "created" trong SchedulePage
        navigate("/schedule", { state: { viewMode: "created" } });
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      
      if (error.response?.data?.message) {
        message.error(`Lỗi: ${error.response.data.message}`);
      } else {
        message.error("Không thể tạo lịch trình. Vui lòng thử lại sau.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const daysOfWeekOptions = [
    { label: "Thứ Hai", value: "1" },
    { label: "Thứ Ba", value: "2" },
    { label: "Thứ Tư", value: "3" },
    { label: "Thứ Năm", value: "4" },
    { label: "Thứ Sáu", value: "5" },
    { label: "Thứ Bảy", value: "6" },
    { label: "Chủ Nhật", value: "0" },
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
                Tạo Lịch Trình Mới
              </h2>
              <p className="text-gray-600">
                Thêm lịch trình học mới vào hệ thống
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
                {/* Cột 1 */}
                <Col xs={24} md={12}>
                  <Title level={4} className="mb-4">Thông tin chung</Title>
                  
                  <Form.Item 
                    name="subjectID" 
                    label="Môn học"
                    rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
                  >
                    <Select 
                      placeholder="Chọn môn học"
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
                    label="Giảng viên"
                    rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}
                  >
                    <Select 
                      placeholder="Chọn giảng viên"
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
                        label="Địa điểm"
                        rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
                      >
                        <Input placeholder="Ví dụ: Cơ sở ABC" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="room" 
                        label="Phòng học"
                        rules={[{ required: true, message: "Vui lòng nhập phòng học" }]}
                      >
                        <Input placeholder="Ví dụ: 101" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item 
                    name="notes" 
                    label="Ghi chú"
                  >
                    <TextArea rows={3} placeholder="Ghi chú về lịch học" />
                  </Form.Item>
                </Col>
                
                {/* Cột 2 */}
                <Col xs={24} md={12}>
                  <Title level={4} className="mb-4">Thời gian học</Title>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="startDate" 
                        label="Ngày bắt đầu"
                        rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
                      >
                        <DatePicker className="w-full" placeholder="Chọn ngày bắt đầu" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="endDate" 
                        label="Ngày kết thúc"
                        rules={[
                          { required: true, message: "Vui lòng chọn ngày kết thúc" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || !getFieldValue('startDate') || 
                                value.isAfter(getFieldValue('startDate'))) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                            },
                          }),
                        ]}
                      >
                        <DatePicker className="w-full" placeholder="Chọn ngày kết thúc" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item 
                        name="classTime" 
                        label="Giờ học"
                        rules={[{ required: true, message: "Vui lòng chọn giờ học" }]}
                      >
                        <TimePicker className="w-full" format="HH:mm" placeholder="Chọn giờ học" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item 
                        name="subjectPeriod" 
                        label="Thời lượng"
                        rules={[{ required: true, message: "Vui lòng chọn thời lượng" }]}
                      >
                        <TimePicker className="w-full" format="HH:mm" placeholder="Chọn thời lượng" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item 
                    name="daysOfWeek" 
                    label="Các ngày học trong tuần"
                    rules={[{ required: true, message: "Vui lòng chọn ít nhất một ngày học" }]}
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
                  Quay lại
                </Button>
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  className="bg-blue-600"
                >
                  Tạo lịch trình
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
