import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography, Descriptions, Spin, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { fetchDecisionTemplatebyId } from "../../services/decisionService";

const { Title } = Typography;

const DecisionTemplateDetailPage = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const data = await fetchDecisionTemplatebyId(templateId);
        setTemplate(data);
      } catch (err) {
        message.error("Failed to load decision template.", err);
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
            onClick={() => navigate("/decision-template")}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Back
          </Button>
        </div>

        <Title level={3}>Decision Template Detail</Title>

        <Descriptions bordered column={1} size="middle" className="mb-8">
          <Descriptions.Item label="Template ID">
            {template.decisionTemplateId}
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
        </Descriptions>

        {template.templateContentWithSas && (
          <>
            <Title level={4}>Template Preview</Title>
            <iframe
              src={template.templateContentWithSas}
              title="Decision Template Preview"
              className="w-full h-[600px] border rounded shadow"
              onError={() =>
                message.error("Failed to load decision template preview.")
              }
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DecisionTemplateDetailPage;
