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
  const [viewMode, setViewMode] = useState(location.state?.viewMode || "all");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentWeek, setCurrentWeek] = useState(null);
  const [weekOptions, setWeekOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [columns, setColumns] = useState([]);

  // Initialize current week and generate week options when component mounts
  useEffect(() => {
    // Get current week number and set it
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    
    // Generate week options for the entire year
    generateWeekOptions(now.getFullYear());
    
    // Set the current week in format "DD/MM To DD/MM"
    const currentWeekDates = getWeekDates(weekNumber, now.getFullYear());
    setCurrentWeek(`${formatDateShort(currentWeekDates.start)} To ${formatDateShort(currentWeekDates.end)}`);
  }, []);

  // Generate week options for dropdown
  const generateWeekOptions = (year) => {
    const options = [];
    for (let week = 1; week <= 52; week++) {
      const weekDates = getWeekDates(week, year);
      options.push({
        value: `${formatDateShort(weekDates.start)} To ${formatDateShort(weekDates.end)}`,
        label: `${formatDateShort(weekDates.start)} To ${formatDateShort(weekDates.end)}`,
        weekNumber: week
      });
    }
    setWeekOptions(options);
  };

  // Get start and end dates for a specific week in a year
  const getWeekDates = (weekNumber, year) => {
    const startOfYear = new Date(year, 0, 1);
    const daysOffset = (startOfYear.getDay() > 0 ? 7 - startOfYear.getDay() : 0) + (weekNumber - 1) * 7;
    const startDate = new Date(year, 0, 1 + daysOffset);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return { start: startDate, end: endDate };
  };

  // Format date as DD/MM
  const formatDateShort = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Format date with day of month and month
  const formatDateFull = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Check token and determine user role
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      message.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
      navigate("/login");
      return;
    }

    if (role) {
      setUserRole(role);
    } else {
      const userId = sessionStorage.getItem("userId");
      if (userId && userId.startsWith("TS-")) {
        setUserRole("TrainingStaff");
      } else {
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

  // Fetch subjects list
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

      // If a subject is selected
      if (selectedSubjectId) {
        try {
          console.log("Fetching data for subject:", selectedSubjectId);

          const data = await trainingScheduleService.getScheduleBySubjectId(
            selectedSubjectId
          );
          console.log("Received data:", data);

          if (data && data.subjectDetails) {
            setSelectedSubjectDetails(data.subjectDetails);
            const schedules = Array.isArray(data.schedules) ? data.schedules : [];
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
        return;
      }

      // Handle the case when no subject is selected
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
        } else if (userRole === "Trainee") {
          response = await trainingScheduleService.getTraineeSubjects();
          
          // Process the response specific for trainee format
          if (response && response.data && Array.isArray(response.data)) {
            // Extract schedules from all subjects
            const allSchedules = [];
            
            response.data.forEach(subject => {
              if (subject.schedules && Array.isArray(subject.schedules)) {
                // Add subject information to each schedule
                const schedulesWithSubjectInfo = subject.schedules.map(schedule => ({
                  ...schedule,
                  subjectID: subject.subjectId,
                  subjectName: subject.subjectName
                }));
                
                allSchedules.push(...schedulesWithSubjectInfo);
              }
            });
            
            setScheduleData(allSchedules);
            return;
          }
        } else {
          response = await trainingScheduleService.getTraineeSubjects();
        }

        console.log("Response from service:", response);

        // Process the response
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

  // Fetch data when selectedSubjectId changes
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

  // Parse days of week string into an array of days
  const parseDaysOfWeek = (daysOfWeekString) => {
    if (!daysOfWeekString) return [];
    console.log("Parsing days:", daysOfWeekString);
    const days = daysOfWeekString
      .split(",")
      .map((day) => day.trim())
      .filter(Boolean);
    console.log("Parsed days:", days);
    return days;
  };

  // Format time from string to display format
  const formatTime = (timeString) => {
    if (!timeString) return "";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    return timeString;
  };

  // Generate dates for current week based on selected week
  const generateWeekDates = (weekString) => {
    // If week string is not set, use current date
    if (!weekString) {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
      
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }
      return dates;
    }
    
    // Parse selected week string (format: "DD/MM To DD/MM")
    const [startDateStr, endDateStr] = weekString.split(" To ");
    const [startDay, startMonth] = startDateStr.split("/").map(Number);
    
    // Create date for Monday of selected week
    const startDate = new Date(currentYear, startMonth - 1, startDay);
    
    // Generate dates for the entire week
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Get formatted date string (DD/MM)
  const getFormattedDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Check if a course is active on a specific date
  const isCourseActiveOnDate = (schedule, date) => {
    const startDate = new Date(schedule.startDateTime);
    const endDate = new Date(schedule.endDateTime);
    
    // Reset time components for accurate date comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    date.setHours(12, 0, 0, 0);
    
    return date >= startDate && date <= endDate;
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

    // Get all unique time slots
    const uniqueTimeSlots = [
      ...new Set(scheduleData.map((item) => item.classTime)),
    ]
      .filter(Boolean)
      .sort();

    console.log("Unique time slots:", uniqueTimeSlots);
    
    // Generate dates for the current/selected week
    const weekDates = generateWeekDates(currentWeek);

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

      // For each day of the week
      daysOfWeek.forEach((day, index) => {
        const currentDate = weekDates[index];
        
        // Find schedules for this time slot and day
        const matchingSchedules = scheduleData.filter((schedule) => {
          const scheduleDays = parseDaysOfWeek(schedule.daysOfWeek);
          
          // Check if schedule is on this day and active on the current date
          return (
            schedule.classTime === timeSlot && 
            scheduleDays.includes(day) && 
            isCourseActiveOnDate(schedule, currentDate)
          );
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
              
              {/* Clear date range information */}
              <div className="text-xs font-medium text-indigo-600 bg-indigo-50 p-1 rounded my-1">
                <div>Từ: {formatDateFull(schedule.startDateTime)}</div>
                <div>Đến: {formatDateFull(schedule.endDateTime)}</div>
              </div>
              
              <div className="text-sm text-gray-500">
                <div>Room: {schedule.room || "N/A"}</div>
                <div>Location: {schedule.location || "N/A"}</div>
                {schedule.courseId && <div>Course: {schedule.courseId}</div>}
                {schedule.subjectPeriod && (
                  <div>Duration: {schedule.subjectPeriod.substring(0, 5)} hours</div>
                )}
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

  // Generate column headers with dates
  const generateColumns = () => {
    const weekDates = generateWeekDates(currentWeek);
    
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
      }
    ];
    
    // Days of week with corresponding dates
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    
    // Add column for each day with its date
    daysOfWeek.forEach((day, index) => {
      const date = weekDates[index];
      
      columns.push({
        title: (
          <div className="text-center font-semibold text-indigo-700">
            <div className="text-lg">{day}</div>
            <div className="text-sm">{getFormattedDate(date)}</div>
          </div>
        ),
        dataIndex: day,
        key: day,
        width: 200,
        render: (content) => (
          <div className="p-2">
            {content !== "No Class" ? (
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
      });
    });
    
    return columns;
  };

  // Update columns when currentWeek changes
  useEffect(() => {
    setColumns(generateColumns());
  }, [currentWeek]);

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

  // Handle navigation to create schedule page
  const handleCreateSchedule = () => {
    navigate("/schedule/create");
  };

  // Render create button (only for Training Staff)
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

  // Handle subject change
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
        // Call API to get subject info and schedules
        const data = await trainingScheduleService.getScheduleBySubjectId(
          subjectId
        );
        console.log("API response:", data);

        // Check and update schedule data
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

  // Render subject selector
  const renderSubjectSelector = () => {
    // Search function with setTimeout
    const handleSearch = (value) => {
      if (!value || value.length < 2) return;

      // Clear previous timeout if exists
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setSearchLoading(true);
      setSearchTerm(value);

      // Set new timeout
      searchTimeoutRef.current = setTimeout(() => {
        try {
          // Filter from loaded subjects list
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
                // When "Get All" is selected, reset selection and fetch all schedules
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
            {/* Add "Get All" option at the top */}
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

            {/* Divider between "Get All" and subjects list */}
            <Option key="divider" disabled className="border-t my-1 py-1">
              <div className="text-xs text-gray-400 text-center">Subjects</div>
            </Option>

            {/* Subjects list */}
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

  // Render year and week selector
  const renderDateSelector = () => {
    return (
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Year selector */}
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-lg text-indigo-600" />
            <span className="font-medium">Year:</span>
            <Select
              value={currentYear}
              onChange={(value) => {
                setCurrentYear(value);
                generateWeekOptions(value);
              }}
              style={{ width: 120 }}
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </div>
          
          {/* Week selector */}
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-lg text-indigo-600" />
            <span className="font-medium">Week:</span>
            <Select
              value={currentWeek}
              onChange={setCurrentWeek}
              style={{ width: 200 }}
              options={weekOptions}
            />
          </div>
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

            {/* Create new schedule button */}
            {renderCreateButton()}
          </div>
        </div>

        {/* View Selector, Subject Selector and Date Selector */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4">
            {renderViewSelector()}
            {renderSubjectSelector()}
            {renderDateSelector()}
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