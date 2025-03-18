// ImportCandidate.jsx
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Table,
  Button,
  Upload,
  Input,
  Tooltip,
  Typography,
  message,
  Divider,
  Modal,
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const ImportCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [latestCandidates, setLatestCandidates] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Fetch latest candidates from API
  const fetchLatestCandidates = async () => {
    try {
      const response = await axios.get("http://localhost:3001/candidates");
      setLatestCandidates(response.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      message.error("Failed to load latest candidates.");
    }
  };

  useEffect(() => {
    fetchLatestCandidates();
  }, []);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setCandidates(jsonData);
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const handleSave = async () => {
    try {
      const saveRequests = candidates.map((candidate) =>
        axios.post("http://localhost:3001/candidates", candidate)
      );
      await Promise.all(saveRequests);
      message.success("Data saved successfully!");
      setCandidates([]);
      fetchLatestCandidates();
    } catch (error) {
      console.error("Error saving data:", error);
      message.error("Failed to save data.");
    }
  };

  const handleEdit = (record, field, value) => {
    const updated = candidates.map((candidate) =>
      candidate.Email === record.Email
        ? { ...candidate, [field]: value }
        : candidate
    );
    setCandidates(updated);
  };

  const handleApprove = () => {
    message.success("Candidate approved successfully");
    setModalVisible(false);
  };

  const handleReject = () => {
    message.warning("Candidate rejected");
    setModalVisible(false);
  };

  const handleRowClick = (record) => {
    setSelectedCandidate(record);
    setModalVisible(true);
  };

  const renderTextWithTooltip = (text) => (
    <Tooltip title={text}>
      <span className="truncate block max-w-[200px]">{text}</span>
    </Tooltip>
  );

  const columnsEditable = [
    {
      title: "Address",
      dataIndex: "Address",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleEdit(record, "Address", e.target.value)}
        />
      ),
    },
    {
      title: "Email",
      dataIndex: "Email",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleEdit(record, "Email", e.target.value)}
        />
      ),
    },
    {
      title: "PhoneNumber",
      dataIndex: "PhoneNumber",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleEdit(record, "PhoneNumber", e.target.value)}
        />
      ),
    },
    {
      title: "PersonalID",
      dataIndex: "PersonalID",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleEdit(record, "PersonalID", e.target.value)}
        />
      ),
    },
    {
      title: "SpecialtyName",
      dataIndex: "SpecialtyName",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleEdit(record, "SpecialtyName", e.target.value)}
        />
      ),
    },
    {
      title: "Note",
      dataIndex: "Note",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleEdit(record, "Note", e.target.value)}
        />
      ),
    },
  ];

  const columnsReadOnly = [
    {
      title: "Address",
      dataIndex: "Address",
      render: renderTextWithTooltip,
    },
    {
      title: "Email",
      dataIndex: "Email",
      render: renderTextWithTooltip,
    },
    {
      title: "PhoneNumber",
      dataIndex: "PhoneNumber",
      render: renderTextWithTooltip,
    },
    {
      title: "PersonalID",
      dataIndex: "PersonalID",
      render: renderTextWithTooltip,
    },
    {
      title: "SpecialtyName",
      dataIndex: "SpecialtyName",
      render: renderTextWithTooltip,
    },
    {
      title: "Note",
      dataIndex: "Note",
      render: renderTextWithTooltip,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Upload beforeUpload={handleFileUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Upload Excel File</Button>
      </Upload>

      <Button type="primary" onClick={handleSave} disabled={!candidates.length}>
        Save to JSON API
      </Button>

      {candidates.length > 0 && (
        <>
          <Typography.Title level={4}>
            Editable Uploaded Candidates
          </Typography.Title>
          <Table
            dataSource={candidates}
            columns={columnsEditable}
            rowKey={(record) => record.Email}
            pagination={false}
          />
        </>
      )}

      <Divider />

      <Typography.Title level={4}>Latest Candidates from API</Typography.Title>
      <Table
        dataSource={latestCandidates}
        columns={columnsReadOnly}
        rowKey={(record) => record.Email}
        pagination={false}
        onRow={(record) => ({ onClick: () => handleRowClick(record) })}
        scroll={{ x: "max-content", y: 300 }}
      />

      <Modal
        title="Candidate Detail"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
          >
            Approve
          </Button>,
        ]}
      >
        {selectedCandidate && (
          <div className="space-y-2">
            {Object.entries(selectedCandidate).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value?.toString()}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImportCandidate;
