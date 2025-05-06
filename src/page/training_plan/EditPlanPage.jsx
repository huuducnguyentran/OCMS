import { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  DatePicker,
  message,
  Spin,
  Card,
  Typography,
  Divider,
  Form,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { trainingPlanService } from "../../services/trainingPlanService";
import { applyTrainingPlanValidation } from "../../../utils/validationSchemas";

const { TextArea } = Input;
const { Title, Text } = Typography;

const EditPlanPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        const response = await trainingPlanService.getTrainingPlanById(planId);
        form.setFieldsValue({
          planName: response.planName,
          description: response.desciption,
          startDate: dayjs(response.startDate),
          endDate: dayjs(response.endDate),
        });
      } catch (error) {
        console.error("Error fetching plan:", error);
        message.error("Failed to load plan data");
        navigate("/plan");
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlanData();
    }
  }, [planId, form]);

  const disablePastDates = (current) => {
    const today = dayjs().startOf("day");
    return current && current.isBefore(today);
  };

  const handleUpdatePlan = async (values) => {
    try {
      await applyTrainingPlanValidation(values);

      setLoading(true);
      const formattedData = {
        planName: values.planName.trim(),
        Desciption: values.description.trim(),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      await trainingPlanService.updateTrainingPlan(planId, formattedData);
      message.success("Training plan updated successfully");
      navigate("/plan", { state: { refresh: true } });
    } catch (error) {
      if (error.name === "ValidationError") {
        message.error(`Validation error: ${error.message}`);
      } else {
        console.error("Error details:", error.response?.data || error);
        message.error(
          `Failed to update Training Plan: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <Card
        className="max-w-4xl mx-auto shadow-lg rounded-xl overflow-hidden"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="m-0 text-blue-700">
              Edit Training Plan
            </Title>
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
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleUpdatePlan}
            className="p-2"
          >
            <Form.Item
              name="planName"
              label={<Text strong>Plan Name</Text>}
              rules={[
                { required: true, message: "Plan name is required" },
                {
                  max: 100,
                  message: "Plan name must not exceed 100 characters",
                },
              ]}
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
                {
                  max: 100,
                  message: "Description must not exceed 100 characters",
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter description"
                className="rounded-lg py-2 px-3 text-base"
                maxLength={100}
              />
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
                    if (value.isBefore(now, "minute")) {
                      return Promise.reject(
                        new Error("Start date cannot be in the past")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full rounded-lg py-2 px-3 text-base"
                showTime={{ format: "HH:mm", minuteStep: 5, showNow: true }}
                format="YYYY-MM-DD HH:mm"
                disabledDate={disablePastDates}
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
                    const startDate = getFieldValue("startDate");
                    if (
                      startDate &&
                      (value.isSame(startDate) || value.isBefore(startDate))
                    ) {
                      return Promise.reject(
                        new Error("End date must be after start date")
                      );
                    }
                    if (startDate) {
                      const diffDays = value.diff(startDate, "days");
                      if (diffDays < 1 || diffDays > 365) {
                        return Promise.reject(
                          new Error("Duration should be between 1 and 365 days")
                        );
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full rounded-lg py-2 px-3 text-base"
                showTime={{ format: "HH:mm", minuteStep: 5, showNow: true }}
                format="YYYY-MM-DD HH:mm"
                disabledDate={(current) => {
                  const startDate = form.getFieldValue("startDate");
                  return (
                    disablePastDates(current) ||
                    (startDate &&
                      (current.isSame(startDate, "day") ||
                        current.isBefore(startDate)))
                  );
                }}
              />
            </Form.Item>

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
                {loading ? "Updating..." : "Update Plan"}
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default EditPlanPage;
