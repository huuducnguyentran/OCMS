import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Descriptions, message, Button, Input, Tag, Select } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  getAssignedTraineeById,
  UpdateAssignedTrainee,
} from "../../services/traineeService";
import { getAllUsers } from "../../services/userService";

const AssignedTraineeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [courseSubjectSpecialties, setCourseSubjectSpecialties] = useState([]);
  const [trainees, setTrainees] = useState([]);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const data = await getAssignedTraineeById(id);
        setAssignment(data);
      } catch (error) {
        message.error("Failed to fetch assigned trainee details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCourseSubjectSpecialties = async () => {
      try {
        const response =
          await learningMatrixService.getAllCourseSubjectSpecialties();
        const arr = response.data || response.courses || response;
        setCourseSubjectSpecialties(arr);
      } catch {
        console.error("Failed to load course-subject-specialties");
      }
    };

    const fetchTrainees = async () => {
      try {
        const response = await getAllUsers();
        const traineeList = response.filter(
          (user) => user.roleName === "Trainee"
        );
        setTrainees(traineeList);
      } catch (error) {
        message.error("Failed to load trainees");
        console.error(error);
      }
    };

    fetchTrainees();
    fetchCourseSubjectSpecialties();
    fetchAssignment();
  }, [id]);

  const handleEditClick = (field) => {
    setEditingField(field);
    setEditValue(assignment[field] || "");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveEdit = async () => {
    try {
      const cleanedValue = editValue.trim() === "" ? null : editValue;

      const updatedData = {
        traineeId:
          editingField === "traineeId" ? cleanedValue : assignment.traineeId,
        courseSubjectSpecialtyId:
          editingField === "courseSubjectSpecialtyId"
            ? cleanedValue
            : assignment.courseSubjectSpecialtyId,
        notes: editingField === "notes" ? cleanedValue : assignment.notes,
      };

      await UpdateAssignedTrainee(id, updatedData);

      const updatedAssignment = await getAssignedTraineeById(id);
      setAssignment(updatedAssignment);
      message.success("Updated successfully!");
    } catch (error) {
      message.error("Failed to update data.");
      console.error(error);
    } finally {
      setEditingField(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center mt-10 text-gray-600 text-lg">
        Assigned trainee data not found.
      </div>
    );
  }

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
          {field === "courseSubjectSpecialtyId" ? (
            <Select
              showSearch
              placeholder="Select a Course-Subject-Specialty"
              optionFilterProp="label"
              onChange={(value) => setEditValue(value)}
              value={editValue ?? undefined}
              style={{ width: 240 }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {Array.isArray(courseSubjectSpecialties) &&
                courseSubjectSpecialties
                  .filter((item) => item?.id != null) // Avoid null/undefined ids
                  .map((item) => {
                    const label = `${
                      item.course?.courseName || item.courseId
                    } / ${item.subject?.subjectName || item.subjectId} / ${
                      item.specialtyId
                    }`;
                    return (
                      <Select.Option
                        key={item.id}
                        value={item.id}
                        label={label}
                      >
                        {label}
                      </Select.Option>
                    );
                  })}
            </Select>
          ) : field === "traineeId" ? (
            <Select
              showSearch
              placeholder="Select a Trainee"
              optionFilterProp="label"
              onChange={(value) => setEditValue(value)}
              value={editValue || undefined}
              style={{ width: 240 }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {Array.isArray(trainees) &&
                trainees.map((trainee) => (
                  <Select.Option
                    key={trainee.userId}
                    value={trainee.userId}
                    label={`${trainee.fullName} (${trainee.userId})`}
                  >
                    {trainee.fullName} ({trainee.userId})
                  </Select.Option>
                ))}
            </Select>
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
      ) : (
        assignment[field] || "-"
      )}
    </Descriptions.Item>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 space-x-2">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            Assigned List
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">
            {assignment.traineeAssignId}
          </span>
        </div>

        <h2 className="text-2xl text-gray-800 font-semibold mb-6">
          Assigned Trainee Detail
        </h2>

        <Descriptions bordered column={1}>
          <Descriptions.Item label="Trainee Assign ID">
            {assignment.traineeAssignId}
          </Descriptions.Item>

          {renderEditableItem("Trainee ID", "traineeId")}
          {renderEditableItem("Trainee Matrix ID", "courseSubjectSpecialtyId")}
          {renderEditableItem("Notes", "notes")}

          <Descriptions.Item label="Request Status">
            {assignment.requestStatus === "Pending" && (
              <Tag color="orange">Pending</Tag>
            )}
            {assignment.requestStatus === "Approved" && (
              <Tag color="green">Approved</Tag>
            )}
            {assignment.requestStatus === "Rejected" && (
              <Tag color="red">Rejected</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Assign By User ID">
            {assignment.assignByUserId}
          </Descriptions.Item>
          <Descriptions.Item label="Assign Date">
            {new Date(assignment.assignDate).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Approved By User ID">
            {assignment.approveByUserId || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Approval Date">
            {assignment.approvalDate
              ? new Date(assignment.approvalDate).toLocaleString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Request ID">
            {assignment.requestId}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </div>
  );
};

export default AssignedTraineeDetailPage;
