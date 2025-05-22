import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  message,
  Spin,
  Card,
  Typography,
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { specialtyService } from "../../services/specialtyServices";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const CreateSpecialtyPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        setLoading(true);
        const response = await specialtyService.getAllSpecialties();
        if (response.success) {
          setSpecialties(response.data);
        }
      } catch (error) {
        message.error("Failed to fetch specialties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialties();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await specialtyService.createSpecialty({
        ...values,
        status: parseInt(values.status),
      });

      if (response.success) {
        message.success("Specialty created successfully");
        navigate("/specialty");
      } else {
        throw new Error(response.message || "Failed to create specialty");
      }
    } catch (error) {
      message.error(error.message || "Error creating specialty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100 p-6">
      <Card className="!mx-auto !mb-6 !shadow-md border !border-cyan-600">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            className="!mb-4 !text-cyan-800 hover:!text-cyan-950 hover:!border-cyan-900"
            onClick={() => navigate("/specialty")}
            type="link"
          >
            Back to Specialties
          </Button>
          <Title level={2} className="!mb-1 text-cyan-900">
            Create New Specialty
          </Title>
          <p className="text-gray-600">
            Add a new medical specialty to the system
          </p>
        </div>

        {loading && !form.isFieldsTouched() ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="space-y-6"
            initialValues={{ status: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Form.Item
                name="specialtyName"
                label="Specialty Name"
                rules={[
                  { required: true, message: "Please enter specialty name" },
                  { max: 100, message: "Name cannot exceed 100 characters" },
                ]}
              >
                <Input
                  placeholder="Enter specialty name"
                  className="h-10 !border-cyan-500 focus:!border-cyan-800"
                />
              </Form.Item>

              <Form.Item name="parentSpecialtyId" label="Parent Specialty">
                <Select
                  allowClear
                  placeholder="Select parent specialty"
                  className="!h-10 "
                  options={specialties.map((s) => ({
                    value: s.specialtyId,
                    label: s.specialtyName,
                  }))}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true, message: "Please enter description" },
                {
                  max: 500,
                  message: "Description cannot exceed 500 characters",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Enter description"
                rows={4}
                className="!resize-none !border-cyan-500 focus:!border-cyan-800"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select className="w-full md:w-1/3">
                <Select.Option value={0}>
                  <Tag color="cyan">Active</Tag>
                </Select.Option>
                <Select.Option value={1}>
                  <Tag color="red">Inactive</Tag>
                </Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => navigate("/specialty")}
                className="!min-w-[100px]"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!bg-cyan-700 hover:!bg-cyan-900 !text-white !min-w-[100px] !border-none"
              >
                Create
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default CreateSpecialtyPage;
