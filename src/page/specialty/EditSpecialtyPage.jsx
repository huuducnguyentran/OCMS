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
import { useNavigate, useParams } from "react-router-dom";
import { specialtyService } from "../../services/specialtyServices";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title } = Typography;

const EditSpecialtyPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [specialtyData, allSpecialties] = await Promise.all([
          specialtyService.getSpecialtyById(id),
          specialtyService.getAllSpecialties(),
        ]);

        if (specialtyData.success) {
          form.setFieldsValue({
            specialtyName: specialtyData.data.specialtyName,
            description: specialtyData.data.description,
            parentSpecialtyId: specialtyData.data.parentSpecialtyId,
            status: specialtyData.data.status,
          });
        }

        if (allSpecialties.success) {
          setSpecialties(
            allSpecialties.data.filter((s) => s.specialtyId !== id)
          );
        }
      } catch (error) {
        message.error("Failed to fetch specialty data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await specialtyService.updateSpecialty(id, {
        ...values,
        status: parseInt(values.status),
      });

      if (response.success) {
        message.success("Specialty updated successfully");
        navigate("/specialty");
      } else {
        message.error(response.message || "Failed to update specialty");
      }
    } catch (error) {
      message.error("Error updating specialty");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <Card className="!max-w-6xl !mx-auto !shadow-xl !border !border-cyan-200 !rounded-xl">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            className="!mb-4 !text-cyan-700 !border-cyan-600 hover:!bg-cyan-100"
            onClick={() => navigate("/specialty")}
          >
            Back to Specialties
          </Button>

          <Title level={2} className="!mb-1 !text-cyan-800">
            {id ? "Edit Specialty" : "Create New Specialty"}
          </Title>
          <p className="text-cyan-700">
            {id
              ? "Update specialty information"
              : "Add a new medical specialty"}
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
                label={<span className="!text-cyan-800">Specialty Name</span>}
                rules={[
                  { required: true, message: "Please enter specialty name" },
                  { max: 100, message: "Name cannot exceed 100 characters" },
                ]}
              >
                <Input
                  placeholder="Enter specialty name"
                  className="h-10 !border-cyan-600 focus:!border-cyan-700 focus:!ring-cyan-700"
                />
              </Form.Item>

              <Form.Item
                name="parentSpecialtyId"
                label={<span className="!text-cyan-800">Parent Specialty</span>}
              >
                <Select
                  allowClear
                  placeholder="Select parent specialty"
                  className="!h-10 !border-cyan-600 focus:!border-cyan-700 focus:!ring-cyan-700"
                  options={specialties.map((s) => ({
                    value: s.specialtyId,
                    label: s.specialtyName,
                  }))}
                />
              </Form.Item>
            </div>

            <Form.Item
              name="description"
              label={<span className="text-cyan-800">Description</span>}
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
                className="resize-none !border-cyan-600 focus:!border-cyan-700 focus:!ring-cyan-700"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label={<span className="!text-cyan-800">Status</span>}
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select className="w-full md:w-1/3 custom-cyan-select">
                <Select.Option value={0}>
                  <Tag color="green">Active</Tag>
                </Select.Option>
                <Select.Option value={1}>
                  <Tag color="red">Inactive</Tag>
                </Select.Option>
              </Select>
            </Form.Item>

            <div className="flex justify-end gap-4 pt-6 border-t !border-cyan-200">
              <Button
                onClick={() => navigate("/specialty")}
                className="!min-w-[100px] !border-cyan-600 text-cyan-700 hover:!bg-cyan-50"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="!min-w-[100px] !bg-cyan-700 hover:!bg-cyan-800 !border-none"
              >
                {id ? "Save Changes" : "Create"}
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EditSpecialtyPage;
