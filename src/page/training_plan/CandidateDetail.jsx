import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Descriptions, message, Button, Input, Tag } from "antd";
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
} from "@ant-design/icons";
import { getExternalCertificatesByCandidateId } from "../../services/certifcationService";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { CandidateDetailSchema } from "../../../utils/validationSchemas";

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");

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

  const handleSaveEdit = async () => {
    if (!editingField) return;

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

  const renderEditableItem = (label, field) => (
    <Descriptions.Item
      label={
        <div className="flex items-center justify-between">
          <span>{label}</span>
          {editingField !== field && (
            <EditOutlined
              className="text-blue-500 ml-2 cursor-pointer"
              onClick={() => handleEditClick(field)}
            />
          )}
        </div>
      }
    >
      {editingField === field ? (
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
              onChange={(date) => setEditValue(date ? date.toISOString() : "")}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Candidate List
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">
            {candidate?.candidateId || candidate}
          </span>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl text-gray-800 font-semibold mb-4">
            External Certificates
          </h2>
          {certLoading ? (
            <Spin />
          ) : certificates.length === 0 ? (
            <p className="text-gray-500">No certificates found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {certificates.map((cert, index) => (
                <div
                  key={index}
                  className="border rounded-xl p-4 shadow-sm bg-white hover:shadow-md transition mb-4"
                >
                  <p>
                    <strong>Certificate Code:</strong> {cert.certificateCode}
                  </p>
                  <p>
                    <strong>Certificate Name:</strong> {cert.certificateName}
                  </p>
                  <p>
                    <strong>Provider:</strong> {cert.certificateProvider || "-"}
                  </p>
                  <p>
                    <strong>Issue Date:</strong>{" "}
                    {cert.issueDate
                      ? new Date(cert.issueDate).toLocaleDateString()
                      : "-"}
                  </p>
                  <p>
                    <strong>Expiration Date:</strong>{" "}
                    {cert.expirationDate
                      ? new Date(cert.expirationDate).toLocaleDateString()
                      : "-"}
                  </p>
                  {cert.certificateFileURL ? (
                    <img
                      src={cert.certificateFileURL}
                      alt="Certificate"
                      className="mt-2 w-full h-auto rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const parent = e.target.parentNode;
                        const errorText = document.createElement("p");
                        errorText.className = "text-red-500 text-sm mt-2";
                        errorText.innerText =
                          "Certificate file not accessible or requires authentication.";
                        parent.appendChild(errorText);
                      }}
                    />
                  ) : (
                    <p className="text-gray-500">
                      No certificate file uploaded.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-2xl text-gray-800 font-semibold mb-6">
          Candidate Detail
        </h2>
        <Descriptions
          bordered
          column={1}
          labelStyle={{
            fontWeight: "600",
            width: 320,
            whiteSpace: "nowrap",
            wordBreak: "keep-all",
          }}
        >
          <Descriptions.Item label="Candidate ID">
            {candidate.candidateId}
          </Descriptions.Item>
          {renderEditableItem("Full Name", "fullName")}
          {renderEditableItem("Gender", "gender")}
          {renderEditableItem("Date of Birth", "dateOfBirth")}
          {renderEditableItem("Address", "address")}
          {renderEditableItem("Email", "email")}
          {renderEditableItem("Phone Number", "phoneNumber")}
          {renderEditableItem("Personal ID", "personalID")}
          {renderEditableItem("Note", "note")}
          {renderEditableItem("Specialty ID", "specialtyId")}
          <Descriptions.Item label="Candidate Status">
            {candidate.candidateStatus === 0 && (
              <Tag color="orange">Pending</Tag>
            )}
            {candidate.candidateStatus === 1 && (
              <Tag color="green">Approved</Tag>
            )}
            {candidate.candidateStatus === 2 && <Tag color="red">Rejected</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(candidate.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(candidate.updatedAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Imported By User ID">
            {candidate.importByUserID}
          </Descriptions.Item>
          <Descriptions.Item label="Import Request ID">
            {candidate.importRequestId}
          </Descriptions.Item>
        </Descriptions>
        <Button
          type="primary"
          onClick={handleCreateAccount}
          loading={creatingAccount}
          className="mt-4"
        >
          Create Account
        </Button>
      </div>
    </div>
  );
};

export default CandidateDetailPage;
