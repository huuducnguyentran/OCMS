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

    setLoading(true);
    try {
      const result = await importDecisionTemplate(formData);
      message.success("Decision template uploaded successfully!");
      navigate("/decision-template");
      setTemplateUrl(result.templateFile);
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-8">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="!text-cyan-600 hover:!text-cyan-800 !border !border-cyan-600 hover:!border-cyan-800 font-medium rounded-lg transition-colors duration-300 px-0"
          >
            Back
          </Button>
        </div>

        {/* Page Title */}
        <Title level={3} className="!text-cyan-700">
          Import Decision Template
        </Title>

        {/* Form */}
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
            <Input.TextArea
              placeholder="Enter template description..."
              rows={3}
            />
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
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="!bg-cyan-600 hover:!bg-cyan-700 !border-none"
            >
              Upload Template
            </Button>
          </Form.Item>
        </Form>

        {/* Preview Section */}
        {templateUrl && (
          <div className="mt-10">
            <Title level={4} className="!text-cyan-600 !mb-4">
              Preview Decision Template
            </Title>
            <iframe
              src={templateUrl}
              title="Decision Template Preview"
              className="!w-full !h-[600px] !border !border-cyan-400 !rounded !shadow"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportDecisionPage;
