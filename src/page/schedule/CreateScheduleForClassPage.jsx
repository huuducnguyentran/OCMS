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
  Upload,
  Radio,
  Divider,
  Steps,
  Table,
  Modal,
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  CalendarOutlined,
  RollbackOutlined,
  UserOutlined,
  BookOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  UploadOutlined,
  UserAddOutlined,
  TeamOutlined,
  SolutionOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { trainingScheduleService } from "../../services/trainingScheduleService";
import { getAllSubjectSpecialties } from "../../services/subjectSpecialtyServices";
import { getAllInstructorAssignments } from "../../services/instructorAssignmentService";
import {
  createClassSubject,
  deleteClassSubject,
} from "../../services/classSubjectService";
import {
  assignTrainee,
  assignTraineeManual,
} from "../../services/traineeService";
import { courseService } from "../../services/courseService";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getAllUsers } from "../../services/userService";
import { read, utils } from "xlsx";

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

// Enums for Location and Room
const LocationEnum = {
  SectionA: 0,
  SectionB: 1,
};

const RoomEnum = {
  R001: 0,
  R002: 1,
  R003: 2,
  R004: 3,
  R005: 4,
  R006: 5,
  R007: 6,
  R008: 7,
  R009: 8,
  R101: 9,
  R102: 10,
  R103: 11,
  R104: 12,
  R105: 13,
  R106: 14,
  R107: 15,
  R108: 16,
  R109: 17,
  R201: 18,
  R202: 19,
  R203: 20,
  R204: 21,
  R205: 22,
  R206: 23,
  R207: 24,
  R208: 25,
  R209: 26,
  R301: 27,
  R302: 28,
  R303: 29,
  R304: 30,
  R305: 31,
  R306: 32,
  R307: 33,
  R308: 34,
  R309: 35,
  R401: 36,
  R402: 37,
  R403: 38,
  R404: 39,
  R405: 40,
  R406: 41,
  R407: 42,
  R408: 43,
  R409: 44,
  R501: 45,
  R502: 46,
  R503: 47,
  R504: 48,
  R505: 49,
  R506: 50,
  R507: 51,
  R508: 52,
  R509: 53,
};

const getLocationName = (value) =>
  Object.keys(LocationEnum).find((key) => LocationEnum[key] === value);
const getRoomName = (value) =>
  Object.keys(RoomEnum).find((key) => RoomEnum[key] === value);

// Helper function: add minutes to time string (HH:mm)
const addMinutesToTime = (time, minutes) => {
  try {
    const [hours, mins] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
  } catch (error) {
    return time;
  }
};

// Helper: get all unique time slots from schedules
const getUniqueTimeSlots = (schedules) => {
  return [
    ...new Set(
      schedules
        .filter(sch => sch.status !== 'Canceled' && sch.classTime)
        .map(sch => sch.classTime.substring(0, 5))
    )
  ].sort();
};

// Helper: get week dates (Monday - Sunday) for current week
const getCurrentWeekDates = () => {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
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

// Helper: check if a schedule is active on a date
const isScheduleActiveOnDate = (schedule, date) => {
  if (!schedule?.startDateTime || !schedule?.endDateTime) return false;
  try {
    const startDate = new Date(schedule.startDateTime);
    const endDate = new Date(schedule.endDateTime);
    const checkDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    checkDate.setHours(12, 0, 0, 0);
    return checkDate >= startDate && checkDate <= endDate;
  } catch {
    return false;
  }
};

// Helper: get days of week from schedule (string)
const getDaysOfWeekArray = (daysOfWeekStr) => {
  if (!daysOfWeekStr) return [];
  return daysOfWeekStr.split(',').map(d => d.trim());
};

// Helper: get week dates (Monday - Sunday) for selected week/year
const getWeekDates = (weekNumber, year) => {
  const startOfYear = new Date(year, 0, 1);
  const daysOffset = (startOfYear.getDay() > 0 ? 7 - startOfYear.getDay() : 0) + (weekNumber - 1) * 7;
  const startDate = new Date(year, 0, 1 + daysOffset);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }
  return dates;
};

// Helper: get week options for a year
const getWeekOptions = (year) => {
  const options = [];
  for (let week = 1; week <= 52; week++) {
    const weekDates = getWeekDates(week, year);
    options.push({
      value: week,
      label: `${dayjs(weekDates[0]).format("DD/MM")} To ${dayjs(weekDates[6]).format("DD/MM")}`,
    });
  }
  return options;
};

// Helper: get current week number in year
const getCurrentWeekNumber = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(
    ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
  );
};

// Thay thế constant cho daysOfWeek select
const recurringDayOptions = [
  { label: "Monday - Thursday", value: "1-4", days: [1, 4] },
  { label: "Tuesday - Friday", value: "2-5", days: [2, 5] },
  { label: "Wednesday - Saturday", value: "3-6", days: [3, 6] },
  { label: "Sunday", value: "0", days: [0] },
];

// Hàm chuyển đổi từ mảng số sang value string của option
const getRecurringDayValueFromDays = (daysArr) => {
  if (!Array.isArray(daysArr)) return daysArr;
  const found = recurringDayOptions.find(opt =>
    Array.isArray(opt.days) &&
    opt.days.length === daysArr.length &&
    opt.days.every((d, i) => d === daysArr[i])
  );
  return found ? found.value : daysArr.join('-');
};

