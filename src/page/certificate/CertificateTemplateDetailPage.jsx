import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Descriptions, Spin, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { fetchCertificateTemplatebyId } from "../../services/certificateService";

const { Title } = Typography;

const CertificateTemplateDetailPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await fetchCertificateTemplatebyId(templateId);
        setTemplate(data);
      } catch (err) {
        message.error("Failed to load certificate template.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

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

        <Title level={3}>Certificate Template Detail</Title>

        <Descriptions bordered column={1} size="middle" className="mb-8">
          <Descriptions.Item label="Template ID">
            {template.certificateTemplateId}
          </Descriptions.Item>
          <Descriptions.Item label="Template Name">
            {template.templateName}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {template.description}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {template.templateStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {template.createdByUserName || template.createdByUserId}
          </Descriptions.Item>
          <Descriptions.Item label="Approved By">
            {template.approvedByUserName || template.approvedByUserId || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(template.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated At">
            {new Date(template.lastUpdatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {template.templateFileWithSas && (
          <>
            <Title level={4}>Template Preview</Title>
            <iframe
              src={template.templateFileWithSas}
              title="Certificate Preview"
              className="w-full h-[600px] border rounded shadow"
              onError={() =>
                message.error("Failed to load certificate preview.")
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CertificateTemplateDetailPage;
