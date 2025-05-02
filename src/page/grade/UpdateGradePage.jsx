import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Spin,
  InputNumber,
  Typography,
  Breadcrumb,
} from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { gradeServices } from "../../services/gradeServices";
import { useAuth } from "../../context/useAuth";
import {
  ArrowLeftOutlined,
  BookOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UpdateGradePage = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const { user } = useAuth();
  const [finalExamEnabled, setFinalExamEnabled] = useState(true);
  const [resitEnabled, setResitEnabled] = useState(false);

  const gradeData = location.state?.gradeData;

  useEffect(() => {
    if (!gradeData || !id) {
      message.error("No grade data provided");
      navigate("/grade");
      return;
    }

    if (id !== gradeData.gradeId) {
      message.error("Invalid grade ID");
      navigate("/grade");
      return;
    }

    const formattedData = {
      traineeAssignID: gradeData.traineeAssignID,
      subjectId: gradeData.subjectId,
      participantScore: parseFloat(gradeData.participantScore) || 0,
      assignmentScore: parseFloat(gradeData.assignmentScore) || 0,
      finalExamScore: parseFloat(gradeData.finalExamScore) || 0,
      finalResultScore: parseFloat(gradeData.finalResultScore) || 0,
      remarks: gradeData.remarks || "",
    };

    setInitialData(formattedData);
    form.setFieldsValue(formattedData);
  }, [gradeData, form, navigate, id]);

  useEffect(() => {
    if (gradeData) {
      const finalExamScore = parseFloat(gradeData.finalExamScore) || 0;
      if (finalExamScore > 0) {
        setFinalExamEnabled(true);
        setResitEnabled(false);
        form.setFieldValue("finalResultScore", 0);
      } else {
        setFinalExamEnabled(false);
        setResitEnabled(true);
      }
    }
  }, [gradeData, form]);

  const handleFinalExamScoreChange = (value) => {
    const score = parseFloat(value) || 0;
    if (score > 0) {
      setResitEnabled(false);
      form.setFieldValue("finalResultScore", 0);
    } else {
      setResitEnabled(true);
    }
  };

  const handleResitChange = (value) => {
    const score = parseFloat(value) || 0;
    if (score > 0) {
      setFinalExamEnabled(false);
      form.setFieldValue("finalExamScore", 0);
    } else {
      setFinalExamEnabled(true);
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      if (!id || !gradeData?.traineeAssignID) {
        throw new Error("Required IDs are missing");
      }

      const updateData = {
        traineeAssignID: gradeData.traineeAssignID,
        subjectId: gradeData.subjectId,
        participantScore: Number(values.participantScore),
        assignmentScore: Number(values.assignmentScore),
        finalExamScore: Number(values.finalExamScore),
        finalResultScore: Number(values.finalResultScore),
        remarks: values.remarks || "",
      };

      console.log("Updating grade:", { gradeId: id, data: updateData });

      await gradeServices.updateGrade(id, updateData);
      message.success("Grade updated successfully");
      navigate("/grade-view");
    } catch (error) {
      console.error("Error details:", error);
      message.error(error.response?.data?.message || "Failed to update grade");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !initialData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-lg mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/grade-view")}
              className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
              ghost
            >
              Back to Grades
            </Button>
            <Breadcrumb className="text-white/60">
              <Breadcrumb.Item>
                <a
                  href="/grade-view"
                  className="text-white/60 hover:text-white"
                >
                  Grades
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="text-white">
                Update Grade
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Title level={2} className="text-white mb-2">
            Update Grade
          </Title>
          <Text className="text-white/80">
            Update grade information for trainee
          </Text>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto shadow-md" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialData}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="traineeAssignID" label="Trainee Assign ID">
              <Input
                disabled
                prefix={<BookOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item name="subjectId" label="Subject ID">
              <Input
                disabled
                prefix={<FileExcelOutlined className="text-gray-400" />}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="participantScore"
              label="Participant Score"
              rules={[
                { required: true, message: "Please input participant score!" },
                {
                  type: "number",
                  min: 0,
                  max: 10,
                  message: "Score must be between 0 and 10!",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                step={0.1}
                precision={1}
                placeholder="Enter participant score"
              />
            </Form.Item>

            <Form.Item
              name="assignmentScore"
              label="Assignment Score"
              rules={[
                { required: true, message: "Please input assignment score!" },
                {
                  type: "number",
                  min: 0,
                  max: 10,
                  message: "Score must be between 0 and 10!",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                step={0.1}
                precision={1}
                placeholder="Enter assignment score"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="finalExamScore"
              label={
                <span>
                  Final Exam Score
                  {!finalExamEnabled && (
                    <span className="text-gray-400 ml-2">
                      (Disabled when Resit &gt; 0)
                    </span>
                  )}
                </span>
              }
              rules={[
                {
                  required: finalExamEnabled,
                  message: "Please input final exam score!",
                },
                {
                  type: "number",
                  min: 0,
                  max: 10,
                  message: "Score must be between 0 and 10!",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                step={0.1}
                precision={1}
                placeholder="Enter final exam score"
                disabled={!finalExamEnabled}
                onChange={handleFinalExamScoreChange}
              />
            </Form.Item>

            <Form.Item
              name="finalResultScore"
              label={
                <span>
                  Resit
                  {!resitEnabled && (
                    <span className="text-gray-400 ml-2">
                      (Disabled when Final Exam &gt; 0)
                    </span>
                  )}
                </span>
              }
              rules={[
                {
                  required: resitEnabled,
                  message: "Please input resit score!",
                },
                {
                  type: "number",
                  min: 0,
                  max: 10,
                  message: "Score must be between 0 and 10!",
                },
              ]}
            >
              <InputNumber
                className="w-full"
                step={0.1}
                precision={1}
                placeholder="Enter resit score"
                disabled={!resitEnabled}
                onChange={handleResitChange}
              />
            </Form.Item>
          </div>

          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea
              rows={4}
              placeholder="Enter remarks (optional)"
              className="w-full"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => navigate("/grade-view")}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
              >
                Update
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateGradePage;
