import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Upload, Spin, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  fetchDecisionTemplatebyId,
  updateDecisionTemplate,
} from "../../services/decisionService";

const { Title } = Typography;

const UpdateDecisionTemplatePage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await fetchDecisionTemplatebyId(templateId);
        form.setFieldsValue({
          templateName: data.templateName,
          description: data.description,
        });
      } catch (error) {
        message.error("Failed to load template.", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [templateId, form]);

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("TemplateName", values.templateName);
    formData.append("Description", values.description);
    if (fileList.length > 0) {
      formData.append("TemplateContent", fileList[0].originFileObj);
    }

    try {
      await updateDecisionTemplate(templateId, formData);
      message.success("Template updated successfully.");
      navigate("/decision-template");
    } catch (error) {
      message.error("Failed to update template.", error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFileList([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
        <Title level={3}>Update Decision Template</Title>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          className="mt-6"
        >
          <Form.Item
            label="Template Name"
            name="templateName"
            rules={[{ required: true, message: "Please enter template name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Upload New Template File" name="templateContent">
            <Upload
              beforeUpload={() => false}
              onRemove={() => setFileList([])}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept=".html"
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <div className="flex space-x-3 mt-4">
            <Button type="primary" htmlType="submit">
              Update
            </Button>
            <Button onClick={handleReset}>Reset</Button>
            <Button danger onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UpdateDecisionTemplatePage;
