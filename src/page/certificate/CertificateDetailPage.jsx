// pages/CertificateDetailPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Empty, Button, message } from "antd";
import {
  getCertificateById,
  signCertificate,
} from "../../services/certificateService";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";

const CertificateDetailPage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const data = await getCertificateById(certificateId);
        setCertificate(data);
      } catch (error) {
        console.error("Failed to fetch certificate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleSignCertificate = async () => {
    try {
      await signCertificate(certificateId);
      message.success("Certificate signed successfully!");
      // Optional: refresh the certificate data
      const updated = await getCertificateById(certificateId);
      setCertificate(updated);
    } catch (error) {
      console.error("Signing failed:", error);
      message.error("Failed to sign certificate.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Empty description="Certificate not found" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <Button
          type="link"
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          className="flex items-center text-blue-600 hover:text-blue-800 text-lg font-medium 
                       transition-all duration-300 hover:-translate-x-1"
        >
          Back
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        {certificate.certificateCode}
      </h1>

      <div className="overflow-x-auto rounded-lg mb-6 border shadow">
        <iframe
          src={certificate.certificateURLwithSas}
          title="Certificate Preview"
          className="w-[1100px] h-[800px] border-0"
        />
      </div>

      <div className="space-y-2 text-base text-gray-600">
        <p>
          <strong>User ID:</strong> {certificate.userId}
        </p>
        <p>
          <strong>Course ID:</strong> {certificate.courseId}
        </p>
        <p>
          <strong>Template ID:</strong> {certificate.templateId}
        </p>
        <p>
          <strong>Status:</strong> {certificate.status}
        </p>
        <p>
          <strong>Issue Date:</strong>{" "}
          {new Date(certificate.issueDate).toLocaleString()}
        </p>
      </div>
      {certificate.status === "Pending" && (
        <div className="flex justify-end mt-8">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleSignCertificate}
            className="text-white bg-green-600 hover:bg-green-700"
          >
            Sign Certificate
          </Button>
        </div>
      )}
    </div>
  );
};

export default CertificateDetailPage;
