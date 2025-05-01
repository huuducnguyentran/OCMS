import React, { useState, useEffect } from "react";
import { 
  Layout, Input, Button, DatePicker, message, 
  Select, Spin, Card, Typography, Divider, Form 
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { trainingPlanService } from '../../services/trainingPlanService';
import { applyTrainingPlanValidation } from "../../../utils/validationSchemas";
import axiosInstance from "../../../utils/axiosInstance";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const CreateTrainingPlanPage = () => {
  // State
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const navigate = useNavigate();

  // Fetch specialties data
  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await axiosInstance.get("Specialty");
      if (response.data.success && response.data.data) {
        const activeSpecialties = response.data.data.filter(specialty => specialty.status === 0);
        setSpecialties(activeSpecialties);
      }
    } catch (error) {
      console.error("Failed to fetch specialties:", error);
      message.error("Failed to load specialties");
    } finally {
      setLoadingSpecialties(false);
    }
  };

  // Cập nhật hàm disablePastDates
  const disablePastDates = (current) => {
    // Allow current minute and future, disable past
    const today = dayjs().startOf('day');
    return current && current.isBefore(today);
  };

  // Form submission với validation
  const handleCreateTrainingPlan = async (values) => {
    try {
      // Validate using Yup schema before submission
      await applyTrainingPlanValidation(values);
      
      setLoading(true);
      const formattedData = {
        "planName": values.planName.trim(),
        "Desciption": values.description.trim(),
        "planLevel": parseInt(values.planLevel),
        "startDate": values.startDate.toISOString(),
        "endDate": values.endDate.toISOString(),
        "specialtyId": values.specialtyId
      };

      await trainingPlanService.createTrainingPlan(formattedData);
      message.success("Training Plan created successfully!");
      navigate("/plan", { state: { refresh: true } });
    } catch (error) {
      if (error.name === 'ValidationError') {
        message.error(`Validation error: ${error.message}`);
      } else {
        console.error('Error details:', error.response?.data || error);
        message.error(`Failed to create Training Plan: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function for rendering specialty options
  const renderSpecialtyOptions = (specialties) => {
    return specialties.map(specialty => {
      if (specialty.children && specialty.children.length > 0 ) {
        return (
          <Select.OptGroup key={specialty.specialtyId} label={specialty.specialtyName}>
            <Option key={specialty.specialtyId} value={specialty.specialtyId}>
              {specialty.specialtyName} ({specialty.specialtyId})
            </Option>
            {renderSpecialtyOptions(specialty.children)}
          </Select.OptGroup>
        );
      }
      return (
        <Option key={specialty.specialtyId} value={specialty.specialtyId}>
          {specialty.specialtyName} ({specialty.specialtyId})
        </Option>
      );
    });
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <Card 
        className="max-w-6xl mx-auto shadow-lg rounded-xl overflow-hidden"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="m-0 text-blue-700">Create Training Plan</Title>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/plan")}
              className="flex items-center"
            >
              Back to Plans
            </Button>
          </div>
        }
      >
        <Spin spinning={loading || loadingSpecialties}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateTrainingPlan}
            initialValues={{ planLevel: 0 }}
            className="p-2"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <Form.Item
                name="planName"
                label={<Text strong>Plan Name</Text>}
                rules={[
                  { required: true, message: "Plan name is required" },
                  { max: 100, message: "Plan name must not exceed 100 characters" }
                ]}
                className="col-span-2"
              >
                <Input 
                  placeholder="Enter plan name" 
                  className="rounded-lg py-2 px-3 text-base" 
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<Text strong>Description</Text>}
                rules={[
                  { required: true, message: "Description is required" },
                  { max: 100, message: "Description must not exceed 100 characters" }
                ]}
                className="col-span-2"
              >
                <TextArea 
                  rows={5} 
                  placeholder="Enter description" 
                  className="rounded-lg py-2 px-3 text-base" 
                  maxLength={100}
                />
              </Form.Item>

              <Form.Item
                name="planLevel"
                label={<Text strong>Plan Level</Text>}
                rules={[{ required: true, message: "Plan level is required" }]}
              >
                <Select
                  placeholder="Select level"
                  className="rounded-lg"
                  dropdownClassName="rounded-lg shadow-md"
                >
                  <Option value={0}>Initial</Option>
                  <Option value={1}>Recurrent</Option>
                  <Option value={2}>Relearn</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="specialtyId"
                label={<Text strong>Specialty</Text>}
                rules={[{ required: true, message: "Specialty is required" }]}
              >
                <Select
                  placeholder="Select specialty"
                  loading={loadingSpecialties}
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                  dropdownClassName="rounded-lg shadow-md"
                  notFoundContent={loadingSpecialties ? <Spin size="small" /> : "No specialties found"}
                >
                  {renderSpecialtyOptions(specialties)}
                </Select>
              </Form.Item>

              <Form.Item
                name="startDate"
                label={<Text strong>Start Date</Text>}
                rules={[
                  { required: true, message: "Start date is required" },
                  () => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const now = dayjs();
                      // Compare by minute precision
                      if (value.isBefore(now, 'minute')) {
                        return Promise.reject(new Error('Start date cannot be in the past'));
                      }
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <DatePicker
                  className="w-full rounded-lg py-2 px-3 text-base"
                  showTime={{ 
                    format: 'HH:mm',
                    minuteStep: 5,
                    showNow: true 
                  }}
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={disablePastDates}
                  disabledTime={(date) => {
                    if (date && date.isSame(dayjs(), 'day')) {
                      return {
                        disabledHours: () => {
                          const hours = [];
                          for (let i = 0; i < dayjs().hour(); i++) {
                            hours.push(i);
                          }
                          return hours;
                        },
                        disabledMinutes: (selectedHour) => {
                          if (selectedHour === dayjs().hour()) {
                            const minutes = [];
                            for (let i = 0; i < dayjs().minute(); i++) {
                              minutes.push(i);
                            }
                            return minutes;
                          }
                          return [];
                        }
                      };
                    }
                    return {};
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="endDate"
                label={<Text strong>End Date</Text>}
                rules={[
                  { required: true, message: "End date is required" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      const startDate = getFieldValue('startDate');
                      
                      if (startDate && (value.isBefore(startDate) || value.isSame(startDate))) {
                        return Promise.reject(new Error('End date must be after start date'));
                      }
                      
                      if (startDate) {
                        const diffDays = value.diff(startDate, 'days');
                        if (diffDays < 1 || diffDays > 365) {
                          return Promise.reject(new Error('Training plan duration should be between 1 day and 365 days'));
                        }
                      }
                      
                      return Promise.resolve();
                    }
                  })
                ]}
              >
                <DatePicker
                  className="w-full rounded-lg py-2 px-3 text-base"
                  showTime={{ 
                    format: 'HH:mm',
                    minuteStep: 5,
                    showNow: true 
                  }}
                  format="YYYY-MM-DD HH:mm"
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue('startDate');
                    return disablePastDates(current) || 
                           (startDate && (current.isBefore(startDate) || current.isSame(startDate, 'day')));
                  }}
                />
              </Form.Item>
            </div>

            <Divider />

            <div className="flex justify-end space-x-4 mt-6">
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => form.resetFields()}
                className="rounded-lg border-gray-300 hover:border-gray-400 hover:text-gray-700"
              >
                Reset
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="bg-green-500 hover:bg-green-600 rounded-lg border-0 px-6 py-2 h-auto"
              >
                {loading ? "Creating..." : "Create Plan"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default CreateTrainingPlanPage;




