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
      render: (id) => (
        <Button
          type="link"
          onClick={() => navigate(`/certificate-template/${id}`)}
          className="!w-full !text-left !border-none !text-cyan-600 hover:!text-cyan-700"
        >
          {id}
        </Button>
      ),
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
      render: (status) => (
        <span
          className={status === "Active" ? "text-green-600" : "text-yellow-500"}
        >
          {status}
        </span>
      ),
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
          className="!text-cyan-600 hover:!text-cyan-800 hover:!border-cyan-800"
        >
          View
        </Button>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
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
            <Menu.Item className="!text-red-600" key="delete">
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
                    message.error("Failed to delete template.", err);
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
            <Button
              icon={<EllipsisOutlined />}
              className="hover:!border-cyan-800"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Floating Button */}
        <Button
          className="!fixed !bottom-6 !right-6 !z-50 !bg-cyan-600 hover:!bg-cyan-700 !text-white !p-5 !shadow-lg !transition-all !duration-300"
          onClick={() => navigate("/certificate-import")}
        >
          <PlusOutlined className="text-xl" />
        </Button>

        {/* Title */}
        <Title level={3} className="!text-cyan-800 !mb-4">
          Certificate Templates
        </Title>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-cyan-400 shadow">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="rounded-lg border border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-500 bg-white">
                <Input
                  allowClear
                  placeholder="Search by name or description"
                  prefix={<SearchOutlined className="!text-cyan-600" />}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="!text-cyan-600 hover:!border-cyan-800"
                />
              </div>
            </Col>

            <Col xs={24} md={4}>
              <div className="rounded-lg border border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-500 bg-white">
                <Select
                  allowClear
                  size="large"
                  placeholder="Filter by Status"
                  onChange={setStatusFilter}
                  className="w-full !text-cyan-600 hover:!border-cyan-800"
                  dropdownStyle={{ color: "#155e75" }} // optional styling override
                >
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} md={4}>
              <div className="rounded-lg border border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-500 bg-white">
                <Select
                  allowClear
                  size="large"
                  placeholder="Description Type"
                  onChange={setDescTypeFilter}
                  className="w-full !text-cyan-600 hover:!border-cyan-800"
                  dropdownStyle={{ color: "#155e75" }}
                >
                  <Option value="initial">Initial</Option>
                  <Option value="recurrent">Recurrent</Option>
                  <Option value="professional">Professional</Option>
                </Select>
              </div>
            </Col>

            <Col xs={24} md={4}>
              <div className="rounded-lg border border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-500 bg-white">
                <RangePicker
                  size="large"
                  className="w-full !text-cyan-800"
                  onChange={(range) => setDateRange(range)}
                  value={dateRange}
                />
              </div>
            </Col>
          </Row>
        </div>

        {/* Table */}
        <div className="rounded-xl shadow overflow-hidden bg-white border border-cyan-400">
          <Table
            columns={columns}
            dataSource={filteredTemplates}
            rowKey="certificateTemplateId"
            pagination={{ pageSize: 5 }}
            scroll={{ x: "max-content", y: 400 }}
            bordered
          />
        </div>
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
