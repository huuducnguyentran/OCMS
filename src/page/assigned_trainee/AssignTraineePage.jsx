// src/pages/AssignTraineePage.jsx
import { useState, useEffect } from "react";
import { read, utils } from "xlsx";
import { message, Input, Button, Select } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import {
  assignTrainee,
  assignTraineeManual,
} from "../../services/traineeService";
import { getAllUsers } from "../../services/userService";
import { getAllClassSubjects } from "../../services/classSubjectService";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const AssignTraineePage = () => {
  const navigate = useNavigate();
  const [traineeData, setTraineeData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [notes, setNotes] = useState("");
  const [trainees, setTrainees] = useState([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState("");
  const [classSubjects, setClassSubjects] = useState([]);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const users = await getAllUsers();
        setTrainees(users.filter((user) => user.roleName === "Trainee"));

        const classData = await getAllClassSubjects();
        setClassSubjects(classData);
      } catch {
        message.error("Failed to fetch trainees or class-subject data.");
      }
    };
    fetchData();
  }, []);

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedFile(file);

      if (!file.type.includes("sheet") && !file.type.includes("excel")) {
        throw new Error("Only Excel files (.xlsx, .xls) are allowed.");
      }

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const sheet = workbook.Sheets["TraineeAssign"];
      if (!sheet) throw new Error("Sheet 'TraineeAssign' not found.");

      const rawData = utils.sheet_to_json(sheet, {
        header: 1,
        defval: "",
      });

      const [header1, header2, ...rows] = rawData;
      const headers = header1.map((h1, i) => h1 || header2[i] || "");
      const jsonData = rows.map((row) =>
        headers.reduce((obj, key, i) => {
          obj[key] = row[i];
          return obj;
        }, {})
      );

      if (jsonData.length === 0) throw new Error("No data in sheet.");

      setColumns(
        headers.map((key) => ({
          title: key,
          dataIndex: key,
          key,
        }))
      );
      setTraineeData(jsonData);
    } catch (err) {
      setError(err.message);
      message.error("Unable to read file: " + err.message);
    } finally {
      setLoading(false);
      setIsDragging(false);
    }
  };

  const handleSubmitToServer = async () => {
    if (!selectedFile) {
      message.warning("Please select a file before uploading.");
      return;
    }

    try {
      setLoading(true);
      const response = await assignTrainee(selectedFile);

      const { failedCount, errors } = response?.result || {};
      if (failedCount > 0 || (errors && errors.length > 0)) {
        setError(errors?.join(", ") || "Some errors occurred.");
        message.error("Some trainees failed to be assigned.");
      } else {
        message.success("Trainees assigned successfully.");
        setTraineeData([]);
        setColumns([]);
        setSelectedFile(null);
        setError(null);
      }
    } catch (err) {
      message.error(err?.response?.data?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTrainee = async () => {
    if (!selectedTraineeId) {
      message.error("Please select a trainee");
      return;
    } else if (!selectedClassSubjectId) {
      message.error("Please select a class-subject.");
      return;
    }

    const payload = {
      traineeId: selectedTraineeId,
      classSubjectId: selectedClassSubjectId,
      notes: notes || "",
    };

    try {
      const response = await assignTraineeManual(payload);
      const { failedCount, errors } = response?.result || {};

      if (failedCount > 0 || (errors && errors.length > 0)) {
        const errorMsg = errors?.join(", ") || "Assignment failed.";
        setError(errorMsg);
        message.error(errorMsg);
        return;
      }

      message.success("Trainee assigned successfully.");
      setSelectedTraineeId("");
      setSelectedClassSubjectId("");
      setNotes("");
      setError(null);
    } catch (err) {
      let msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to assign trainee.";
      if (msg.includes("already assigned")) {
        msg = "Trainee này đã được gán vào Course-Subject-Specialty này.";
      }
      setError(msg);
      message.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Title */}
        <div className="bg-white border border-cyan-400 p-6 rounded-2xl shadow-md">
          <div className="flex justify-between mb-8">
            <h2 className="text-3xl font-bold text-cyan-700 mb-6">
              Assign Trainee
            </h2>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/assigned-trainee")}
              className="!text-cyan-600 hover:!text-cyan-800 border !border-cyan-400  hover:!border-cyan-600 !rounded-lg"
            >
              Back
            </Button>
          </div>
          {/* File Upload Section */}
          {!traineeData.length && (
            <div
              className={`border-2 border-dashed p-6 rounded-xl transition-all duration-200 ${
                isDragging
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-gray-300 hover:border-cyan-400"
              }`}
            >
              <div className="text-center space-y-4">
                <div>
                  <UploadOutlined className="!text-6xl !text-gray-400" />
                </div>
                <label className="inline-block px-4 py-2 bg-cyan-600 text-white rounded-lg cursor-pointer hover:bg-cyan-700 transition">
                  <span>Choose Excel File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </label>
                <p className="text-sm text-gray-500">Supported: .xlsx, .xls</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-6 rounded">
              <p className="text-sm text-red-700 font-semibold">Error:</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Table */}
          {traineeData.length > 0 && (
            <div className="mt-6">
              {selectedFile && (
                <p className="text-sm text-cyan-700 mb-2">
                  Selected file: <strong>{selectedFile.name}</strong>
                </p>
              )}

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-cyan-700">
                  Trainee Assign Data ({traineeData.length})
                </h2>
                <div className="space-x-2">
                  <Button
                    onClick={() => {
                      setTraineeData([]);
                      setColumns([]);
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm !text-cyan-500 hover:!border-cyan-600 hover:!text-cyan-700 rounded-lg"
                  >
                    Re-import
                  </Button>
                  <Button
                    onClick={handleSubmitToServer}
                    className="px-4 py-2 text-sm !bg-cyan-600 !text-white hover:!bg-cyan-700 rounded-lg"
                  >
                    Submit to Server
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border border-gray-200 rounded-lg">
                  <thead className="bg-cyan-50 text-cyan-700 ">
                    <tr>
                      {columns.map((col) => (
                        <th key={col.key} className="px-4 py-2">
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {traineeData.map((row, i) => (
                      <tr
                        key={i}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {columns.map((col, j) => (
                          <td key={j} className="px-4 py-2 text-cyan-600">
                            {row[col.dataIndex] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Manual Assignment */}
        <div className="bg-white border border-cyan-400 p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-cyan-700 mb-6">
            Assign Manually
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <Select
              showSearch
              placeholder="Select Class-Subject"
              value={selectedClassSubjectId || undefined}
              optionFilterProp="label"
              onChange={setSelectedClassSubjectId}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {classSubjects.map((item) => (
                <Option
                  key={item.classSubjectId}
                  value={item.classSubjectId}
                  label={`${item.className} / ${item.subjectSpecialtyId} / ${item.classSubjectId}`}
                >
                  {item.className} - {item.subjectSpecialtyId} - (
                  {item.classSubjectId})
                </Option>
              ))}
            </Select>

            <Select
              showSearch
              placeholder="Select Trainee"
              value={selectedTraineeId || undefined}
              optionFilterProp="label"
              onChange={setSelectedTraineeId}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {trainees.map((t) => (
                <Option
                  key={t.userId}
                  value={t.userId}
                  label={`${t.fullName} (${t.userId})`}
                >
                  {t.fullName} - ({t.userId}) - ({t.specialtyId})
                </Option>
              ))}
            </Select>
          </div>

          <Input.TextArea
            rows={4}
            placeholder="Optional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="!mb-4"
          />

          <Button
            type="primary"
            className="!bg-cyan-600 hover:!bg-cyan-700"
            onClick={handleAssignTrainee}
          >
            Assign Trainee
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignTraineePage;
