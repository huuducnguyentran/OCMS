import React, { useState, useEffect } from "react";
import { 
  Layout, Input, Button, Select, message, Form, 
  Spin, Card, Typography, Divider 
} from "antd";
import { ArrowLeftOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { courseService } from "../../services/courseService";
import { trainingPlanService } from "../../services/trainingPlanService";

const { Option } = Select;
const { Title, Text } = Typography;

const EditCoursePage = () => {
  // State management
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Fetch course and training plans data
  useEffect(() => {
    fetchCourseData();
    fetchTrainingPlans();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoadingCourse(true);
      const response = await courseService.getCourseById(id);
      console.log("Course data:", response);
      
      if (response && response.success && response.data) {
        // Set form values with the course data
        form.setFieldsValue({
          courseId: response.data.courseId,
          trainingPlanId: response.data.trainingPlanId,
          courseName: response.data.courseName,
          courseLevel: response.data.courseLevel
        });
      } else {
        message.error("Failed to load course data");
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
      message.error("Failed to load course data");
    } finally {
      setLoadingCourse(false);
    }
  };

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
  const handleUpdateCourse = async (values) => {
    try {
      setLoading(true);

      const formattedData = {
        courseId: values.courseId,
        trainingPlanId: values.trainingPlanId,
        courseName: values.courseName,
        courseLevel: parseInt(values.courseLevel)
      };

      console.log("Sending update data:", formattedData);
      
      // Call the update API with the course ID
      await courseService.updateCourse(id, formattedData);
      message.success("Course updated successfully!");
      navigate("/course", { state: { refresh: true } });
    } catch (error) {
      console.error("Failed to update course:", error);
      message.error(`Failed to update course: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gray-50 p-8 sm:p-10">
      <Card 
        className="max-w-5xl mx-auto shadow-xl rounded-xl overflow-hidden border-0"
        title={
          <div className="flex items-center justify-between py-2">
            <Title level={2} className="m-0 text-gray-800">Edit Course</Title>
            <Button 
              size="large"
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate("/course")}
              className="flex items-center text-gray-600 hover:text-gray-800 border-gray-300"
            >
              Back to Courses
            </Button>
          </div>
        }
        styles={{
          header: { borderBottom: '1px solid #f0f0f0' },
          body: { padding: '16px' }
        }}
      >
        <Spin spinning={loading || loadingCourse || loadingPlans} size="large">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdateCourse}
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
                  disabled
                />
              </Form.Item>

              <Form.Item
                name="courseName"
                label={<Text strong className="text-lg">Course Name</Text>}
                rules={[{ required: true, message: "Course name is required" }]}
              >
                <Input 
                  placeholder="e.g., Pilot: the first step" 
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
                  dropdownStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
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

              <Form.Item
                name="courseLevel"
                label={<Text strong className="text-lg">Course Level</Text>}
                rules={[{ required: true, message: "Course level is required" }]}
                className="col-span-2"
              >
                <Select 
                  placeholder="Select level"
                  className="rounded-lg text-lg"
                  dropdownStyle={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  size="large"
                >
                  <Option value={0} className="py-2">Initial</Option>
                  <Option value={1} className="py-2">Recurrent</Option>
                  <Option value={2} className="py-2">Relearn</Option>
                </Select>
              </Form.Item>
            </div>

            <Divider className="my-8 border-gray-200" />

            <div className="flex justify-end space-x-6 mt-8">
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchCourseData}
                className="rounded-lg border-gray-300 hover:border-gray-400 hover:text-gray-700 px-6 py-3 h-auto text-base flex items-center"
                size="large"
              >
                Reset Changes
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="bg-gray-700 hover:bg-gray-800 rounded-lg border-0 px-8 py-3 h-auto text-base flex items-center shadow-md"
                size="large"
              >
                {loading ? "Updating..." : "Update Course"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default EditCoursePage;
