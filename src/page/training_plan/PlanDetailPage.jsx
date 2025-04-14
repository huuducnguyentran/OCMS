import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Empty, Spin, Button, Typography, Breadcrumb, Statistic, Row, Col, Divider } from 'antd';
import { 
  ArrowLeftOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  PlusOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { trainingPlanService } from '../../services/trainingPlanService';

const { Title, Text } = Typography;

const PlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await trainingPlanService.getTrainingPlanById(planId);
      console.log("Plan details response:", response);
      
      if (response && response.plan) {
        setPlanDetails(response.plan);
      } else {
        message.error("Could not load plan details");
      }
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      message.error("Could not load plan details");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getAllSubjects = () => {
    if (!planDetails?.courses) return [];
    return planDetails.courses.flatMap(course => 
      course.subjects?.map(subject => ({
        ...subject,
        courseId: course.courseId,
        courseName: course.courseName
      })) || []
    );
  };

  const getAllSchedules = () => {
    if (!planDetails?.courses) return [];
    return planDetails.courses.flatMap(course => 
      course.subjects?.flatMap(subject => 
        subject.trainingSchedules?.map(schedule => ({
          ...schedule,
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          courseId: course.courseId,
          courseName: course.courseName
        })) || []
      ) || []
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <Text className="block mt-4 text-gray-600">Loading plan details...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/plan')}
              className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
              ghost
            >
              Back to Plans
            </Button>
            <Breadcrumb className="text-white/60">
              <Breadcrumb.Item>
                <a href="/plan" className="text-white/60 hover:text-white">Plans</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="text-white">Details</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          
          <Title level={2} className="text-white mb-2">
            {planDetails?.planName || 'Training Plan Details'}
          </Title>
          <Text className="text-white/80">
            Plan ID: {planDetails?.planId}
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Courses"
                value={planDetails?.courses?.length || 0}
                prefix={<BookOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Subjects"
                value={getAllSubjects().length}
                prefix={<TeamOutlined className="text-green-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Total Schedules"
                value={getAllSchedules().length}
                prefix={<ClockCircleOutlined className="text-purple-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false} className="h-full shadow-sm hover:shadow-md transition-shadow">
              <Statistic
                title="Status"
                value={planDetails?.trainingPlanStatus || 'N/A'}
                prefix={<CheckCircleOutlined className="text-indigo-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-blue-500" />
              <span>Basic Information</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Plan Level</Text>
                  <Tag color="blue" className="mt-1 text-base px-3 py-1">
                    {planDetails?.planLevel || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">Start Date</Text>
                  <Text strong className="text-base">
                    {planDetails?.startDate ? new Date(planDetails.startDate).toLocaleDateString() : "N/A"}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Status</Text>
                  <Tag color={planDetails?.trainingPlanStatus === "Approved" ? "green" : "orange"} className="mt-1 text-base px-3 py-1">
                    {planDetails?.trainingPlanStatus || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">End Date</Text>
                  <Text strong className="text-base">
                    {planDetails?.endDate ? new Date(planDetails.endDate).toLocaleDateString() : "N/A"}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Divider orientation="left">Description</Divider>
              <Text className="text-base">
                {planDetails?.desciption || "No description available"}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Courses Section */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <BookOutlined className="text-green-500" />
              <span>Courses</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          {planDetails?.courses?.length > 0 ? (
            <Table
              dataSource={planDetails.courses}
              columns={[
                { 
                  title: 'Course ID', 
                  dataIndex: 'courseId', 
                  key: 'courseId',
                  width: '15%',
                  render: (text) => <Text strong>{text}</Text>
                },
                { 
                  title: 'Course Name', 
                  dataIndex: 'courseName', 
                  key: 'courseName',
                  width: '25%'
                },
                { 
                  title: 'Level', 
                  dataIndex: 'courseLevel', 
                  key: 'courseLevel',
                  width: '15%',
                  render: (level) => (
                    <Tag color="blue">{level || 'N/A'}</Tag>
                  )
                },
                { 
                  title: 'Status', 
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === "Approved" ? "green" : "default"}>
                      {status || "N/A"}
                    </Tag>
                  )
                },
                {
                  title: 'Progress',
                  dataIndex: 'progress',
                  key: 'progress',
                  render: (progress) => (
                    <Tag color={progress === "NotYet" ? "orange" : "green"}>
                      {progress || "N/A"}
                    </Tag>
                  )
                }
              ]}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    dataSource={record.subjects || []}
                    columns={[
                      { 
                        title: 'Subject ID', 
                        dataIndex: 'subjectId', 
                        key: 'subjectId',
                        width: '15%',
                        render: (text) => <Text strong>{text}</Text>
                      },
                      { 
                        title: 'Subject Name', 
                        dataIndex: 'subjectName', 
                        key: 'subjectName',
                        width: '25%'
                      },
                      {
                        title: 'Credits',
                        dataIndex: 'credits',
                        key: 'credits',
                        width: '10%',
                        render: (credits) => (
                          <Tag color="blue">{credits || 'N/A'}</Tag>
                        )
                      },
                      {
                        title: 'Passing Score',
                        dataIndex: 'passingScore',
                        key: 'passingScore',
                        width: '15%',
                        render: (score) => (
                          <Tag color="green">{score || 'N/A'}</Tag>
                        )
                      },
                      {
                        title: 'Instructor',
                        key: 'instructor',
                        width: '15%',
                        render: (_, record) => {
                          const instructor = record.instructors?.[0];
                          return instructor ? (
                            <Tag color="purple">{instructor.instructorId}</Tag>
                          ) : (
                            <Tag color="default">No Instructor</Tag>
                          );
                        }
                      },
                      {
                        title: 'Schedules',
                        key: 'schedules',
                        width: '20%',
                        render: (_, record) => (
                          <div className="space-y-1">
                            {record.trainingSchedules?.map((schedule, index) => (
                              <Tag key={index} color="cyan">
                                {schedule.classTime} - {schedule.daysOfWeek}
                              </Tag>
                            )) || <Tag color="default">No Schedule</Tag>}
                          </div>
                        )
                      }
                    ]}
                    pagination={false}
                    size="small"
                    rowKey="subjectId"
                    className="bg-gray-50 rounded-lg"
                  />
                ),
                expandIcon: ({ expanded, onExpand, record }) => (
                  expanded ? (
                    <Button 
                      icon={<MinusOutlined />} 
                      onClick={e => onExpand(record, e)}
                      type="text"
                      className="text-blue-500"
                    >
                    </Button>
                  ) : ( 
                    <Button 
                      icon={<PlusOutlined />} 
                      onClick={e => onExpand(record, e)}
                      type="text"
                      className="text-gray-500 hover:text-blue-500"
                    >
                    </Button>
                  )
                )
              }}
              size="middle"
              pagination={false}
              rowKey="courseId"
              className="shadow-sm"
            />
          ) : (
            <Empty description="No courses assigned" />
          )}
        </Card>

        {/* Training Schedules Section */}
        <Card 
          title={
            <div className="flex items-center space-x-2">
              <ScheduleOutlined className="text-indigo-500" />
              <span>Training Schedules</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          {getAllSchedules().length > 0 ? (
            <Table
              dataSource={getAllSchedules()}
              columns={[
                { 
                  title: 'Schedule ID', 
                  dataIndex: 'scheduleID', 
                  key: 'scheduleID',
                  width: '15%',
                  render: (text) => <Text strong>{text}</Text>
                },
                { 
                  title: 'Subject', 
                  key: 'subject',
                  width: '25%',
                  render: (_, record) => (
                    <div>
                      <Text strong>{record.subjectName}</Text>
                      <Text className="block text-xs text-gray-500">{record.subjectId}</Text>
                    </div>
                  )
                },
                { 
                  title: 'Time', 
                  key: 'time',
                  width: '20%',
                  render: (_, record) => (
                    <div className="space-y-1">
                      <Text strong>{record.classTime}</Text>
                      <Tag color="blue" className="block w-fit">{record.daysOfWeek}</Tag>
                      <Text className="block text-xs text-gray-500">
                        Duration: {record.subjectPeriod}
                      </Text>
                    </div>
                  )
                },
                { 
                  title: 'Location', 
                  key: 'location',
                  width: '20%',
                  render: (_, record) => (
                    <div>
                      <Text strong>Room: {record.room}</Text>
                      <Text className="block text-xs text-gray-500">{record.location}</Text>
                    </div>
                  )
                },
                {
                  title: 'Status',
                  key: 'status',
                  width: '10%',
                  render: (_, record) => (
                    <Tag color={record.status === "Incoming" ? "blue" : "default"}>
                      {record.status}
                    </Tag>
                  )
                },
                {
                  title: 'Instructor',
                  dataIndex: 'instructorID',
                  key: 'instructor',
                  width: '10%',
                  render: (instructorId) => (
                    <Tag color="purple">{instructorId || 'N/A'}</Tag>
                  )
                }
              ]}
              size="middle"
              pagination={false}
              rowKey="scheduleID"
              className="shadow-sm"
            />
          ) : (
            <Empty description="No schedules assigned" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PlanDetailPage;
