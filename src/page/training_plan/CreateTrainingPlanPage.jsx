import { useState } from "react";
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
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { trainingPlanService } from "../../services/trainingPlanService";
import { applyTrainingPlanValidation } from "../../../utils/validationSchemas";

const { TextArea } = Input;
const { Title, Text } = Typography;

const CreateTrainingPlanPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const disablePastDates = (current) => {
    const today = dayjs().startOf("day");
    return current && current.isBefore(today);
  };

  const handleCreateTrainingPlan = async (values) => {
    try {
      await applyTrainingPlanValidation(values);

      setLoading(true);
      const formattedData = {
        planName: values.planName.trim(),
        Desciption: values.description.trim(),
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
      };

      await trainingPlanService.createTrainingPlan(formattedData);
      message.success("Training Plan created successfully!");
      navigate("/plan", { state: { refresh: true } });
    } catch (error) {
      if (error.name === "ValidationError") {
        message.error(`Validation error: ${error.message}`);
      } else {
        console.error("Error details:", error.response?.data || error);
        message.error(
          `Failed to create Training Plan: ${
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
              Create Training Plan
            </Title>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/plan")}
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
            onFinish={handleCreateTrainingPlan}
            className="p-2"
          >
            <Form.Item
              name="planName"
              label={<Text strong>Plan Name</Text>}
              rules={[
                { required: true, message: "Plan name is required" },
                { max: 100, message: "Must not exceed 100 characters" },
              ]}
            >
              <Input placeholder="Enter plan name" maxLength={100} />
            </Form.Item>

            <Form.Item
              name="description"
              label={<Text strong>Description</Text>}
              rules={[
                { required: true, message: "Description is required" },
                { max: 100, message: "Must not exceed 100 characters" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Enter description"
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
                    if (value.isBefore(dayjs(), "minute")) {
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
                className="w-full"
                showTime={{ format: "HH:mm", minuteStep: 5, showNow: true }}
                format="YYYY-MM-DD HH:mm"
                disabledDate={disablePastDates}
                disabledTime={(date) => {
                  if (date && date.isSame(dayjs(), "day")) {
                    return {
                      disabledHours: () => [...Array(dayjs().hour()).keys()],
                      disabledMinutes: (selectedHour) =>
                        selectedHour === dayjs().hour()
                          ? [...Array(dayjs().minute()).keys()]
                          : [],
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
                    const startDate = getFieldValue("startDate");
                    if (!value || !startDate) return Promise.resolve();
                    if (value.isSameOrBefore(startDate)) {
                      return Promise.reject(
                        new Error("End date must be after start date")
                      );
                    }
                    const diff = value.diff(startDate, "days");
                    if (diff < 1 || diff > 365) {
                      return Promise.reject(
                        new Error(
                          "Duration should be between 1 day and 365 days"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full"
                showTime={{ format: "HH:mm", minuteStep: 5, showNow: true }}
                format="YYYY-MM-DD HH:mm"
                disabledDate={(current) => {
                  const startDate = form.getFieldValue("startDate");
                  return (
                    disablePastDates(current) ||
                    (startDate &&
                      (current.isBefore(startDate) ||
                        current.isSame(startDate, "day")))
                  );
                }}
              />
            </Form.Item>

            <Divider />

            <div className="flex justify-end space-x-4">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => form.resetFields()}
              >
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                className="bg-green-500 hover:bg-green-600"
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
