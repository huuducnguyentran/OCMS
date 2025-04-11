import { Layout, Card, Button, Empty, Tag, Popconfirm, message, Tooltip, Modal, Form, Input, Select, Checkbox, Space, DatePicker, Row, Col, Input as AntInput, Typography, Badge, Spin } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { trainingPlanService } from '../../services/trainingPlanService';
import "animate.css";

const { Search } = AntInput;
const { Title, Paragraph } = Typography;

const RequestTypeEnum = {
  NewPlan: 0,
  RecurrentPlan: 1,
  RelearnPlan: 2,
  PlanChange: 4,
  PlanDelete: 5
};

const RequestTypeLabels = {
  [RequestTypeEnum.NewPlan]: "New Plan",
  [RequestTypeEnum.RecurrentPlan]: "Recurrent Plan",
  [RequestTypeEnum.RelearnPlan]: "Relearn Plan",
  [RequestTypeEnum.PlanChange]: "Plan Change",
  [RequestTypeEnum.PlanDelete]: "Plan Delete"
};

// Thêm các enum và options mới
const PlanLevelEnum = {
  Initial: 0,
  Recurrent: 1,
  Relearn: 2
};

const StatusEnum = {
  Pending: 0,
  Approved: 1,
  Rejected: 2
};

// Cập nhật lại các options với giá trị enum
const statusOptions = [
  { label: 'Pending', value: 0 },
  { label: 'Approved', value: 1 },
  { label: 'Rejected', value: 2 }
];

const planLevelOptions = [
  { label: 'Initial', value: 0 },
  { label: 'Recurrent', value: 1 },
  { label: 'Relearn', value: 2 }
];

const PlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestForm] = Form.useForm();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter and sort states
  const [searchText, setSearchText] = useState('');
  const [selectedStatusValues, setSelectedStatusValues] = useState([]);
  const [selectedLevelValues, setSelectedLevelValues] = useState([]);
  const [dateSort, setDateSort] = useState('desc'); // 'asc' hoặc 'desc'
  const [filterVisible, setFilterVisible] = useState(false);

  const fetchTrainingPlans = async () => {
    try {
      setLoading(true);
      console.log("Fetching all training plans...");
      
      const response = await trainingPlanService.getAllTrainingPlans();
      console.log("All training plans response:", response);
      
      if (response && response.plans) {
        console.log("Training plans data:", response.plans);
        setTrainingPlans(response.plans);
        applyFilters(response.plans);
      } else {
        console.error("Invalid response format:", response);
        message.error("Failed to load training plans data: Invalid format");
        setTrainingPlans([]);
        setFilteredPlans([]);
      }
    } catch (error) {
      console.error("Failed to fetch training plans:", error);
      console.error("Error details:", error.message, error.stack);
      message.error("Failed to load training plans: " + (error.message || "Unknown error"));
      setTrainingPlans([]);
      setFilteredPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchTrainingPlans();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  // Apply all filters & sort
  const applyFilters = (plans) => {
    const planList = plans || trainingPlans;
    if (!planList || planList.length === 0) {
      setFilteredPlans([]);
      return;
    }

    let result = [...planList];

    // Filter by search text
    if (searchText && searchText.trim() !== '') {
      const lowerSearchText = searchText.toLowerCase().trim();
      result = result.filter(plan => 
        (plan.planName && plan.planName.toLowerCase().includes(lowerSearchText)) || 
        (plan.planId && plan.planId.toLowerCase().includes(lowerSearchText))
      );
    }

    // Filter by status using enum values
    if (selectedStatusValues.length > 0) {
      result = result.filter(plan => selectedStatusValues.includes(plan.trainingPlanStatus));
    }

    // Filter by plan level using enum values
    if (selectedLevelValues.length > 0) {
      result = result.filter(plan => selectedLevelValues.includes(plan.planLevel));
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateSort === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    setFilteredPlans(result);
  };

  // Apply filters when filter conditions change
  useEffect(() => {
    applyFilters();
  }, [searchText, selectedStatusValues, selectedLevelValues, dateSort]);

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

  // Cập nhật hàm getPlanLevelText
  const getPlanLevelText = (level) => {
    // Chỉ trả về level như giá trị thực tế
    return level || "Unknown";
  };

  const handleViewDetails = (planId) => {
    if (planId) {
      navigate(`/plan/${planId}`);
    } else {
      message.error("Invalid plan ID");
    }
  };

  const handleEdit = (planId) => {
    if (planId) {
      navigate(`/plan/edit/${planId}`);
    } else {
      message.error("Invalid plan ID");
    }
  };

  const handleDelete = async (planId) => {
    try {
      await trainingPlanService.deleteTrainingPlan(planId);
      message.success("Training plan deleted successfully");
      fetchTrainingPlans();
    } catch (error) {
      console.error("Failed to delete training plan:", error);
      message.error("Failed to delete training plan");
    }
  };

  const handleRequest = (planId, planName) => {
    setSelectedPlan({ id: planId, name: planName });
    requestForm.resetFields();
    setRequestModalVisible(true);
  };

  const handleRequestSubmit = async () => {
    try {
      const values = await requestForm.validateFields();
      setSubmitting(true);
      
      await trainingPlanService.createRequest(
        selectedPlan.id,
        values.description,
        values.notes,
        values.requestType
      );
      
      message.success(`Request sent for plan: ${selectedPlan.name}`);
      setRequestModalVisible(false);
    } catch (error) {
      console.error("Failed to send request:", error);
      message.error("Failed to send request for this plan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = (values) => {
    setSelectedStatusValues(values);
  };

  const handleLevelChange = (values) => {
    setSelectedLevelValues(values);
  };

  const handleDateSortChange = () => {
    setDateSort(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const renderFilterSection = () => {
    return (
      <Card 
        className="mb-6 w-full shadow-md animate__animated animate__fadeIn"
        style={{ display: filterVisible ? 'block' : 'none' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="mb-2 font-semibold">
              Status Filter <span className="text-gray-500 text-xs">(none selected = show all)</span>
            </div>
            <Checkbox.Group 
              options={statusOptions} 
              value={selectedStatusValues} 
              onChange={handleStatusChange}
              className="flex flex-wrap gap-2"
            />
          </Col>
          
          <Col xs={24} md={8}>
            <div className="mb-2 font-semibold">
              Plan Level Filter <span className="text-gray-500 text-xs">(none selected = show all)</span>
            </div>
            <Checkbox.Group onChange={handleLevelChange} value={selectedLevelValues}>
              <Space direction="vertical">
                {planLevelOptions.map(level => (
                  <Checkbox key={level.value} value={level.value}>
                    {level.label}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Col>
          
          <Col xs={24} md={8}>
            <div className="mb-2 font-semibold">Date Sort</div>
            <Button 
              type="default" 
              icon={<SortAscendingOutlined rotate={dateSort === 'desc' ? 180 : 0} />} 
              onClick={handleDateSortChange}
              className="w-full"
            >
              Sort Date {dateSort === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
            </Button>
          </Col>
        </Row>
      </Card>
    );
  };

  const renderRequestModal = () => {
    return (
      <Modal
        title={`Send Request for Plan: ${selectedPlan?.name || ''}`}
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        onOk={handleRequestSubmit}
        confirmLoading={submitting}
        okText="Submit Request"
        width={600}
      >
        <Form
          form={requestForm}
          layout="vertical"
          initialValues={{ requestType: RequestTypeEnum.NewPlan }}
        >
          <Form.Item
            name="requestType"
            label="Request Type"
            rules={[{ required: true, message: 'Please select a request type' }]}
          >
            <Select placeholder="Select request type">
              {Object.entries(RequestTypeLabels).map(([value, label]) => (
                <Select.Option key={value} value={Number(value)}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter request description" />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notes"
            rules={[{ required: true, message: 'Please enter a Notes' }]}
          >
            <Input.TextArea rows={3} placeholder="Additional notes " />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate__animated animate__fadeIn">
            <CalendarOutlined className="text-5xl mb-4" />
            <h1 className="text-4xl font-bold mb-4">Training Plans</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Manage and organize your training schedules effectively
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate__animated animate__fadeInDown">
          <div className="max-w-xl mx-auto">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Search plans by name or ID..."
              onChange={(e) => setSearchText(e.target.value)}
              className="text-lg rounded-lg"
              allowClear
              size="large"
            />
          </div>
          
          {/* Filter Section */}
          {filterVisible && (
            <div className="mt-6 animate__animated animate__fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Status Filter */}
                <div>
                  <Title level={5}>Status</Title>
                  <div className="space-y-2">
                    {statusOptions.map(option => (
                      <Tag
                        key={option.value}
                        className={`cursor-pointer px-3 py-1 mr-2 ${
                          selectedStatusValues.includes(option.value) ? 'bg-blue-100 border-blue-500' : ''
                        }`}
                        onClick={() => {
                          const newSelected = selectedStatusValues.includes(option.value)
                            ? selectedStatusValues.filter(v => v !== option.value)
                            : [...selectedStatusValues, option.value];
                          setSelectedStatusValues(newSelected);
                        }}
                      >
                        {option.label}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Plan Level Filter */}
                <div>
                  <Title level={5}>Plan Level</Title>
                  <div className="space-y-2">
                    {planLevelOptions.map(option => (
                      <Tag
                        key={option.value}
                        className={`cursor-pointer px-3 py-1 mr-2 ${
                          selectedLevelValues.includes(option.value) ? 'bg-blue-100 border-blue-500' : ''
                        }`}
                        onClick={() => {
                          const newSelected = selectedLevelValues.includes(option.value)
                            ? selectedLevelValues.filter(v => v !== option.value)
                            : [...selectedLevelValues, option.value];
                          setSelectedLevelValues(newSelected);
                        }}
                      >
                        {option.label}
                      </Tag>
                    ))}
                  </div>
                </div>

                {/* Sort Option */}
                <div>
                  <Title level={5}>Sort by Date</Title>
                  <Button
                    icon={<SortAscendingOutlined rotate={dateSort === 'desc' ? 180 : 0} />}
                    onClick={handleDateSortChange}
                    className={`w-full ${
                      dateSort === 'asc' ? 'bg-blue-100 border-blue-500' : ''
                    }`}
                  >
                    {dateSort === 'asc' ? 'Oldest First' : 'Newest First'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading plans..." />
          </div>
        ) : filteredPlans.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center space-y-4">
                <p className="text-gray-500 text-lg">
                  {searchText ? `No plans matching "${searchText}"` : "No plans available"}
                </p>
                <button
                  onClick={() => navigate("/plan/create")}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create your first plan
                </button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate__animated animate__fadeInUp">
            {filteredPlans.map((plan) => (
              <Card
                key={plan.planId}
                className="hover:shadow-xl transition-shadow duration-300 rounded-xl border-none bg-white overflow-hidden"
                actions={[
                  <Tooltip title="View Details">
                    <InfoCircleOutlined
                      key="details"
                      className="text-blue-500 text-lg hover:text-blue-700"
                      onClick={() => handleViewDetails(plan.planId)}
                    />
                  </Tooltip>,
                  <Tooltip title="Edit Plan">
                    <EditOutlined
                      key="edit"
                      className="text-green-500 text-lg hover:text-green-700"
                      onClick={() => handleEdit(plan.planId)}
                    />
                  </Tooltip>,
                  <Tooltip title="Send Request">
                    <SendOutlined
                      key="request"
                      className="text-blue-500 text-lg hover:text-blue-700"
                      onClick={() => handleRequest(plan.planId, plan.planName)}
                    />
                  </Tooltip>,
                  <Tooltip title="Delete Plan">
                    <DeleteOutlined
                      key="delete"
                      className="text-red-500 text-lg hover:text-red-700"
                      onClick={() => handleDelete(plan.planId)}
                    />
                  </Tooltip>,
                ]}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => handleViewDetails(plan.planId)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Title level={4} className="text-xl font-bold text-gray-800 mb-2">
                        {plan.planName}
                      </Title>
                      <Tag color="blue" className="mb-2">
                        {plan.planId}
                      </Tag>
                    </div>
                    <CalendarOutlined className="text-2xl text-blue-500" />
                  </div>

                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    className="text-gray-600 mb-4"
                  >
                    {plan.desciption || "No description provided"}
                  </Paragraph>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                    <Tag color={getStatusColor(plan.trainingPlanStatus)} className="text-center">
                      {plan.trainingPlanStatus || 'No Status'}
                    </Tag>
                    <Tag color="purple" className="text-center">
                      {getPlanLevelText(plan.planLevel)}
                    </Tag>
                  </div>

                  <div className="mt-4 text-sm text-gray-500">
                    <div className="flex justify-between items-center">
                      <span>Start: {new Date(plan.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(plan.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Action Button */}
        <Tooltip title="Create New Plan" placement="left">
          <button
            onClick={() => navigate("/plan/create")}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 animate__animated animate__bounceIn"
          >
            <PlusOutlined className="text-xl" />
          </button>
        </Tooltip>
      </div>

      {/* Request Modal */}
      {renderRequestModal()}
    </div>
  );
};

export default PlanPage;
