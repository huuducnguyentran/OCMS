import { useState, useEffect, useRef } from "react";
import {
  Table,
  Spin,
  Empty,
  message,
  Select,
  Button,
  Tag,
  Tooltip,
  Popconfirm,
} from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserSwitchOutlined,
  BookOutlined,
  InfoCircleOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";
import { SchedulePageValidationSchema } from "../../../utils/validationSchemas";
const { Option } = Select;

const SchedulePage = () => {
  // State cho instructor filter (chỉ dùng khi TrainingStaff)
  const [selectedInstructor, setSelectedInstructor] = useState("INST-1");
  const location = useLocation();
  const navigate = useNavigate();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [viewMode, setViewMode] = useState(location.state?.viewMode || "all");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  // const [setSelectedSubjectDetails] = useState(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentWeek, setCurrentWeek] = useState(null);
  const [weekOptions, setWeekOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectOptions, setSubjectOptions] = useState([]);
  // const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const [columns, setColumns] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Helper function to add minutes to a time string (format: HH:mm)
  const addMinutesToTime = (timeStr, durationStr) => {
  try {
      const [startHours, startMinutes] = timeStr.split(":" ).map(Number);
      const [durHours, durMinutes, durSeconds = 0] = durationStr.split(":" ).map(Number);

      const startDate = new Date();
      startDate.setHours(startHours);
      startDate.setMinutes(startMinutes);
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);

      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + durHours);
      endDate.setMinutes(startDate.getMinutes() + durMinutes);
      endDate.setSeconds(startDate.getSeconds() + durSeconds);

      const endHours = endDate.getHours();
      const endMinutes = endDate.getMinutes();

      return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    } catch (error) {
      console.error("Error in addMinutesToTime:", error);
      return timeStr;
    }
  };



  const [error, setError] = useState(null);

  // Initialize current week and generate week options when component mounts
 
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    generateWeekOptions(year);

    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(now.getDate() + diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    setCurrentYear(year);
    setCurrentWeek(`${formatDateShort(startOfWeek)} To ${formatDateShort(endOfWeek)}`);
  }, []);


  // Generate week options for dropdown
  const generateWeekOptions = (year) => {
    const options = [];
    for (let week = 1; week <= 52; week++) {
      const weekDates = getWeekDates(week, year);
      options.push({
        value: `${formatDateShort(weekDates.start)} To ${formatDateShort(
          weekDates.end
        )}`,
        label: `${formatDateShort(weekDates.start)} To ${formatDateShort(
          weekDates.end
        )}`,
        weekNumber: week,
      });
    }
    setWeekOptions(options);
  };

  // Get start and end dates for a specific week in a year
  const getWeekDates = (weekNumber, year) => {
    try {
      // Ensure valid inputs
      const validYear = parseInt(year);
      const validWeek = parseInt(weekNumber);

      if (
        isNaN(validYear) ||
        isNaN(validWeek) ||
        validWeek < 1 ||
        validWeek > 53
      ) {
        console.error(`Invalid week or year: week=${weekNumber}, year=${year}`);
        // Return a default week range
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return { start: startDate, end: endDate };
      }

      const startOfYear = new Date(validYear, 0, 1);
      const daysOffset =
        (startOfYear.getDay() > 0 ? 7 - startOfYear.getDay() : 0) +
        (validWeek - 1) * 7;
      const startDate = new Date(validYear, 0, 1 + daysOffset);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      return { start: startDate, end: endDate };
    } catch (error) {
      console.error("Error calculating week dates:", error);
      // Return a default week range
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay());
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return { start: startDate, end: endDate };
    }
  };

  // Format date as DD/MM
  const formatDateShort = SchedulePageValidationSchema.formatDateShort;

  // Check token and determine user role
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const userId = sessionStorage.getItem("userId");

    if (!token) {
      message.error("Session expired, please login again");
      navigate("/login");
      return;
    }

    console.log("Current user info:", { role, userId }); // Thêm log để debug
    setUserRole(role);
  }, [navigate]);

  // Fetch instructor list nếu là TrainingStaff
  useEffect(() => {
    const fetchInstructors = async () => {
      if (userRole === "TrainingStaff" || userRole === "Training staff") {
        try {
          // Thay vì gọi getAllInstructors, lấy danh sách instructors từ scheduleData
          const uniqueInstructors = Array.from(
            new Set(scheduleData.map((item) => item.instructorName))
          ).filter(Boolean);

          if (uniqueInstructors.length > 0) {
            setSelectedInstructor(uniqueInstructors[0]); // Set default instructor
          }
        } catch (error) {
          console.error("Error getting instructors:", error);
          message.error("Failed to load instructor list");
        }
      }
    };
    fetchInstructors();
  }, [userRole, scheduleData]);

  // Fetch schedule data based on user role
  useEffect(() => {
    if (userRole) {
      fetchScheduleData();
    }
  }, [userRole, viewMode]);

  // Update table when year changes or when scheduleData updates
  useEffect(() => {
    const updateTable = () => {
      try {
        console.log(`Processing data for year: ${currentYear}`);
        setColumns(generateColumns());
        const processedData = processScheduleData();
        setTableData(Array.isArray(processedData) ? processedData : []);
      } catch (error) {
        console.error("Error updating table:", error);
        setTableData([]);
      }
    };

    updateTable();
  }, [currentYear, scheduleData]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("token");
      if (!token) {
        message.error("Session expired");
        navigate("/login");
        return;
      }

      let response;
      let schedules = [];

      if (userRole === "Instructor") {
        response = await trainingScheduleService.getInstructorSubjects();
        console.log("Instructor schedule response:", response);
      } else if (userRole === "Trainee") {
        response = await trainingScheduleService.getTraineeSubjects();
      } else if (
        userRole === "TrainingStaff" ||
        userRole === "Training staff"
      ) {
        response = await trainingScheduleService.getAllTrainingSchedules();
      }

      if (response?.schedules) {
        schedules = response.schedules;

        // Apply filtering only for Instructor or Trainee
        if (userRole === "Instructor" || userRole === "Trainee") {
          schedules = schedules.filter(
            (schedule) =>
              schedule.status !== "Pending" && schedule.status !== "Canceled"
          );
        }

        setScheduleData(schedules);

        if (schedules.length === 0) {
          message.info("No schedule data found");
        }
      } else {
        setScheduleData([]);
        message.info("No schedule data found");
      }

      console.log("Schedule Data after setting:", schedules);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 404:
          message.error("Data not found");
          break;
        case 403:
          message.error("You do not have access");
          break;
        case 401:
          message.error("Session expired");
          navigate("/login");
          break;
        default:
          message.error("An error occurred while loading data");
      }
    } else {
      message.error("Cannot connect to server");
    }
    setScheduleData([]);
    setError(error.message);
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
  // const parseDaysOfWeek = (daysOfWeekString) => {
  //   if (!daysOfWeekString) return [];

  //   console.log("Original days string:", daysOfWeekString);

  //   // Standardize format
  //   const normalized = daysOfWeekString
  //     .replace(/\s+/g, "")
  //     .split(",")
  //     .map((day) => {
  //       // Ensure first letter is capitalized and rest is lowercase
  //       day = day.trim();
  //       return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  //     })
  //     .filter(Boolean);

  //   console.log("Parsed days:", normalized);
  //   return normalized;
  // };

  // Format time from string to display format
  // const formatTime = SchedulePageValidationSchema.formatTime;

  // Generate dates for current week based on selected week
  const generateWeekDates = (weekString) => {
    // Helper function to get default week dates
    const getDefaultWeekDates = () => {
      const today = new Date();
      const monday = new Date(today);
      const day = today.getDay();
      // Adjust to get Monday (adjust 0 (Sunday) to be 6, otherwise subtract 1)
      const daysFromMonday = day === 0 ? 6 : day - 1;
      monday.setDate(today.getDate() - daysFromMonday);

      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        dates.push(date);
      }
      console.log(
        "Generated default week dates:",
        dates.map((d) => d.toDateString())
      );
      return dates;
    };
    if (!weekString) {
      return getDefaultWeekDates();
    }

    try {
      // Parse week string (format: "DD/MM To DD/MM")
      const [startStr] = weekString.split(" To ");
      if (!startStr) {
        console.error("Invalid week string format:", weekString);
        return getDefaultWeekDates();
      }

      const parts = startStr.split("/");
      if (parts.length !== 2) {
        console.error("Invalid date format in week string:", startStr);
        return getDefaultWeekDates();
      }

      const [startDay, startMonth] = parts.map(Number);

      if (
        isNaN(startDay) ||
        isNaN(startMonth) ||
        startMonth < 1 ||
        startMonth > 12 ||
        startDay < 1 ||
        startDay > 31
      ) {
        console.error("Invalid date numbers:", startDay, startMonth);
        return getDefaultWeekDates();
      }

      // Create date for Monday using the current year from state
      const startDate = new Date(currentYear, startMonth - 1, startDay);

      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.error("Invalid date created:", startDate);
        return getDefaultWeekDates();
      }

      console.log(
        "Start date from string:",
        startDate.toDateString(),
        "(Year:",
        currentYear,
        ")"
      );

      // Generate dates for the week
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
      }

      console.log(
        `Generated week dates for ${currentYear}:`,
        dates.map((d) => d.toDateString())
      );
      return dates;
    } catch (error) {
      console.error("Error in generateWeekDates:", error);
      return getDefaultWeekDates();
    }
  };

  // Get formatted date string (DD/MM)
  const getFormattedDate = (date) => {
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}`;
  };

  // Check if a course is active on a specific date
  const isCourseActiveOnDate = (schedule, date) => {
  //   if (!schedule?.startDateTime || !schedule?.endDateTime) {
  //     console.log("Schedule missing date range:", schedule);
  //     return false;
  //   }

  //   try {
  //     // Format dates consistently
  //     const startDate = new Date(schedule.startDateTime);
  //     const endDate = new Date(schedule.endDateTime);
  //     const checkDate = new Date(date);

  //     // Validate dates
  //     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || isNaN(checkDate.getTime())) {
  //       console.error("Invalid date in schedule:", { startDate, endDate, checkDate });
  //       return false;
  //     }

  //     // Reset time components for accurate date comparison
  //     startDate.setHours(0, 0, 0, 0);
  //     endDate.setHours(23, 59, 59, 999);
  //     checkDate.setHours(12, 0, 0, 0);

  //     const isActive = checkDate >= startDate && checkDate <= endDate;
      
  //     // Only log if debugging is needed - too verbose for production
  //     if (process.env.NODE_ENV === 'development') {
  //       console.log(
  //         `Date check for ${schedule.subjectName || 'unknown'}: ${checkDate.toDateString()} is ` +
  //         `${isActive ? 'within' : 'outside'} range ${startDate.toDateString()} - ${endDate.toDateString()}`
  //       );
  //     }
      
  //     return isActive;
  //   } catch (error) {
  //     console.error('Error checking course active date:', error, 'Schedule:', schedule);
  //     return false;
  //   }
  // };
   if (!schedule?.startDateTime || !schedule?.endDateTime) return false;
    try {
      const startDate = new Date(schedule.startDateTime);
      const endDate = new Date(schedule.endDateTime);
      const checkDate = new Date(date);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      checkDate.setHours(12, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    } catch (error) {
      console.error("Error checking course active date:", error);
      return false;
    }
  };

  // Process schedule data into time slots
  const processScheduleData = () => {
    console.log(
      "Processing schedule data. Total items:",
      scheduleData?.length || 0
    );

    // If no schedule data, return empty array
    if (!Array.isArray(scheduleData) || scheduleData.length === 0) {
      console.log("No schedule data available");
      return [];
    }

    // Filter data based on the selected year
    let filteredData = [];
    try {
      filteredData = scheduleData.filter((schedule) => {
        try {
          if (!schedule?.startDateTime) return false;

          // Parse the start date
          const startDate = new Date(schedule.startDateTime);
          if (isNaN(startDate.getTime())) {
            console.warn(
              "Invalid start date in schedule:",
              schedule.startDateTime,
              schedule
            );
            return false;
          }

          // Get the year from the start date
          const scheduleYear = startDate.getFullYear();

          // Also check if the schedule is active in the current week
          const weekDates = generateWeekDates(currentWeek);
          const isActiveInCurrentWeek = weekDates.some((date) =>
            isCourseActiveOnDate(schedule, date)
          );

          return scheduleYear === currentYear && isActiveInCurrentWeek;
        } catch (error) {
          console.error("Error processing schedule item:", error, schedule);
          return false;
        }
      });
    } catch (error) {
      console.error("Error filtering schedule data by year:", error);
      return [];
    }

    console.log(`Filtered data for year ${currentYear}:`, filteredData.length);

    // If no data for selected year, return empty array
    if (filteredData.length === 0) {
      console.log(
        `No schedule data available for year ${currentYear} in the current week`
      );
      return [];
    }

    // Filter by instructor if user is Training Staff
    if (
      (userRole === "TrainingStaff" || userRole === "Training staff") &&
      selectedInstructor
    ) {
      filteredData = filteredData.filter(
        (sch) => sch.instructorName === selectedInstructor
      );
    }

    if (filteredData.length === 0) {
      console.log("No schedule data to process after filtering");
      return [];
    }

    // Get unique time slots
    const uniqueTimeSlots = [
      ...new Set(filteredData.map((item) => item.classTime).filter(Boolean)),
    ]
      .map((time) => time.substring(0, 5))
      .sort();

    console.log("Unique time slots:", uniqueTimeSlots);

    // return uniqueTimeSlots.map((timeSlot, timeIndex) => {
    //   const row = {
    //     key: `timeslot-${timeIndex}`,
    //     timeFrame: `${timeSlot} - ${addMinutesToTime(timeSlot, 90)}`,
    //   };
   return uniqueTimeSlots.map((timeSlot, timeIndex) => {
    const matchingEntry = filteredData
  .filter(i => i.classTime?.substring(0, 5) === timeSlot && i.subjectPeriod)
  .sort((a, b) => {
    const toMinutes = (str) => {
      const [h, m, s = 0] = str.split(":" ).map(Number);
      return h * 60 + m + s / 60;
    };
    return toMinutes(b.subjectPeriod) - toMinutes(a.subjectPeriod);
  })[0];

      const timeFrame = matchingEntry?.subjectPeriod && matchingEntry?.classTime
        ? `${matchingEntry.classTime.substring(0, 5)} - ${addMinutesToTime(matchingEntry.classTime.substring(0, 5), matchingEntry.subjectPeriod)}`
        : `${timeSlot} - ${timeSlot}`;

      const row = {
        key: `timeslot-${timeIndex}`,
        timeFrame,
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

      // Get the dates for the current week
      let weekDates;
      try {
        weekDates = generateWeekDates(currentWeek);
      } catch (error) {
        console.error("Error generating week dates:", error);
        weekDates = getDefaultWeekDates();
      }

      daysOfWeek.forEach((day, dayIndex) => {
        // Get the date for this day in the current week
        const currentWeekDate = weekDates[dayIndex];

        const matchingSchedules = filteredData.filter((schedule) => {
          // Check if schedule time matches
          const scheduleTime = schedule.classTime
            ? schedule.classTime.substring(0, 5)
            : "";

          // Check if day of week matches
          const scheduleDays = schedule.daysOfWeek
            ? schedule.daysOfWeek.split(",").map((d) => d.trim())
            : [];

          // Check if the current date falls within the schedule's start and end dates
          const isWithinDateRange = isCourseActiveOnDate(
            schedule,
            currentWeekDate
          );

          return (
            scheduleDays.includes(day) &&
            scheduleTime === timeSlot &&
            isWithinDateRange
          );
        });

        if (matchingSchedules.length > 0) {
          const schedule = matchingSchedules[0];

          // Check if today's date is within the schedule's date range
          const currentDate = new Date();
          const startDate = new Date(schedule.startDateTime);
          const endDate = new Date(schedule.endDateTime);
          const isActive = currentDate >= startDate && currentDate <= endDate;

          row[day] = (
            <div
              key={`schedule-${schedule.scheduleID}`}
              onClick={() =>
                navigate(`/classSubject/${schedule.classSubjectId}`)
              }
              className="group cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
            >
              <div
                className={`p-4 rounded-xl border transition-all duration-300 
                ${
                  isActive
                    ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                    : "border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50"
                } 
                hover:shadow-lg hover:border-green-300`}
              >
                {/* Status Badge */}
                <div className="flex justify-between items-center mb-2">
                  <Tag
                    className={`px-2 py-1 border-0 font-medium 
                      ${
                        schedule.status === "Completed"
                          ? "!bg-blue-100 !text-blue-700"
                          : schedule.status === "Incoming"
                          ? "!bg-yellow-100 !text-yellow-700"
                          : schedule.status === "Pending"
                          ? "!bg-orange-100 !text-orange-700"
                          : "!bg-gray-100 !text-gray-700"
                      }`}
                  >
                    {schedule.status}
                  </Tag>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {getCardActions(schedule)}
                    <Tooltip title="View Subject Details">
                      <BookOutlined className="!text-cyan-500" />
                    </Tooltip>
                  </div>
                </div>

                {/* Subject Name */}
                <div className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                  {schedule.subjectName}
                </div>

                {/* Schedule Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <ClockCircleOutlined className="text-gray-400" />
                    <span>{timeSlot}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOutlined className="text-gray-400" />
                    <span>Room {schedule.roomName}</span>
                  </div>

                  {userRole !== "Instructor" && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <UserSwitchOutlined className="text-gray-400" />
                      <span>{schedule.instructorName}</span>
                    </div>
                  )}

                  <Tooltip title={schedule.location}>
                    <div className="flex items-center gap-2 text-gray-600">
                      <EnvironmentOutlined className="text-gray-400" />
                      <span className="truncate">{schedule.locationName}</span>
                    </div>
                  </Tooltip>
                </div>
                <div className="h-1 w-0 group-hover:w-full bg-cyan-500 mt-3 transition-all duration-300 rounded-full"></div>
              </div>
            </div>
          );
        } else {
          row[day] = (
            <div
              key={`empty-${day}-${timeIndex}`}
              className="h-full flex items-center justify-center"
            >
              <div
                className="text-center text-gray-400 p-4 bg-gray-50/50 rounded-xl border border-gray-100 
                hover:bg-gray-100/50 transition-colors"
              >
                <ClockCircleOutlined className="text-2xl mb-2" />
                <div>No Class</div>
              </div>
            </div>
          );
        }
      });

      return row;
    });
  };

  // Generate column headers with dates
  const generateColumns = () => {
    let weekDates;
    try {
      weekDates = generateWeekDates(currentWeek);
    } catch (error) {
      console.error("Error generating week dates for columns:", error);
      weekDates = getDefaultWeekDates();
    }

    const columns = [
      {
        title: "Time",
        dataIndex: "timeFrame",
        key: "timeFrame",
        width: 150,
        fixed: "left",
      },
      ...[
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].map((day, index) => ({
        title: (
          <div>
            <div>{day}</div>
            <div className="text-xs text-gray-500">
              {weekDates[index] ? getFormattedDate(weekDates[index]) : ""}
            </div>
          </div>
        ),
        dataIndex: day,
        key: day,
        width: 200,
      })),
    ];

    return columns;
  };

  // Get default week dates (current week)
  const getDefaultWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    const day = today.getDay();
    // Adjust to get Monday (adjust 0 (Sunday) to be 6, otherwise subtract 1)
    const daysFromMonday = day === 0 ? 6 : day - 1;
    monday.setDate(today.getDate() - daysFromMonday);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Update columns when currentWeek or scheduleData changes
  useEffect(() => {
    try {
      setColumns(generateColumns());
      // Also regenerate the table data when week changes
      if (scheduleData.length > 0) {
        const tableData = processScheduleData();
        tableData(tableData);
      }
    } catch (error) {
      console.error("Error updating columns:", error);
    }
  }, [currentWeek, scheduleData]);

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
              <Option value="created">Created Schedule</Option>
              <Option value="instructor">Instructor View</Option>
              <Option value="trainee">Trainee View</Option>
            </Select>
          </div>
        </div>
      );
    }
  };

  // Instructor Filter chỉ hiển thị cho TrainingStaff

  // const renderInstructorFilter = () => {
  //   if (userRole === "TrainingStaff" || userRole === "Training staff") {
  //     // Lấy danh sách unique instructors với cả ID và Name
  //     const instructorOptions = Array.from(
  //       new Set(
  //         scheduleData.map((item) => ({
  //           id: item.instructorID,
  //           name: item.instructorName,
  //         }))
  //       ),
  //       (instructor) => JSON.stringify(instructor)
  //     )
  //       .map((str) => JSON.parse(str))
  //       .filter((instructor) => instructor.id && instructor.name);

  //     return (
  //       <div className="mb-4" style={{ maxWidth: 300 }}>
  //         <label className="mr-2 font-medium">Instructor:</label>
  //         <Select
  //           style={{ width: "100%" }}
  //           value={selectedInstructor}
  //           onChange={setSelectedInstructor}
  //           dropdownMatchSelectWidth={false}
  //           showSearch
  //           optionFilterProp="children"
  //         >
  //           {instructorOptions.map((instructor) => (
  //             <Option key={instructor.id} value={instructor.id}>
  //               {instructor.name} ({instructor.id})
  //             </Option>
  //           ))}
  //         </Select>
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  // Handle navigation to create schedule page
  // const handleCreateSchedule = () => {
  //   navigate("/schedule/create");
  // };

  // Render create button (only for Training Staff)
  // const renderCreateButton = () => {
  //   if (userRole === "TrainingStaff" || userRole === "Training staff") {
  //     return (
  //       <Button
  //         type="primary"
  //         icon={<PlusOutlined />}
  //         onClick={handleCreateSchedule}
  //         className="bg-green-600 hover:bg-green-700"
  //         size="large"
  //       >
  //         Create Schedule
  //       </Button>
  //     );
  //   }
  //   return null;
  // };

  // Handle subject change
  // Render subject selector
  const renderSubjectSelector = () => {
    // Search function with setTimeout
    // const handleSearch = (value) => {
    //   if (!value || value.length < 2) {
    //     // Nếu không có search term, hiển thị tất cả subjects của trainee
    //     setSubjectOptions(subjects);
    //     return;
    //   }

    //   // Clear previous timeout if exists
    //   if (searchTimeoutRef.current) {
    //     clearTimeout(searchTimeoutRef.current);
    //   }

    //   setSearchLoading(true);
    //   setSearchTerm(value);

    //   // Set new timeout
    //   searchTimeoutRef.current = setTimeout(() => {
    //     try {
    //       // Filter from loaded subjects list
    //       const filtered = subjects.filter((subject) => {
    //         const searchValue = value.toLowerCase();
    //         return (
    //           subject.subjectName.toLowerCase().includes(searchValue) ||
    //           subject.courseId?.toLowerCase().includes(searchValue) ||
    //           subject.subjectId?.toLowerCase().includes(searchValue)
    //         );
    //       });

    //       setSubjectOptions(filtered);
    //     } catch (error) {
    //       console.error("Error searching subjects:", error);
    //     } finally {
    //       setSearchLoading(false);
    //     }
    //   }, 300);
    // };

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
            <div className="p-2 bg-cyan-100 rounded-lg">
              <CalendarOutlined className="text-xl !text-cyan-600" />
            </div>
            <span className="text-lg font-semibold text-cyan-700">
              Select Period
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Academic Year
              </label>
              <Select
                value={currentYear}
                onChange={(value) => {
                  try {
                    console.log(`Changing year to: ${value}`);
                    setCurrentYear(value);
                    generateWeekOptions(value);

                    // When year changes, update the current week for that year
                    // Use a safe date in the middle of the year
                    const newDate = new Date(value, 5, 15); // June 15 of selected year
                    const startOfYear = new Date(value, 0, 1);
                    const weekNumber = Math.ceil(
                      ((newDate - startOfYear) / 86400000 +
                        startOfYear.getDay() +
                        1) /
                        7
                    );

                    console.log(
                      `Calculated week number: ${weekNumber} for year ${value}`
                    );
                    const currentWeekDates = getWeekDates(weekNumber, value);

                    if (
                      currentWeekDates &&
                      currentWeekDates.start &&
                      currentWeekDates.end
                    ) {
                      setCurrentWeek(
                        `${formatDateShort(
                          currentWeekDates.start
                        )} To ${formatDateShort(currentWeekDates.end)}`
                      );
                    } else {
                      console.error("Invalid week dates returned");
                      // Set a default week
                      setCurrentWeek("01/01 To 07/01");
                    }
                  } catch (error) {
                    console.error("Error changing year:", error);
                    // Set a default week
                    setCurrentWeek("01/01 To 07/01");
                  }
                }}
                size="large"
                className="w-full"
                dropdownClassName="custom-dropdown"
              >
                {[2023, 2024, 2025, 2026].map((year) => (
                  <Option key={year} value={year}>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-cyan-600" />
                      <span>{year}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {/* Week selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Week Period
              </label>
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

  // const validateNewSchedule = async (values) => {
  //   try {
  //     const response = await trainingScheduleService.checkScheduleConflict({
  //       classTime: values.classTime,
  //       daysOfWeek: values.daysOfWeek,
  //       startDate: values.startDate,
  //       endDate: values.endDate,
  //     });

  //     if (response.hasConflict) {
  //       throw new Error("This time is already scheduled!");
  //     }
  //   } catch (error) {
  //     message.error(error.message);
  //     return false;
  //   }
  //   return true;
  // };

  // Update the status legend section
  const renderStatusLegend = () => (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-700 flex items-center gap-2">
        <TagsOutlined className="text-indigo-600" />
        Schedule Status
      </h4>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">Approved</span>
        </div>

        {/* Chỉ hiển thị Pending status cho Training Staff */}
        {(userRole === "TrainingStaff" || userRole === "Training staff") && (
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
        )}

        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-600">No Class</span>
        </div>
      </div>
    </div>
  );

  // Update the summary section
  const renderScheduleSummary = () => {
    const approvedCount = scheduleData.filter(
      (s) => s.status === "Approved"
    ).length;
    const pendingCount = scheduleData.filter(
      (s) => s.status === "Pending"
    ).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-green-600 text-xl" />
            <div>
              <h4 className="font-medium text-green-700">Approved Classes</h4>
              <p className="text-sm text-green-600">{approvedCount} classes</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center gap-3">
            <ClockCircleOutlined className="text-yellow-600 text-xl" />
            <div>
              <h4 className="font-medium text-yellow-700">Pending Classes</h4>
              <p className="text-sm text-yellow-600">{pendingCount} classes</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleEditSchedule = (schedule) => {
    navigate(`/schedule/edit/${schedule.scheduleID}`, {
      state: { scheduleData: schedule },
    });
  };

  // Thêm hàm getCardActions
  const getCardActions = (schedule) => {
    const actions = [];

    // Chỉ hiển thị nút Edit và Delete cho Training Staff
    if (userRole === "TrainingStaff" || userRole === "Training staff") {
      actions.push(
        <div className="flex items-center gap-2 mt-2">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditSchedule(schedule);
            }}
            className="!text-cyan-500 hover:!text-cyan-700 hover:!border-cyan-700"
          />
          <Popconfirm
            title="Are you sure you want to delete this schedule?"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDeleteSchedule(schedule.scheduleID);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
              className="!text-red-500 hover:!text-red-700 hover:!border-red-700"
            />
          </Popconfirm>
        </div>
      );
    }

    return actions;
  };

  // Thêm hàm xử lý delete
  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await trainingScheduleService.deleteSchedule(scheduleId);
      message.success("Schedule deleted successfully");
      fetchScheduleData(); // Refresh data after deletion
    } catch (error) {
      message.error("Failed to delete schedule");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6 sm:p-8">
      <div className="max-w-[1500px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyan-600 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <CalendarOutlined className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Weekly Schedule
                </h2>
                <p className="text-gray-600">
                  {userRole === "TrainingStaff"
                    ? "Manage and view all training schedules"
                    : "View your weekly training schedule"}
                </p>
              </div>
            </div>

            {/* Nút Create Schedule chỉ cho TrainingStaff */}
            {(userRole === "TrainingStaff" || userRole === "Training staff") && (
              <Button type="primary" onClick={() => navigate("/schedule/create")}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Create Schedule
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4">
            {renderViewSelector()}
            {renderSubjectSelector()}
            {renderDateSelector()}

            {(userRole === "TrainingStaff" ||
              userRole === "Training staff") && (
              <div className="mb-4" style={{ maxWidth: 300 }}>
                <label className="mr-2 font-medium text-gray-700">
                  Instructor:
                </label>
                <Select
                  style={{ width: "100%" }}
                  value={selectedInstructor}
                  onChange={setSelectedInstructor}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  optionFilterProp="children"
                >
                  {Array.from(
                    new Set(scheduleData.map((i) => i.instructorName))
                  )
                    .filter(Boolean)
                    .map((instName) => (
                      <Option key={instName} value={instName}>
                        {instName}
                      </Option>
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
              <Spin size="large" />
              <span className="text-gray-500 animate-pulse font-medium">
                Loading your schedule...
              </span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : scheduleData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="p-6 bg-cyan-50 rounded-full animate-pulse">
                <CalendarOutlined className="!text-5xl !text-cyan-400" />
              </div>
              <Empty
                description={
                  <div className="space-y-3">
                    <p className="text-gray-700 font-semibold text-lg">
                      {userRole === "Instructor"
                        ? "You have no assigned courses"
                        : "No schedule found"}
                    </p>
                    <p className="text-gray-500 text-sm max-w-md text-center">
                      {userRole === "Instructor"
                        ? "Please contact Training Staff to be assigned a course"
                        : "Try selecting a different time period"}
                    </p>
                  </div>
                }
              />
              {/* {renderCreateButton()} */}
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
                rowClassName="hover:!bg-cyan-50 !transition-colors !duration-200"
                components={{
                  header: {
                    cell: ({ children, ...restProps }) => (
                      <th
                        {...restProps}
                        className="bg-gradient-to-br from-cyan-50 to-teal-50 
                                   text-cyan-700 font-semibold py-4 px-6 
                                   first:rounded-tl-xl last:rounded-tr-xl
                                   border-b border-cyan-100 whitespace-nowrap"
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
                                   group-hover:bg-cyan-50/50 transition-colors duration-200"
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

              {/* Legend & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {renderStatusLegend()}
                {renderScheduleSummary()}
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <InfoCircleOutlined className="!text-cyan-600 !text-lg" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-cyan-700">
                      Schedule Information
                    </h4>
                    <p className="text-sm text-cyan-600/90">
                      Click on any class to view details. Active classes are
                      marked with a green indicator.
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
