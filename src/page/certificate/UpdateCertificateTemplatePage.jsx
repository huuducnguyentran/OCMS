import { useEffect, useState } from "react";
import { Upload, Button, Input, Form, message, Typography, Select } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import {
  fetchCertificateTemplatebyId,
  updateCertificateTemplate,
} from "../../services/certificateService";
import { useNavigate, useParams } from "react-router-dom";

const { Title } = Typography;

const UpdateCertificateTemplatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templateUrl, setTemplateUrl] = useState(null);

  const { templateId } = useParams();

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await fetchCertificateTemplatebyId(templateId);
        form.setFieldsValue({
          description: data.description,
          templateStatus: data.templateStatus?.toString(),
        });

        if (data.templateFileWithSas) {
          setTemplateUrl(data.templateFileWithSas);
        }
      } catch (err) {
        message.error("Failed to load certificate template.");
        console.error(err);
      }
    };

    loadTemplate();
  }, [templateId, form]);

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("description", values.description);
    formData.append("templateStatus", values.templateStatus);
    if (values.htmlTemplate && values.htmlTemplate[0]?.originFileObj) {
      formData.append("htmlTemplate", values.htmlTemplate[0].originFileObj);
    }

    setLoading(true);
    try {
      await updateCertificateTemplate(templateId, formData);
      message.success("Certificate Template updated successfully!");
      navigate("/certificate");
    } catch (error) {
      console.error(error);
      message.error("Failed to update certificate template.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setTemplateUrl(localUrl); // Local preview
    } else {
      setTemplateUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/certificate")}
            className="!text-cyan-600 hover:!text-cyan-800 !border !border-cyan-600 hover:!border-cyan-800 font-medium rounded-lg transition-colors duration-300 px-0"
          >
            Back
          </Button>
        </div>

        {/* Title */}
        <Title level={3} className="!text-cyan-700 mb-6">
          Update Certificate Template
        </Title>

        {/* Form */}
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          className="space-y-6"
        >
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea
              placeholder="Enter certificate description..."
              className="rounded-md"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            label="Template Status"
            name="templateStatus"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select className="rounded-md">
              <Select.Option value="0">Inactive</Select.Option>
              <Select.Option value="1">Active</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="HTML Template File"
            name="htmlTemplate"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".html"
              onChange={handleFileChange}
            >
              <Button
                icon={<UploadOutlined />}
                className="!bg-cyan-400 !text-white hover:!bg-cyan-500 !rounded-md"
              >
                Select File
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="!bg-cyan-600 hover:!bg-cyan-700 !border-none !rounded-md"
            >
              Update Template
            </Button>
          </Form.Item>
        </Form>

        {/* Preview */}
        {templateUrl && (
          <div className="mt-10">
            <Title level={4} className="!text-cyan-600 !mb-4">
              Preview Certificate Template
            </Title>
            <iframe
              src={templateUrl}
              title="Certificate Template Preview"
              className="w-full h-[600px] border border-cyan-400 rounded shadow"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCertificateTemplatePage;
