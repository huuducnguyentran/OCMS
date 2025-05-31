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
      navigate("/certificate");
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
      setTemplateUrl(localUrl); // Local browser preview
    } else {
      setTemplateUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Back button */}
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
        <Title level={3} className="!text-cyan-700 mb-6">
          Import Certificate Template
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
              className="rounded-md !border !border-cyan-400 !h-32"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
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
              <Button
                icon={<UploadOutlined />}
                className="!bg-cyan-400 !text-white hover:!bg-cyan-500 !rounded-md !border-none"
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
              Upload Template
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
              className="!w-full !h-[600px] !border !border-cyan-400 !rounded !shadow"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCertificatePage;