const CreateScheduleForClassPage = () => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const location = useLocation();
  const courseId = location.state?.courseId;
  const [form] = Form.useForm();
  const [traineeForm] = Form.useForm();

  const [loading, setLoading] = useState({
    page: true,
    subjects: false,
    instructors: false,
    instructorSchedules: false,
    assigningTrainee: false,
    eligibleTrainees: false,
  });
  const [submittingStep1, setSubmittingStep1] = useState(false);
  const [submittingStep2, setSubmittingStep2] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [createdClassSubjectId, setCreatedClassSubjectId] = useState(null);
  const [createdTrainingScheduleId, setCreatedTrainingScheduleId] =
    useState(null);
  const [isEditingScheduleDetails, setIsEditingScheduleDetails] =
    useState(false);

  const [subjectSpecialties, setSubjectSpecialties] = useState([]);
  const [allSubjectSpecialties, setAllSubjectSpecialties] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(false);

  const [selectedSubjectSpecialty, setSelectedSubjectSpecialty] =
    useState(null);

  const [availableInstructors, setAvailableInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  
  const [instructorExistingSchedules, setInstructorExistingSchedules] =
    useState([]);
  const [conflictMessages, setConflictMessages] = useState([]);

  const [traineeAssignMethod, setTraineeAssignMethod] = useState("import");
  const [fileList, setFileList] = useState([]);
  const [manualTrainees, setManualTrainees] = useState([
    { traineeId: "", notes: "" },
  ]);
  const [eligibleManualTrainees, setEligibleManualTrainees] = useState([]);

  const [excelPreviewData, setExcelPreviewData] = useState([]);
  const [excelPreviewColumns, setExcelPreviewColumns] = useState([]);
  const [excelPreviewError, setExcelPreviewError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // State cho tuần/năm Instructor Conflicts
  const [conflictYear, setConflictYear] = useState(new Date().getFullYear());
  const [conflictWeek, setConflictWeek] = useState(getCurrentWeekNumber());
  const [conflictWeekOptions, setConflictWeekOptions] = useState(getWeekOptions(conflictYear));

  const isStep1Completed = createdClassSubjectId !== null && currentStep === 1;
  const isEditingStep1 = currentStep === 0 && !createdClassSubjectId;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const isStep1FormTouched = isEditingStep1 && form.isFieldsTouched();
      
      let hasFormValues = false;
      if (isEditingStep1) {
        const currentValues = form.getFieldsValue();
        hasFormValues = Object.values(currentValues).some(
          (value) =>
            value !== undefined &&
            value !== "" &&
            (!Array.isArray(value) || value.length > 0)
        );
      }

      if ((hasFormValues && !createdClassSubjectId) || isStep1Completed) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes or an incomplete schedule. Are you sure you want to leave?";
        return "You have unsaved changes or an incomplete schedule. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditingStep1, form, createdClassSubjectId, isStep1Completed]);

  useEffect(() => {
    if (classId) {
      setLoading((prev) => ({ ...prev, page: false }));
    }
    fetchAllSubjectSpecialtiesList();
    if (courseId) {
      fetchCourseDetails(courseId);
    } else {
      message.warn(
        "Course ID not found. Subject specialty filtering might not work as expected."
      );
    }
  }, [classId, courseId]);

  useEffect(() => {
    if (courseDetails && allSubjectSpecialties.length > 0) {
      if (
        courseDetails.subjectSpecialties &&
        courseDetails.subjectSpecialties.length > 0
      ) {
        const courseSubjectSpecialtyIds = courseDetails.subjectSpecialties.map(
          (ss) => ss.subjectSpecialtyId
        );
        const filtered = allSubjectSpecialties.filter((ss) =>
          courseSubjectSpecialtyIds.includes(ss.subjectSpecialtyId)
        );
        setSubjectSpecialties(filtered);
        if (filtered.length === 0) {
          message.info(
            "No subject specialties from the course are available for scheduling."
          );
        }
      } else {
        message.warn(
          "The fetched course has no subject specialties linked. No subjects will be available."
        );
        setSubjectSpecialties([]);
      }
    } else if (!courseId && allSubjectSpecialties.length > 0) {
      setSubjectSpecialties(allSubjectSpecialties);
    }
  }, [courseDetails, allSubjectSpecialties, courseId]);

  useEffect(() => {
    if (selectedSubjectSpecialty) {
      fetchInstructorsForSubject(selectedSubjectSpecialty);
      if (traineeAssignMethod === "manual" && isStep1Completed) {
        fetchEligibleManualTrainees(selectedSubjectSpecialty.specialtyId);
      }
    } else {
      setAvailableInstructors([]);
      setEligibleManualTrainees([]);
    }
  }, [selectedSubjectSpecialty, isStep1Completed]);

  useEffect(() => {
    if (selectedInstructor && selectedInstructor.id) {
      fetchInstructorSchedules(selectedInstructor.id);
    } else {
      setInstructorExistingSchedules([]);
      setConflictMessages([]);
    }
  }, [selectedInstructor]);

  useEffect(() => {
    if (
      traineeAssignMethod === "manual" &&
      isStep1Completed &&
      selectedSubjectSpecialty?.specialtyId
    ) {
      fetchEligibleManualTrainees(selectedSubjectSpecialty.specialtyId);
    } else {
      setEligibleManualTrainees([]);
    }
  }, [traineeAssignMethod, isStep1Completed, selectedSubjectSpecialty]);

  useEffect(() => {
    setConflictWeekOptions(getWeekOptions(conflictYear));
    setConflictWeek(getCurrentWeekNumber());
  }, [conflictYear]);

  useEffect(() => {
    if (createdClassSubjectId && form.getFieldValue('daysOfWeek')) {
      const val = form.getFieldValue('daysOfWeek');
      if (Array.isArray(val)) {
        form.setFieldsValue({ daysOfWeek: getRecurringDayValueFromDays(val) });
      }
    }
  }, [createdClassSubjectId]);

  const fetchAllSubjectSpecialtiesList = async () => {
    setLoading((prev) => ({ ...prev, subjects: true }));
    try {
      const response = await getAllSubjectSpecialties();
      if (Array.isArray(response)) {
        setAllSubjectSpecialties(response);
      } else if (response && Array.isArray(response.data)) {
        setAllSubjectSpecialties(response.data);
      } else {
        setAllSubjectSpecialties([]);
        message.error(
          "Could not load all subject specialties in expected format."
        );
      }
    } catch (error) {
      console.error("Error fetching all subject specialties:", error);
      message.error("Failed to load all subject specialties.");
      setAllSubjectSpecialties([]);
    } finally {
      setLoading((prev) => ({ ...prev, subjects: false }));
    }
  };

  const fetchCourseDetails = async (cId) => {
    setLoadingCourse(true);
    try {
      const response = await courseService.getCourseById(cId);
      if (response && response.data) {
        setCourseDetails(response.data);
      } else {
        message.error(`Could not retrieve details for course ${cId}.`);
        setCourseDetails(null);
      }
    } catch (error) {
      console.error(`Error fetching course ${cId} details:`, error);
      message.error(
        `Failed to load course ${cId} details. ` +
          (error.response?.data?.message || error.message)
      );
      setCourseDetails(null);
    } finally {
      setLoadingCourse(false);
    }
  };

  const fetchInstructorsForSubject = async (specialty) => {
    setLoading((prev) => ({ ...prev, instructors: true }));
    if (!createdClassSubjectId) { 
      setSelectedInstructor(null); 
      form.setFieldsValue({ instructorId: null });
    }
    try {
      const allAssignments = await getAllInstructorAssignments();
      const scheduleResponse =
        await trainingScheduleService.getAllTrainingSchedules();

      if (
        allAssignments &&
        Array.isArray(allAssignments) &&
        specialty &&
        specialty.subjectId
      ) {
        const filteredAssignments = allAssignments.filter((assign) => {
          const isMatch =
            assign.courseSubjectSpecialtyId === specialty.subjectId;
            return isMatch;
          });
        const instructorNamesMap = {};
        if (
          scheduleResponse &&
          scheduleResponse.schedules &&
          Array.isArray(scheduleResponse.schedules)
        ) {
          scheduleResponse.schedules.forEach((schedule) => {
            if (schedule.instructorID && schedule.instructorName) {
              instructorNamesMap[schedule.instructorID] =
                schedule.instructorName;
            }
          });
        }

        const instructors = filteredAssignments.map((assign) => {
          if (!assign.assignmentId) {
            console.warn(
              "CRITICAL: assignmentId is missing in filtered assign object:",
              assign
            );
          }
          return {
            id: assign.instructorId, 
            instructorName:
              instructorNamesMap[assign.instructorId] ||
              `Instructor ${assign.instructorId}`,
            assignmentId: assign.assignmentId,
          };
        });

        const uniqueInstructors = Array.from(
          new Map(instructors.map((item) => [item.id, item])).values()
        );

        setAvailableInstructors(uniqueInstructors);
        if (uniqueInstructors.length === 0) {
          message.info(
            "No instructors found for the selected subject specialty."
          );
        }
      } else {
        console.warn(
          "Unexpected format for instructor assignments:",
          allAssignments
        );
        setAvailableInstructors([]);
        message.error("Could not load instructors for the subject specialty.");
      }
    } catch (error) {
      console.error("Error fetching instructors for subject specialty:", error);
      message.error("Failed to load instructors.");
      setAvailableInstructors([]);
    } finally {
      setLoading((prev) => ({ ...prev, instructors: false }));
    }
  };
  
  const fetchInstructorSchedules = async (instructorId) => {
    setLoading((prev) => ({ ...prev, instructorSchedules: true }));
    setConflictMessages([]); 
    try {
      const response = await trainingScheduleService.getAllTrainingSchedules(); 
      let currentSchedules = [];
      if (response && response.schedules && Array.isArray(response.schedules)) {
        currentSchedules = response.schedules.filter(
          (s) => s.instructorID === instructorId
        );
      } else {
        console.warn(
          "Unexpected format for getAllTrainingSchedules:",
          response
        );
      }
      setInstructorExistingSchedules(currentSchedules);

      if (currentSchedules.length > 0) {
        const today = dayjs();
        const newConflictMessages = [];
        currentSchedules.forEach((sch, index) => {
          const endDate = dayjs(sch.endDateTime);
          if (today.isSameOrBefore(endDate, "day")) {
            const startTime = dayjs(sch.classTime, "HH:mm:ss");
            let endTime = startTime;
            if (sch.subjectPeriod) {
              const [h, m, s] = sch.subjectPeriod.split(":").map(Number);
              endTime = startTime
                .add(h, "hours")
                .add(m, "minutes")
                .add(s, "seconds");
            }
            const conflictMessageJSX = (
              <span key={`conflict-${index}`}>
                Instructor{" "}
                <strong>
                  {sch.instructorName || `ID: ${sch.instructorID}`}
                </strong>{" "}
                already has schedule for <strong>"{sch.subjectName}"</strong> {}
                at{" "}
                <strong>
                  {getLocationName(sch.location) || sch.location}
                </strong>{" "}
                (Room: <strong>{getRoomName(sch.room) || sch.room}</strong>), {}
                from{" "}
                <strong>
                  {dayjs(sch.startDateTime).format("YYYY-MM-DD")}
                </strong>{" "}
                to <strong>{endDate.format("YYYY-MM-DD")}</strong>, {}
                on <strong>{sch.daysOfWeek}</strong> from{" "}
                <strong>{startTime.format("HH:mm")}</strong> to{" "}
                <strong>{endTime.format("HH:mm")}</strong>.
              </span>
            );
            newConflictMessages.push(conflictMessageJSX);
          }
        });
        setConflictMessages(newConflictMessages);
        if (newConflictMessages.length > 0) {
          message.warning(
            "Selected instructor has existing schedules. Please check carefully.",
            7
          );
        }
      } else {
        message.info("Selected instructor has no existing schedules.");
      }
    } catch (error) {
      console.error("Error fetching instructor schedules:", error);
      message.error("Failed to load instructor's existing schedules.");
      setInstructorExistingSchedules([]);
    } finally {
      setLoading((prev) => ({ ...prev, instructorSchedules: false }));
    }
  };

  const handleSubjectSpecialtyChange = (value) => {
    const selectedSpecialty = subjectSpecialties.find(
      (s) => s.subjectSpecialtyId === value
    );
    setSelectedSubjectSpecialty(selectedSpecialty);
    form.setFieldsValue({ 
      subjectSpecialtyId: value,
      instructorId: null,
    });
  };

  const handleInstructorChange = (value, option) => {
    if (option && option.key) {
      const instructor = availableInstructors.find(
        (inst) => inst.id === option.key
      );
        if (instructor) {
            setSelectedInstructor(instructor); 
        } else {
            setSelectedInstructor({
                id: option.key,
                instructorName: option.children, 
          assignmentId: null,
            });
        }
    } else {
        setSelectedInstructor(null);
    }
  };
  
  const isSlotFree = (date, timeRange) => {
    if (!selectedInstructor || instructorExistingSchedules.length === 0) {
      return true; 
    }

    const targetDayOfWeek = date.day(); 
    const targetStartTime = dayjs(timeRange[0]); 
    const targetEndTime = dayjs(timeRange[1]);

    for (const schedule of instructorExistingSchedules) {
      const scheduleDays = (schedule.daysOfWeek || "")
        .toLowerCase()
        .split(",")
        .map((dayName) => {
          switch (dayName.trim()) {
            case "sunday":
              return 0;
            case "monday":
              return 1;
            case "tuesday":
              return 2;
            case "wednesday":
              return 3;
            case "thursday":
              return 4;
            case "friday":
              return 5;
            case "saturday":
              return 6;
            default:
              return -1;
          }
        })
        .filter((dayNum) => dayNum !== -1);

      if (!scheduleDays.includes(targetDayOfWeek)) {
        continue; 
      }

      const scheduleStartTime = dayjs(schedule.classTime, "HH:mm:ss"); 
      const schedulePeriod = schedule.subjectPeriod; 
      
      let scheduleEndTime = scheduleStartTime;
      if (schedulePeriod) {
        const [h, m, s] = schedulePeriod.split(":").map(Number);
        scheduleEndTime = scheduleStartTime
          .add(h, "hours")
          .add(m, "minutes")
          .add(s, "seconds");
      }

      const existingSchStartDate = dayjs(
        schedule.startDateTime || schedule.startDay
      );
      const existingSchEndDate = dayjs(schedule.endDateTime || schedule.endDay); 

      if (
        !(
          date.isSame(existingSchStartDate, "day") ||
          date.isAfter(existingSchStartDate, "day")
        ) ||
        !(
          date.isSame(existingSchEndDate, "day") ||
          date.isBefore(existingSchEndDate, "day")
        )
      ) {
          continue; 
      }

      if (
        targetStartTime.isBefore(scheduleEndTime) &&
        targetEndTime.isAfter(scheduleStartTime)
      ) {
        message.warning(
          `Time conflict with existing schedule: ${
            schedule.subjectName
          } on ${date.format("YYYY-MM-DD")} from ${scheduleStartTime.format(
            "HH:mm"
          )} to ${scheduleEndTime.format("HH:mm")}`
        );
        return false; 
      }
    }
    return true; 
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };
  
  const disabledTime = (now, type) => {
    return {};
  };

  const handleProceedToStep2 = (newClassSubjectId, newTrainingScheduleId) => {
    setCreatedClassSubjectId(newClassSubjectId);
    setCreatedTrainingScheduleId(newTrainingScheduleId);
    setCurrentStep(1);
    setIsEditingScheduleDetails(false);
    message.success(
      "Step 1 Completed: Schedule created! Please proceed to Step 2."
    );
  };
  
  const hardResetAndRollback = async () => {
    console.log("hardResetAndRollback function CALLED!");
    const csIdToRollback = createdClassSubjectId;

    form.resetFields(); 
    traineeForm.resetFields(); 

    setSelectedSubjectSpecialty(null);
    setSelectedInstructor(null);
    setAvailableInstructors([]);
    setInstructorExistingSchedules([]);
    setConflictMessages([]);
    setCurrentStep(0);
    setCreatedClassSubjectId(null);
    setCreatedTrainingScheduleId(null);
    setIsEditingScheduleDetails(false);
    setTraineeAssignMethod("import");
    setFileList([]);
    setSubmittingStep1(false);
    setSubmittingStep2(false);
    setLoading((prev) => ({
      ...prev,
      assigningTrainee: false,
      eligibleTrainees: false,
    }));
    
    if (csIdToRollback) {
        try {
            setSubmittingStep1(true); 
        console.log(
          `HardReset: Attempting to delete ClassSubject ID: ${csIdToRollback}`
        );
            await deleteClassSubject(csIdToRollback);
        message.success(
          `Rolled back: ClassSubject ${csIdToRollback} has been deleted during page reset.`
        );
        } catch (deleteError) {
            console.error("HardReset: Error deleting ClassSubject:", deleteError);
        const delErrMsg =
          deleteError.response?.data?.message ||
          deleteError.message ||
          "An unexpected error occurred during rollback.";
        message.error(
          `HardReset: Failed to rollback ClassSubject ${csIdToRollback}. Error: ${String(
            delErrMsg
          )}`,
          7
        );
        } finally {
            setSubmittingStep1(false);
        }
    }
    message.info("Page has been completely reset.");
  };

  const resetPageForNewScheduleCycle = () => {
    console.log("resetPageForNewScheduleCycle function CALLED!");
    form.resetFields(); 
    traineeForm.resetFields();

    setSelectedSubjectSpecialty(null);
    setSelectedInstructor(null);
    setAvailableInstructors([]);
    setInstructorExistingSchedules([]);
    setConflictMessages([]);
    setCurrentStep(0);
    setCreatedClassSubjectId(null);
    setCreatedTrainingScheduleId(null);
    setIsEditingScheduleDetails(false);
    setTraineeAssignMethod("import");
    setFileList([]);
    setSubmittingStep1(false);
    setSubmittingStep2(false);
    setEligibleManualTrainees([]);
    setLoading((prev) => ({
      ...prev,
      assigningTrainee: false,
      eligibleTrainees: false,
    }));
    message.success("Process completed! Ready to create a new schedule.", 5);
  };

  const handleCreateScheduleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmittingStep1(true);
      if (
        !selectedSubjectSpecialty?.subjectSpecialtyId ||
        !selectedInstructor?.assignmentId
      ) {
        message.error("Please select subject specialty and instructor.");
        setSubmittingStep1(false);
        return;
      }
      const values = form.getFieldsValue(true);
      // Convert daysOfWeek value string sang mảng số
      let daysOfWeekArr = [];
      const opt = recurringDayOptions.find(o => o.value === values.daysOfWeek);
      if (opt) daysOfWeekArr = opt.days;
      else if (Array.isArray(values.daysOfWeek)) daysOfWeekArr = values.daysOfWeek;
      else if (typeof values.daysOfWeek === 'string') daysOfWeekArr = values.daysOfWeek.split('-').map(Number);
      const classSubjectData = {
        classId,
        subjectSpecialtyId: selectedSubjectSpecialty.subjectSpecialtyId,
        instructorAssignmentID: selectedInstructor.assignmentId,
        notes: values.notes || "",
      };
      let csResponse, newClassSubjectId;
      try {
        csResponse = await createClassSubject(classSubjectData);
        newClassSubjectId =
          csResponse?.classSubject?.classSubjectId ||
          csResponse?.data?.classSubject?.classSubjectId ||
          csResponse?.data?.classSubjectId ||
          csResponse?.classSubjectId;
        if (!newClassSubjectId) {
          message.error(
            "Failed to create class subject: ID not found. " +
              JSON.stringify(csResponse)
          );
          setSubmittingStep1(false);
          return;
        }
      } catch (csError) {
        message.error(
          "Failed to create class subject. " +
            (csError.response?.data?.message || csError.message)
        );
        setSubmittingStep1(false);
        return;
      }
      
      const scheduleData = { 
        classSubjectId: newClassSubjectId, 
        location: values.location, 
        room: values.room, 
        notes: values.notes,
        startDay: values.startDate?.toISOString(), 
        endDay: values.endDate?.toISOString(), 
        daysOfWeek: daysOfWeekArr,
        classTime: values.classTime?.format("HH:00:00"),
        subjectPeriod: values.subjectPeriod?.format("HH:mm:ss"),
      };

      try {
        const tsResponse = await trainingScheduleService.createTrainingSchedule(
          scheduleData
        );
        console.log("Create Training Schedule Response:", tsResponse);
        const newTrainingScheduleId =
          tsResponse?.data?.scheduleID ||
          tsResponse?.scheduleId ||
          tsResponse?.data?.trainingScheduleID ||
          tsResponse?.trainingScheduleID ||
          tsResponse?.id ||
          tsResponse?.data?.id;

        if (!newTrainingScheduleId) {
          message.error(
            "Failed to create training schedule: Training Schedule ID not found in API response. Rolling back ClassSubject.",
            7
          );
          try {
            await deleteClassSubject(newClassSubjectId);
            message.warning(
              `Rolled back: ClassSubject ${newClassSubjectId} deleted.`
            );
          } catch (delError) {
            message.error(
              `Failed to rollback ClassSubject ${newClassSubjectId}. ` +
                (delError.response?.data?.message || delError.message)
            );
          }
            setSubmittingStep1(false);
            return;
        }
        handleProceedToStep2(newClassSubjectId, newTrainingScheduleId);
      } catch (tsError) {
        const errMsg =
          tsError.response?.data?.message ||
          tsError.message ||
          "Unexpected error creating training schedule.";
        message.error(
          "Failed to create training schedule. Rolling back... " +
            String(errMsg),
          7
        );
        if (newClassSubjectId) {
          try {
            await deleteClassSubject(newClassSubjectId);
            message.warning(
              `Rolled back: ClassSubject ${newClassSubjectId} deleted.`
            );
          } catch (delError) {
            message.error(
              `Failed to rollback ClassSubject ${newClassSubjectId}. ` +
                (delError.response?.data?.message || delError.message)
            );
          }
        }
      }
    } catch (errorInfo) {
      message.error("Please fill all required fields for schedule.");
    } finally {
      setSubmittingStep1(false);
    }
  };

  const handleAssignTraineesSubmit = async () => {
    if (!createdClassSubjectId) {
      message.error(
        "Cannot assign trainees without a created schedule (ClassSubject ID is missing). Please complete Step 1."
      );
        return;
    }
    setSubmittingStep2(true);
    setLoading((prev) => ({ ...prev, assigningTrainee: true }));

    try {
      if (traineeAssignMethod === "import") {
            if (excelPreviewData.length === 0 && fileList.length > 0) {
          message.info(
            "Attempting to import with selected file. If preview was not shown, check console."
          );
            } else if (fileList.length === 0) {
                message.error("Please select and preview an Excel file to import.");
          setSubmittingStep2(false);
          setLoading((prev) => ({ ...prev, assigningTrainee: false }));
          return;
            }
            await assignTrainee(fileList[0]); 
            message.success("Trainees imported successfully from file!");
            setFileList([]); 
            setExcelPreviewData([]);
            setExcelPreviewColumns([]);
            setExcelPreviewError(null);
        } else {
            await traineeForm.validateFields();
        const manualValues = traineeForm.getFieldValue("trainees");
        if (
          !manualValues ||
          manualValues.length === 0 ||
          manualValues.every((t) => !t.traineeId)
        ) {
          message.error(
            "Please add at least one trainee or fill in the details for existing ones."
          );
          setSubmittingStep2(false);
          setLoading((prev) => ({ ...prev, assigningTrainee: false }));
          return;
            }

            const assignments = manualValues
          .filter((trainee) => trainee.traineeId)
          .map((trainee) => ({
                    traineeId: trainee.traineeId,
                    classId: classId, 
                    notes: trainee.notes || "",
                    classSubjectId: createdClassSubjectId,
            }));
            
            if (assignments.length === 0) {
                message.error("No valid trainee data to assign.");
          setSubmittingStep2(false);
          setLoading((prev) => ({ ...prev, assigningTrainee: false }));
          return;
            }

            let allSuccessful = true;
            for (const assignment of assignments) {
                try {
                    await assignTraineeManual(assignment);
                } catch (manualError) {
                    allSuccessful = false;
            const errMsg =
              manualError.response?.data?.message ||
              manualError.message ||
              "An unexpected error occurred.";
            message.error(
              `Failed to assign trainee ${assignment.traineeId}: ${String(
                errMsg
              )}`
            );
                }
            }
            if (allSuccessful) {
          message.success(
            "All selected trainees assigned manually successfully!"
          );
            } else {
          message.warning(
            "Some trainees could not be assigned. Please check the details. The schedule itself is created."
          );
            }
        }
    } catch (error) {
        console.error("Error assigning trainees:", error);
      const mainErrMsg =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred while assigning trainees.";
      message.error(
        "Failed to assign trainees: " +
          String(mainErrMsg) +
          (error.errors ? " Check validation." : "")
      );
    } finally {
        setSubmittingStep2(false);
      setLoading((prev) => ({ ...prev, assigningTrainee: false }));
    }
  };

  const beforeUpload = async (file) => {
    setFileList([file]);
    setExcelPreviewData([]);
    setExcelPreviewColumns([]);
    setExcelPreviewError(null);
    setIsProcessingFile(true);

    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcel) {
      message.error("You can only upload Excel files (xls, xlsx)!");
      setExcelPreviewError(
        "Invalid file type. Please upload Excel files only."
      );
      setIsProcessingFile(false);
      return Upload.LIST_IGNORE;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File must be smaller than 5MB!");
      setExcelPreviewError("File size exceeds 5MB limit.");
      setIsProcessingFile(false);
      return Upload.LIST_IGNORE;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        message.error("File contains no data.");
        setExcelPreviewError("File contains no data.");
        setIsProcessingFile(false);
        return Upload.LIST_IGNORE;
      }

      const headers = jsonData[0];
      const tableColumns = headers.map((header, index) => ({
        title: header,
        dataIndex: index.toString(),
        key: header + index,
      }));

      const tableData = jsonData.slice(1).map((row, rowIndex) => {
        const rowObject = { key: `row-${rowIndex}` };
        headers.forEach((header, index) => {
          rowObject[index.toString()] = row[index];
        });
        return rowObject;
      });

      setExcelPreviewColumns(tableColumns);
      setExcelPreviewData(tableData);
      message.success("Excel file preview generated successfully.");
    } catch (err) {
      console.error("Error processing Excel file for preview:", err);
      message.error("Error reading or processing Excel file for preview.");
      setExcelPreviewError(
        "Error reading or processing Excel file: " + err.message
      );
    } finally {
      setIsProcessingFile(false);
    }
    
    return false;
  };

  const handleRemoveFile = () => {
    setFileList([]);
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
  
  const getDisabledSeconds = (selectedHour, selectedMinute) => {
     if (selectedHour === null || selectedMinute === null) return [];
     const seconds = [];
     for (let i = 1; i < 60; i++) {
       seconds.push(i);
     }
     return seconds;
  };

  const handleEditScheduleDetails = () => {
    setIsEditingScheduleDetails(true);
    message.info(
      "You are now editing schedule details. Instructor and Subject cannot be changed.",
      5
    );
  };

  const handleCancelUpdateScheduleDetails = () => {
    setIsEditingScheduleDetails(false);
    message.info("Editing schedule details cancelled.");
  };

  const handleUpdateScheduleDetailsSubmit = async () => {
    if (!createdTrainingScheduleId) {
      message.error(
        "Cannot update schedule: Training Schedule ID is missing. Please ensure Step 1 was completed correctly."
      );
      return;
    }
    try {
      await form.validateFields(); 
      setSubmittingStep1(true);

      const values = form.getFieldsValue(true);
      
      const scheduleDetailsData = {
        location: values.location,
        room: values.room,
        notes: values.notes,
        startDay: values.startDate?.toISOString(),
        endDay: values.endDate?.toISOString(),
        daysOfWeek: values.daysOfWeek?.map((d) => parseInt(d, 10)) || [],
        classTime: values.classTime?.format("HH:00:00"),
        subjectPeriod: values.subjectPeriod?.format("HH:mm:ss"),
        classSubjectId: createdClassSubjectId,
      };
      
      console.log(
        "Updating Training Schedule with ID:",
        createdTrainingScheduleId,
        "Data:",
        scheduleDetailsData
      );

      await trainingScheduleService.updateTrainingSchedule(
        createdTrainingScheduleId,
        scheduleDetailsData
      );
      message.success("Schedule details updated successfully!");
      setIsEditingScheduleDetails(false);
    } catch (errorInfo) {
      if (errorInfo.errorFields) {
          message.error("Please fill all required schedule details correctly.");
      } else {
          console.error("Error updating training schedule:", errorInfo);
        const errMsg =
          errorInfo.response?.data?.message ||
          errorInfo.message ||
          "An unexpected error occurred while updating schedule.";
          message.error(`Failed to update schedule: ${String(errMsg)}`, 7);
      }
    } finally {
      setSubmittingStep1(false);
    }
  };

  const fetchEligibleManualTrainees = async (specialtyId) => {
    if (!specialtyId) {
      setEligibleManualTrainees([]);
      return;
    }
    setLoading((prev) => ({ ...prev, eligibleTrainees: true }));
    try {
      const response = await getAllUsers();
      let users = [];
      if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response)) {
         users = response;
      } else if (
        response &&
        response.data &&
        Array.isArray(response.data.users)
      ) {
         users = response.data.users;
      } else {
        console.warn("Unexpected format for getAllUsers response:", response);
      }

      if (users.length > 0) {
        const filteredTrainees = users.filter(
          (user) =>
            user.roleName === "Trainee" &&
            user.specialtyId === specialtyId &&
            user.accountStatus === "Active"
        );
        setEligibleManualTrainees(filteredTrainees);
        if (filteredTrainees.length === 0) {
          message.info(
            "No eligible trainees found for the selected specialty to assign manually."
          );
        }
      } else {
        setEligibleManualTrainees([]);
      }
    } catch (error) {
      console.error("Error fetching eligible trainees:", error);
      message.error("Failed to load trainees for manual assignment.");
      setEligibleManualTrainees([]);
    } finally {
      setLoading((prev) => ({ ...prev, eligibleTrainees: false }));
    }
  };

  if (loading.page) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 p-6 text-white">
            <div className="flex items-center gap-4">
                <CalendarOutlined className="text-4xl opacity-80" />
                <div>
              <Title level={2} style={{ color: "white", margin: 0 }}>
                Create Class Schedule & Assign Trainees
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                Class ID: {classId}
              </Text>
                </div>
            </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Stepper */}
        <div className="flex justify-center">
  <div className="w-full max-w-xl">
    <Steps
      current={currentStep}
      className="mb-10 pb-2 border-b border-gray-200"
    >
      <Step
        title="Create Schedule"
                  icon={
                    isStep1Completed ? (
                      <CheckCircleFilled
                        style={{ fontSize: "24px", color: "#22d3ee" }} // cyan-400
                      />
                    ) : (
                      <div className="w-6 h-6 border-2 border-cyan-500 rounded-full flex items-center justify-center text-sm text-cyan-500 mt-1">
                        1
                      </div>
                    )
                  }
        description=" "
        status={
          currentStep > 0
            ? createdClassSubjectId
                        ? "finish"
                        : "error"
            : currentStep === 0
                      ? "process"
                      : "wait"
        }
      />
      <Step
        title="Assign Trainees"
        icon={
                    <div className="w-6 h-6 border-2 border-cyan-500 rounded-full flex items-center justify-center text-sm text-cyan-500 mt-1">
              2
            </div>
          }
        disabled={!isStep1Completed}
                  description=" "
                  status={currentStep === 1 ? "process" : "wait"}
      />
    </Steps>
  </div>
