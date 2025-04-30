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
  Tooltip,
  Button,
  Modal,
  message,
} from "antd";
import {
  getRevokedCertificate,
  manuallyCreateCertificate,
} from "../../services/certificateService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const CertificateRevokedPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await getRevokedCertificate();
        setCertificates(data);
      } catch (error) {
        console.error("Failed to fetch revoked certificates:", error);
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

      const certDate = dayjs(cert.issueDate);
      const matchDate =
        filterDate && filterDate.length === 2
          ? certDate.isAfter(filterDate[0].startOf("day").subtract(1, "ms")) &&
            certDate.isBefore(filterDate[1].endOf("day").add(1, "ms"))
          : true;

      return matchCode && matchDate;
    });
  }, [certificates, searchCode, filterDate]);

  const openManualModal = (courseId, traineeId) => {
    setSelectedCourseId(courseId);
    setSelectedTraineeId(traineeId);
    setModalOpen(true);
  };

  const handleCreateCertificate = async () => {
    setCreating(true);
    try {
      await manuallyCreateCertificate(selectedCourseId, selectedTraineeId);
      message.success("Certificate created successfully!");
      setModalOpen(false);
      navigate("/certificate-pending");
    } catch (error) {
      console.error("Manual creation failed:", error);
      message.error("Failed to create certificate manually.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3}>Revoked Certificates List</Title>

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
            <RangePicker
              placeholder={["From Date", "To Date"]}
              value={filterDate}
              onChange={(dates) => setFilterDate(dates)}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
        </Row>
      </div>

      {/* Certificate List */}
      {filteredCertificates.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No revoked certificates match the filters" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => (
            <div
              key={cert.certificateId}
              onClick={() => navigate(`/certificate/${cert.certificateId}`)}
              className="relative cursor-pointer"
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
                <span
                  className={`px-2 py-1 rounded-full text-white text-xs ${
                    cert.status === "Active"
                      ? "bg-green-500"
                      : cert.status === "Revoked"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                >
                  {cert.status}
                </span>

                <p>
                  <strong>Issue Date:</strong>{" "}
                  {new Date(cert.issueDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Expiration Date:</strong>{" "}
                  {new Date(cert.expirationDate).toLocaleDateString()}
                </p>
              </Card>

              <Tooltip title="Manually Create Certificate">
                <Button
                  type="primary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  size="small"
                  className="absolute bottom-3 right-3 z-10"
                  onClick={(e) => {
                    e.stopPropagation(); // Stop triggering card click
                    openManualModal(cert.courseId, cert.userId);
                  }}
                />
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      {/* Manual Create Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCreateCertificate}
        okText="Create Certificate"
        cancelText="Cancel"
        confirmLoading={creating}
        centered
        title="Manually Create Certificate"
      >
        <Paragraph>
          You are about to manually create a certificate for:
        </Paragraph>
        <ul className="list-disc ml-6">
          <li>
            <strong>Course ID:</strong> {selectedCourseId}
          </li>
          <li>
            <strong>Trainee ID:</strong> {selectedTraineeId}
          </li>
        </ul>
      </Modal>
    </div>
  );
};

export default CertificateRevokedPage;
