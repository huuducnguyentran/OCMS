import { Form, Input, Button, DatePicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
// import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";

const CreateExCertificatePage = () => {
  const [form] = Form.useForm();
  const { id: candidateId } = useParams();

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();

    formData.append("CertificateCode", values.certificateCode);
    formData.append("CertificateName", values.certificateName);
    formData.append("CertificateProvider", values.certificateProvider || "");
    formData.append("IssueDate", values.issueDate?.toISOString() || "");
    formData.append(
      "ExpirationDate",
      values.expirationDate?.toISOString() || ""
    );
    formData.append("CertificateFileURL", "");
    formData.append("CandidateId", candidateId); // from route or props
    formData.append(
      "CertificateImage",
      values.certificateImage?.[0]?.originFileObj
    );
    formData.append("CertificateFileURLWithSas", "");
    formData.append("Id", "");

    try {
      await axiosInstance.post(
        `/${API.CREATE_EXTERNAL_CERTIFICATE}/${candidateId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      message.success("Certificate uploaded successfully!");
      form.resetFields();
    } catch (error) {
      if (error.response?.data?.errors) {
        console.error("Backend validation errors:", error.response.data.errors);
      } else {
        console.error("Upload error:", error);
      }
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
          name="certificateProvider"
          label="Certificate Provider"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="issueDate" label="Issue Date">
          <DatePicker showTime format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" />
        </Form.Item>

        <Form.Item name="expirationDate" label="Expiration Date">
          <DatePicker showTime format="YYYY-MM-DDTHH:mm:ss.SSS[Z]" />
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
