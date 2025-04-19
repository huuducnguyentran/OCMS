import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Spin,
  Empty,
  Input,
  DatePicker,
  Row,
  Col,
  Typography,
} from "antd";
import { getActiveCertificate } from "../../services/certificateService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;

const CertificateActivePage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getActiveCertificate();
        setCertificates(data);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchCode = cert.certificateCode
        .toLowerCase()
        .includes(searchCode.toLowerCase());
      const matchDate = filterDate
        ? dayjs(cert.issueDate).isSame(filterDate, "day")
        : true;

      return matchCode && matchDate;
    });
  }, [certificates, searchCode, filterDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3}>Active Certificates List</Title>
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Certificate Code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker
              placeholder="Filter by Issue Date"
              value={filterDate}
              onChange={(date) => setFilterDate(date)}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
        </Row>
      </div>

      {/* Certificate List */}
      {filteredCertificates.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No certificates match the filters" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
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
      )}
    </div>
  );
};

export default CertificateActivePage;
