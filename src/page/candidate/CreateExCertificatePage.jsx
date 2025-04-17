import { Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";

const CreateExCertificatePage = () => {
  const [form] = Form.useForm();
  const { id: candidateId } = useParams();

  const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

  const handleSubmit = async (values) => {
    const formData = new FormData();

    formData.append("CertificateCode", values.certificateCode);
    formData.append("CertificateName", values.certificateName);
    formData.append("IssuingOrganization", values.issuingOrganization);
    formData.append("CandidateId", candidateId);
    formData.append(
      "CertificateImage",
      values.certificateImage?.[0]?.originFileObj
    );

    try {
      await axiosInstance.post(API.CREATE_EXTERNAL_CERTIFICATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Certificate uploaded successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload certificate.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <h2>Upload External Certificate</h2>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="certificateCode"
          label="Certificate Code"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="certificateName"
          label="Certificate Name"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="issuingOrganization"
          label="Issuing Organization"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="certificateImage"
          label="Certificate Image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            { required: true, message: "Please upload a certificate image." },
          ]}
        >
          <Upload
            name="certificateImage"
            beforeUpload={() => false}
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Upload Certificate
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateExCertificatePage;
