import {
  Table,
  Typography,
  message,
  Button,
  Modal,
  Spin,
  Menu,
  Dropdown,
  Popconfirm,
  Alert,
  Space,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  fetchCertificateTemplates,
  fetchCertificateTemplatebyId,
  deleteCertificateTemplate,
} from "../../services/certificateService";
import {
  EllipsisOutlined,
  PlusOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CertificateTemplateListPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const loadingTimeoutRef = useRef(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [descTypeFilter, setDescTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchCertificateTemplates();
        setTemplates(data);
        setFilteredTemplates(data);
      } catch (err) {
        message.error("Failed to fetch certificate templates.");
        console.error("Error fetching templates:", err);
      }
    };

    loadTemplates();

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const filtered = templates.filter((template) => {
      const matchesSearch =
        template.templateName
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        template.description.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter
        ? template.templateStatus === statusFilter
        : true;

      const matchesDescType = descTypeFilter
        ? template.description
            .toLowerCase()
            .includes(descTypeFilter.toLowerCase())
        : true;

      const matchesDateRange = dateRange
        ? dayjs(template.createdAt).isAfter(dateRange[0], "day") &&
          dayjs(template.createdAt).isBefore(dateRange[1], "day")
        : true;

      return (
        matchesSearch && matchesStatus && matchesDescType && matchesDateRange
      );
    });

    setFilteredTemplates(filtered);
  }, [searchText, statusFilter, descTypeFilter, dateRange, templates]);

  const closeModal = () => {
    setIsModalVisible(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setPreviewError(null);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  const handlePreview = async (templateId) => {
    setLoading(true);
    setPreviewError(null);
    setIsModalVisible(true);

    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setPreviewError(
          "Preview loading timeout. The server took too long to respond."
        );
      }
    }, 15000);

    try {
      const data = await fetchCertificateTemplatebyId(templateId);
      if (data?.templateFileWithSas) {
        setPreviewUrl(data.templateFileWithSas);
      }
    } catch (err) {
      console.error("Template fetch error:", err);
      setPreviewError(
        `Error loading template: ${err.message || "Unknown error"}`
      );
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Template ID",
      dataIndex: "certificateTemplateId",
      key: "certificateTemplateId",
    },
    {
      title: "Template Name",
      dataIndex: "templateName",
      key: "templateName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "templateStatus",
      key: "templateStatus",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "Preview",
      key: "preview",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handlePreview(record.certificateTemplateId)}
        >
          View
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="edit"
              onClick={() =>
                navigate(
                  `/certificate-template/update/${record.certificateTemplateId}`
                )
              }
            >
              Edit
            </Menu.Item>
            <Menu.Item key="delete">
              <Popconfirm
                title="Are you sure you want to delete this template?"
                onConfirm={async () => {
                  try {
                    await deleteCertificateTemplate(
                      record.certificateTemplateId
                    );
                    message.success("Template deleted successfully.");
                    const data = await fetchCertificateTemplates();
                    setTemplates(data);
                  } catch (err) {
                    message.error("Failed to delete template.");
                    console.error("Delete error:", err);
                  }
                }}
                okText="Yes"
                cancelText="No"
              >
                Delete
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <button
          className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white border-none shadow-lg animate__animated animate__bounceIn"
          onClick={() => navigate("/certificate-import")}
        >
          <PlusOutlined className="text-xl" />
        </button>

        <Title level={3}>Certificate Templates</Title>

        {/* Filters */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={6}>
              <Input
                allowClear
                placeholder="Search by name or description"
                prefix={<SearchOutlined />}
                size="large"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                allowClear
                size="large"
                placeholder="Filter by Status"
                onChange={setStatusFilter}
                style={{ width: "100%" }}
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                allowClear
                size="large"
                placeholder="Description Type"
                onChange={setDescTypeFilter}
                style={{ width: "100%" }}
              >
                <Option value="initial">Initial</Option>
                <Option value="recurrent">Recurrent</Option>
                <Option value="professional">Professional</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <RangePicker
                size="large"
                style={{ width: "100%" }}
                onChange={(range) => setDateRange(range)}
                value={dateRange}
              />
            </Col>
          </Row>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredTemplates}
          rowKey="certificateTemplateId"
          pagination={{ pageSize: 5 }}
          bordered
        />
      </div>

      {/* Preview Modal */}
      <Modal
        title="Certificate Template Preview"
        open={isModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="close" onClick={closeModal}>
            Close
          </Button>,
        ]}
        width={800}
        maskClosable
        closable
        destroyOnClose
      >
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin tip="Loading template..." />
          </div>
        ) : previewError ? (
          <Alert
            message="Error Loading Preview"
            description={
              <Space direction="vertical">
                <div>{previewError}</div>
                <Button type="primary" danger onClick={closeModal}>
                  <CloseCircleOutlined /> Close Preview
                </Button>
              </Space>
            }
            type="error"
            showIcon
            icon={<WarningOutlined />}
          />
        ) : (
          previewUrl && (
            <iframe
              src={previewUrl}
              title="Template Preview"
              style={{ width: "100%", height: "600px", border: "none" }}
              onError={() =>
                setPreviewError("Failed to load template content.")
              }
            />
          )
        )}
      </Modal>
    </div>
  );
};

export default CertificateTemplateListPage;
