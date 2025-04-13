// src/pages/SchedulePage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Table, Spin, Empty, message, Select, Tag, Button } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserSwitchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";

const { Option } = Select;

const SchedulePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState(location.state?.viewMode || "all"); // For Training Staff: "all", "instructor", "trainee"
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState(null);

  // Thêm các state mới cho search
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Kiểm tra token và xác định quyền người dùng
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      navigate("/login");
      return;
    }

    // Xác định quyền người dùng từ token hoặc sessionStorage
    if (role) {
      setUserRole(role);
    } else {
      // Hoặc kiểm tra userId
      const userId = sessionStorage.getItem("userId");
      if (userId && userId.startsWith("TS-")) {
        setUserRole("TrainingStaff");
      } else {
        // Default role nếu không xác định được
        setUserRole("Trainee");
      }
    }
  }, [navigate]);

  // Fetch schedule data based on user role
  useEffect(() => {
    if (userRole) {
      fetchScheduleData();
    }
  }, [userRole, viewMode]);

  // Thêm useEffect để fetch danh sách subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        console.log("Fetching subjects from API...");

        const subjects = await trainingScheduleService.getAllSubjects();
        console.log("Subjects fetched successfully:", subjects);

        if (Array.isArray(subjects) && subjects.length > 0) {
          setSubjects(subjects);
          setSubjectOptions(subjects);
        } else {
          console.warn("No subjects returned or invalid format");
          message.warning("Không tìm thấy môn học nào");
          setSubjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);

        // Hiển thị lỗi cụ thể hơn
        if (error.response) {
          message.error(
            `Lỗi API (${error.response.status}): ${
              error.response.data?.message || "Không thể tải danh sách môn học"
            }`
          );
        } else if (error.request) {
          message.error(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          message.error("Không thể tải danh sách môn học");
        }

        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("Phiên đăng nhập hết hạn");
        navigate("/login");
        return;
      }

      // Nếu có subject được chọn
      if (selectedSubjectId) {
        try {
          // Log để debug
          console.log("Fetching data for subject:", selectedSubjectId);

          const data = await trainingScheduleService.getScheduleBySubjectId(
            selectedSubjectId
          );
          console.log("Received data:", data);

          if (data && data.subjectDetails) {
            setSelectedSubjectDetails(data.subjectDetails);

            // Đảm bảo schedules là một mảng
            const schedules = Array.isArray(data.schedules)
              ? data.schedules
              : [];
            console.log("Processed schedules:", schedules);

            setScheduleData(schedules);

            if (schedules.length === 0) {
              message.info("Không có lịch học cho môn này");
            }
          } else {
            console.log("No subject details found");
            setScheduleData([]);
            setSelectedSubjectDetails(null);
            message.warning("Không tìm thấy thông tin môn học");
          }
        } catch (error) {
          console.error("Error in subject fetch:", error);
          handleError(error);
        }
        return; // Kết thúc sớm nếu đã xử lý subject
      }

      // Xử lý trường hợp không có subject được chọn
      let response;
      try {
        if (userRole === "Training staff" || userRole === "TrainingStaff") {
          switch (viewMode) {
            case "instructor":
              response = await trainingScheduleService.getInstructorSubjects();
              break;
            case "trainee":
              response = await trainingScheduleService.getTraineeSubjects();
              break;
            case "created":
              const userId = sessionStorage.getItem("userId");
              response = await trainingScheduleService.getCreatedSchedules(
                userId
              );
              break;
            default:
              response =
                await trainingScheduleService.getAllTrainingSchedules();
          }
        } else if (userRole === "Instructor") {
          response = await trainingScheduleService.getInstructorSubjects();
        } else {
          response = await trainingScheduleService.getTraineeSubjects();
        }

        console.log("Response from service:", response);

        // Xử lý response
        if (response && response.schedules) {
          setScheduleData(response.schedules);
        } else if (Array.isArray(response)) {
          setScheduleData(response);
        } else if (response && response.data) {
          setScheduleData(response.data);
        } else {
          console.warn("Unexpected response format:", response);
          setScheduleData([]);
        }
      } catch (error) {
        console.error("Error in general fetch:", error);
        handleError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm handleError
  const handleError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          message.error("Không tìm thấy dữ liệu");
          break;
        case 403:
          message.error("Bạn không có quyền truy cập");
          break;
        case 401:
          message.error("Phiên đăng nhập hết hạn");
          navigate("/login");
          break;
        default:
          message.error("Có lỗi xảy ra khi tải dữ liệu");
      }
    } else {
      message.error("Không thể kết nối đến server");
    }
    setScheduleData([]);
  };

  // Thêm useEffect để fetch lại data khi selectedSubjectId thay đổi
  useEffect(() => {
    if (userRole) {
      console.log("Fetching data with:", {
        selectedSubjectId,
        userRole,
        viewMode,
      });
      fetchScheduleData();
    }
  }, [userRole, viewMode, selectedSubjectId]);

  // Xử lý chuỗi daysOfWeek thành mảng các ngày
  const parseDaysOfWeek = (daysOfWeekString) => {
    if (!daysOfWeekString) return [];

    console.log("Parsing days:", daysOfWeekString);

    // Xử lý các trường hợp ngày như "Saturday" hoặc "Monday, Tuesday, Wednesday"
    const days = daysOfWeekString
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean);

    console.log("Parsed days:", days);
    return days;
  };

  // Chuyển đổi thời gian từ string thành định dạng hiển thị
  const formatTime = (timeString) => {
    if (!timeString) return "";

    // Xử lý nếu timeString có dạng "HH:mm:ss"
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }

    return timeString;
  };

  // Process schedule data into time slots
  const processScheduleData = () => {
    console.log("Processing schedule data:", {
      scheduleData,
      selectedSubjectId,
      selectedSubjectDetails,
    });

    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
      console.log("No schedule data to process");
      return [];
    }

    // Lấy tất cả time slots duy nhất
    const uniqueTimeSlots = [
      ...new Set(scheduleData.map((item) => item.classTime)),
    ]
      .filter(Boolean)
      .sort();

    console.log("Unique time slots:", uniqueTimeSlots);

    return uniqueTimeSlots.map((timeSlot) => {
      const row = {
        key: timeSlot,
        timeFrame: formatTime(timeSlot),
      };

      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      daysOfWeek.forEach((day) => {
        const matchingSchedules = scheduleData.filter((schedule) => {
          const scheduleDays = parseDaysOfWeek(schedule.daysOfWeek);
          return schedule.classTime === timeSlot && scheduleDays.includes(day);
        });

        if (matchingSchedules.length > 0) {
          const schedule = matchingSchedules[0];
          row[day] = (
            <div
              onClick={() => navigate(`/course/${schedule.scheduleID}`)}
              className="space-y-2"
            >
              <div className="font-semibold text-blue-600 hover:text-blue-700">
                {schedule.subjectName}
              </div>
              <div className="text-sm text-gray-500">
                <div>Room: {schedule.room || "N/A"}</div>
                <div>Location: {schedule.location || "N/A"}</div>
                {schedule.courseId && <div>Course: {schedule.courseId}</div>}
                {userRole === "TrainingStaff" && (
                  <>
                    <div>Instructor: {schedule.instructorID}</div>
                    <div>
                      Status:
                      <Tag
                        color={
                          schedule.status === "Pending" ? "orange" : "green"
                        }
                      >
                        {schedule.status}
                      </Tag>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        } else {
          row[day] = "No Class";
        }
      });

      return row;
    });
  };

  const columns = [
    {
      title: (
        <div className="flex items-center gap-2 text-indigo-700">
          <ClockCircleOutlined />
          <span>Time Slot</span>
        </div>
      ),
      dataIndex: "timeFrame",
      key: "timeFrame",
      fixed: "left",
      width: 150,
      render: (text) => (
        <div className="font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
          {text}
        </div>
      ),
    },
    ...[
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ].map((day) => ({
      title: (
        <div className="text-center font-semibold text-indigo-700">
          <div className="text-lg">{day}</div>
        </div>
      ),
      dataIndex: day,
      key: day,
      width: 200,
      render: (content) => (
        <div className="p-2">
          {content !== "-" ? (
            <div
              className="bg-white hover:bg-blue-50 p-4 rounded-xl shadow-sm 
                         border border-blue-100 transition-all duration-300
                         hover:shadow-md cursor-pointer"
            >
              {content}
            </div>
          ) : (
            <div className="text-center text-gray-400 p-4">No Class</div>
          )}
        </div>
      ),
    })),
  ];

  // View selector for Training Staff
  const renderViewSelector = () => {
    if (userRole === "TrainingStaff") {
      return (
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <UserSwitchOutlined className="text-lg text-indigo-600" />
            <span className="font-medium">View as:</span>
            <Select
              value={viewMode}
              onChange={setViewMode}
              className="w-48"
              style={{ width: 200 }}
            >
              <Option value="all">All Schedules</Option>
              <Option value="created">Lịch đã tạo</Option>
              <Option value="instructor">Instructor View</Option>
              <Option value="trainee">Trainee View</Option>
            </Select>
          </div>
        </div>
      );
    }
    return null;
  };

  // Xử lý điều hướng đến trang tạo lịch trình
  const handleCreateSchedule = () => {
    navigate("/schedule/create");
  };

  // Render nút tạo lịch trình (chỉ hiển thị cho Training Staff)
  const renderCreateButton = () => {
    if (userRole === "TrainingStaff" || userRole === "Training staff") {
      return (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateSchedule}
          className="bg-green-600 hover:bg-green-700"
          size="large"
        >
          Create Schedule
        </Button>
      );
    }
    return null;
  };

  // Thêm hàm xử lý khi chọn subject
  const handleSubjectChange = async (subjectId) => {
    try {
      console.log("Selected subject ID:", subjectId);
      if (!subjectId) {
        setSelectedSubjectId(null);
        setSelectedSubjectDetails(null);
        setScheduleData([]);
        fetchScheduleData();
        return;
      }

      setLoading(true);
      setSelectedSubjectId(subjectId);

      try {
        // Gọi API để lấy thông tin subject và schedules
        const data = await trainingScheduleService.getScheduleBySubjectId(
          subjectId
        );
        console.log("API response:", data);

        // Kiểm tra và cập nhật schedule data
        if (data.schedules && data.schedules.length > 0) {
          setScheduleData(data.schedules);
          console.log("Schedule data set:", data.schedules);
        } else {
          console.log("No schedules found for this subject");
          message.info("Không có lịch học cho môn này");
          setScheduleData([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        // Hiển thị lỗi phù hợp
        if (error.response) {
          if (error.response.status === 404) {
            message.error("Không tìm thấy môn học");
          } else {
            message.error(`Lỗi server: ${error.response.status}`);
          }
        } else if (error.request) {
          message.error("Không thể kết nối đến server");
        } else {
          message.error("Lỗi khi tải dữ liệu");
        }

        setScheduleData([]);
      }
    } catch (error) {
      console.error("Error in handleSubjectChange:", error);
      message.error("Có lỗi xảy ra");
      setScheduleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Thêm component Subject Selector vào giao diện
  const renderSubjectSelector = () => {
    // Hàm tìm kiếm sử dụng setTimeout
    const handleSearch = (value) => {
      if (!value || value.length < 2) return;

      // Clear timeout cũ nếu có
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setSearchLoading(true);
      setSearchTerm(value);

      // Set timeout mới
      searchTimeoutRef.current = setTimeout(() => {
        try {
          // Lọc từ danh sách subjects đã tải
          const filtered = subjects.filter(
            (subject) =>
              subject.subjectName.toLowerCase().includes(value.toLowerCase()) ||
              subject.subjectId.toLowerCase().includes(value.toLowerCase())
          );

          setSubjectOptions(filtered);
        } catch (error) {
          console.error("Error searching subjects:", error);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    };

    console.log("Rendering subject selector with:", {
      subjects: subjects.length,
      options: (searchTerm ? subjectOptions : subjects).length,
    });

    return (
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarOutlined className="text-lg text-indigo-600" />
          <span className="font-medium">Select Subject:</span>
          <Select
            showSearch
            style={{ width: 350 }}
            placeholder="Select a subject"
            optionFilterProp="children"
            onChange={(value, option) => {
              console.log("Selected subject:", option);
              if (value === "get_all") {
                // Khi chọn "Get All", reset selection và fetch tất cả schedules
                setSelectedSubjectId(null);
                setSelectedSubjectDetails(null);
                fetchScheduleData();
              } else {
                handleSubjectChange(option?.key);
              }
            }}
            onSearch={handleSearch}
            loading={searchLoading}
            value={
              selectedSubjectId
                ? subjects.find((s) => s.subjectId === selectedSubjectId)
                    ?.subjectName
                : undefined
            }
            allowClear
            onClear={() => {
              setSelectedSubjectId(null);
              setSelectedSubjectDetails(null);
              fetchScheduleData();
            }}
            filterOption={false}
            notFoundContent={
              searchLoading ? <Spin size="small" /> : "No subjects found"
            }
          >
            {/* Thêm option "Get All" ở đầu danh sách */}
            <Option key="get_all" value="get_all">
              <div className="flex flex-col">
                <div className="font-medium text-blue-600">
                  Get All Schedules
                </div>
                <div className="text-xs text-gray-500">
                  View all training schedules
                </div>
              </div>
            </Option>

            {/* Phân cách giữa "Get All" và danh sách subjects */}
            <Option key="divider" disabled className="border-t my-1 py-1">
              <div className="text-xs text-gray-400 text-center">Subjects</div>
            </Option>

            {/* Danh sách subjects */}
            {(searchTerm ? subjectOptions : subjects).map((subject) => (
              <Option key={subject.subjectId} value={subject.subjectId}>
                <div className="flex flex-col">
                  <div className="font-medium">{subject.subjectName}</div>
                  <div className="text-xs text-gray-500">
                    ID: {subject.subjectId} | Course:{" "}
                    {subject.courseId || "N/A"}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-[1500px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <CalendarOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Weekly Schedule
                </h2>
                <p className="text-gray-600">
                  {userRole === "TrainingStaff"
                    ? "Manage and view all training schedules"
                    : "View your weekly training schedule"}
                </p>
              </div>
            </div>

            {/* Nút tạo lịch trình mới */}
            {renderCreateButton()}
          </div>
        </div>

        {/* View Selector and Subject Selector */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4">
            {renderViewSelector()}
            {renderSubjectSelector()}
          </div>
          <div className="mb-4 sm:mb-0 sm:hidden">{renderCreateButton()}</div>
        </div>

        {/* Table Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : scheduleData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Empty description="No schedule data available" />
              {renderCreateButton()}
            </div>
          ) : (
            <Table
              dataSource={processScheduleData()}
              columns={columns}
              bordered={true}
              scroll={{ x: "max-content" }}
              pagination={false}
              className="custom-schedule-table"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
