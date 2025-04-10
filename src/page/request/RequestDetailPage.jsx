import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  approveRequest,
  getRequestById,
  rejectRequest,
} from "../../services/requestService";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ProfileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  ScheduleOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Spin, Tag, Button, message, Modal, Card, Collapse, Empty, Table, Typography, Divider } from "antd";
import { trainingPlanService } from "../../services/trainingPlanService";

const { Panel } = Collapse;
const { Title, Text } = Typography;

// RequestType enum to text mapping
const RequestTypeEnum = {
  0: "New Plan",
  1: "Recurrent Plan",
  2: "Relearn Plan",
  4: "Plan Change",
  5: "Plan Delete"
};

const RequestDetail = () => {
  const { id } = useParams(); // get id from route
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getRequestById(id);
        setRequest(data);
        
        // If request type is one of the training plan types (0, 1, 2, 4, 5)
        // And we have an entityId, fetch the plan details
        if (data && [0, 1, 2, 4, 5].includes(Number(data.requestType)) && data.requestEntityId) {
          await fetchTrainingPlan(data.requestEntityId);
        }
      } catch (err) {
        console.error("Error fetching request by ID:", err);
        message.error("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const fetchTrainingPlan = async (planId) => {
    try {
      setLoadingPlan(true);
      const response = await trainingPlanService.getTrainingPlanById(planId);
      if (response && response.plan) {
        setPlanData(response.plan);
              console.log(response.plan);

      }
    } catch (error) {
      console.error("Error fetching training plan:", error);
      message.error("Failed to load training plan details");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveRequest(request.requestId);
      message.success("Request approved successfully");
      setRequest({ ...request, status: "Approved" });
    } catch (error) {
      console.error("Failed to approve request:", error);
      message.error("Failed to approve request");
    }
  };

  const handleReject = () => {
    Modal.confirm({
      title: "Reject Request",
      content: "Are you sure you want to reject this request?",
      onOk: async () => {
        try {
          await rejectRequest(request.requestId, "Rejected by admin");
          message.success("Request rejected successfully");
          setRequest({ ...request, status: "Rejected" });
        } catch (error) {
          console.error("Failed to reject request:", error);
          message.error("Failed to reject request");
        }
      },
    });
  };

  // Render training plan details with collapsible sections
  const renderTrainingPlan = () => {
    if (!planData) return <Empty description="No training plan data available" />;

    return (
      <div className="mt-6">
        <Card 
          title={
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-indigo-800">{planData.planName || 'Unnamed Plan'}</span>
              <Tag color={
                planData.trainingPlanStatus === "Draft" ? "blue" : 
                planData.trainingPlanStatus === "Approved" ? "green" : 
                "orange"
              }>
                {planData.trainingPlanStatus || 'No Status'}
              </Tag>
            </div>
          }
          className="shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600"><strong>Plan ID:</strong> {planData.planId || 'N/A'}</p>
              <p className="text-gray-600"><strong>Level:</strong> {planData.planLevel || 'N/A'}</p>
              <p className="text-gray-600"><strong>Created by:</strong> {planData.createByUserName || 'N/A'}</p>
              <p className="text-gray-600"><strong>Specialty:</strong> {planData.specialtyName || 'N/A'} {planData.specialtyId ? `(${planData.specialtyId})` : ''}</p>
            </div>
            <div>
              <p className="text-gray-600"><strong>Start Date:</strong> {planData.startDate ? new Date(planData.startDate).toLocaleDateString() : 'N/A'}</p>
              <p className="text-gray-600"><strong>End Date:</strong> {planData.endDate ? new Date(planData.endDate).toLocaleDateString() : 'N/A'}</p>
              <p className="text-gray-600"><strong>Description:</strong> {planData.description || 'No description'}</p>
            </div>
          </div>

          <Divider orientation="left">Courses</Divider>
          
          {planData.courses && planData.courses.length > 0 ? (
            <Collapse 
              className="mb-4"
              bordered={false}
              expandIcon={({ isActive }) => isActive ? <DownOutlined /> : <RightOutlined />}
            >
              {planData.courses.map(course => (
                <Panel 
                  key={course.courseId || 'unknown-course'} 
                  header={
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <BookOutlined className="text-blue-600" />
                        <span className="font-semibold">{course.courseName || 'Unnamed Course'}</span>
                      </div>
                      <Tag color={
                        course.status === "Approved" ? "green" : 
                        course.status === "Rejected" ? "red" : 
                        "orange"
                      }>
                        {course.status || 'No Status'}
                      </Tag>
                    </div>
                  }
                  className="bg-blue-50 mb-2 rounded-lg overflow-hidden border border-blue-100"
                >
                  <div className="pl-6 py-2">
                    <p className="text-gray-600"><strong>Course ID:</strong> {course.courseId || 'N/A'}</p>
                    <p className="text-gray-600"><strong>Level:</strong> {course.courseLevel || 'N/A'}</p>
                    <p className="text-gray-600"><strong>Progress:</strong> {course.progress || 'N/A'}</p>
                    <p className="text-gray-600"><strong>Created At:</strong> {course.createdAt ? new Date(course.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>

                  <Divider orientation="left">Subjects</Divider>
                  
                  {course.subjects && course.subjects.length > 0 ? (
                    <Collapse className="ml-6" bordered={false}>
                      {course.subjects.map(subject => (
                        <Panel
                          key={subject.subjectId || 'unknown-subject'}
                          header={
                            <div className="flex items-center gap-2">
                              <ReadOutlined className="text-green-600" />
                              <span className="font-semibold">{subject.subjectName || 'Unnamed Subject'}</span>
                            </div>
                          }
                          className="bg-green-50 mb-2 rounded-lg overflow-hidden border border-green-100"
                        >
                          <div className="pl-6 py-2">
                            <p className="text-gray-600"><strong>Subject ID:</strong> {subject.subjectId || 'N/A'}</p>
                            <p className="text-gray-600"><strong>Credits:</strong> {subject.credits || 'N/A'}</p>
                            <p className="text-gray-600"><strong>Passing Score:</strong> {subject.passingScore || 'N/A'}</p>
                            <p className="text-gray-600"><strong>Description:</strong> {subject.description || 'No description'}</p>
                          </div>

                          <Divider orientation="left">Instructors</Divider>
                          {subject.instructors && subject.instructors.length > 0 ? (
                            <div className="ml-6">
                              {subject.instructors.map((instructor, index) => (
                                <div key={instructor.id || `instructor-${index}`} className="flex items-center gap-2 mb-2">
                                  <UserOutlined className="text-purple-600" />
                                  <span>{instructor.name || 'Unknown Instructor'}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Empty className="my-4" description="No instructors assigned" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}

                          <Divider orientation="left">Schedules</Divider>
                          {subject.trainingSchedules && subject.trainingSchedules.length > 0 ? (
                            <div className="ml-6">
                              {subject.trainingSchedules.map((schedule, index) => (
                                <div key={schedule.scheduleID || `schedule-${index}`} className="bg-yellow-50 p-3 rounded-lg mb-2 border border-yellow-100">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ScheduleOutlined className="text-orange-600" />
                                    <span className="font-semibold">Schedule ID: {schedule.scheduleID || 'N/A'}</span>
                                  </div>
                                  <p className="text-gray-600"><strong>Room:</strong> {schedule.room || 'N/A'}</p>
                                  <p className="text-gray-600"><strong>Location:</strong> {schedule.location || 'N/A'}</p>
                                  <p className="text-gray-600"><strong>Days:</strong> {schedule.daysOfWeek ? schedule.daysOfWeek.join(', ') : 'N/A'}</p>
                                  <p className="text-gray-600"><strong>Time:</strong> {schedule.classTime || 'N/A'}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Empty className="my-4" description="No schedules available" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )}
                        </Panel>
                      ))}
                    </Collapse>
                  ) : (
                    <Empty className="my-4" description="No subjects in this course" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Empty description="No courses in this training plan" />
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Request List
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">
            {request?.requestId || "Request Details"}
          </span>
        </div>
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl text-gray-800 font-semibold mb-4">
            Request Details
          </h2>
          <div className="flex gap-4 mt-4">
            {!loading && request?.status === "Pending" && (
              <div className="flex ml-auto gap-4 mt-4 mb-1">
                <Link
                  onClick={handleApprove}
                  className="!text-blue-600 hover:!text-blue-800 hover:underline cursor-pointer font-medium"
                >
                  Approve
                </Link>
                <Link
                  onClick={handleReject}
                  className="!text-red-600 hover:!text-red-800 hover:underline cursor-pointer font-medium"
                >
                  Reject
                </Link>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : request ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <div className="relative space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Request ID: {request.requestId}
                  </h2>

                  <div className="flex items-center gap-2 text-gray-600">
                    <ProfileOutlined className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Type: {RequestTypeEnum[request.requestType] || request.requestType}
                    </span>
                  </div>

                  {request.requestEntityId && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <ProfileOutlined className="text-indigo-500" />
                      <span className="text-sm font-medium">
                        Entity ID: {request.requestEntityId}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <FileTextOutlined className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Description: {request.description || 'No description'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarOutlined className="text-indigo-500" />
                    <span className="text-sm font-medium">
                      Request Date:{" "}
                      {request.requestDate ? new Date(request.requestDate).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    Status:{" "}
                    <Tag
                      icon={
                        request.status === "Approved" ? (
                          <CheckCircleOutlined />
                        ) : request.status === "Rejected" ? (
                          <CloseCircleOutlined />
                        ) : (
                          <ClockCircleOutlined />
                        )
                      }
                      color={
                        request.status === "Approved"
                          ? "green"
                          : request.status === "Rejected"
                          ? "red"
                          : "orange"
                      }
                      className="text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {request.status || 'Unknown'}
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Show training plan details if applicable */}
              {request.requestType !== undefined && [0, 1, 2, 4, 5].includes(Number(request.requestType)) && (
                <>
                  <Divider orientation="left">Training Plan Details</Divider>
                  {loadingPlan ? (
                    <div className="flex justify-center py-8">
                      <Spin size="large" />
                    </div>
                  ) : (
                    renderTrainingPlan()
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-red-500">Request not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
