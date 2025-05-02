import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Empty,
  message,
  Spin,
  Pagination,
  Tag,
  Typography,
  Progress,
  Statistic,
  Row,
  Col,
  Table,
  Button,
  Collapse,
  Alert
} from "antd";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  DownOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// CSS for transition effects
const transitionStyle = {
  transition: 'all 0.3s ease',
  overflow: 'hidden'
};

const scheduleContainerStyle = {
  transition: 'max-height 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
  overflow: 'hidden'
};

const AssignedTraineeCoursePage = () => {
  // const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseDetails, setCourseDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsLoading, setDetailsLoading] = useState({});
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [errorMessageShown, setErrorMessageShown] = useState(false);
  const pageSize = 3;
  const [errorState, setErrorState] = useState({});
  const [retryCount, setRetryCount] = useState({});
  const MAX_RETRIES = 2;
  // const [errorShown, setErrorShown] = useState(false);

  useEffect(() => {
    fetchCourses();
    
    // Thêm event listener để theo dõi khi tab mất focus để tạm dừng các request không cần thiết
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Tab is now hidden - pausing requests");
        // Tạm dừng các request không cần thiết khi tab không hiển thị
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchCourses = async () => {
    const storedUserID = sessionStorage.getItem("userID");
    try {
      setLoading(true);
      setErrorState({}); // Clear previous errors
      
      // Cache key cho dữ liệu khóa học
      const cacheKey = `trainee_courses_${storedUserID}`;
      
      // Kiểm tra cache trước khi gọi API
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          // Kiểm tra xem dữ liệu có quá cũ không (5 phút)
          const now = Date.now();
          if (parsedData.timestamp && (now - parsedData.timestamp < 5 * 60 * 1000)) {
            console.log("Using cached course data");
            const approvedCourses = Array.isArray(parsedData.data) 
              ? parsedData.data.filter(course => course.status === "Approved")
              : [];
            
            setCourses(approvedCourses);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Error parsing cached data:", e);
          // Nếu có lỗi xử lý cache, tiếp tục gọi API
        }
      }
      
      const data = await courseService.getAssignedTraineeCourse(storedUserID);
      
      // Only show approved courses
      const approvedCourses = Array.isArray(data) 
        ? data.filter(course => course.status === "Approved")
        : [];
      
      setCourses(approvedCourses);
      
      // Lưu vào cache
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          data: approvedCourses,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error("Error caching course data:", e);
      }
      
      // Tối ưu việc tải chi tiết khóa học
      if (approvedCourses.length > 0) {
        // Chỉ tải chi tiết cho khóa học đầu tiên trên trang hiện tại
        if (approvedCourses.length > 0) {
          const initialCourse = approvedCourses[0];
          setTimeout(() => {
            if (!courseDetails[initialCourse.courseId]) {
              fetchCourseDetails(initialCourse.courseId, 0);
            }
          }, 1000); // Delay 1 giây
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to fetch assigned courses. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = useCallback(async (courseId, currentRetry = 0) => {
    // Skip if max retries reached for this course
    if ((retryCount[courseId] || 0) >= MAX_RETRIES) {
      return;
    }

    // Skip if this course is already loading
    if (detailsLoading[courseId]) {
      return;
    }
    
    // Skip if we already have data for this course
    if (courseDetails[courseId] && !currentRetry) {
      return;
    }

    try {
      setDetailsLoading(prev => ({ ...prev, [courseId]: true }));
      
      // Set an error timeout to prevent indefinite loading
      const timeoutId = setTimeout(() => {
        setDetailsLoading(prev => ({ ...prev, [courseId]: false }));
        setErrorState(prev => ({ 
          ...prev, 
          [courseId]: "Request timed out. Network may be slow or server is busy." 
        }));
      }, 15000); // 15 second timeout
      
      const response = await courseService.getCourseById(courseId);
      clearTimeout(timeoutId); // Clear timeout if request succeeds
      
      const data = response.data || response;
      
      // Kiểm tra xem dữ liệu có hợp lệ không
      if (!data) {
        console.error(`Invalid data returned for course ${courseId}`);
        setErrorState(prev => ({ 
          ...prev, 
          [courseId]: "No data returned from server" 
        }));
        return;
      }
      
      // Đảm bảo rằng subjects là một mảng (nếu không có, gán mảng rỗng)
      const safeData = {
        ...data,
        subjects: Array.isArray(data.subjects) ? data.subjects : []
      };
      
      setCourseDetails(prev => ({
        ...prev,
        [courseId]: safeData
      }));
      
      // Clear error state if successful
      setErrorState(prev => {
        const newState = {...prev};
        delete newState[courseId];
        return newState;
      });
      
      // Reset retry count on success
      setRetryCount(prev => {
        const newState = {...prev};
        delete newState[courseId];
        return newState;
      });
      
    } catch (error) {
      console.error(`Error fetching details for course ${courseId}:`, error);
      
      // Add a delay between retries to avoid overwhelming the server
      if (currentRetry < MAX_RETRIES) {
        const nextRetry = currentRetry + 1;
        const delay = 5000 * Math.pow(2, currentRetry); // Longer delay: 5s, 10s, 20s
        
        console.log(`Retrying fetch for course ${courseId}, attempt ${nextRetry} in ${delay}ms`);
        
        setRetryCount(prev => ({
          ...prev,
          [courseId]: nextRetry
        }));
        
        // Set error state for UI feedback
        setErrorState(prev => ({ 
          ...prev, 
          [courseId]: "Loading failed. Retrying..." 
        }));
        
        setTimeout(() => {
          if (!courseDetails[courseId]) { // Only retry if we still don't have the data
            fetchCourseDetails(courseId, nextRetry);
          }
        }, delay);
      } else {
        // Set final error state after all retries
        setErrorState(prev => ({ 
          ...prev, 
          [courseId]: "Could not load data after multiple attempts" 
        }));
      }
    } finally {
      setDetailsLoading(prev => ({ ...prev, [courseId]: false }));
    }
  }, [courseDetails, retryCount, detailsLoading]);

  // Get courses for current page
  const currentCourses = courses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    // When changing pages, load details for courses on the new page
    const loadDetailsForPage = async () => {
      // Only load details for visible courses that don't have data yet
      const coursesToLoad = currentCourses
        .filter(course => !courseDetails[course.courseId] && !detailsLoading[course.courseId]);
      
      if (coursesToLoad.length > 0) {
        // Limit the number of concurrent requests to avoid overwhelming the server
        const limit = 2; // Load max 2 courses at a time
        for (let i = 0; i < Math.min(limit, coursesToLoad.length); i++) {
          await fetchCourseDetails(coursesToLoad[i].courseId, 0);
        }
      }
    };

    if (currentCourses.length > 0) {
      loadDetailsForPage();
    }
  }, [currentPage, currentCourses, fetchCourseDetails, courseDetails, detailsLoading]);

  // Debounce function to limit how often a function can be called
  const useDebounce = (fn, delay) => {
    const timeoutRef = useRef(null);
    
    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  };
  
  // Toggle expand/collapse course details with debounce
  const debouncedToggleCourseExpand = useDebounce((courseId) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
    } else {
      // Nếu chưa có dữ liệu chi tiết cho khóa học này và không đang tải
      // và chưa có lỗi cho khóa học này
      if (!courseDetails[courseId] && !detailsLoading[courseId] && !errorState[courseId]) {
        fetchCourseDetails(courseId, 0);
      }
      setExpandedCourseId(courseId);
    }
  }, 300); // 300ms debounce

  // Toggle schedule expand/collapse
  const toggleScheduleExpand = (subjectId) => {
    setExpandedSchedules(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  // Get color based on status
  // const getStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case "approved":
  //       return "green";
  //     case "pending":
  //       return "orange";
  //     case "rejected":
  //       return "red";
  //     default:
  //       return "blue";
  //   }
  // };

  // Get color based on course level
  const getLevelColor = (level) => {
    if (!level) return "blue";
    
    switch(level.toLowerCase()) {
      case "initial":
        return "purple";
      case "recurrent":
        return "red";
      default:
        return "green";
    }
  };

  // Get color based on progress
  const getProgressColor = (progress) => {
    if (!progress) return "#bfbfbf";
    
    switch (progress.toLowerCase()) {
      case "completed":
        return "#52c41a";
      case "ongoing":
      case "approved":
        return "#1890ff";
      case "not started":
      case "notyet":
        return "#bfbfbf";
      default:
        return "#722ed1";
    }
  };

  // Get percentage based on progress
  const getProgressPercent = (progress) => {
    switch (progress?.toLowerCase()) {
      case "completed":
        return 100;
      case "approved":
      case "ongoing": 
        return "Ongoing";
      case "not started":
      case "notyet":
        return 0;
      default:
        return 0;
    }
  };

  // Modify the render function inside Progress component to show full green circle with white check
  const renderProgressFormat = (percent, progress) => {
    if (progress?.toLowerCase() === 'completed') {
      return (
        <div style={{ 
          backgroundColor: '#52c41a', 
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <CheckOutlined style={{ fontSize: '24px' }} />
        </div>
      );
    }
    
    if (percent === "Ongoing") {
      return (
        <div style={{ 
          backgroundColor: '#1890ff', 
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <ClockCircleOutlined style={{ fontSize: '24px' }} />
        </div>
      );
    }
    
    return (
      <span style={{ color: getProgressColor(progress) }}>
        {percent}%
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total credits from subjects
  const getTotalCredits = (subjects) => {
    if (!subjects) return 0;
    return subjects.reduce((total, subject) => total + (subject.credits || 0), 0);
  };

  // Count total subjects
  const getSubjectCount = (details) => {
    return details?.subjects?.length || 0;
  };

  // Schedule table columns - updated to show start and end dates
  const scheduleColumns = [
    {
      title: 'Days',
      dataIndex: 'daysOfWeek',
      key: 'daysOfWeek',
      width: 120,
    },
    {
      title: 'Time',
      key: 'time',
      width: 120,
      render: (_, record) => (
        <span>{record.classTime} ({record.subjectPeriod})</span>
      )
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_, record) => (
        <span>Room {record.room}, {record.location}</span>
      )
    },
    {
      title: 'Start Date',
      key: 'startDate',
      width: 120,
      render: (_, record) => (
        <span>{formatDate(record.startDateTime)}</span>
      )
    },
    {
      title: 'End Date',
      key: 'endDate',
      width: 120,
      render: (_, record) => (
        <span>{formatDate(record.endDateTime)}</span>
      )
    },
    
  ];

  // Get step color for status
  // const getStatusStepColor = (status) => {
  //   switch(status?.toLowerCase()) {
  //     case 'ongoing':
  //       return 'blue';
  //     case 'completed':
  //       return 'green';
  //     default:
  //       return 'gray';
  //   }
  // };

  // Find and update the JSX for schedule display to include animation
  // For example, in the part where schedules are shown:
  const renderScheduleSection = (subject) => {
    const isExpanded = expandedSchedules[subject.subjectId];
    
    return (
      <div className="mt-6 border-t border-gray-200 pt-6">
        <div 
          className="text-gray-800 font-semibold mb-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleScheduleExpand(subject.subjectId)}
          style={{ transition: 'all 0.2s ease' }}
        >
          <div className="flex items-center">
            <CalendarOutlined className="mr-2 text-blue-500" />
            <span>Schedule ({subject.trainingSchedules.length})</span>
          </div>
          <div style={{ 
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            <DownOutlined className="text-blue-500" />
          </div>
        </div>
        
        <div style={{
          maxHeight: isExpanded ? '500px' : '0px',
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
          ...scheduleContainerStyle,
          marginBottom: isExpanded ? '16px' : '0px'
        }}>
          {isExpanded && (
            <Table
              dataSource={subject.trainingSchedules}
              columns={scheduleColumns}
              pagination={false}
              rowKey="scheduleID"
              size="small"
            />
          )}
        </div>
      </div>
    );
  };

  // Render a custom error component for course details
  const renderErrorState = (courseId) => {
    return (
      <div className="p-6 text-center">
        <div className="mb-4">
          <Alert
            message="Can't load course data"
            description="Server is temporarily unavailable. Please try again later."
            type="error"
            showIcon
          />
        </div>
        <Button 
          type="primary" 
          onClick={() => {
            setRetryCount(prev => ({...prev, [courseId]: 0}));
            fetchCourseDetails(courseId, 0);
          }}
        >
          Thử lại
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <Title level={2} className="text-gray-800 mb-2">
            <BookOutlined className="mr-3 text-blue-600" />
            My Courses
          </Title>
          <Text className="text-gray-500">
            Track the progress and schedule of courses
          </Text>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 rounded-xl bg-white border border-gray-200 shadow-sm">
            <Spin size="large" tip="Loading courses..." />
          </div>
        ) : courses.length === 0 ? (
          <Empty 
            description={<span className="text-gray-500">No approved courses found</span>} 
            className="p-10 rounded-xl bg-white border border-gray-200 shadow-sm"
          />
        ) : (
          <>
            {/* Summary Cards */}
            <Row gutter={16} className="mb-8">
              <Col span={8}>
                <Card className="bg-gradient-to-r from-blue-500 to-blue-400 text-black border-0 rounded-xl shadow-md">
                  <Statistic 
                    title={<span className="text-black-50">Total Courses</span>} 
                    value={courses.length} 
                    prefix={<BookOutlined />} 
                    valueStyle={{ color: 'black' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="bg-gradient-to-r from-green-500 to-green-400 text-white border-0 rounded-xl shadow-md">
                  <Statistic 
                    title={<span className="text-black-50">Ongoing Courses</span>} 
                    value={courses.filter(c => c.progress?.toLowerCase() === 'ongoing').length} 
                    prefix={<ClockCircleOutlined />} 
                    valueStyle={{ color: 'orange' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-400 text-white border-0 rounded-xl shadow-md">
                  <Statistic 
                    title={<span className="text-black-50">Completed Courses</span>} 
                    value={courses.filter(c => c.progress?.toLowerCase() === 'completed').length} 
                    prefix={<CheckCircleOutlined />} 
                    valueStyle={{ color: 'green' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Thông báo lỗi chung nếu có */}
            {Object.keys(errorState).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <div className="flex items-center mb-2">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <Text strong className="text-red-600">
                    Some courses can not be loaded
                  </Text>
                </div>
                <Text className="text-red-500">
                  There is an issue loading course details. This may be due to network issues or the server being busy. Please try again later.
                </Text>
              </div>
            )}

            {/* Courses Section */}
            <div className="space-y-10 mb-10">
              {currentCourses.map((course) => {
                const details = courseDetails[course.courseId];
                const isExpanded = expandedCourseId === course.courseId;

                return (
              <Card
                key={course.courseId}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow animate__animated animate__fadeIn shadow-sm"
                  >
                    {/* Course Header - with smooth transition */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between" 
                      style={transitionStyle}>
                      <div className="mb-4 md:mb-0">
                        <Title level={4} className="text-gray-800 mb-2">
                          {course.courseName}
                        </Title>
                        <div className="flex items-center space-x-4 text-gray-500 text-sm">
                          <span><Tag color="blue">{course.courseId}</Tag></span>
                          <span><Tag color={getLevelColor(course.courseLevel)}>{course.courseLevel}</Tag></span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div>
                          <Progress 
                            type="circle" 
                            percent={getProgressPercent(course.progress)} 
                            size={60} 
                            strokeColor={getProgressColor(course.progress)}
                            format={() => renderProgressFormat(getProgressPercent(course.progress), course.progress)}
                          />
                        </div>
                        <Button 
                          type="primary" 
                          icon={<EyeOutlined />} 
                          onClick={() => debouncedToggleCourseExpand(course.courseId)}
                        >
                          {isExpanded ? "Collapse" : "Details"}
                        </Button>
                      </div>
                    </div>

                    {/* Course Details */}
                    <div 
                      style={{
                        maxHeight: isExpanded ? '2000px' : '0px',
                        opacity: isExpanded ? 1 : 0,
                        margin: isExpanded ? '24px 0 0 0' : '0',
                        padding: isExpanded ? '24px' : '0',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden',
                        backgroundColor: '#f9fafb',
                        borderRadius: '0.5rem'
                      }}
                    >
                      {isExpanded && errorState[course.courseId] ? (
                        renderErrorState(course.courseId)
                      ) : isExpanded && details ? (
                        <>
                          {/* Stats Cards */}
                          <Row gutter={[16, 16]} className="mb-8">
                            <Col span={8}>
                              <Card className="bg-white border border-gray-200 shadow-sm">
                                <Statistic 
                                  title={<span className="text-gray-500">Number of Subjects</span>} 
                                  value={getSubjectCount(details)} 
                                  prefix={<BookOutlined className="text-blue-500" />} 
                                  valueStyle={{ color: '#1890ff' }}
                                />
                              </Card>
                            </Col>
                            <Col span={8}>
                              <Card className="bg-white border border-gray-200 shadow-sm">
                                <Statistic 
                                  title={<span className="text-gray-500">Total Credits</span>} 
                                  value={getTotalCredits(details?.subjects || [])} 
                                  prefix={<FileTextOutlined className="text-green-500" />} 
                                  valueStyle={{ color: '#52c41a' }}
                                />
                              </Card>
                            </Col>
                            <Col span={8}>
                              <Card className="bg-white border border-gray-200 shadow-sm">
                                <Statistic 
                                  title={<span className="text-gray-500">Plan ID</span>} 
                                  value={details?.trainingPlanId || "N/A"} 
                                  prefix={<InfoCircleOutlined className="text-purple-500" />}
                                  valueStyle={{ color: '#722ed1', fontSize: '16px' }}
                                />
                              </Card>
                            </Col>
                          </Row>

                          {/* Subjects */}
                          <Collapse 
                            className="mb-8 bg-white border border-gray-200 shadow-sm" 
                            expandIconPosition="end"
                          >
                            <Panel 
                              header={
                                <span className="text-gray-800 font-semibold">
                                  <BookOutlined className="mr-2 text-blue-500" />
                                  Subjects List
                                </span>
                              } 
                              key="subjects"
                            >
                              {details?.subjects && details.subjects.length > 0 ? (
                                <div>
                                  {details?.subjects?.map(subject => (
                                    <Card 
                                      key={subject.subjectId} 
                                      size="small" 
                                      className="bg-white border border-gray-200 shadow-sm mb-4"
                                      title={
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-800 font-semibold">{subject.subjectName}</span>
                                          <Tag color="blue">{subject.subjectId}</Tag>
                                        </div>
                                      }
                                    >
                                      <div className="mb-6 grid grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                          <FileTextOutlined className="mr-1 text-green-500" />
                                          <span className="text-gray-600">Credits: {subject.credits}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <CheckCircleOutlined className="mr-1 text-red-500" />
                                          <span className="text-gray-600">Passing Score: {subject.passingScore}</span>
                                        </div>
                                        
                                        {/* Display instructors */}
                                        {subject.instructors && subject.instructors.length > 0 && (
                                          <div className="flex items-center col-span-2">
                                            <TeamOutlined className="mr-1 text-blue-500" />
                                            <span className="text-gray-600">Instructors: {subject.instructors.map(inst => inst.instructorId).join(', ')}</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Display schedules - with animated transition */}
                                      {subject.trainingSchedules && subject.trainingSchedules.length > 0 && 
                                        renderScheduleSection(subject)
                                      }
                                    </Card>
                                  ))}
                                </div>
                              ) : (
                                <Empty 
                                  description={<span className="text-gray-500">No subjects found</span>} 
                                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                />
                              )}
                            </Panel>
                            <br></br>
                          </Collapse>
                        </>
                      ) : isExpanded ? (
                        <div className="p-6 text-center">
                          <Spin tip="Loading course details..." />
                          <p className="mt-4 text-gray-500">Please wait while we load the course information...</p>
                          <p className="mt-2 text-xs text-gray-400">If this takes too long, try closing and reopening the details.</p>
                        </div>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <Pagination
                current={currentPage}
                onChange={setCurrentPage}
                total={courses.length}
                pageSize={pageSize}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssignedTraineeCoursePage;
