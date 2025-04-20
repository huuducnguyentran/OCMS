import { Form, Input, Button, Upload, message, Card, Typography, DatePicker, Space } from "antd";
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";

const { Title, Text } = Typography;

const CreateExCertificatePage = () => {
  const [form] = Form.useForm();
  const { id: candidateId } = useParams();
  const navigate = useNavigate();

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handleSubmit = async (values) => {
    const formData = new FormData();

    formData.append("CertificateCode", values.certificateCode);
    formData.append("CertificateName", values.certificateName);
    formData.append("IssuingOrganization", values.issuingOrganization);
    formData.append("CandidateId", candidateId);
    if (values.issueDate) {
      formData.append("IssueDate", values.issueDate.toISOString());
    }
    if (values.expirationDate) {
      formData.append("ExpirationDate", values.expirationDate.toISOString());
    }
    formData.append("CertificateImage", values.certificateImage?.[0]?.originFileObj);

    try {
      await axiosInstance.post(API.CREATE_EXTERNAL_CERTIFICATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Certificate uploaded successfully!");
      navigate(`/candidates/${candidateId}`);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload certificate.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/candidates-view`)}
            className="mb-4"
          >
            Back to Candidate
          </Button>
          <Title level={2}>Upload External Certificate</Title>
          <Text type="secondary">
            Please fill in the certificate details and upload the image
          </Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="certificateCode"
            label="Certificate Code"
            rules={[{ required: true, message: "Please enter certificate code" }]}
          >
            <Input placeholder="Enter certificate code" />
          </Form.Item>

          <Form.Item
            name="certificateName"
            label="Certificate Name"
            rules={[{ required: true, message: "Please enter certificate name" }]}
          >
            <Input placeholder="Enter certificate name" />
          </Form.Item>

          <Form.Item
            name="issuingOrganization"
            label="Issuing Organization"
            rules={[{ required: true, message: "Please enter issuing organization" }]}
          >
            <Input placeholder="Enter issuing organization" />
          </Form.Item>

          <Space className="w-full gap-4">
            <Form.Item
              name="issueDate"
              label="Issue Date"
              className="flex-1"
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="expirationDate"
              label="Expiration Date"
              className="flex-1"
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Space>

          <Form.Item
            name="certificateImage"
            label="Certificate Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Please upload a certificate image" }]}
          >
            <Upload
              name="certificateImage"
              beforeUpload={() => false}
              listType="picture-card"
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div className="mt-2">Upload</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              block
            >
              Upload Certificate
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateExCertificatePage;
