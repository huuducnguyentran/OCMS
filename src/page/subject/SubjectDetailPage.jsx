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
import { useState, useEffect, useMemo } from "react";
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

  // Moved useMemo to the top level of the component
  const filteredSpecialtiesForDropdown = useMemo(() => {
    // Ensure dependencies are ready before processing
    if (loadingSpecialtiesDropdown || loadingRelatedSpecialties) {
      return []; // Or some indicator that options are loading
    }
    const linkedSpecialtyIds = relatedSubjectSpecialties.map(rs => rs.specialtyId);
    return specialtiesForDropdown
      .filter(spec => !linkedSpecialtyIds.includes(spec.specialtyId));
  }, [specialtiesForDropdown, relatedSubjectSpecialties, loadingSpecialtiesDropdown, loadingRelatedSpecialties]);

  const fetchSubjectAndRelatedSpecialties = async () => {
    setLoading(true); // Overall page loading
    setLoadingRelatedSpecialties(true); // Start loading for related specialties
    setSubject(null); // Clear previous subject data
    setRelatedSubjectSpecialties([]); // Clear previous related specialties

    try {
      // 1. Fetch subject details
      const subjectResponse = await getSubjectById(subjectId);
      if (subjectResponse && subjectResponse.subject) {
        setSubject(subjectResponse.subject);
      } else {
        message.error("Could not load subject details.");
        setLoading(false);
        setLoadingRelatedSpecialties(false);
        return; // Exit if subject details failed to load
      }

      // 2. Fetch all subject specialties
      const allSpecialtiesResponse = await getAllSubjectSpecialties();

      // 3. Filter for related ones based on the current subjectId
      if (Array.isArray(allSpecialtiesResponse)) {
        const filteredSpecialties = allSpecialtiesResponse.filter(
          (ss) => ss.subjectId === subjectId
        );
        setRelatedSubjectSpecialties(filteredSpecialties);
      } else if (allSpecialtiesResponse && Array.isArray(allSpecialtiesResponse.data)) {
        // Handle cases where the actual array might be nested, e.g., response.data
        const filteredSpecialties = allSpecialtiesResponse.data.filter(
          (ss) => ss.subjectId === subjectId
        );
        setRelatedSubjectSpecialties(filteredSpecialties);
      } else {
        console.warn("Unexpected format for getAllSubjectSpecialties response or no data:", allSpecialtiesResponse);
        // No explicit message to user, Empty component will handle it
      }
    } catch (error) {
      console.error("Error fetching subject details or related specialties:", error);
      message.error("Could not load subject details or related specialties. " + (error.message || ''));
    } finally {
      setLoading(false); // Overall page loading off
      setLoadingRelatedSpecialties(false); // Stop loading for related specialties
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

  const handleOkAddSpecialty = async () => {
    try {
      // Validate and get form values first
      const values = await form.validateFields();
      setConfirmLoadingModal(true);
      
      // Now we have both subjectId and specialtyId
      const payload = {
        subjectId: subjectId,
        specialtyId: values.specialtyId // This comes from the form Select value
      };
      
      console.log('Creating subject specialty with payload:', payload); // For debugging
      
      await createSubjectSpecialty(payload);
      message.success("Specialty link added successfully");
      form.resetFields();
      setIsAddSpecialtyModalVisible(false);
      fetchSubjectAndRelatedSpecialties();
    } catch (error) {
      console.error("Error adding specialty link:", error);
      let backendMessage = "Failed to add specialty link.";
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (data.title) {
          backendMessage = data.title;
        }
        if (data.errors) {
          const errorDetails = Object.entries(data.errors)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('; ');
          backendMessage += ` Details: ${errorDetails}`;
        } else if (data.message && !data.title) {
          backendMessage = data.message;
        }
      } else if (error.message) {
        backendMessage = `Failed to add specialty link: ${error.message}`;
      }
      message.error(backendMessage);
    } finally {
      setConfirmLoadingModal(false);
    }
  };

  const handleCancelAddSpecialty = () => {
    form.resetFields();
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                navigate(shouldNavigateToSchedule ? "/schedule" : "/subject")
              }
              className="flex items-center !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
              ghost
            >
              {shouldNavigateToSchedule
                ? "Back to Schedule"
                : "Back to Subjects"}
            </Button>
            <Breadcrumb className="text-white/70">
              <Breadcrumb.Item>
                <a
                  href={shouldNavigateToSchedule ? "/schedule" : "/subject"}
                  className="text-white/70 hover:text-white"
                >
                  {shouldNavigateToSchedule ? "Schedule" : "Subjects"}
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="text-white">Details</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Title level={2} className="text-white mb-1">
            {subject?.subjectName || "Subject Details"}
          </Title>
          <Text className="text-white/80">
            Subject ID: {subject?.subjectId}
          </Text>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Credits"
                value={subject?.credits || 0}
                prefix={<BookOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Passing Score"
                value={subject?.passingScore || 0}
                prefix={<TrophyOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Subject Specialties"
                value={relatedSubjectSpecialties?.length || 0}
                prefix={<TagOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-md hover:shadow-lg transition"
            >
              <Statistic
                title="Last Updated"
                value={moment(subject?.updatedAt).format("DD/MM/YYYY")}
                prefix={<ClockCircleOutlined className="!text-cyan-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card
          title={
            <div className="flex items-center space-x-2 text-cyan-700">
              <BookOutlined />
              <span className="font-semibold">Basic Information</span>
            </div>
          }
          className="mb-8 shadow-md hover:shadow-lg transition"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="!text-gray-500">Credits</Text>
                  <Tag color="cyan" className="!mt-1 !ml-1 px-3 py-1 text-base">
                    {subject?.credits}
                  </Tag>
                </div>
                <div>
                  <Text className="!text-gray-500">Passing Score</Text>
                  <Tag color="blue" className="!mt-1 !ml-1 py-1 text-base">
                    {subject?.passingScore}
                  </Tag>
                </div>
                <div>
                  <Text className="!text-gray-500">Created By</Text>
                  <Tag
                    color="geekblue"
                    className="!mt-1 !ml-1 px-3 py-1 text-base"
                  >
                    {subject?.createByUserId}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="!text-gray-500">Created At</Text>
                  <Text strong className="block text-base">
                    {moment(subject?.createdAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
                <div>
                  <Text className="!text-gray-500">Last Updated</Text>
                  <Text strong className="block text-base">
                    {moment(subject?.updatedAt).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Text className="!text-gray-500 !block mb-1">Description</Text>
              <Text className="!text-base">
                {subject?.description || "No description available"}
              </Text>
            </Col>
          </Row>
        </Card>
<br/>
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
            !loadingRelatedSpecialties ? (
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
          {loadingRelatedSpecialties ? (
            <div className="flex justify-center items-center py-8">
              <Spin />
            </div>
          ) : relatedSubjectSpecialties && relatedSubjectSpecialties.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={relatedSubjectSpecialties}
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
        <Spin spinning={loadingSpecialtiesDropdown || loadingRelatedSpecialties}>
          <Form 
            form={form} 
            layout="vertical" 
            name="add_specialty_link_form"
          >
            <Form.Item
              name="specialtyId"
              label="Select Specialty"
              rules={[{ required: true, message: "Please select a specialty!" }]}
            >
              <Select
                placeholder="Choose a specialty to link"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {filteredSpecialtiesForDropdown.map((spec) => (
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
