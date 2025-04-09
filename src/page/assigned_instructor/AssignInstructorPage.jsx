// src/pages/AssignInstructorPage.jsx
import { useState, useEffect } from "react";
import { Input, Button, Select, message } from "antd";
import { assignInstructor } from "../../services/subjectService";
import { getAllUsers } from "../../services/userService";

const { Option } = Select;

const AssignInstructorPage = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const users = await getAllUsers();
        const instructorsOnly = users.filter(
          (user) => user.role === "Instructor"
        );
        setInstructors(instructorsOnly);
      } catch (error) {
        console.error("Failed to fetch instructors", error);
        message.error("Failed to load instructors");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleAssign = async () => {
    if (!subjectId || !selectedInstructorId) {
      message.error("Please enter subject ID and select an instructor.");
      return;
    }

    const payload = {
      subjectId,
      instructorId: selectedInstructorId,
      notes,
    };

    try {
      await assignInstructor(payload);
      message.success("Instructor assigned successfully!");
      // Clear form
      setSubjectId("");
      setNotes("");
      setSelectedInstructorId("");
    } catch {
      message.error("Failed to assign instructor.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-8 animate__animated animate__fadeIn">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Assign Instructor to Subject
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            placeholder="Enter Subject ID"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          />

          <Select
            showSearch
            placeholder="Select an Instructor"
            optionFilterProp="children"
            onChange={(value) => setSelectedInstructorId(value)}
            value={selectedInstructorId || undefined}
            loading={loading}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {instructors.map((inst) => (
              <Option key={inst.userId} value={inst.userId}>
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
          onClick={handleAssign}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Assign Instructor
        </Button>
      </div>
    </div>
  );
};

export default AssignInstructorPage;
