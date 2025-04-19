import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Spin,
  Empty,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Typography,
  Button,
  Checkbox,
  message,
} from "antd";
import {
  getPendingCertificate,
  signCertificate,
} from "../../services/certificateService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Title } = Typography;

const CertificatePendingPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
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

  const handleCheckboxChange = (certificateId, checked) => {
    setSelectedCertificates((prev) =>
      checked
        ? [...prev, certificateId]
        : prev.filter((id) => id !== certificateId)
    );
  };

  const handleSignCertificates = async () => {
    if (selectedCertificates.length === 0) {
      message.warning("Please select at least one certificate.");
      return;
    }

    try {
      for (const certId of selectedCertificates) {
        await signCertificate(certId);
      }

      message.success("Selected certificates signed successfully!");

      const updated = await getPendingCertificate();
      setCertificates(updated);
      setSelectedCertificates([]);
    } catch (error) {
      console.error("Signing failed:", error);
      message.error("Failed to sign one or more certificates.");
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const matchCode = cert.certificateCode
        .toLowerCase()
        .includes(searchCode.toLowerCase());
      const matchStatus = filterStatus
        ? cert.status.toLowerCase() === filterStatus.toLowerCase()
        : true;
      const matchDate = filterDate
        ? dayjs(cert.issueDate).isSame(filterDate, "day")
        : true;

      return matchCode && matchStatus && matchDate;
    });
  }, [certificates, searchCode, filterStatus, filterDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3}>Certificate Management List</Title>

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
            <Select
              placeholder="Filter by Status"
              value={filterStatus || undefined}
              onChange={(value) => setFilterStatus(value)}
              allowClear
              style={{ width: "100%" }}
            >
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
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

        <Button
          type="primary"
          onClick={handleSignCertificates}
          disabled={selectedCertificates.length === 0}
        >
          Sign Selected ({selectedCertificates.length})
        </Button>
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
              className="relative border rounded-2xl shadow-md hover:shadow-lg transition"
            >
              <Checkbox
                className="absolute top-2 left-2 z-10 bg-white p-1 rounded"
                checked={selectedCertificates.includes(cert.certificateId)}
                onChange={(e) =>
                  handleCheckboxChange(cert.certificateId, e.target.checked)
                }
              />
              <div
                onClick={() => navigate(`/certificate/${cert.certificateId}`)}
                className="cursor-pointer"
              >
                <Card
                  title={cert.certificateCode}
                  bordered={false}
                  className="rounded-2xl"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatePendingPage;
