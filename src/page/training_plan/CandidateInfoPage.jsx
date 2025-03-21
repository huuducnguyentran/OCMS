import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const CandidateInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const candidate = location.state?.candidate;
  const externalCertifyData = location.state?.externalCertifyData || [];

  // Match external certs based on Personal ID
  const relatedCertifications = externalCertifyData.filter(
    (item) =>
      item["PersonalID"]?.toString().trim() === candidateId?.toString().trim()
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
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
            {candidate?.candidateId || candidateId}
          </span>
        </div>
        <h2 className="text-4xl font-bold mb-4 text-gray-700">
          Candidate Details
        </h2>

        <div className="flex gap-6">
          {/* External Certifications on the left */}
          <div className="w-1/2">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              External Certifications
            </h2>
            {relatedCertifications.length > 0 ? (
              <div className="bg-white shadow rounded p-4">
                {relatedCertifications.map((cert, idx) => (
                  <div key={idx} className="mb-4 border-b pb-2">
                    {Object.entries(cert).map(([key, value]) => (
                      <div key={key} className="text-sm text-gray-700 mb-1">
                        <strong>{key}:</strong>{" "}
                        {key === "CertificateImage" && value ? (
                          <img
                            src={value}
                            alt="Certificate"
                            className="mt-2 max-w-xs rounded border"
                          />
                        ) : (
                          value
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No certifications found.</p>
            )}
          </div>

          {/* Candidate Info on the right */}
          <div className="w-1/2">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              Candidate Information
            </h2>
            <div className="bg-white shadow rounded p-4">
              {candidate ? (
                Object.entries(candidate).map(([key, value]) => (
                  <p key={key} className="text-sm text-gray-700 mb-1">
                    <strong>{key}:</strong> {value}
                  </p>
                ))
              ) : (
                <p className="text-sm text-red-500">No candidate data found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateInfoPage;
