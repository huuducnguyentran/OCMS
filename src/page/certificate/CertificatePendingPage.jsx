import { useEffect, useState } from "react";
import { Card, Spin, Empty } from "antd";
import { getPendingCertificate } from "../../services/certificateService";
import { useNavigate } from "react-router-dom";

const CertificatePendingPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getPendingCertificate();
        setCertificates(data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Empty description="No pending certificates found" />
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {certificates.map((cert) => (
        <div
          key={cert.certificateId}
          onClick={() => navigate(`/certificate/${cert.certificateId}`)}
          className="cursor-pointer"
        >
          <Card
            title={cert.certificateCode}
            bordered
            className="rounded-2xl shadow-md hover:shadow-lg transition"
            cover={
              <iframe
                src={cert.certificateURLwithSas}
                title="Certificate Preview"
                className="w-full h-64 rounded-t-2xl"
              />
            }
          >
            <p>
              <strong>User ID:</strong> {cert.userId}
            </p>
            <p>
              <strong>Course ID:</strong> {cert.courseId}
            </p>
            <p>
              <strong>Status:</strong> {cert.status}
            </p>
            <p>
              <strong>Issue Date:</strong>{" "}
              {new Date(cert.issueDate).toLocaleDateString()}
            </p>
          </Card>
        </div>
      ))}
    </div>
  );
};
export default CertificatePendingPage;
