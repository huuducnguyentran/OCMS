// pages/CertificateDetailPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Empty, Button, message, Tooltip } from "antd";
import {
  getCertificateById,
  revokeCertificate,
  signCertificate,
} from "../../services/certificateService";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

const CertificateDetailPage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRole = sessionStorage.getItem("role");
  const isHeadMaster = userRole === "HeadMaster";
  const isTrainingStaff = userRole === "Training staff";

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
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can sign certificates");
      return;
    }

    try {
      await signCertificate(certificateId);
      message.success("Certificate signed successfully!");
      const updated = await getCertificateById(certificateId);
      setCertificate(updated);
    } catch (error) {
      console.error("Signing failed:", error);
      message.error("Failed to sign certificate.");
    }
  };

  const handleRevokeCertificate = async () => {
    if (!isTrainingStaff) {
      message.warning("Only Training staff can revoke certificates");
      return;
    }

    try {
      await revokeCertificate(certificateId);
      message.success("Certificate revoked successfully!");
      const updated = await getCertificateById(certificateId);
      setCertificate(updated);
    } catch (error) {
      console.error("Revocation failed:", error);
      message.error("Failed to revoke certificate.");
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
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            type="link"
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            className="!flex items-center !text-cyan-600 hover:text-cyan-800 text-lg font-medium !transition-all !duration-300 hover:!-translate-x-1 !border !border-cyan-600 hover:!border-cyan-800"
          >
            Back
          </Button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-cyan-900 mb-6 tracking-tight">
          Certificate: {certificate.certificateCode}
        </h1>

        {/* Certificate Preview */}
        <div className="rounded-xl overflow-hidden border border-cyan-200 shadow-md bg-white mb-8">
          <iframe
            src={certificate.certificateURLwithSas}
            title="Certificate Preview"
            className="w-full h-[800px] border-0"
          />
        </div>

        {/* Certificate Info */}
        <div className="bg-white border border-cyan-100 shadow p-6 rounded-xl space-y-4 text-gray-700">
          <p>
            <span className="font-semibold text-cyan-800">User ID:</span>{" "}
            {certificate.userId}
          </p>
          <p>
            <span className="font-semibold text-cyan-800">Course ID:</span>{" "}
            {certificate.courseId}
          </p>
          <p>
            <span className="font-semibold text-cyan-800">Template ID:</span>{" "}
            {certificate.templateId}
          </p>
          <p>
            <span className="font-semibold text-cyan-800">Status:</span>{" "}
            <span
              className={`ml-2 px-3 py-1 rounded-full text-white text-sm font-semibold ${
                certificate.status === "Active"
                  ? "bg-cyan-700"
                  : certificate.status === "Revoked"
                  ? "bg-red-600"
                  : "bg-gray-500"
              }`}
            >
              {certificate.status}
            </span>
          </p>
          <p>
            <span className="font-semibold text-cyan-800">Issue Date:</span>{" "}
            {new Date(certificate.issueDate).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold text-cyan-800">
              Expiration Date:
            </span>{" "}
            {new Date(certificate.expirationDate).toLocaleString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          {certificate.status === "Pending" && (
            <Tooltip
              title={
                isHeadMaster ? "" : "Only HeadMaster can sign certificates"
              }
            >
              <Button
                icon={<CheckCircleOutlined />}
                onClick={handleSignCertificate}
                disabled={!isHeadMaster}
                className={`px-6 py-2 font-semibold rounded-md transition-colors ${
                  isHeadMaster
                    ? "!bg-cyan-600 hover:!bg-cyan-700 !text-white !border !border-cyan-600 hover:!border-cyan-700"
                    : "!bg-gray-400 !text-white !cursor-not-allowed"
                }`}
              >
                Sign Certificate
              </Button>
            </Tooltip>
          )}

          {certificate.status !== "Pending" &&
            certificate.status !== "Revoked" && (
              <Tooltip
                title={
                  isTrainingStaff
                    ? ""
                    : "Only Training Staff can revoke certificates"
                }
              >
                <Button
                  icon={<StopOutlined />}
                  onClick={handleRevokeCertificate}
                  disabled={!isTrainingStaff}
                  className={`px-6 py-2 font-semibold rounded-md transition-colors ${
                    isTrainingStaff
                      ? "!bg-red-500 hover:!bg-red-600 !text-white !border !border-red-600 hover:!border-red-700"
                      : "!bg-gray-400 !text-white !cursor-not-allowed"
                  }`}
                >
                  Revoke Certificate
                </Button>
              </Tooltip>
            )}
        </div>
      </div>
    </div>
  );
};

export default CertificateDetailPage;
