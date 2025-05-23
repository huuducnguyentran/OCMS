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
  Modal,
  Form,
  message,
} from "antd";
import {
  getActiveCertificate,
  revokeCertificate,
} from "../../services/certificateService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SearchOutlined, UndoOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const CertificateActivePage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterDateRange, setFilterDateRange] = useState(null);
  const [revokeModalVisible, setRevokeModalVisible] = useState(false);
  const [currentCertificate, setCurrentCertificate] = useState(null);
  const [revokingLoading, setRevokingLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState("");
  const isTrainingStaff = userRole === "Training staff";

  useEffect(() => {
    const role = sessionStorage.getItem("role");
    setUserRole(role);

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

  const showRevokeModal = (e, certificate) => {
    e.stopPropagation();
    setCurrentCertificate(certificate);
    setRevokeModalVisible(true);
  };

  const handleRevoke = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      setRevokingLoading(true);
      await revokeCertificate(
        currentCertificate.certificateId,
        values.revokeReason
      );

      message.success("Certificate has been successfully revoked!");
      const updatedData = await getActiveCertificate();
      setCertificates(updatedData);

      setRevokeModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error revoking certificate:", error);
      message.error("Unable to revoke certificate. Please try again!");
    } finally {
      setRevokingLoading(false);
    }
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      let matchSearch = true;
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        matchSearch =
          cert.certificateCode.toLowerCase().includes(searchLower) ||
          cert.userId.toString().toLowerCase().includes(searchLower) ||
          cert.courseId.toString().toLowerCase().includes(searchLower);
      }

      let matchDate = true;
      if (filterDateRange?.[0] && filterDateRange?.[1]) {
        const certDate = dayjs(new Date(cert.issueDate));
        matchDate =
          certDate.isAfter(dayjs(filterDateRange[0]).subtract(1, "day")) &&
          certDate.isBefore(dayjs(filterDateRange[1]).add(1, "day"));
      }

      return matchSearch && matchDate;
    });
  }, [certificates, searchText, filterDateRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <Title level={3} className="!text-cyan-800">
        Active Certificates
      </Title>

      {/* Filters */}
      <Card className="!mb-6 !border !border-cyan-600 !rounded-xl !shadow-sm !bg-white">
        <Title
          level={5}
          className="!mb-4 !flex !items-center !gap-2 !text-cyan-700"
        >
          <SearchOutlined />
          Filter Certificates
        </Title>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={12} lg={14}>
            <Input
              placeholder="Search by Certificate Code, User ID or Course ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
              className="!rounded-md !border-cyan-600 focus:!border-cyan-700 focus:!shadow-cyan-200"
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={10}>
            <RangePicker
              placeholder={["Start Date", "End Date"]}
              value={filterDateRange}
              onChange={(dates) => setFilterDateRange(dates)}
              style={{ width: "100%" }}
              allowClear
              size="large"
              className="!rounded-md !border-cyan-600 focus:!border-cyan-700 focus:!shadow-cyan-200"
            />
          </Col>
        </Row>
      </Card>

      {/* Certificate Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No certificates match the filters" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredCertificates.map((cert) => (
            <Card
              key={cert.certificateId}
              title={
                <span className="!text-cyan-800 !font-semibold">
                  {cert.certificateCode}
                </span>
              }
              bordered
              className="rounded-2xl shadow hover:shadow-lg transition cursor-pointer border-cyan-200"
              onClick={() => navigate(`/certificate/${cert.certificateId}`)}
              cover={
                <iframe
                  src={cert.certificateURLwithSas}
                  title="Certificate Preview"
                  className="w-full h-64 rounded-t-2xl"
                />
              }
              actions={
                isTrainingStaff
                  ? [
                      <Button
                        key="revoke"
                        danger
                        type="text"
                        icon={<UndoOutlined />}
                        onClick={(e) => showRevokeModal(e, cert)}
                        className="hover:bg-cyan-100"
                      >
                        Revoke
                      </Button>,
                    ]
                  : undefined
              }
            >
              <p>
                <strong>User ID:</strong> {cert.userId}
              </p>
              <p>
                <strong>Course ID:</strong> {cert.courseId}
              </p>
              <p className="text-sm">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-white text-xs ${
                    cert.status === "Active"
                      ? "bg-cyan-700"
                      : cert.status === "Revoked"
                      ? "bg-red-500"
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
            </Card>
          ))}
        </div>
      )}

      {/* Revoke Modal */}
      <Modal
        title="Revoke Certificate"
        open={revokeModalVisible}
        onCancel={() => {
          setRevokeModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setRevokeModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={revokingLoading}
            onClick={handleRevoke}
            className="bg-cyan-700 hover:bg-cyan-800"
          >
            Revoke
          </Button>,
        ]}
      >
        {currentCertificate && (
          <div className="mb-4">
            <Text strong className="block mb-2 text-cyan-700">
              Certificate: {currentCertificate.certificateCode}
            </Text>
            <Text className="block mb-4">
              User ID: {currentCertificate.userId}
            </Text>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="revokeReason"
            label="Revocation Reason"
            rules={[
              {
                required: true,
                message:
                  "Please enter the reason for revoking this certificate",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Enter reason for certificate revocation..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificateActivePage;
