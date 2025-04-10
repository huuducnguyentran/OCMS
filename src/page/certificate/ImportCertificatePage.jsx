import { useState } from "react";
import { Upload, Button, Input, Form, message, Typography } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { importCertificate } from "../../services/certificateService";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ImportCertificatePage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templateUrl, setTemplateUrl] = useState(null);

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("description", values.description);
    formData.append("htmlTemplate", values.htmlTemplate[0].originFileObj);

    setLoading(true);
    try {
      const result = await importCertificate(formData);
      message.success("Certificate Template uploaded successfully!");
      setTemplateUrl(result.templateFile); // Server-provided URL
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Failed to upload certificate template.");
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
            onClick={() => navigate(-1)}
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
            label="HTML Template File"
            name="htmlTemplate"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[
              {
                required: true,
                message: "Please upload an HTML template file",
              },
            ]}
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

export default ImportCertificatePage;
