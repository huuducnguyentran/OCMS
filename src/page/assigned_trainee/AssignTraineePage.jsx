// src/pages/AssignTraineePage.jsx
import { useState, useEffect } from "react";
import { read, utils } from "xlsx";
import { message, Input, Button, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  assignTrainee,
  assignTraineeManual,
} from "../../services/traineeService";
import { getAllUsers } from "../../services/userService";
import { courseService } from "../../services/courseService";

const { Option } = Select;

const AssignTraineePage = () => {
  const [traineeData, setTraineeData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Trainee assignment form state
  const [notes, setNotes] = useState("");
  const [trainees, setTrainees] = useState([]);
  const [selectedTraineeId, setSelectedTraineeId] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Fetch trainee and course
  useEffect(() => {
    const fetchTrainee = async () => {
      try {
        const response = await getAllUsers();
        const trainees = response.filter((user) => user.roleName === "Trainee");
        setTrainees(trainees);
      } catch {
        message.error("Failed to load trainees");
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await courseService.getAllCourses();
        const coursesArray = response.courses || response.data || response;
        setCourses(coursesArray);
      } catch {
        message.error("Failed to load courses");
      }
    };

    fetchTrainee();
    fetchCourses();
  }, []);

  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      setError(null);

      if (!file.type.includes("sheet") && !file.type.includes("excel")) {
        throw new Error("Only Excel files (.xlsx, .xls) are allowed.");
      }

      setSelectedFile(file);

      const data = await file.arrayBuffer();
      const workbook = read(data);

      const traineeSheet = workbook.Sheets["TraineeAssign"];
      if (!traineeSheet) throw new Error("Sheet 'TraineeAssign' not found.");
      const jsonTrainee = utils.sheet_to_json(traineeSheet);
      if (jsonTrainee.length === 0) {
        throw new Error("Sheet 'TraineeAssign' contains no data.");
      }

      const traineeCols = Object.keys(jsonTrainee[0]).map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
      }));

      setColumns(traineeCols);
      setTraineeData(jsonTrainee);
    } catch (err) {
      setError("Error: " + err.message);
      message.error("Unable to read file");
    } finally {
      setLoading(false);
      setIsDragging(false);
    }
  };

  const handleSubmitToServer = async () => {
    try {
      setLoading(true);
      if (!selectedFile) {
        message.warning("Please select a file before uploading.");
        return;
      }

      const response = await assignTrainee(selectedFile);
      message.success(response?.message || "File uploaded successfully.");
    } catch (error) {
      message.error(error?.response?.data?.message || "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTrainee = async () => {
    if (!selectedCourseId || !selectedTraineeId) {
      message.error("Please select a course and a trainee.");
      return;
    }

    const payload = {
      traineeId: selectedTraineeId,
      courseId: selectedCourseId,
      notes,
    };

    try {
      await assignTraineeManual(payload);
      message.success("Trainee assigned successfully!");
      setSelectedCourseId("");
      setSelectedTraineeId("");
      setNotes("");
    } catch (error) {
      message.error("Failed to assign Trainee.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-4xl text-gray-900 font-bold mb-6">
            Assign Trainee
          </h2>

          {/* File Upload */}
          {!traineeData.length && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all duration-200 ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <UploadOutlined className="text-4xl text-gray-400" />
                <label className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors duration-200">
                  <span className="ml-2">Choose File</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                  />
                </label>
                <p className="text-sm text-gray-500">
                  Only .xlsx or .xls files
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Trainee Table */}
          {traineeData.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  Trainee Assign Data ({traineeData.length})
                </h2>
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setTraineeData([]);
                      setColumns([]);
                      setSelectedFile(null);
                      setError(null);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    Re-import
                  </button>
                  <button
                    onClick={handleSubmitToServer}
                    className="px-4 py-2 text-sm bg-blue-500 text-white hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Submit to Server
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {traineeData.map((row, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        {columns.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {row[column.dataIndex] || "-"}
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

        {/* Assign Instructor Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Assign Trainee to Course
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Select
              showSearch
              placeholder="Select a Course"
              optionFilterProp="label"
              onChange={(value) => setSelectedCourseId(value)}
              value={selectedCourseId || undefined}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {Array.isArray(courses) &&
                courses.map((course) => (
                  <Option
                    key={course.courseId}
                    value={course.courseId}
                    label={`${course.courseName} (${course.courseId})`}
                  >
                    {course.courseName} ({course.courseId})
                  </Option>
                ))}
            </Select>

            <Select
              showSearch
              placeholder="Select a Trainee"
              optionFilterProp="label"
              onChange={(value) => setSelectedTraineeId(value)}
              value={selectedTraineeId || undefined}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {trainees.map((inst) => (
                <Option
                  key={inst.userId}
                  value={inst.userId}
                  label={`${inst.fullName} (${inst.username})`}
                >
                  {inst.fullName} ({inst.username})
                </Option>
              ))}
            </Select>

            <Input.TextArea
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="md:col-span-2"
              rows={4}
            />
          </div>

          <Button
            type="primary"
            onClick={handleAssignTrainee}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Assign Trainee
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignTraineePage;
