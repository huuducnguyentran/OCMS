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
        message.error("Failed to load certificate template.", err);
      }
    };

    loadTemplate();
  });

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
      setTemplateUrl(localUrl); // Use browser-local URL for preview
    } else {
      setTemplateUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/certificate")}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Back
          </Button>
        </div>
        <Title level={3}>Import Certificate Template</Title>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea placeholder="Enter certificate description..." />
          </Form.Item>

          <Form.Item
            label="Template Status"
            name="templateStatus"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select>
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
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Upload Template
            </Button>
          </Form.Item>
        </Form>

        {templateUrl && (
          <div className="mt-8">
            <Title level={4}>Preview Certificate Template</Title>
            <iframe
              src={templateUrl}
              title="Certificate Template Preview"
              className="w-full h-[600px] border rounded shadow"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCertificateTemplatePage;
