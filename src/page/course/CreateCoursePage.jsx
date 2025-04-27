import React, { useState, useEffect } from "react";
import { 
  Layout, Input, Button, Select, message, Form, 
  Spin, Card, Typography, Divider 
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { trainingPlanService } from "../../services/trainingPlanService";

const { Option } = Select;
const { Title, Text } = Typography;

const CreateCoursePage = () => {
  // State management
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [courseLevel, setCourseLevel] = useState(0);

  // Fetch training plans
  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  const fetchTrainingPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await trainingPlanService.getAllTrainingPlans();
      setTrainingPlans(response.plans || []);
    } catch (error) {
      console.error("Failed to fetch training plans:", error);
      message.error("Failed to load training plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  // Form submission
  const handleCreateCourse = async (values) => {
    try {
      setLoading(true);

      const formattedData = {
        courseId: values.courseId,
        trainingPlanId: values.trainingPlanId,
        courseName: values.courseName,
        description: values.description,
        courseRelatedId: values.courseRelatedId || "",
      };

      console.log("Sending course data:", formattedData);
      
      await courseService.createCourse(formattedData);
      message.success("Course created successfully!");
      form.resetFields();
      navigate("/all-courses", { state: { refresh: true } });
    } catch (error) {
      console.error("Failed to create course:", error);
      message.error(`Failed to create course: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm xử lý khi thay đổi course level
  const handleCourseLevelChange = (value) => {
    setCourseLevel(value);
    // Reset courseRelatedId khi chuyển sang Initial
    if (value === 0) {
      form.setFieldValue('courseRelatedId', '');
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50 p-8 sm:p-10">
      <Card 
        className="max-w-5xl mx-auto shadow-xl rounded-xl overflow-hidden border-0"
        title={
          <div className="flex items-center justify-between py-2">
            <Title level={2} className="m-0 text-gray-800">Create New Course</Title>
            <Button 
              size="large"
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/all-courses")}
              className="flex items-center text-gray-600 hover:text-gray-800 border-gray-300"
            >
              Back to Courses
            </Button>
          </div>
        }
        headStyle={{ borderBottom: '2px solid #f0f0f0', padding: '16px 24px' }}
        bodyStyle={{ padding: '32px' }}
      >
        <Spin spinning={loading || loadingPlans} size="large">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateCourse}
            initialValues={{ courseLevel: 0 }}
            className="p-2"
            size="large"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Form.Item
                name="courseId"
                label={<Text strong className="text-lg">Course ID</Text>}
                rules={[{ required: true, message: "Course ID is required" }]}
              >
                <Input 
                  placeholder="e.g., C-0001" 
                  className="rounded-lg py-3 px-4 text-lg" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="courseName"
                label={<Text strong className="text-lg">Course Name</Text>}
                rules={[{ required: true, message: "Course name is required" }]}
              >
                <Input 
                  placeholder="Enter course name" 
                  className="rounded-lg py-3 px-4 text-lg" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="courseRelatedId"
                label={<Text strong className="text-lg">Course Related ID</Text>}
                rules={[
                  {
                    required: courseLevel > 0,
                    message: "Course Related ID is required for Recurrent/Relearn courses"
                  }
                ]}
              >
                <Input 
                  placeholder="Enter Course Related ID" 
                  className="rounded-lg py-3 px-4 text-lg" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<Text strong className="text-lg">Description</Text>}
                rules={[{ required: true, message: "Description is required" }]}
              >
                <Input.TextArea 
                  placeholder="Enter course description" 
                  className="rounded-lg py-3 px-4 text-lg" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="trainingPlanId"
                label={<Text strong className="text-lg">Training Plan</Text>}
                rules={[{ required: true, message: "Training plan is required" }]}
                className="col-span-2"
              >
                <Select
                  placeholder="Select training plan"
                  loading={loadingPlans}
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg text-lg"
                  dropdownStyle={{ borderRadius: '8px' }}
                  notFoundContent={loadingPlans ? <Spin size="small" /> : "No training plans found"}
                  size="large"
                >
                  {trainingPlans.map(plan => (
                    <Option key={plan.planId} value={plan.planId} className="py-2">
                      {plan.planName} ({plan.planId})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Divider className="my-8 border-gray-200" />

            <div className="flex justify-end space-x-6 mt-8">
              <Button 
                icon={<ReloadOutlined />}
                onClick={() => form.resetFields()}
                className="rounded-lg border-gray-300 hover:border-gray-400 hover:text-gray-700 px-6 py-3 h-auto text-base flex items-center"
                size="large"
              >
                Reset Form
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                loading={loading}
                className="bg-gray-700 hover:bg-gray-800 rounded-lg border-0 px-8 py-3 h-auto text-base flex items-center shadow-md"
                size="large"
              >
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default CreateCoursePage; 