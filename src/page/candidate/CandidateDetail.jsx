import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  Spin,
  Descriptions,
  message,
  Button,
  Input,
  Tag,
  Card,
  Space,
  Empty,
  Typography,
  Modal,
  Select,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  createCandidateAccount,
  getCandidateById,
  updateCandidate,
} from "../../services/candidateService";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
  FileOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  deleteExternalCertificate,
  getExternalCertificatesByCandidateId,
  updateExternalCertificate,
} from "../../services/externalCertifcateService";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { CandidateDetailSchema } from "../../../utils/validationSchemas";

const { Title, Text } = Typography;

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [candidate, setCandidate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editForm, setEditForm] = useState({
    certificateName: "",
    certificateCode: "",
    certificateProvider: "",
  });
  const [certificateFilter, setCertificateFilter] = useState("all");

  // Lấy role của người dùng từ session storage
  const userRole = sessionStorage.getItem("role");
  const canEdit = userRole === "HR" || userRole === "Admin";
  // Kiểm tra có phải HeadMaster không
  const isHeadMaster = userRole === "HeadMaster";
  const isTrainingStaff = userRole === "Training staff";
  const isAdmin = userRole === "Admin";
  // Kiểm tra xem người dùng đến từ trang request hay không
  const isFromRequest =
    location.state?.fromRequest || isHeadMaster || isTrainingStaff;

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const data = await getCandidateById(id);
        setCandidate(data);
      } catch (error) {
        message.error("Failed to fetch candidate details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCertificates = async () => {
      try {
        const certs = await getExternalCertificatesByCandidateId(id);
        setCertificates(certs);
      } catch (error) {
        message.error("Failed to fetch external certificates.");
        console.error(error);
      } finally {
        setCertLoading(false);
      }
    };

    fetchCandidate();
    fetchCertificates();
  }, [id]);

  const handleCreateAccount = async () => {
    if (!candidate) return;
    setCreatingAccount(true);
    try {
      await createCandidateAccount(id);
      message.success(
        "Account created successfully. Credentials sent to email."
      );
    } catch (error) {
      message.error("Failed to create account.");
      console.error(error);
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleGoBack = () => {
    if (isFromRequest) {
      navigate("/request");
    } else {
      navigate("/candidates-view");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center mt-10 text-gray-600 text-lg">
        Candidate not found.
      </div>
    );
  }

  const handleUpdateCertificate = async () => {
    try {
      // Validate form data
      if (!editForm.certificateName || !editForm.certificateCode) {
        message.error("Please fill in all required fields");
        return;
      }

      // Tạo payload data với đúng format mà API yêu cầu
      const updateData = {
        externalCertificateId: editingCertificate.certificateId, // Thêm ID
        certificateName: editForm.certificateName.trim(),
        certificateCode: editForm.certificateCode.trim(),
        certificateProvider: editForm.certificateProvider?.trim() || "",
        candidateId: id,
        certificateFileURL: editingCertificate.certificateFileURL || "",
        certificateFileURLWithSas:
          editingCertificate.certificateFileURLWithSas || "",
        status: editingCertificate.status || 0, // Thêm status nếu cần
      };

      console.log("Updating certificate with data:", updateData);

      // Gọi API update
      await updateExternalCertificate(
        editingCertificate.certificateId,
        updateData
      );
      message.success("Certificate updated successfully");

      // Refresh certificates list
      const updatedCerts = await getExternalCertificatesByCandidateId(id);
      setCertificates(updatedCerts);
      setEditModalVisible(false);

      // Reset form
      setEditForm({
        certificateName: "",
        certificateCode: "",
        certificateProvider: "",
      });
      setEditingCertificate(null);
    } catch (error) {
      console.error("Error updating certificate:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 400) {
        message.error(
          error.response?.data?.message ||
            "Invalid request data. Please check your input."
        );
      } else {
        message.error("Failed to update certificate. Please try again.");
      }
    }
  };

  const handleDelete = async (certificateId) => {
    try {
      await deleteExternalCertificate(certificateId);
      message.success("Certificate deleted");

      const certs = await getExternalCertificatesByCandidateId(id);
      setCertificates(certs);
    } catch (error) {
      console.error(error);
      message.error("Failed to delete certificate");
    }
  };

  const handleSaveEdit = async () => {
    if (!canEdit || !editingField) return;

    try {
      // Validate only the current editing field
      await CandidateDetailSchema.validateAt(editingField, {
        ...candidate,
        [editingField]: editValue,
      });

      const newCandidate = {
        ...candidate,
        [editingField]: editValue,
      };

      if (editingField === "dateOfBirth") {
        newCandidate.dateOfBirth = new Date(editValue).toISOString();
      }

      const updated = await updateCandidate(id, {
        fullName: newCandidate.fullName,
        gender: newCandidate.gender,
        dateOfBirth: newCandidate.dateOfBirth,
        address: newCandidate.address,
        email: newCandidate.email,
        phoneNumber: newCandidate.phoneNumber,
        personalID: newCandidate.personalID,
        note: newCandidate.note,
        specialtyId: newCandidate.specialtyId,
      });

      setCandidate(updated.candidate);
      message.success("Candidate updated successfully.");
      setEditingField(null);
      setEditValue("");
    } catch (err) {
      console.error(err);
      message.error(err.message || "Validation or update failed.");
    }
  };

  const handleEditClick = (field) => {
    if (!canEdit) return;

    if (field === "dateOfBirth" && candidate[field]) {
      setEditValue(candidate[field]);
    } else {
      setEditValue(candidate[field] || "");
    }
    setEditingField(field);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const renderEditableItem = (label, field) => {
    const isApproved = candidate?.candidateStatus === 1;

    return (
      <Descriptions.Item
        label={
          <div className="flex items-center justify-between">
            <span>{label}</span>
            {!isApproved && canEdit && editingField !== field && (
              <EditOutlined
                className="text-blue-500 ml-2 cursor-pointer"
                onClick={() => handleEditClick(field)}
              />
            )}
          </div>
        }
      >
        {editingField === field && canEdit && !isApproved ? (
          <div className="flex items-center gap-2">
            {field === "gender" ? (
              <Select
                value={editValue}
                onChange={(value) => setEditValue(value)}
                size="small"
                style={{ minWidth: 100 }}
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
              />
            ) : field === "dateOfBirth" ? (
              <DatePicker
                value={dayjs(editValue)}
                onChange={(date) =>
                  setEditValue(date ? date.toISOString() : "")
                }
                size="small"
                allowClear={false}
                inputReadOnly
              />
            ) : (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                size="small"
              />
            )}
            <CheckOutlined
              className="text-green-600 cursor-pointer"
              onClick={handleSaveEdit}
            />
            <CloseOutlined
              className="text-red-500 cursor-pointer"
              onClick={handleCancelEdit}
            />
          </div>
        ) : field === "dateOfBirth" ? (
          candidate[field] ? (
            new Date(candidate[field]).toLocaleDateString()
          ) : (
            "-"
          )
        ) : (
          candidate[field] || "-"
        )}
      </Descriptions.Item>
    );
  };

  const renderEditModal = () => (
    <Modal
      title="Edit Certificate"
      open={editModalVisible}
      onCancel={() => setEditModalVisible(false)}
      onOk={handleUpdateCertificate}
      okText="Save Changes"
      cancelText="Cancel"
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
      </div>
    </Modal>
  );

  const sortCertificates = (certificates) => {
    const certOrder = {
      IELTS: 1,
      "Bằng IELTS": 1,
      "Bằng IELTSSSS": 1,
      Driver: 2,
      "Bằng lái xe": 2,
      "Bằng lái": 2,
      TOEIC: 3,
      "Test TOEIC": 3,
      TOEFL: 4,
      "Test TOEFL": 4,
      Other: 5,
    };

    return [...certificates].sort((a, b) => {
      const getType = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("ielts")) return 1;
        if (lowerName.includes("lái xe") || lowerName.includes("driver"))
          return 2;
        if (lowerName.includes("toeic")) return 3;
        if (lowerName.includes("toefl")) return 4;
        return 5; // Other certificates
      };

      return getType(a.certificateName) - getType(b.certificateName);
    });
  };

  const filterCertificates = (certificates) => {
    if (certificateFilter === "all") return sortCertificates(certificates);

    return sortCertificates(certificates).filter((cert) => {
      const lowerName = cert.certificateName.toLowerCase();
      switch (certificateFilter) {
        case "ielts":
          return lowerName.includes("ielts");
        case "driver":
          return lowerName.includes("lái xe") || lowerName.includes("driver");
        case "toeic":
          return lowerName.includes("toeic");
        case "toefl":
          return lowerName.includes("toefl");
        case "other":
          return (
            !lowerName.includes("ielts") &&
            !lowerName.includes("lái xe") &&
            !lowerName.includes("driver") &&
            !lowerName.includes("toeic") &&
            !lowerName.includes("toefl")
          );
        default:
          return true;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                className="text-blue-600 hover:text-blue-800 px-0 mb-2"
              >
                {isFromRequest ? "Request List" : "Candidate List"}
              </Button>
              <Title level={2} className="mb-0">
                Candidate Profile
              </Title>
              <Text type="secondary">ID: {candidate?.candidateId}</Text>
            </div>
            {isAdmin && (
              <Space>
                <Button
                  onClick={handleCreateAccount}
                  loading={creatingAccount}
                  icon={<UserOutlined />}
                  className="bg-green-500 hover:bg-green-600 text-white border-none"
                >
                  Create Account
                </Button>
              </Space>
            )}
          </div>
        </Card>

        {/* Candidate Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card
              className="shadow-sm"
              title={
                <div className="flex items-center space-x-2">
                  <UserOutlined className="text-blue-500" />
                  <span>Personal Information</span>
                </div>
              }
            >
              <Descriptions
                bordered
                column={1}
                labelStyle={{
                  fontWeight: "600",
                  backgroundColor: "#f8fafc",
                  padding: "12px 16px",
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                }}
              >
                {renderEditableItem("Full Name", "fullName")}
                {renderEditableItem("Gender", "gender")}
                {renderEditableItem("Date of Birth", "dateOfBirth")}
                {renderEditableItem("Email", "email")}
                {renderEditableItem("Phone Number", "phoneNumber")}
                {renderEditableItem("Personal ID", "personalID")}
                {renderEditableItem("Address", "address")}
                {renderEditableItem("Note", "note")}
                {renderEditableItem("Specialty ID", "specialtyId")}
              </Descriptions>
            </Card>
          </div>

          {/* Right Column - Status Information */}
          <Card
            className="shadow-sm h-fit"
            title={
              <div className="flex items-center space-x-2">
                <CheckOutlined className="text-green-500" />
                <span>Status Information</span>
              </div>
            }
          >
            <Descriptions
              column={1}
              bordered
              labelStyle={{
                fontWeight: "600",
                backgroundColor: "#f8fafc",
                padding: "12px 16px",
              }}
              contentStyle={{
                backgroundColor: "#ffffff",
                padding: "12px 16px",
              }}
            >
              <Descriptions.Item label="Status">
                {candidate.candidateStatus === 0 && (
                  <Tag color="orange">Pending</Tag>
                )}
                {candidate.candidateStatus === 1 && (
                  <Tag color="green">Approved</Tag>
                )}
                {candidate.candidateStatus === 2 && (
                  <Tag color="red">Rejected</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(candidate.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Updated At">
                {new Date(candidate.updatedAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Imported By">
                {candidate.importByUserID}
              </Descriptions.Item>
              <Descriptions.Item label="Import Request">
                {candidate.importRequestId}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* External Certificates Section */}
        <Card
          className="shadow-sm"
          title={
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileOutlined className="text-blue-500" />
                <span className="text-xl font-semibold">
                  External Certificates
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Select
                  defaultValue="all"
                  style={{ width: 200 }}
                  onChange={(value) => setCertificateFilter(value)}
                  options={[
                    { value: "all", label: "All Certificates" },
                    { value: "ielts", label: "IELTS Certificates" },
                    { value: "driver", label: "Driver Licenses" },
                    { value: "toeic", label: "TOEIC Certificates" },
                    { value: "toefl", label: "TOEFL Certificates" },
                    { value: "other", label: "Other Certificates" },
                  ]}
                />
                {!isHeadMaster && !isTrainingStaff && (
                  <Space>
                    <Tooltip>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          navigate(`/external-certificate/create/${id}`)
                        }
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={userRole === "TrainingStaff"}
                      >
                        Add Certificate
                      </Button>
                    </Tooltip>
                    <Button
                      onClick={() =>
                        navigate(`/external-certificate/edit/${id}`)
                      }
                      icon={<EditOutlined />}
                      className="border-blue-500 text-blue-500 hover:text-blue-600 hover:border-blue-600"
                    >
                      Manage Certificates
                    </Button>
                  </Space>
                )}
              </div>
            </div>
          }
        >
          {certLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : certificates.length === 0 ? (
            <Empty description="No certificates found" className="py-8" />
          ) : (
            <>
              <div className="mb-4">
                <Text type="secondary">
                  Showing {filterCertificates(certificates).length} of{" "}
                  {certificates.length} certificates
                </Text>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterCertificates(certificates).map((cert, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition border border-gray-200"
                  >
                    <Card.Meta
                      title={
                        <div className="font-semibold text-lg text-blue-600">
                          {cert.certificateName}
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <p>
                            <strong>Code:</strong> {cert.certificateCode}
                          </p>
                          <p>
                            <strong>Provider:</strong>{" "}
                            {cert.certificateProvider || "-"}
                          </p>
                        </div>
                      }
                    />
                    <Popconfirm
                      title="Are you sure you want to delete this certificate?"
                      onConfirm={() => {
                        console.log("Deleting certificate with ID:", cert.id);
                        handleDelete(cert.id);
                      }}
                      okText="Yes"
                      cancelText="No"
                    >
                      <DeleteOutlined className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer" />
                    </Popconfirm>
                    {cert.certificateFileURLWithSas && (
                      <div className="mt-4">
                        <img
                          src={cert.certificateFileURLWithSas}
                          alt="Certificate"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition cursor-pointer"
                          onClick={() =>
                            window.open(
                              cert.certificateFileURLWithSas,
                              "_blank"
                            )
                          }
                          onError={(e) => {
                            e.target.style.display = "none";
                            const errorText = document.createElement("p");
                            errorText.className = "text-red-500 text-sm mt-2";
                            errorText.innerText =
                              "Certificate image not available";
                            e.target.parentNode.appendChild(errorText);
                          }}
                        />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Edit Certificate Modal */}
      {renderEditModal()}
    </div>
  );
};

export default CandidateDetailPage;
