import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Tag,
  Typography,
  Breadcrumb,
  Row,
  Col,
  Spin,
  Table,
  Statistic,
  Avatar,
  List,
  Empty,
  message,
  Tooltip,
  Modal,
  Form,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  BookOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { getSubjectById } from "../../services/subjectService";
import { 
  createSubjectSpecialty, 
  getAllSubjectSpecialties
} from "../../services/subjectSpecialtyServices";
import { specialtyService } from '../../services/specialtyServices';
import moment from "moment";

const { Title, Text, Paragraph } = Typography;

const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainees, setTrainees] = useState([]);
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const [relatedSubjectSpecialties, setRelatedSubjectSpecialties] = useState([]);
  const [loadingRelatedSpecialties, setLoadingRelatedSpecialties] = useState(false);
  const isTrainee = sessionStorage.getItem("role") === "Trainee";
  const isInstructor = sessionStorage.getItem("role") === "Instructor";
  const shouldNavigateToSchedule = isTrainee || isInstructor;

  const [isAddSpecialtyModalVisible, setIsAddSpecialtyModalVisible] = useState(false);
  const [specialtiesForDropdown, setSpecialtiesForDropdown] = useState([]);
  const [loadingSpecialtiesDropdown, setLoadingSpecialtiesDropdown] = useState(false);
  const [selectedSpecialtyIdModal, setSelectedSpecialtyIdModal] = useState(null);
  const [confirmLoadingModal, setConfirmLoadingModal] = useState(false);
  const [form] = Form.useForm();

  const fetchSubjectAndRelatedSpecialties = async () => {
    setLoading(true); // Overall page loading
    setLoadingRelatedSpecialties(true);
    try {
      const subjectPromise = getSubjectById(subjectId);
      const allSpecialtiesPromise = getAllSubjectSpecialties();

      const [subjectResponse, allSpecialtiesResponse] = await Promise.all([
        subjectPromise,
        allSpecialtiesPromise,
      ]);

      setSubject(subjectResponse.subject);

      if (Array.isArray(allSpecialtiesResponse)) {
        const filteredSpecialties = allSpecialtiesResponse.filter(
          (ss) => ss.subjectId === subjectId
        );
        setRelatedSubjectSpecialties(filteredSpecialties);
      } else {
        setRelatedSubjectSpecialties([]);
      }
    } catch (error) {
      console.error("Error fetching subject details or related specialties:", error);
      message.error("Could not load subject details or related specialties");
      setRelatedSubjectSpecialties([]);
    } finally {
      setLoading(false); // Overall page loading off
      setLoadingRelatedSpecialties(false);
    }
  };

  useEffect(() => {
    fetchSubjectAndRelatedSpecialties();
  }, [subjectId]);


  useEffect(() => {
    const fetchSpecialtiesForDropdown = async () => {
      try {
        setLoadingSpecialtiesDropdown(true);
        const response = await specialtyService.getAllSpecialties();
        console.log("fetchSpecialtiesForDropdown",  response);
        if (response && response.data) {
          setSpecialtiesForDropdown(response.data);
        } else {
          setSpecialtiesForDropdown([]);
        }
      } catch (error) {
        console.error("Error fetching specialties for dropdown:", error);
        setSpecialtiesForDropdown([]);
      } finally {
        setLoadingSpecialtiesDropdown(false);
      }
    };
    fetchSpecialtiesForDropdown();
  }, []);

  const showAddSpecialtyModal = () => {
    setIsAddSpecialtyModalVisible(true);
  };

  const handleOkAddSpecialty = async (values) => {
    try {
      setConfirmLoadingModal(true);
      await createSubjectSpecialty(values.specialtyId);
      message.success("Specialty link added successfully");
      form.resetFields();
      setIsAddSpecialtyModalVisible(false);
    } catch (error) {
      console.error("Error adding specialty link:", error);
      message.error("Failed to add specialty link");
    } finally {
      setConfirmLoadingModal(false);
    }
  };

  const handleCancelAddSpecialty = () => {
    setIsAddSpecialtyModalVisible(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <Text className="block mt-4 text-gray-600">
            Loading subject details...
          </Text>
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
              onClick={() => navigate(shouldNavigateToSchedule ? "/schedule" : "/subject")}
              className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
              ghost
            >
              {shouldNavigateToSchedule ? "Back to Schedule" : "Back to Subjects"}
            </Button>
            <Breadcrumb className="text-white/60">
              <Breadcrumb.Item>
                <a 
                  href={shouldNavigateToSchedule ? "/schedule" : "/subject"} 
                  className="text-white/60 hover:text-white"
                >
                  {shouldNavigateToSchedule ? "Schedule" : "Subjects"}
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="text-white">Details</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Title level={2} className="text-white mb-2">
            {subject?.subjectName || "Subject Details"}
          </Title>
          <Text className="text-white/80">
            Subject ID: {subject?.subjectId}
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Credits"
                value={subject?.credits || 0}
                prefix={<BookOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Passing Score"
                value={subject?.passingScore || 0}
                prefix={<TrophyOutlined className="text-yellow-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Subject Specialties"
                value={subject?.courseSubjectSpecialties?.length || 0}
                prefix={<TagOutlined className="text-purple-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Last Updated"
                value={moment(subject?.updatedAt).format("DD/MM/YYYY")}
                prefix={<ClockCircleOutlined className="text-indigo-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <BookOutlined className="text-blue-500" />
              <span>Basic Information</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Credits</Text>
                  <Tag color="blue" className="mt-1 text-base px-3 py-1">
                    {subject?.credits || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">Passing Score</Text>
                  <Tag color="orange" className="mt-1 text-base px-3 py-1">
                    {subject?.passingScore || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">Created By</Text>
                  <Tag color="cyan" className="mt-1 text-base px-3 py-1">
                    {subject?.createByUserId || "N/A"}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Created At</Text>
                  <Text strong className="text-base">
                    {moment(subject?.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-500 block">Last Updated</Text>
                  <Text strong className="text-base">
                    {moment(subject?.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Text className="text-gray-500 block mb-2">Description</Text>
              <Text className="text-base">
                {subject?.description || "No description available"}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Related Specialties Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <TagOutlined className="text-green-500" />
              <span>Related Specialties</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
          extra={
            !subject?.courseSubjectSpecialties || subject.courseSubjectSpecialties.length === 0 ? (
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={showAddSpecialtyModal}
              >
                Add Specialty Link
              </Button>
            ) : null
          }
        >
          {subject?.courseSubjectSpecialties && subject.courseSubjectSpecialties.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={subject.courseSubjectSpecialties}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<TagOutlined />} style={{ backgroundColor: '#87d068' }}/>}
                    title={item.specialty?.specialtyName || "Unknown Specialty"}
                    description={`Specialty ID: ${item.specialty?.specialtyId || 'N/A'}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No specialties are currently linked to this subject." />
          )}
        </Card>

      </div>

      <Modal
        title="Add Specialty Link to Subject"
        open={isAddSpecialtyModalVisible}
        onOk={handleOkAddSpecialty}
        confirmLoading={confirmLoadingModal}
        onCancel={handleCancelAddSpecialty}
        okText="Add Link"
        cancelText="Cancel"
      >
        <Spin spinning={loadingSpecialtiesDropdown}>
          <Form form={form} layout="vertical" name="add_specialty_link_form">
            <Form.Item
              name="specialtyId"
              label="Select Specialty"
              rules={[{ required: true, message: "Please select a specialty!" }]}
            >
              <Select
                placeholder="Choose a specialty to link"
                onChange={(value) => setSelectedSpecialtyIdModal(value)}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {specialtiesForDropdown.map((spec) => (
                  <Select.Option key={spec.specialtyId} value={spec.specialtyId}>
                    {spec.specialtyName} ({spec.specialtyId})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default SubjectDetailPage;
