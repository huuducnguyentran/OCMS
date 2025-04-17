import { useState } from "react";
import { Upload, Button, Input, Form, message, Typography } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { importDecisionTemplate } from "../../services/decisionService";

const { Title } = Typography;

const ImportDecisionPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [templateUrl, setTemplateUrl] = useState(null);

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("templateName", values.templateName);
    formData.append("description", values.description);
    formData.append("templateContent", values.templateContent[0].originFileObj);

    console.log("🔍 Submitted Data:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    setLoading(true);
    try {
      const result = await importDecisionTemplate(formData);
      message.success("Decision template uploaded successfully!");
      navigate("/decision-template");
      setTemplateUrl(result.templateFile); // If the server returns a previewable link
      form.resetFields();
    } catch (error) {
      console.error(error);
      message.error("Failed to upload decision template.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (info) => {
    const file = info.fileList[0]?.originFileObj;
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setTemplateUrl(localUrl);
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
        <Title level={3}>Import Decision Template</Title>

        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Template Name"
            name="templateName"
            rules={[
              { required: true, message: "Please enter a template name" },
            ]}
          >
            <Input placeholder="Enter template name..." />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea placeholder="Enter template description..." />
          </Form.Item>

          <Form.Item
            label="HTML Template File"
            name="templateContent"
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
            <Title level={4}>Preview Decision Template</Title>
            <iframe
              src={templateUrl}
              title="Decision Template Preview"
              className="w-full h-[600px] border rounded shadow"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportDecisionPage;
