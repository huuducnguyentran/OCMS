import React, { useEffect, useState } from "react";
import InstructorAssService from "../../services/instructorAssServices";

const CRUD_instructor = () => {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ subjectId: "", instructorId: "", notes: "" });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = () => {
    InstructorAssService.getAllInstructorAssignments()
      .then(res => setAssignments(res.data))
      .catch(err => console.error(err));
  };

  const handleCreate = () => {
    InstructorAssService.createInstructorAssignment(form)
      .then(() => {
        fetchAssignments();
        setForm({ subjectId: "", instructorId: "", notes: "" });
      })
      .catch(err => console.error(err));
  };

  const handleDelete = (id) => {
    InstructorAssService.deleteInstructorAssignment(id)
      .then(() => fetchAssignments())
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h2>Instructor Assignments</h2>
      <input
        placeholder="Subject ID"
        value={form.subjectId}
        onChange={e => setForm({ ...form, subjectId: e.target.value })}
      />
      <input
        placeholder="Instructor ID"
        value={form.instructorId}
        onChange={e => setForm({ ...form, instructorId: e.target.value })}
      />
      <input
        placeholder="Notes"
        value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })}
      />
      <button onClick={handleCreate}>Create</button>
      <ul>
        {assignments.map(a => (
          <li key={a.id}>
            {a.subjectId} - {a.instructorId} - {a.notes}
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CRUD_instructor;
