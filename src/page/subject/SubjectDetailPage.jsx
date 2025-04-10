import { useParams, useNavigate } from "react-router-dom";
import { Layout, Button, Card, Tag, Typography, Breadcrumb, Row, Col, Spin, Table } from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  EditOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getSubjectById } from "../../services/subjectService";
import moment from 'moment';

const { Title, Paragraph, Text } = Typography;

const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const response = await getSubjectById(subjectId);
        setSubject(response.subject);
      } catch (error) {
        console.error("Error fetching subject:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubject();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">Loading subject details...</div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return <p className="text-center text-red-500">Subject not found!</p>;
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
                      <a onClick={() => navigate('/subject')} className="text-blue-600">
                        <BookOutlined className="mr-1" />
                        Subjects
                      </a>
                    ),
                  },
                  {
                    title: subject?.subjectName,
                  },
                ]}
              />
              <Title level={2} className="mb-2">{subject?.subjectName}</Title>
              <Tag color="blue" className="mb-4">{subject?.subjectId}</Tag>
            </div>
             <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/subject")}
              className="text-white hover:text-blue-200 px-0 text-lg"
            >
              Back to Subjects
            </Button> 
          </div>

          <Paragraph className="text-lg text-gray-600">
            {subject?.description || "No description available."}
          </Paragraph>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-8">
          <Col xs={24} sm={12}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <BookOutlined className="text-3xl text-blue-500 mr-4" />
                <div>
                  <Text className="text-gray-600 block">Credits</Text>
                  <Title level={3} className="mb-0">{subject?.credits}</Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <TrophyOutlined className="text-3xl text-yellow-500 mr-4" />
                <div>
                  <Text className="text-gray-600 block">Passing Score</Text>
                  <Title level={3} className="mb-0">{subject?.passingScore}</Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Additional Information */}
        <div className="space-y-8">
          {/* Training Schedules Section */}
          <Card className="rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-6">
              <Title level={4} className="flex items-center m-0">
                <CalendarOutlined className="mr-2 text-blue-500" />
                Training Schedules
              </Title>
            </div>
            <div className="overflow-x-auto">
              <Table
                dataSource={subject?.trainingSchedules}
                rowKey="scheduleID"
                className="w-full"
                pagination={false}
              >
                <Table.Column
                  title="Schedule ID"
                  dataIndex="scheduleID"
                  key="scheduleID"
                  render={(text) => <Tag color="blue">{text}</Tag>}
                />
                <Table.Column
                  title="Period"
                  key="period"
                  render={(_, record) => (
                    <div>
                      <div className="font-medium">
                        {moment(record.startDateTime).format('DD/MM/YYYY')} - {moment(record.endDateTime).format('DD/MM/YYYY')}
                      </div>
                      <div className="text-gray-500">
                        {record.daysOfWeek} at {record.classTime} ({record.subjectPeriod} hours)
                      </div>
                    </div>
                  )}
                />
                <Table.Column
                  title="Location"
                  key="location"
                  render={(_, record) => (
                    <div>
                      <EnvironmentOutlined className="mr-1 text-red-500" />
                      {record.location} - Room {record.room}
                    </div>
                  )}
                />
                <Table.Column
                  title="Status"
                  dataIndex="status"
                  key="status"
                  render={(status) => (
                    <Tag color={
                      status === 'Incoming' ? 'blue' :
                      status === 'Ongoing' ? 'green' :
                      status === 'Completed' ? 'gray' : 'default'
                    }>
                      {status}
                    </Tag>
                  )}
                />
                <Table.Column
                  title="Notes"
                  dataIndex="notes"
                  key="notes"
                  render={(notes) => (
                    <div className="max-w-xs truncate" title={notes}>
                      {notes || '-'}
                    </div>
                  )}
                />
              </Table>
            </div>
          </Card>

          {/* Instructors Section */}
          <Card className="rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-6">
              <Title level={4} className="flex items-center m-0">
                <TeamOutlined className="mr-2 text-blue-500" />
                Assigned Instructors
              </Title>
            </div>
            <div className="overflow-x-auto">
              <Table
                dataSource={subject?.instructors}
                rowKey="assignmentId"
                className="w-full"
                pagination={false}
              >
                <Table.Column
                  title="Assignment ID"
                  dataIndex="assignmentId"
                  key="assignmentId"
                  render={(text) => <Tag color="purple">{text}</Tag>}
                />
                <Table.Column
                  title="Instructor ID"
                  dataIndex="instructorId"
                  key="instructorId"
                  render={(text) => <Tag color="blue">{text}</Tag>}
                />
                <Table.Column
                  title="Assigned Date"
                  dataIndex="assignDate"
                  key="assignDate"
                  render={(date) => moment(date).format('DD/MM/YYYY HH:mm')}
                />
                <Table.Column
                  title="Status"
                  dataIndex="requestStatus"
                  key="requestStatus"
                  render={(status) => (
                    <Tag color={
                      status === 'Approved' ? 'green' :
                      status === 'Pending' ? 'gold' :
                      status === 'Rejected' ? 'red' : 'default'
                    }>
                      {status}
                    </Tag>
                  )}
                />
                <Table.Column
                  title="Notes"
                  dataIndex="notes"
                  key="notes"
                  render={(notes) => (
                    <div className="max-w-xs truncate" title={notes}>
                      {notes || '-'}
                    </div>
                  )}
                />
              </Table>
            </div>
          </Card>

          {/* Study Requirements Card */}
          <Card className="rounded-xl shadow-md">
            <Title level={4} className="mb-4">Additional Information</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card className="bg-gray-50 border-none">
                  <Title level={5} className="flex items-center mb-3">
                    <ClockCircleOutlined className="mr-2" />
                    Study Requirements
                  </Title>
                  <Paragraph>
                    Students must achieve a minimum score of{' '}
                    <Tag color="orange">{subject?.passingScore}</Tag>
                    {' '}to pass this subject.
                  </Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card className="bg-gray-50 border-none">
                  <Title level={5} className="flex items-center mb-3">
                    <BookOutlined className="mr-2" />
                    Credit Information
                  </Title>
                  <Paragraph>
                    This subject is worth{' '}
                    <Tag color="blue">{subject?.credits} credits</Tag>
                    {' '}towards your course completion.
                  </Paragraph>
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SubjectDetailPage;
