import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Input,
  Button,
  Upload,
  message,
  Card,
  Space,
  Spin,
  Empty,
  Modal,
  Table,
} from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import {
  getExternalCertificatesByCandidateId,
  deleteExternalCertificate,
  updateExternalCertificate,
} from "../../services/externalCertifcateService";

const EditExternalCertiPage = () => {
  const { id: candidateId } = useParams();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editForm, setEditForm] = useState({
    certificateName: "",
    certificateCode: "",
    certificateProvider: "",
  });
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, [candidateId]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const certs = await getExternalCertificatesByCandidateId(candidateId);
      setCertificates(certs);
    } catch (error) {
      message.error("Failed to fetch certificates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cert) => {
    setEditingCertificate(cert);
    setEditForm({
      certificateName: cert.certificateName,
      certificateCode: cert.certificateCode,
      certificateProvider: cert.certificateProvider || "",
    });
    setEditModalVisible(true);
  };

  // const normFile = (e) => {
  //   if (Array.isArray(e)) {
  //     return e;
  //   }
  //   return e?.fileList;
  // };

  const handleUpdateCertificate = async () => {
    try {
      if (!editForm.certificateName || !editForm.certificateCode) {
        message.error("Please fill in all required fields");
        return;
      }

      const updateData = {
        certificateCode: editForm.certificateCode.trim(),
        certificateName: editForm.certificateName.trim(),
        issuingOrganization: editForm.certificateProvider?.trim() || "",
        candidateId: candidateId,
      };

      if (fileList.length > 0) {
        const formData = new FormData();
        formData.append("certificateImage", fileList[0].originFileObj);

        Object.keys(updateData).forEach((key) => {
          formData.append(key, updateData[key]);
        });

        await updateExternalCertificate(editingCertificate.id, formData);
      } else {
        await updateExternalCertificate(editingCertificate.id, updateData);
      }

      // Đóng modal và reset form
      setEditModalVisible(false);
      resetForm();

      // Hiển thị thông báo thành công
      message.success("Certificate updated successfully");

      // Refresh lại trang
      window.location.reload();
    } catch (error) {
      console.error("Error updating certificate:", error);
      message.error("Failed to update certificate");
    }
  };

  const handleDelete = (cert) => {
    Modal.confirm({
      title: "Delete Certificate",
      content: (
        <div>
          <p>Are you sure you want to delete this certificate?</p>
          <div className="mt-4">
            <div className="font-medium">Certificate Details:</div>
            <div>Name: {cert.certificateName}</div>
            <div>Code: {cert.certificateCode}</div>
            <div>Provider: {cert.certificateProvider || "-"}</div>
            {cert.certificateFileURLWithSas && (
              <div className="mt-2">
                <img
                  src={cert.certificateFileURLWithSas}
                  alt={cert.certificateName}
                  className="max-w-[200px] h-auto rounded-lg border"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/200x200?text=No+Image";
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ),
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No",
      width: 500,
      centered: true,
      onOk: async () => {
        try {
          setLoading(true); // Thêm loading state
          await deleteExternalCertificate(cert.id);
          message.success("Certificate deleted successfully");

          // Refresh lại trang
          window.location.reload();
        } catch (error) {
          console.error("Error deleting certificate:", error);
          message.error("Failed to delete certificate");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const resetForm = () => {
    setEditForm({
      certificateName: "",
      certificateCode: "",
      certificateProvider: "",
    });
    setFileList([]);
    setEditingCertificate(null);
  };

  const handleCreateCertificate = () => {
    navigate(`/external-certificate/create/${candidateId}`);
  };

  const handlePreviewImage = (record) => {
    setPreviewImage(record.certificateFileURLWithSas);
    setPreviewTitle(record.certificateName);
    setPreviewVisible(true);
  };

  const renderEditModal = () => (
    <Modal
      title="Edit Certificate"
      open={editModalVisible}
      onCancel={() => {
        setEditModalVisible(false);
        resetForm();
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            setEditModalVisible(false);
            resetForm();
          }}
          className="!text-cyan-700 hover:!text-cyan-900 border !border-cyan-600 hover:!border-cyan-800 font-medium rounded-lg transition-colors duration-300"
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleUpdateCertificate}
          className="!bg-gradient-to-r from-cyan-950 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 border-0 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
        >
          Save Changes
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate Name
          </label>
          <Input
            value={editForm.certificateName}
            onChange={(e) =>
              setEditForm({ ...editForm, certificateName: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate Code
          </label>
          <Input
            value={editForm.certificateCode}
            onChange={(e) =>
              setEditForm({ ...editForm, certificateCode: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <Input
            value={editForm.certificateProvider}
            onChange={(e) =>
              setEditForm({ ...editForm, certificateProvider: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Certificate Image
          </label>
          <div className="space-y-4">
            {editingCertificate?.certificateFileURLWithSas &&
              fileList.length === 0 && (
                <div className="relative group inline-block">
                  <div className="max-w-md overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={editingCertificate.certificateFileURLWithSas}
                      alt="Current Certificate"
                      className="w-xs h-auto object-contain bg-white"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x300?text=No+Image";
                      }}
                    />
                  </div>
                  <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                               transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                    onClick={() => handlePreviewImage(editingCertificate)}
                  >
                    <EyeOutlined className="text-white text-2xl" />
                  </div>
                </div>
              )}
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              className="mt-4"
            >
              {fileList.length < 1 && (
                <div className="text-center p-4">
                  <UploadOutlined className="text-2xl text-gray-400" />
                  <div className="mt-2 text-gray-500">Upload new image</div>
                </div>
              )}
            </Upload>
          </div>
        </div>
      </div>
    </Modal>
  );

  const renderPreviewModal = () => (
    <Modal
      open={previewVisible}
      title={previewTitle}
      footer={null}
      onCancel={() => setPreviewVisible(false)}
      width={800}
      centered
    >
      <div className="flex justify-center bg-white p-4 rounded-lg">
        <img
          alt={previewTitle}
          src={previewImage}
          className="max-w-full max-h-[70vh] object-contain"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/800x600?text=Image+Not+Available";
          }}
        />
      </div>
    </Modal>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="!mb-6 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/candidates/${candidateId}`)}
                className="!text-cyan-600 hover:!border-cyan-800"
              >
                Back to Candidates
              </Button>
            </div>
            <div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateCertificate}
                className="!bg-gradient-to-r from-cyan-950 to-cyan-800 !border-cyan-950 hover:opacity-90"
              >
                Create Certificate
              </Button>
            </div>
          </div>
        </Card>
        {loading ? (
          <Spin size="large" />
        ) : certificates.length > 0 ? (
          <Card className="shadow-sm">
            <Table
              dataSource={certificates}
              columns={[
                {
                  title: "Certificate Name",
                  dataIndex: "certificateName",
                  key: "certificateName",
                },
                {
                  title: "Certificate Code",
                  dataIndex: "certificateCode",
                  key: "certificateCode",
                },
                {
                  title: "Provider",
                  dataIndex: "certificateProvider",
                  key: "certificateProvider",
                },
                {
                  title: "Image",
                  key: "image",
                  render: (_, record) =>
                    record.certificateFileURLWithSas ? (
                      <div className="relative group">
                        <div className="w-24 h-24 overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={record.certificateFileURLWithSas}
                            alt={record.certificateName}
                            className="w-full h-full object-contain bg-white"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/100x100?text=No+Image";
                            }}
                          />
                        </div>
                        <div
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                                     transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                          onClick={() => handlePreviewImage(record)}
                        >
                          <EyeOutlined className="text-white text-xl" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-200 
                                      flex items-center justify-center"
                      >
                        <FileImageOutlined className="text-gray-400 text-2xl" />
                      </div>
                    ),
                },
                {
                  title: "Actions",
                  key: "actions",
                  render: (_, record) => (
                    <Space size="middle">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="!bg-gradient-to-r from-cyan-950 to-cyan-800 !border-cyan-950 hover:opacity-90"
                      >
                        Edit
                      </Button>
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                        className="!border-red-600 !text-red-600 hover:opacity-80"
                      >
                        Delete
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        ) : (
          <Empty description="No certificates found" />
        )}
        {renderEditModal()}
        {renderPreviewModal()}
      </div>
    </div>
  );
};

export default EditExternalCertiPage;
