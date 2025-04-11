import { useParams, useNavigate } from "react-router-dom";
import { Layout, Button, Card, Tag, Typography, Breadcrumb, Row, Col, Spin, Table, Collapse, Tooltip, Empty, Tabs, message, Result } from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  EditOutlined,
  SendOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  WarningOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { trainingPlanService } from "../../services/trainingPlanService";
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const TrainingPlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  const fetchTrainingPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      console.log("Fetching training plan with ID:", planId);
      
      const response = await trainingPlanService.getTrainingPlanById(planId);
      console.log("Training plan data response:", response);
      
      if (response && response.plan) {
        console.log("Plan data successfully fetched:", response.plan);
        setPlan(response.plan);
      } else {
        console.error("Invalid or empty response format:", response);
        setError("Invalid data format returned from server");
        message.error("Unable to load training plan. Invalid data format.");
      }
    } catch (error) {
      console.error("Error fetching training plan:", error);
      console.error("Error details:", error.message, error.stack);
      
      if (error.code === "ERR_NETWORK") {
        setNetworkError(true);
        message.error("Network error. Unable to connect to the server.");
      } else {
        setError(error.message || "Unknown error");
        message.error("Failed to load training plan: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (planId) {
      fetchTrainingPlan();
    } else {
      console.error("No plan ID provided");
      message.error("No training plan ID provided");
      setLoading(false);
    }
  }, [planId]);

  const handleRetry = () => {
    fetchTrainingPlan();
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    switch (status) {
      case 'Draft': return 'blue';
      case 'Pending': return 'orange';
      case 'Approved': return 'green';
      case 'Rejected': return 'red';
      default: return 'default';
    }
  };

  const getPlanLevelColor = (level) => {
    if (!level) return 'default';
    
    switch (level) {
      case 'Initial': return 'blue';
      case 'Recurrent': return 'purple';
      case 'Relearn': return 'orange';
      default: return 'default';
    }
  };

  const getProgressColor = (progress) => {
    if (!progress) return 'default';
    
    switch (progress) {
      case 'NotYet': return 'blue';
      case 'InProgress': return 'orange';
      case 'Completed': return 'green';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Loading training plan details...</div>
        </div>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="error"
          title="Network Error"
          subTitle="Unable to connect to the server. Please check your internet connection or try again later."
          extra={[
            <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={handleRetry}>
              Retry
            </Button>,
            <Button key="back" onClick={() => navigate('/plan')}>
              Back to Training Plans
            </Button>,
          ]}
        />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="warning"
          title="Training Plan Not Found"
          subTitle={error || "The training plan you're looking for doesn't exist or has been removed."}
          extra={[
            <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={handleRetry}>
              Retry
            </Button>,
            <Button key="back" onClick={() => navigate('/plan')}>
              Back to Training Plans
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <Breadcrumb
                className="mb-4"
                items={[
                  {
                    title: (
                      <a onClick={() => navigate('/plan')} className="text-blue-600">
                        <CalendarOutlined className="mr-1" />
                        Training Plans
                      </a>
                    ),
                  },
                  {
                    title: plan?.planName,
                  },
                ]}
              />
              <Title level={2} className="mb-2">{plan?.planName}</Title>
              <Tag color="blue" className="mb-4">{plan?.planId}</Tag>
            </div>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/plan")}
              className="text-white hover:text-blue-200 px-0 text-lg"
            >
              Back to Training Plans
            </Button>
          </div>

          <Paragraph className="text-lg text-gray-600">
            {plan?.desciption || "No description available."}
          </Paragraph>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <CalendarOutlined className="text-3xl text-blue-500 mr-4" />
                <div>
                  <Text className="text-gray-600 block">Time Period</Text>
                  <Title level={3} className="mb-0">
                    {moment(plan?.endDate).diff(moment(plan?.startDate), 'days')} days
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <TeamOutlined className="text-3xl text-green-500 mr-4" />
                <div>
                  <Text className="text-gray-600 block">Creator</Text>
                  <Title level={3} className="mb-0">{plan?.createByUserName}</Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <BookOutlined className="text-3xl text-purple-500 mr-4" />
                <div>
                  <Text className="text-gray-600 block">Courses</Text>
                  <Title level={3} className="mb-0">{plan?.courses?.length || 0}</Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Additional Information */}
        <div className="space-y-8">
          {/* Plan Details Card */}
          <Card className="rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-6">
              <Title level={4} className="flex items-center m-0">
                <InfoCircleOutlined className="mr-2 text-blue-500" />
                Plan Information
              </Title>
            </div>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text strong className="text-gray-700 block mb-1">Start Date:</Text>
                  <div className="text-lg">{moment(plan?.startDate).format('DD/MM/YYYY')}</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text strong className="text-gray-700 block mb-1">End Date:</Text>
                  <div className="text-lg">{moment(plan?.endDate).format('DD/MM/YYYY')}</div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text strong className="text-gray-700 block mb-1">Status:</Text>
                  <Tag color={getStatusColor(plan?.trainingPlanStatus)} className="text-base">
                    {plan?.trainingPlanStatus}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text strong className="text-gray-700 block mb-1">Plan Level:</Text>
                  <Tag color={getPlanLevelColor(plan?.planLevel)} className="text-base">
                    {plan?.planLevel}
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text strong className="text-gray-700 block mb-1">Specialty:</Text>
                  <Tag color="cyan" className="text-base">
                    {plan?.specialtyName} ({plan?.specialtyId})
                  </Tag>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="mb-4">
                  <Text strong className="text-gray-700 block mb-1">Created By:</Text>
                  <div className="text-lg">{plan?.createByUserId}</div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Courses Section */}
          <Card className="rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-6">
              <Title level={4} className="flex items-center m-0">
                <BookOutlined className="mr-2 text-blue-500" />
                Courses
              </Title>
            </div>
            <div className="overflow-x-auto">
              {plan.courses && plan.courses.length > 0 ? (
                <Table
                  dataSource={plan.courses}
                  rowKey="courseId"
                  className="w-full"
                  pagination={false}
                  expandable={{
                    expandedRowRender: (record) => (
                      <Tabs defaultActiveKey="subjects" className="px-4">
                        <TabPane 
                          tab={<span><BookOutlined /> Subjects ({record.subjects?.length || 0})</span>} 
                          key="subjects"
                        >
                          {record.subjects && record.subjects.length > 0 ? (
                            <Table
                              dataSource={record.subjects}
                              rowKey="subjectId"
                              pagination={false}
                              size="small"
                            >
                              <Table.Column 
                                title="Subject ID" 
                                dataIndex="subjectId" 
                                key="subjectId"
                                render={(text) => <Tag color="blue">{text}</Tag>}
                              />
                              <Table.Column 
                                title="Subject Name" 
                                dataIndex="subjectName" 
                                key="subjectName"
                              />
                              <Table.Column 
                                title="Credits" 
                                dataIndex="credits" 
                                key="credits"
                                render={(text) => <Tag color="green">{text}</Tag>}
                              />
                              <Table.Column 
                                title="Passing Score" 
                                dataIndex="passingScore" 
                                key="passingScore"
                                render={(text) => <Tag color="orange">{text}</Tag>}
                              />
                            </Table>
                          ) : (
                            <Empty description="No subjects found for this course" />
                          )}
                        </TabPane>
                        <TabPane 
                          tab={<span><TeamOutlined /> Trainees ({record.trainees?.length || 0})</span>} 
                          key="trainees"
                        >
                          {record.trainees && record.trainees.length > 0 ? (
                            <Table
                              dataSource={record.trainees}
                              rowKey="traineeAssignId"
                              pagination={false}
                              size="small"
                            >
                              <Table.Column 
                                title="Trainee ID" 
                                dataIndex="traineeId" 
                                key="traineeId"
                                render={(text) => <Tag color="blue">{text}</Tag>}
                              />
                              <Table.Column 
                                title="Status" 
                                dataIndex="requestStatus" 
                                key="requestStatus"
                                render={(text) => <Tag color={getStatusColor(text)}>{text}</Tag>}
                              />
                              <Table.Column 
                                title="Assigned Date" 
                                dataIndex="assignDate" 
                                key="assignDate"
                                render={(text) => text ? moment(text).format('DD/MM/YYYY') : '-'}
                              />
                            </Table>
                          ) : (
                            <Empty description="No trainees assigned to this course" />
                          )}
                        </TabPane>
                      </Tabs>
                    ),
                  }}
                >
                  <Table.Column 
                    title="Course ID" 
                    dataIndex="courseId" 
                    key="courseId"
                    render={(text) => <Tag color="blue">{text}</Tag>}
                  />
                  <Table.Column 
                    title="Course Name" 
                    dataIndex="courseName" 
                    key="courseName"
                    render={(text) => <span className="font-medium">{text}</span>}
                  />
                  <Table.Column 
                    title="Level" 
                    dataIndex="courseLevel" 
                    key="courseLevel"
                    render={(text) => <Tag color={getPlanLevelColor(text)}>{text}</Tag>}
                  />
                  <Table.Column 
                    title="Status" 
                    dataIndex="status" 
                    key="status"
                    render={(text) => <Tag color={getStatusColor(text)}>{text}</Tag>}
                  />
                  <Table.Column 
                    title="Progress" 
                    dataIndex="progress" 
                    key="progress"
                    render={(text) => <Tag color={getProgressColor(text)}>{text}</Tag>}
                  />
                  <Table.Column 
                    title="Created Date" 
                    dataIndex="createdAt" 
                    key="createdAt"
                    render={(text) => moment(text).format('DD/MM/YYYY')}
                  />
                </Table>
              ) : (
                <Empty description="No courses found for this training plan" />
              )}
            </div>
          </Card>

          {/* Additional Information Card */}
          <Card className="rounded-xl shadow-md">
            <Title level={4} className="mb-4">Additional Information</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card className="bg-gray-50 border-none">
                  <Title level={5} className="flex items-center mb-3">
                    <CalendarOutlined className="mr-2" />
                    Schedule Information
                  </Title>
                  <Paragraph>
                    This training plan runs from{' '}
                    <Tag color="blue">{moment(plan?.startDate).format('DD/MM/YYYY')}</Tag>
                    {' '}to{' '}
                    <Tag color="blue">{moment(plan?.endDate).format('DD/MM/YYYY')}</Tag>
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="bg-gray-50 border-none">
                  <Title level={5} className="flex items-center mb-3">
                    <TeamOutlined className="mr-2" />
                    Course Information
                  </Title>
                  <Paragraph>
                    This plan contains{' '}
                    <Tag color="blue">{plan?.courses?.length || 0} courses</Tag>
                    {' '}with{' '}
                    <Tag color="green">
                      {plan?.courses?.reduce((total, course) => total + (course.subjects?.length || 0), 0)} subjects
                    </Tag>
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end mt-8">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/plan/edit/${plan?.planId}`)}
            className="mr-4"
          >
            Edit Plan
          </Button>
          <Button
            type="default"
            icon={<SendOutlined />}
            onClick={() => {
              // Implement request functionality
              console.log("Send request for plan:", plan?.planId);
            }}
          >
            Send Request
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default TrainingPlanDetailPage; 