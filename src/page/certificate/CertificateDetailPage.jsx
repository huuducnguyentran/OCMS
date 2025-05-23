// pages/CertificateDetailPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Empty, Button, message, Tooltip } from "antd";
import {
  getCertificateById,
  revokeCertificate,
  signCertificate,
} from "../../services/certificateService";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";

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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          type="link"
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          className="flex items-center text-cyan-700 hover:text-cyan-900 text-lg font-medium transition-all duration-300 hover:-translate-x-1"
        >
          Back
        </Button>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-cyan-950 mb-6">
        {certificate.certificateCode}
      </h1>

      {/* Certificate Preview */}
      <div className="rounded-xl overflow-hidden border border-cyan-200 shadow mb-8">
        <iframe
          src={certificate.certificateURLwithSas}
          title="Certificate Preview"
          className="w-full max-w-[1100px] h-[800px] mx-auto block"
        />
      </div>

      {/* Certificate Info */}
      <div className="space-y-3 text-base text-gray-700 bg-white p-6 rounded-xl border border-cyan-100 shadow-sm mb-6">
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
          <strong>Status:</strong>{" "}
          <span
            className={`ml-2 px-3 py-1 rounded-full text-white text-sm font-medium ${
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
          <strong>Issue Date:</strong>{" "}
          {new Date(certificate.issueDate).toLocaleString()}
        </p>
        <p>
          <strong>Expiration Date:</strong>{" "}
          {new Date(certificate.expirationDate).toLocaleString()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {certificate.status === "Pending" && (
          <Tooltip
            title={isHeadMaster ? "" : "Only HeadMaster can sign certificates"}
          >
            <Button
              icon={<CheckCircleOutlined />}
              onClick={handleSignCertificate}
              disabled={!isHeadMaster}
              className={`text-white font-medium px-6 py-2 rounded-md transition-colors ${
                isHeadMaster
                  ? "bg-cyan-700 hover:bg-cyan-800"
                  : "bg-gray-400 cursor-not-allowed"
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
                danger
                onClick={handleRevokeCertificate}
                disabled={!isTrainingStaff}
                className={`px-6 py-2 font-medium rounded-md transition-colors ${
                  isTrainingStaff
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                Revoke Certificate
              </Button>
            </Tooltip>
          )}
      </div>
    </div>
  );
};

export default CertificateDetailPage;
