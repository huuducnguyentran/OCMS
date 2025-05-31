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
      <div className="flex items-center justify-center min-h-screen bg-cyan-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-8">
        {/* Back button */}
        <div className="flex items-center mb-6">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/certificate")}
            className="!text-cyan-600 hover:!text-cyan-800 !border !border-cyan-600 hover:!border-cyan-800 font-medium rounded-lg transition-colors duration-300 px-0"
          >
            Back to Templates
          </Button>
        </div>

        {/* Title */}
        <Title level={3} className="!text-cyan-700">
          Certificate Template Detail
        </Title>

        {/* Template Info */}
        <Descriptions
          bordered
          column={1}
          size="middle"
          className="!mb-8 !rounded-md !overflow-hidden !border-cyan-400"
          labelStyle={{
            width: 160,
            fontWeight: "500",
            backgroundColor: "#ECFEFF",
          }}
        >
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
            {template.templateStatus === 1 ? "Active" : "Inactive"}
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

        {/* Preview Section */}
        {template.templateFileWithSas && (
          <div>
            <Title level={4} className="!text-cyan-600 mb-4">
              Template Preview
            </Title>
            <iframe
              src={template.templateFileWithSas}
              title="Certificate Preview"
              className="w-full h-[600px] border border-cyan-400 rounded shadow"
              onError={() =>
                message.error("Failed to load certificate preview.")
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateTemplateDetailPage;
