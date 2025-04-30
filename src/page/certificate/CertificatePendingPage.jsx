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
  Button,
  Checkbox,
  message,
  Tooltip,
} from "antd";
import {
  getPendingCertificate,
  signCertificate,
} from "../../services/certificateService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const CertificatePendingPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [selectedCertificates, setSelectedCertificates] = useState([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const isHeadMaster = userRole === "HeadMaster";

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
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can select certificates for signing");
      return;
    }
    
    setSelectedCertificates((prev) =>
      checked
        ? [...prev, certificateId]
        : prev.filter((id) => id !== certificateId)
    );
  };

  const handleSelectAll = (checked) => {
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can select certificates for signing");
      return;
    }
    
    if (checked) {
      const allCertificateIds = filteredCertificates.map(cert => cert.certificateId);
      setSelectedCertificates(allCertificateIds);
    } else {
      setSelectedCertificates([]);
    }
  };

  const handleSignCertificates = async () => {
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can sign certificates");
      return;
    }
    
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
      const searchLower = searchText.toLowerCase();
      const matchSearchText = 
        cert.certificateCode.toLowerCase().includes(searchLower) ||
        cert.userId.toString().toLowerCase().includes(searchLower) ||
        cert.courseId.toString().toLowerCase().includes(searchLower);

      const certDate = dayjs(cert.issueDate);
      const matchDate =
        filterDate && filterDate.length === 2
          ? certDate.isAfter(filterDate[0].startOf("day").subtract(1, "ms")) &&
            certDate.isBefore(filterDate[1].endOf("day").add(1, "ms"))
          : true;

      return matchSearchText && matchDate;
    });
  }, [certificates, searchText, filterDate]);

  const areAllSelected = filteredCertificates.length > 0 && 
    filteredCertificates.every(cert => 
      selectedCertificates.includes(cert.certificateId)
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={3} className="mb-4">
        Pending Certificates
      </Title>

      {/* Filters */}
      <Card className="!mb-6 border rounded-xl shadow-sm bg-white">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Certificate, User ID or Course ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={["From Date", "To Date"]}
              value={filterDate}
              onChange={(dates) => setFilterDate(dates)}
              style={{ width: "100%" }}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} md={8} className="flex justify-end items-center gap-3">
            <Tooltip title={isHeadMaster ? "" : "Only HeadMaster can select certificates"}>
              <Checkbox 
                checked={areAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={!isHeadMaster || filteredCertificates.length === 0}
              >
                Select All
              </Checkbox>
            </Tooltip>
            <Tooltip title={isHeadMaster ? "" : "Only HeadMaster can sign certificates"}>
              <Button
                type="primary"
                onClick={handleSignCertificates}
                disabled={!isHeadMaster || selectedCertificates.length === 0}
                size="large"
              >
                Sign ({selectedCertificates.length})
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* Certificate Cards */}
      {filteredCertificates.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No certificates match the filters" />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.certificateId}
              className="relative group rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300 bg-white"
            >
              <Tooltip title={isHeadMaster ? "" : "Only HeadMaster can select certificates"}>
                <Checkbox
                  className="absolute top-3 right-3 z-10 p-1 rounded bg-white bg-opacity-70"
                  checked={selectedCertificates.includes(cert.certificateId)}
                  onChange={(e) =>
                    handleCheckboxChange(cert.certificateId, e.target.checked)
                  }
                  disabled={!isHeadMaster}
                />
              </Tooltip>
              <div
                onClick={() => navigate(`/certificate/${cert.certificateId}`)}
                className="cursor-pointer"
              >
                <Card
                  title={
                    <span className="text-base font-semibold">
                      {cert.certificateCode}
                    </span>
                  }
                  bordered={false}
                  className="rounded-2xl border-none"
                  cover={
                    <iframe
                      src={cert.certificateURLwithSas}
                      title="Certificate Preview"
                      className="w-full h-64 rounded-t-2xl"
                    />
                  }
                >
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>User ID:</strong> {cert.userId}
                    </p>
                    <p>
                      <strong>Course ID:</strong> {cert.courseId}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                          cert.status === "Active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </p>
                    <p>
                      <strong>Issue Date:</strong>{" "}
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Expiration Date:</strong>{" "}
                      {new Date(cert.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
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