</div>
            {/* ----- STEP 1: CREATE SCHEDULE ----- */}
            <Card 
            className={`!shadow-lg !rounded-xl !mb-8 !border-2 !transition-all !duration-500 ${
              isStep1Completed
                ? "!border-cyan-300 !opacity-80"
                : "!border-cyan-600"
            }`}
                bordered
                title={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                  <SolutionOutlined
                    className={`mr-3 text-2xl ${
                      isStep1Completed ? "!text-cyan-500" : "!text-cyan-700"
                    }`}
                  />
                  <Title
                    level={4}
                    className={`!mb-0 ${
                      isStep1Completed ? "!text-gray-600" : "!text-cyan-700"
                    }`}
                  >
                    Step 1: Create Training Schedule
                  </Title>
                        </div>
                        {isStep1Completed && !isEditingScheduleDetails && (
                  <Button
                    icon={<EditOutlined />}
                    onClick={handleEditScheduleDetails}
                    type="link"
                    className="!text-cyan-700 hover:!text-cyan-500"
                  >
                                Edit Schedule Details
                            </Button>
                        )}
                    </div>
                }
            >
            <Spin
              spinning={
                submittingStep1 ||
                loading.subjects ||
                loading.instructors ||
                loading.instructorSchedules
              }
            >
                    <Form form={form} layout="vertical" initialValues={{
                      startDate: dayjs().startOf('day'),
                      endDate: dayjs().add(7, 'day').startOf('day'),
                      daysOfWeek: recurringDayOptions[0].value
                    }} disabled={(isStep1Completed && !isEditingScheduleDetails) || submittingStep1}>
                        <Row gutter={24}> 
                            {/* Phần Selection sẽ chiếm toàn bộ chiều rộng */}
                            <Col xs={24} md={24}>
                                <Title level={5} className="mb-3 text-gray-700"><BookOutlined className="mr-2"/>Selection</Title>
                                {/* Loại bỏ Row con, để mỗi Form.Item chiếm một dòng */} 
                                <Form.Item name="subjectSpecialtyId" label="Subject" rules={[{ required: true, message: "Required" }]}>
                                    <Select placeholder="Select subject" loading={loading.subjects} onChange={handleSubjectSpecialtyChange} showSearch optionFilterProp="children" style={{ width: '100%' }} disabled={createdClassSubjectId !== null || submittingStep1}>
                                        {subjectSpecialties.map(s => (
                                            <Option key={s.subjectSpecialtyId} value={s.subjectSpecialtyId}>
                                                {s.subjectName || s.subject?.subjectName || 'Unknown Subject'} 
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item name="instructorId" label="Instructor" rules={[{ required: true, message: "Required" }]}>
                                    <Select placeholder="Select instructor" loading={loading.instructors} onChange={handleInstructorChange} showSearch optionFilterProp="children" style={{ width: '100%' }} disabled={createdClassSubjectId !== null || submittingStep1}>
                                        {availableInstructors.map(i => <Option key={i.id} value={i.id}>{i.instructorName} ({i.id})</Option>)}
                                    </Select>
                                </Form.Item>
                                {conflictMessages.length > 0 && !isStep1Completed && (
                      <div className="my-4">
                        <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded">
                          <div className="font-semibold text-cyan-800 mb-2 flex items-center">
                            <InfoCircleOutlined className="mr-2" /> Instructor Conflicts
                          </div>
                          {/* Dropdown chọn năm và tuần */}
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
                              <Select
                                value={conflictYear}
                                onChange={setConflictYear}
                                size="small"
                                style={{ minWidth: 100 }}
                              >
                                {[2023, 2024, 2025, 2026].map((year) => (
                                  <Option key={year} value={year}>{year}</Option>
                                ))}
                              </Select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Week Period</label>
                              <Select
                                value={conflictWeek}
                                onChange={setConflictWeek}
                                size="small"
                                style={{ minWidth: 160 }}
                              >
                                {conflictWeekOptions.map((opt, idx) => (
                                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                ))}
                              </Select>
                            </div>
                          </div>
                          {/* Schedule Grid Start */}
                          <div className="overflow-x-auto">
                            {(() => {
                              const schedules = instructorExistingSchedules.filter(sch => sch.status !== 'Canceled');
                              if (schedules.length === 0) {
                                return <div className="text-cyan-700 py-2">No active schedules found for this instructor.</div>;
                              }
                              const weekDates = getWeekDates(conflictWeek, conflictYear);
                              const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                              // Lọc time slot chỉ lấy slot có class thực sự trong tuần này
                              const timeSlots = [...new Set(
                                schedules.flatMap(sch => {
                                  // Lấy ra các ngày thực sự active trong tuần này
                                  return daysOfWeek.map((day, idx) => {
                                    const scheduleDays = getDaysOfWeekArray(sch.daysOfWeek);
                                    const scheduleTime = sch.classTime ? sch.classTime.substring(0, 5) : "";
                                    const currentDate = weekDates[idx];
                                    if (scheduleDays.includes(day) && isScheduleActiveOnDate(sch, currentDate)) {
                                      return scheduleTime;
                                    }
                                    return null;
                                  }).filter(Boolean);
                                })
                              )].sort();
                              if (timeSlots.length === 0) {
                                return <div className="text-cyan-700 py-2">No time slots found.</div>;
                              }
                              return (
                                <table className="min-w-full text-xs border border-cyan-200 bg-white rounded-xl">
                                  <thead className="bg-cyan-100">
                                    <tr>
                                      <th className="px-2 py-2 border">Time</th>
                                      {daysOfWeek.map((day, idx) => (
                                        <th key={day} className="px-2 py-2 border text-center">
                                          <div>{day}</div>
                                          <div className="text-[10px] text-gray-500">{weekDates[idx] ? dayjs(weekDates[idx]).format("DD/MM") : ""}</div>
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {timeSlots.map((slot, slotIdx) => (
                                      <tr key={slotIdx}>
                                        <td className="border px-2 py-2 font-semibold text-gray-700 whitespace-nowrap">{slot} - {addMinutesToTime(slot, 90)}</td>
                                        {daysOfWeek.map((day, dayIdx) => {
                                          // Tìm schedule phù hợp
                                          const currentDate = weekDates[dayIdx];
                                          const sch = schedules.find(sch => {
                                            const scheduleDays = getDaysOfWeekArray(sch.daysOfWeek);
                                            const scheduleTime = sch.classTime ? sch.classTime.substring(0, 5) : "";
                                            return scheduleDays.includes(day) && scheduleTime === slot && isScheduleActiveOnDate(sch, currentDate);
                                          });
                                          if (sch) {
                                            return (
                                              <td key={day} className="border px-2 py-2 align-top">
                                                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-2 shadow-sm">
                                                  <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                                      ${sch.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                        sch.status === 'Incoming' ? 'bg-cyan-100 text-cyan-700' :
                                                        sch.status === 'Pending' ? 'bg-cyan-200 text-cyan-800' :
                                                        'bg-gray-100 text-gray-700'}`}>{sch.status}</span>
                                                  </div>
                                                  <div className="font-semibold text-gray-800 text-xs mb-1 line-clamp-2">{sch.subjectName}</div>
                                                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1"><ClockCircleOutlined className="text-gray-400" />{slot}</div>
                                                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1"><BookOutlined className="text-gray-400" />Room: {sch.roomName || getRoomName(sch.room) || sch.room}</div>
                                                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1"><InfoCircleOutlined className="text-gray-400" />Location: {sch.locationName || getLocationName(sch.location) || sch.location}</div>
                                                  <div className="flex items-center gap-1 text-gray-600 text-xs mb-1"><TagOutlined className="text-gray-400" />Days: {sch.daysOfWeek}</div>
                                                  <div className="flex items-center gap-1 text-gray-600 text-xs"><CalendarOutlined className="text-gray-400" />{sch.startDateTime ? dayjs(sch.startDateTime).format('YYYY-MM-DD') : ''} - {sch.endDateTime ? dayjs(sch.endDateTime).format('YYYY-MM-DD') : ''}</div>
                                                </div>
                                              </td>
                                            );
                                          } else {
                                            return (
                                              <td key={day} className="border px-2 py-2 align-top">
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-xs">
                                                  <ClockCircleOutlined className="text-lg mb-1" />
                                                  No Class
                                                </div>
                                              </td>
                                            );
                                          }
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>
                          {/* Schedule Grid End */}
                        </div>
                      </div>
                                )}
                            </Col>

                            {/* Phần Details sẽ nằm bên dưới và cũng chiếm toàn bộ chiều rộng */}
                  <Col xs={24} md={24} className="mt-6">
                    {" "}
                    {/* Thêm class mt-6 (margin-top) để tạo khoảng cách */}
                    <Title level={5} className="!mb-3 !text-cyan-700">
                      <CalendarOutlined className="mr-2" />
                      Details
                    </Title>
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
                              <Option key={v} value={v}>
                                {n}
                              </Option>
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
                              <Option key={v} value={v}>
                                {n}
                              </Option>
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
                            {
                              required: true,
                              message: "Start date is required",
                            },
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
                            disabledDate={disabledDate}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="endDate"
                          label="End Date"
                          rules={[
                            {
                              required: true,
                              message: "End date is required",
                            },
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
                            disabledDate={disabledDate}
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
                            {
                              required: true,
                              message: "Start time is required",
                            },
                          ]}
                        >
                                            <TimePicker 
                                                className="w-full" 
                            format="HH:mm"
                                                showNow={false}
                                                disabledHours={getDisabledHours}
                            disabledMinutes={getDisabledMinutesForHalfHour}
                                                disabledSeconds={getDisabledSeconds}
                                                hideDisabledOptions
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                    {/* Recurring Days select box */}
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
                        {!createdClassSubjectId && !isEditingScheduleDetails && (
                            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                    <Button
                      icon={<RollbackOutlined />}
                      onClick={() => navigate("/class")}
                      size="large"
                      className="mr-4 hover:!text-cyan-600 hover:!border-cyan-600"
                    >
                      Back to Classrooms
                    </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleCreateScheduleSubmit}
                      loading={submittingStep1}
                      size="large"
                      className="!bg-cyan-600 hover:!bg-cyan-700 !border-none"
                    >
                                    Save Schedule & Proceed to Step 2
                                </Button>
                            </div>
                        )}
                         {createdClassSubjectId && !isEditingScheduleDetails && (
                  <Alert
                    message="Step 1 Completed"
                    description={`Schedule created with Class Subject ID: ${createdClassSubjectId}. Training Schedule ID: ${createdTrainingScheduleId}. You can now proceed to Step 2 below, or edit schedule details.`}
                    type="success"
                    showIcon
                    className="mt-4"
                  />
                        )}
                        {isEditingScheduleDetails && createdClassSubjectId && (
                            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200 gap-4">
                    <Button
                      onClick={handleCancelUpdateScheduleDetails}
                      size="large"
                    >
                                    Cancel Update
                                </Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleUpdateScheduleDetailsSubmit}
                      loading={submittingStep1}
                      size="large"
                      className="!bg-cyan-600 hover:!bg-cyan-700"
                    >
                                    Update Schedule Details
                                </Button>
                            </div>
                        )}
                    </Form>
                </Spin>
            </Card>
          <br />
            {/* ----- STEP 2: ASSIGN TRAINEES ----- */}
            <Card 
            className={`!transition-all !duration-500 !shadow-xl !rounded-xl !border ${
              !isStep1Completed
                ? "!opacity-50 !cursor-not-allowed"
                : "!border-cyan-500"
            }`}
                bordered
                title={
                    <div className="flex items-center">
                <TeamOutlined
                  className={`!mr-3 !text-2xl ${
                    !isStep1Completed ? "!text-gray-400" : "!text-cyan-600"
                  }`}
                />
                <Title
                  level={4}
                  style={{ margin: 0 }}
                  className={`${
                    !isStep1Completed ? "!text-gray-500" : "!text-cyan-700"
                  }`}
                >
                  Step 2: Assign Trainees to Class
                </Title>
                    </div>
                }
            >
            <Spin
              spinning={loading.assigningTrainee || loading.eligibleTrainees}
            >
              <div
                className={`${!isStep1Completed ? "pointer-events-none" : ""}`}
              >
                {" "}
                {/* Overlay để chặn tương tác khi Bước 1 chưa xong */}
                        <Form.Item label="Assign Trainee Method" className="mb-6">
                  <Radio.Group
                    onChange={(e) => setTraineeAssignMethod(e.target.value)}
                    value={traineeAssignMethod}
                    disabled={!isStep1Completed}
                  >
                    <Radio.Button value="import">
                      <UploadOutlined className="mr-1" /> Import Excel
                    </Radio.Button>
                    <Radio.Button value="manual">
                      <UserAddOutlined className="mr-1" /> Add Manually
                    </Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                {traineeAssignMethod === "import" && (
                            <Form.Item label="Upload Excel File (.xlsx, .xls)">
                    <Upload
                      fileList={fileList}
                      beforeUpload={beforeUpload}
                      onRemove={handleRemoveFile}
                      maxCount={1}
                      disabled={!isStep1Completed || isProcessingFile}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        disabled={!isStep1Completed || isProcessingFile}
                        loading={isProcessingFile}
                        className="!bg-cyan-600 hover:!bg-cyan-700 !text-white"
                      >
                        {isProcessingFile
                          ? "Processing..."
                          : "Select File (Max 5MB)"}
                                    </Button>
                                </Upload>
                    <Text
                      type="secondary"
                      className="!block !mt-2 !text-sm !text-gray-600"
                    >
                      Ensure <strong>TraineeID</strong> column exists. Trainees
                      will be assigned to Class ID:{" "}
                      <span className="text-cyan-700">{classId}</span>
                    </Text>

                    {isProcessingFile && (
                      <Spin tip="Generating preview..." className="!mt-2" />
                    )}

                                {excelPreviewError && (
                      <Alert
                        message="File Preview Error"
                        description={excelPreviewError}
                        type="error"
                        showIcon
                        className="!mt-4"
                      />
                                )}

                                {excelPreviewData.length > 0 && !excelPreviewError && (
                                    <div className="mt-6">
                        <Title level={5} className="!text-cyan-700">
                          Preview Data ({excelPreviewData.length} records)
                        </Title>
                                        <Table 
                                            columns={excelPreviewColumns}
                                            dataSource={excelPreviewData}
                                            bordered
                                            size="small"
                          scroll={{ x: "max-content" }}
                          pagination={false}
                          className="!mt-2"
                                        />
                                    </div>
                                )}
                            </Form.Item>
                        )}
                {traineeAssignMethod === "manual" && (
                  <Form
                    form={traineeForm}
                    layout="vertical"
                    initialValues={{ trainees: [{ traineeId: "", notes: "" }] }}
                    disabled={!isStep1Completed || submittingStep2}
                  >
                    <Title level={5} className="!mb-2 !text-cyan-700">
                      Add Trainees Manually to Class ID: {classId}
                    </Title>
                    <Paragraph
                      type="secondary"
                      className="!mb-4 !text-sm !text-gray-600"
                    >
                      Select trainees who have specialty:{" "}
                      <Text strong className="!text-cyan-800">
                        {selectedSubjectSpecialty?.specialtyName ||
                          selectedSubjectSpecialty?.specialtyId ||
                          "N/A"}
                      </Text>
                      .
                                </Paragraph>
                                <Form.List name="trainees">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                                                    <Form.Item 
                                                        {...restField} 
                                name={[name, "traineeId"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select a trainee",
                                  },
                                ]}
                                style={{ width: "300px" }}
                                                    >
                                                        <Select 
                                                            placeholder="Select Trainee" 
                                                            loading={loading.eligibleTrainees}
                                                            showSearch
                                                            optionFilterProp="children"
                                                            filterOption={(input, option) => 
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase()) ||
                                    (option?.value ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  disabled={
                                    !isStep1Completed || submittingStep2
                                  }
                                >
                                  {eligibleManualTrainees.map((trainee) => (
                                    <Option
                                      key={trainee.userId}
                                      value={trainee.userId}
                                      label={`${trainee.fullName} (${trainee.userId})`}
                                    >
                                      {trainee.fullName} ({trainee.userId})
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "notes"]}
                                style={{ width: "250px" }}
                              >
                                <Input
                                  placeholder="Notes (Optional)"
                                  disabled={
                                    !isStep1Completed || submittingStep2
                                  }
                                />
                              </Form.Item>
                              {fields.length > 1 ? (
                                <Button
                                  type="dashed"
                                  danger
                                  onClick={() => remove(name)}
                                  icon={<UserOutlined />}
                                  disabled={
                                    !isStep1Completed || submittingStep2
                                  }
                                >
                                  Remove
                                </Button>
                              ) : null}
                                                </Space>
                                            ))}
                                            <Form.Item>
                            <Button
                              type="dashed"
                              onClick={() => add()}
                              block
                              icon={<UserAddOutlined />}
                              disabled={!isStep1Completed || submittingStep2}
                              className="hover:!border-cyan-500"
                            >
                              Add Another Trainee
                            </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Form>
                        )}
                <Divider className="!border-cyan-200" />
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={hardResetAndRollback}
                    size="large"
                    danger
                    className="!mr-auto"
                    disabled={submittingStep1 || submittingStep2}
                  >
                                Reset All & Start Over
                            </Button>

                  <Button
                    icon={<ReloadOutlined />}
                    onClick={resetPageForNewScheduleCycle}
                    size="large"
                    className="!mr-4 !border-cyan-500 !text-cyan-700 hover:!bg-cyan-50"
                    disabled={submittingStep1 || submittingStep2}
                  >
                                Start New Schedule Cycle
                            </Button>
                          
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleAssignTraineesSubmit}
                    loading={submittingStep2}
                    size="large"
                    className="!bg-cyan-600 !text-white hover:!bg-cyan-700"
                    disabled={
                      !isStep1Completed ||
                      submittingStep1 ||
                      (traineeAssignMethod === "import" &&
                        excelPreviewData.length === 0 &&
                        fileList.length > 0)
                    }
                  >
                                Assign Trainees & Finish
                            </Button>
                        </div>
                    </div>
                </Spin>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateScheduleForClassPage;