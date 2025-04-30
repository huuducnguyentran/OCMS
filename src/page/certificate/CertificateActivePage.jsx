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
import { getActiveCertificate, revokeCertificate } from "../../services/certificateService";
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

  const [userRole, setUserRole] = useState('');
  const isTrainingStaff = userRole === 'Training staff';

  useEffect(() => {
    // Get user role from sessionStorage
    const userRole = sessionStorage.getItem('role');
    setUserRole(userRole);

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
    e.stopPropagation(); // Prevent clicking on the certificate card
    setCurrentCertificate(certificate);
    setRevokeModalVisible(true);
  };

  const handleRevoke = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      setRevokingLoading(true);
      await revokeCertificate(currentCertificate.certificateId, values.revokeReason);
      
      message.success("Certificate has been successfully revoked!");
      
      // Refresh certificate list
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
      // Filter by search text across multiple fields
      let matchSearch = true;
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const certificateCodeMatch = cert.certificateCode.toLowerCase().includes(searchLower);
        const userIdMatch = cert.userId.toString().toLowerCase().includes(searchLower);
        const courseIdMatch = cert.courseId.toString().toLowerCase().includes(searchLower);
        
        matchSearch = certificateCodeMatch || userIdMatch || courseIdMatch;
      }
      
      // Filter by date range
      let matchDate = true;
      if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
        const certDate = dayjs(new Date(cert.issueDate));
        const startDate = dayjs(filterDateRange[0]);
        const endDate = dayjs(filterDateRange[1]);
        
        // Check if certDate is within the range (inclusive)
        matchDate = certDate.isAfter(startDate.subtract(1, 'day')) && 
                    certDate.isBefore(endDate.add(1, 'day'));
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
    <div className="p-4">
      <Title level={3}>Active Certificates List</Title>
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={12} lg={14}>
            <Input
              placeholder="Search by Certificate Code, User ID or Course ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
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
              className="relative"
            >
              <Card
                title={cert.certificateCode}
                bordered
                className="rounded-2xl shadow-md hover:shadow-lg transition"
                onClick={() => navigate(`/certificate/${cert.certificateId}`)}
                cover={
                  <iframe
                    src={cert.certificateURLwithSas}
                    title="Certificate Preview"
                    className="w-full h-64 rounded-t-2xl"
                  />
                }
                actions={isTrainingStaff ? [
                  <Button 
                    key="revoke" 
                    danger 
                    type="text" 
                    icon={<UndoOutlined />} 
                    onClick={(e) => showRevokeModal(e, cert)}
                  >
                    Revoke
                  </Button>
                ] : undefined}
              >
                <p>
                  <strong>User ID:</strong> {cert.userId}
                </p>
                <p>
                  <strong>Course ID:</strong> {cert.courseId}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong className="text-gray-800">Status:</strong>{" "}
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
            </div>
          ))}
        </div>
      )}

      {/* Revoke Certificate Modal */}
      <Modal
        title="Revoke Certificate"
        open={revokeModalVisible}
        onCancel={() => {
          setRevokeModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => {
              setRevokeModalVisible(false);
              form.resetFields();
            }}
          >
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            danger
            loading={revokingLoading}
            onClick={handleRevoke}
          >
            Revoke
          </Button>
        ]}
      >
        {currentCertificate && (
          <div className="mb-4">
            <Text strong className="block mb-2">Certificate: {currentCertificate.certificateCode}</Text>
            <Text className="block mb-4">User ID: {currentCertificate.userId}</Text>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="revokeReason"
            label="Revocation Reason"
            rules={[{ required: true, message: 'Please enter the reason for revoking this certificate' }]}
          >
            <TextArea rows={4} placeholder="Enter reason for certificate revocation..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CertificateActivePage;
