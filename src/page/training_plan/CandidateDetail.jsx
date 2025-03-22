import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Descriptions, message, Button } from "antd";
import { getCandidateById } from "../../services/candidateService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getExternalCertificatesByCandidateId } from "../../services/certifcationService";

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const data = await getCandidateById(id);
        setCandidate(data);
      } catch (error) {
        message.error("Failed to fetch candidate details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCertificates = async () => {
      try {
        const certs = await getExternalCertificatesByCandidateId(id);
        setCertificates(certs);
      } catch (error) {
        message.error("Failed to fetch external certificates.");
        console.error(error);
      } finally {
        setCertLoading(false);
      }
    };

    fetchCandidate();
    fetchCertificates();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center mt-10 text-gray-600 text-lg">
        Candidate not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Candidate List
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">
            {candidate?.candidateId || candidate}
          </span>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">External Certificates</h2>
          {certLoading ? (
            <Spin />
          ) : certificates.length === 0 ? (
            <p className="text-gray-500">No certificates found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition"
                >
                  <p>
                    <strong>Certificate Code:</strong> {cert.certificateCode}
                  </p>
                  <p>
                    <strong>Certificate Name:</strong> {cert.certificateName}
                  </p>
                  <p>
                    <strong>Provider:</strong> {cert.certificateProvider || "-"}
                  </p>
                  <p>
                    <strong>Issue Date:</strong>{" "}
                    {cert.issueDate
                      ? new Date(cert.issueDate).toLocaleDateString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Expiration Date:</strong>{" "}
                    {cert.expirationDate
                      ? new Date(cert.expirationDate).toLocaleDateString()
                      : "-"}
                  </p>
                  {cert.certificateFileURL && (
                    <img
                      src={cert.certificateFileURL}
                      alt="Certificate"
                      className="mt-2 w-full h-auto rounded-lg border"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-6">Candidate Detail</h2>
        <Descriptions
          bordered
          column={1}
          labelStyle={{
            fontWeight: "600",
            width: 320,
            whiteSpace: "nowrap",
            wordBreak: "keep-all",
          }}
        >
          <Descriptions.Item label="Candidate ID">
            {candidate.candidateId}
          </Descriptions.Item>
          <Descriptions.Item label="Full Name">
            {candidate.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {candidate.gender}
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {new Date(candidate.dateOfBirth).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {candidate.address}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{candidate.email}</Descriptions.Item>
          <Descriptions.Item label="Phone Number">
            {candidate.phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Personal ID">
            {candidate.personalID}
          </Descriptions.Item>
          <Descriptions.Item label="Note">
            {candidate.note || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Candidate Status">
            {candidate.candidateStatus}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(candidate.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(candidate.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Imported By User ID">
            {candidate.importByUserID}
          </Descriptions.Item>
          <Descriptions.Item label="Specialty ID">
            {candidate.specialtyId}
          </Descriptions.Item>
          <Descriptions.Item label="Import Request ID">
            {candidate.importRequestId}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
