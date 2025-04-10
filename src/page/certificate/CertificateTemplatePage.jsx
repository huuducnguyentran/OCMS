import { useEffect, useState } from "react";
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
} from "antd";
import {
  fetchCertificateTemplates,
  fetchCertificateTemplatebyId,
  deleteCertificateTemplate,
} from "../../services/certificateService";
import { EllipsisOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const CertificateTemplateListPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchCertificateTemplates();
        setTemplates(data);
      } catch (err) {
        message.error("Failed to fetch certificate templates.", err);
      }
    };

    loadTemplates();
  }, []);

  const handlePreview = async (templateId) => {
    setLoading(true);
    try {
      const data = await fetchCertificateTemplatebyId(templateId);

      if (data?.templateFile) {
        const response = await fetch(data.templateFile, {
          headers: {
            Accept: "text/html",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load certificate template file.");
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        setPreviewUrl(blobUrl);
        setIsModalVisible(true);
      } else {
        message.warning("No template file found.");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch template details.");
    } finally {
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
                    // Reload templates
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
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="certificateTemplateId"
          pagination={{ pageSize: 5 }}
        />
      </div>

      <Modal
        title="Certificate Template Preview"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          if (previewUrl) URL.revokeObjectURL(previewUrl); // Cleanup
          setPreviewUrl("");
        }}
        footer={null}
        width={800}
      >
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin />
          </div>
        ) : (
          <iframe
            src={previewUrl}
            title="Template Preview"
            style={{ width: "100%", height: "600px", border: "none" }}
          />
        )}
      </Modal>
    </div>
  );
};

export default CertificateTemplateListPage;
