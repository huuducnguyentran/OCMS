import React, { useState, useEffect, useRef } from "react";
import { Table, Spin, Empty, message, Select, Tag, Button, Alert } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserSwitchOutlined,
  PlusOutlined,
  BookOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";
import { SchedulePageValidationSchema } from '../../../utils/validationSchemas';
const { Option } = Select;

const SchedulePage = () => {
  // State cho instructor filter (chỉ dùng khi TrainingStaff)
  const [selectedInstructor, setSelectedInstructor] = useState('INST-1');
  const location = useLocation();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState(location.state?.viewMode || "all");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [ setSelectedSubjectDetails] = useState(null);
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
  const formatDateShort = SchedulePageValidationSchema.formatDateShort;

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
      const userId = sessionStorage.getItem("role");
      if (userId && userId.startsWith("TS-")) {
        setUserRole("TrainingStaff");
      } else {
        setUserRole("Trainee");
      }
    }
  }, [navigate]);

  // Fetch instructor list nếu là TrainingStaff
  useEffect(() => {
    const fetchInstructors = async () => {
      if (userRole === "TrainingStaff" || userRole === "Training staff") {
        try {
          const token = sessionStorage.getItem("token");
          const response = await trainingScheduleService.getAllInstructors(token);
          if (response && Array.isArray(response)) {
            setInstructorList(response);
          } else if (response && response.data && Array.isArray(response.data)) {
            setInstructorList(response.data);
          } else {
            setInstructorList([]);
          }
        } catch (error) {
          setInstructorList([]);
        }
      }
    };
    fetchInstructors();
  }, [userRole]);

  // Fetch schedule data based on user role
  useEffect(() => {
    if (userRole) {
      fetchScheduleData();
    }
  }, [userRole, viewMode]);

  // Fetch subjects list
  // useEffect(() => {
  //   const fetchSubjects = async () => {
  //     try {
  //       setLoading(true);
  //       console.log("Fetching subjects from API...");

  //       let response;
  //       if (userRole === "Instructor") {
  //         response = await trainingScheduleService.getInstructorSubjects();
  //         console.log("Instructor subjects response:", response);
          
  //         if (response && response.data) {
  //           const subjects = response.data.map(subject => ({
  //             subjectId: subject.subjectId,
  //             subjectName: subject.subjectName,
  //             courseId: subject.courseId,
  //             schedules: subject.schedules || []
  //           }));
            
  //         setSubjects(subjects);
  //         setSubjectOptions(subjects);
            
  //           // Process schedules
  //           if (response.schedules && Array.isArray(response.schedules)) {
  //             setScheduleData(response.schedules);
  //           }
  //         }
  //       } else if (userRole === "Trainee") {
  //         response = await trainingScheduleService.getTraineeSubjects();
  //         // Process trainee data...
  //       } else if (userRole === "TrainingStaff") {
  //         response = await trainingScheduleService.getAllSubjects();
  //       }

  //       if (!response || (!response.data && !response.schedules)) {
  //         console.warn("No subjects returned or invalid format");
  //         setSubjects([]);
  //         setScheduleData([]);
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch subjects:", error);
  //         message.error("Không thể tải danh sách môn học");
  //       setSubjects([]);
  //       setScheduleData([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (userRole) {
  //   fetchSubjects();
  //   }
  // }, [userRole]);

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
          console.log("Instructor schedule response:", response);
          
          // Xử lý dữ liệu cho instructor
          if (response && response.data && Array.isArray(response.data)) {
            const allSchedules = [];
            response.data.forEach(subject => {
              if (subject.schedules && Array.isArray(subject.schedules)) {
                const schedulesWithSubjectInfo = subject.schedules.map(schedule => ({
                  ...schedule,
                  subjectId: subject.subjectId,
                  subjectName: subject.subjectName,
                  courseId: subject.courseId
                }));
                allSchedules.push(...schedulesWithSubjectInfo);
              }
            });
            console.log("Processed instructor schedules:", allSchedules);
            setScheduleData(allSchedules);
            return;
          }
        } else if (userRole === "Trainee") {
          response = await trainingScheduleService.getTraineeSubjects();
          // Lọc dữ liệu chỉ lấy subject có schedules status 'Incoming' và không rỗng
          if (response && response.data && Array.isArray(response.data)) {
            const filteredSubjects = response.data
              .map(subject => ({
                ...subject,
                schedules: (subject.schedules || []).filter(sch => sch.status === "Incoming")
              }))
              .filter(subject => subject.schedules.length > 0);
            setSubjects(filteredSubjects);
            // Gộp tất cả schedules lại để hiển thị
            setScheduleData(filteredSubjects.flatMap(subject =>
              subject.schedules
                .filter(schedule => schedule.status === "Incoming")
                .map(schedule => ({
                  ...schedule,
                  subjectID: subject.subjectId,
                  subjectName: subject.subjectName
                }))
            ));
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
          const schedulesWithSpecialty = await Promise.all(
            response.data.map(async (schedule) => {
              try {
                const instructorDetails = await trainingScheduleService.getInstructorDetails(schedule.instructorID);
                return {
                  ...schedule,
                  instructorSpecialtyId: instructorDetails?.specialtyId
                };
              } catch (error) {
                console.error("Error fetching instructor details:", error);
                return schedule;
              }
            })
          );
          response.data = schedulesWithSpecialty;
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
  const formatTime = SchedulePageValidationSchema.formatTime;

  // Generate dates for current week based on selected week
  const generateWeekDates = (weekString) => {
    // If week string is not set, use current date
    if (!weekString) {
      const today = new Date();
      const dayOfWeek = today.getDay(); // Sẽ trả về 0 cho Sunday, 1 cho Monday,...
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek); // Lùi về Sunday
      
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
    
    // Create date for Sunday of selected week
    const startDate = new Date(currentYear, startMonth - 1, startDay);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek); // Điều chỉnh về Sunday
    
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

  const checkScheduleConflict = (schedule1, schedule2) => {
    // Kiểm tra trùng thời gian
    if (schedule1.classTime !== schedule2.classTime) return false;
    
    // Kiểm tra trùng ngày
    const days1 = parseDaysOfWeek(schedule1.daysOfWeek);
    const days2 = parseDaysOfWeek(schedule2.daysOfWeek);
    
    return days1.some(day => days2.includes(day));
  };

  // Lấy danh sách unique instructor từ scheduleData
  const getInstructorOptions = () => {
    const map = new Map();
    scheduleData.forEach(item => {
      if (item.instructorID && !map.has(item.instructorID)) {
        map.set(item.instructorID, true);
      }
    });
    return Array.from(map.keys());
  };

  // Process schedule data into time slots
  const processScheduleData = () => {
    // Lọc lịch theo instructor nếu chọn
    let filteredData = scheduleData;
    if ((userRole === "TrainingStaff" || userRole === "Training staff") && selectedInstructor && selectedInstructor !== 'all') {
      filteredData = scheduleData.filter(sch => sch.instructorID === selectedInstructor);
    }
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      return [];
    }

    // Get all unique time slots and format them
    const uniqueTimeSlots = [...new Set(filteredData.map((item) => item.classTime))]
      .sort()
      .map(timeSlot => {
        const schedule = filteredData.find(s => s.classTime === timeSlot);
        
        // Xử lý thời gian kết thúc dựa trên subjectPeriod
        const [startHour, startMinute] = timeSlot.split(':').map(Number);
        
        // Chuyển đổi subjectPeriod từ "HH:mm:ss" sang số phút
        let durationInMinutes = 0;
        if (schedule.subjectPeriod) {
          const [periodHour, periodMinute] = schedule.subjectPeriod.split(':').map(Number);
          durationInMinutes = (periodHour * 60) + periodMinute;
        }

        // Tính toán thời gian kết thúc
        let endMinutes = startMinute + durationInMinutes;
        let endHour = startHour + Math.floor(endMinutes / 60);
        endMinutes = endMinutes % 60;

        // Định dạng thời gian kết thúc
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
        
        return {
          start: timeSlot,
          end: endTime,
          display: `${timeSlot} - ${endTime}`
        };
      });
    
    // Generate dates for the current/selected week
    const weekDates = generateWeekDates(currentWeek);

    return uniqueTimeSlots.map((timeSlot, timeIndex) => {
      const row = {
        key: `timeslot-${timeIndex}-${timeSlot.start}`,
        timeFrame: timeSlot.display,
      };

      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];

      // For each day of the week
      daysOfWeek.forEach((day, dayIndex) => {
        const currentDate = weekDates[dayIndex];
        
        // Find schedules for this time slot and day
        const matchingSchedules = filteredData.filter((schedule) => {
          const scheduleDays = parseDaysOfWeek(schedule.daysOfWeek);
          return (
            schedule.classTime === timeSlot.start &&
            scheduleDays.includes(day) &&
            isCourseActiveOnDate(schedule, currentDate) &&
            ((userRole !== "Trainee" && userRole !== "Instructor") || schedule.status === "Incoming")
          );
        });

        if (matchingSchedules.length > 1) {
          console.warn(`Warning: Multiple schedules found for ${day} at ${timeSlot.display}`);
          message.warning(`Phát hiện lịch học trùng vào ${day} lúc ${timeSlot.display}`);
          
          row[day] = (
            <div className="conflict-warning">
              <Alert
                type="warning"
                message="Lịch học trùng"
                description={
                  <div>
                    {matchingSchedules.map(schedule => (
                      <div key={schedule.scheduleID}>
                        {schedule.subjectName} - Room: {schedule.room}
                      </div>
                    ))}
                  </div>
                }
              />
            </div>
          );
        } else if (matchingSchedules.length === 1) {
          const schedule = matchingSchedules[0];
          row[day] = (
            <div
              key={`schedule-${schedule.scheduleID}`}
              onClick={() => navigate(`/course/${schedule.scheduleID}`)}
              className="space-y-2"
              schedule={schedule}
            >
              <div className="font-semibold text-blue-600 hover:text-blue-700">
                {schedule.subjectName}
              </div>
              
              <div className="text-xs font-medium text-indigo-600 bg-indigo-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-indigo-500" />
                  <span>Time: {timeSlot.display}</span>
                </div>
                {schedule.subjectPeriod && (
                  <div className="flex items-center gap-2 mt-1">
                    <ClockCircleOutlined className="text-indigo-500" />
                    <span>Duration: {schedule.subjectPeriod.substring(0, 5)} hours</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                <div>{schedule.room || "N/A"}</div>
                <div>{schedule.location || "N/A"}</div>
                {schedule.courseId && <div>Course: {schedule.courseId}</div>}
                {userRole === "TrainingStaff" && (
                  <div className="flex items-center gap-2">
                    <UserSwitchOutlined className="text-gray-400" />
                    <span>
                      Instructor: {schedule.instructorID}
                      {schedule.instructorSpecialtyId && ` (${schedule.instructorSpecialtyId})`}
                    </span>
                  </div>
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
        width: 180, // Tăng độ rộng để hiển thị đủ thời gian
        render: (text) => (
          <div className="font-medium text-gray-700 bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-indigo-500" />
              <span>{text}</span>
            </div>
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
                className="relative bg-white hover:bg-blue-50 p-4 rounded-xl shadow-sm 
                         border border-blue-100 transition-all duration-300
                           hover:shadow-md cursor-pointer group"
              >
                {/* Active Indicator */}
                {content.props && content.props.schedule && 
                 isCourseActiveOnDate(content.props.schedule, new Date()) && (
                  <div className="absolute -top-1 -right-1">
                    <div className="relative">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="absolute top-0 right-0">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="space-y-3">
                  {/* Subject Name with Icon */}
                  <div className="font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-2">
                    <BookOutlined className="text-lg" />
                    <span>{content.props?.children[0]?.props?.children || "N/A"}</span>
                  </div>

                  {/* Date Range with Icons */}
                  <div className="text-xs font-medium text-indigo-600 bg-indigo-50 p-2 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarOutlined className="text-indigo-500" />
                      <span>Room: {content.props?.children[2]?.props?.children[0]?.props?.children}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-indigo-500" />
                      <span>Location: {content.props?.children[2]?.props?.children[1]?.props?.children}</span>
                    </div>
                  </div>
                  
                  {/* Additional Details */}
                  <div className="text-sm text-gray-500 space-y-1">
                    {content.props?.children[4]?.props?.children[2] && (
                      <div className="flex items-center gap-2">
                        <TagOutlined className="text-gray-400" />
                        <span>Course: {content.props?.children[4]?.props?.children[2]?.props?.children[1]}</span>
                      </div>
                    )}
                    {content.props?.children[4]?.props?.children[3] && (
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-gray-400" />
                        <span>{content.props.children[4].props.children[3].props.children}</span>
                      </div>
                    )}
                    {userRole === "TrainingStaff" && content.props?.children[4]?.props?.children[4] && (
                      <div className="flex items-center gap-2">
                        <UserSwitchOutlined className="text-gray-400" />
                        <span>{content.props.children[4].props.children[4].props.children}</span>
                      </div>
                    )}
                    {userRole === "TrainingStaff" && content.props?.children[4]?.props?.children[5] && (
                      <div className="flex items-center gap-2">
                        {content.props.children[4].props.children[5].props.children}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                <ClockCircleOutlined className="text-2xl mb-2" />
                <div>No Class</div>
              </div>
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
  };

  // Instructor Filter chỉ hiển thị cho TrainingStaff


  const renderInstructorFilter = () => {
    if (userRole === "TrainingStaff" || userRole === "Training staff") {
      const instructorOptions = getInstructorOptions();
      return (
        <div className="mb-4">
          <label className="mr-2 font-medium">Instructor:</label>
          <Select
            style={{ width: 220 }}
            value={selectedInstructor}
            onChange={setSelectedInstructor}
            allowClear={false}
          >
            {instructorOptions.map(instId => (
              <Option key={instId} value={instId}>{instId}</Option>
            ))}
          </Select>
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
  // Render subject selector
  const renderSubjectSelector = () => {
    // Search function with setTimeout
    const handleSearch = (value) => {
      if (!value || value.length < 2) {
        // Nếu không có search term, hiển thị tất cả subjects của trainee
        setSubjectOptions(subjects);
        return;
      }

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
          const filtered = subjects.filter((subject) => {
            const searchValue = value.toLowerCase();
            return (
              subject.subjectName.toLowerCase().includes(searchValue) ||
              subject.courseId?.toLowerCase().includes(searchValue) ||
              subject.subjectId?.toLowerCase().includes(searchValue)
            );
          });

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
  };

  // Render year and week selector
  const renderDateSelector = () => {
    return (
      <div className="mb-6 bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <CalendarOutlined className="text-xl text-indigo-600" />
            </div>
            <span className="text-lg font-semibold text-gray-700">Select Period</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Year selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Academic Year</label>
            <Select
              value={currentYear}
              onChange={(value) => {
                setCurrentYear(value);
                generateWeekOptions(value);
              }}
                size="large"
                className="w-full"
                dropdownClassName="custom-dropdown"
            >
              {[2023, 2024, 2025, 2026].map((year) => (
                <Option key={year} value={year}>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-indigo-600" />
                      <span>{year}</span>
                    </div>
                </Option>
              ))}
            </Select>
          </div>
          
          {/* Week selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Week Period</label>
            <Select
              value={currentWeek}
              onChange={setCurrentWeek}
                size="large"
                className="w-full"
                dropdownClassName="custom-dropdown"
              >
                {weekOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-indigo-600" />
                      <span>{option.label}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const validateNewSchedule = async (values) => {
    try {
      const response = await trainingScheduleService.checkScheduleConflict({
        classTime: values.classTime,
        daysOfWeek: values.daysOfWeek,
        startDate: values.startDate,
        endDate: values.endDate
      });
      
      if (response.hasConflict) {
        throw new Error('Thời gian này đã có lịch học khác!');
      }
    } catch (error) {
      message.error(error.message);
      return false;
    }
    return true;
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
            {/* Instructor Dropdown for TrainingStaff */}
            {(userRole === "TrainingStaff" || userRole === "Training staff") && (
              <div className="mb-4" style={{ maxWidth: 300 }}>
                <label className="mr-2 font-medium">Instructor:</label>
                <Select
                  style={{ width: '100%' }}
                  value={selectedInstructor}
                  onChange={setSelectedInstructor}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  optionFilterProp="children"
                >
                   {Array.from(new Set(scheduleData.map(item => item.instructorID)))
                    .filter(Boolean)
                    .map(instId => (
                      <Option key={instId} value={instId}>{instId}</Option>
                    ))}
                </Select>
              </div>
            )}

          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="relative">
              <Spin size="large" />
                <div className="absolute -top-2 -right-2">
                  <div className="animate-ping w-3 h-3 bg-indigo-400 rounded-full"></div>
                </div>
              </div>
              <span className="text-gray-500 animate-pulse font-medium">Loading your schedule...</span>
            </div>
          ) : scheduleData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="p-6 bg-indigo-50 rounded-full animate-pulse">
                <CalendarOutlined className="text-5xl text-indigo-400" />
              </div>
              <Empty 
                description={
                  <div className="space-y-3">
                    <p className="text-gray-700 font-semibold text-lg">No Schedule Found</p>
                    <p className="text-gray-500 text-sm max-w-md text-center">
                      Select a subject or time period to view your training schedule
                    </p>
                  </div>
                }
              />
              {renderCreateButton()}
            </div>
          ) : (
            <div className="space-y-6">
            <Table
              dataSource={processScheduleData()}
              columns={columns}
                bordered={false}
              scroll={{ x: "max-content" }}
              pagination={false}
              className="custom-schedule-table"
                rowClassName="hover:bg-blue-50/50 transition-colors duration-200"
                components={{
                  header: {
                    cell: ({ children, ...restProps }) => (
                      <th
                        {...restProps}
                        className="bg-gradient-to-br from-indigo-50 to-blue-50 
                                   text-indigo-700 font-semibold py-4 px-6 
                                   first:rounded-tl-xl last:rounded-tr-xl
                                   border-b border-indigo-100 whitespace-nowrap"
                      >
                        {children}
                      </th>
                    ),
                  },
                  body: {
                    cell: ({ children, ...restProps }) => (
                      <td
                        {...restProps}
                        className="p-4 border-b border-gray-100 
                                   group-hover:bg-blue-50/30 transition-colors duration-200"
                      >
                        {children}
                      </td>
                    ),
                    row: ({ children, ...restProps }) => (
                      <tr {...restProps} className="group">
                        {children}
                      </tr>
                    ),
                  },
                }}
              />
              
              {/* Status and Legend Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Legend */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700 flex items-center gap-2">
                    <TagsOutlined className="text-indigo-600" />
                    Schedule Status
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="absolute -top-1 -right-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600">Active Class</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span className="text-sm text-gray-600">No Class</span>
                    </div>
                    {userRole === "TrainingStaff" && (
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm text-gray-600">Pending Schedule</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <InfoCircleOutlined className="text-blue-600 text-lg" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-blue-700">Schedule Information</h4>
                      <p className="text-sm text-blue-600/90">
                        Click on any class card to view detailed information. Active classes are highlighted 
                        with a green indicator.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Classes Summary */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleOutlined className="text-green-600 text-lg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-green-700">Active Classes</h4>
                      <div className="px-2 py-0.5 bg-green-100 rounded text-sm text-green-700">
                        {scheduleData.filter(schedule => 
                          isCourseActiveOnDate(schedule, new Date())
                        ).length} Classes
                      </div>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      You have active classes scheduled for this week. Click on any class for more details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;