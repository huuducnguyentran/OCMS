import { useState } from "react";
import { Layout, Input, Button, message } from "antd";
import { createSubject } from "../../services/subjectService";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;

const CreateSubjectPage = () => {
  const [subjectData, setSubjectData] = useState({
    subjectId: "",
    courseId: "",
    subjectName: "",
    description: "",
    credits: "",
    passingScore: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
  };

  const handleCreateSubject = async () => {
    if (
      !subjectData.subjectId ||
      !subjectData.courseId ||
      !subjectData.subjectName ||
      !subjectData.description ||
      !subjectData.credits ||
      !subjectData.passingScore
    ) {
      message.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      await createSubject({
        subjectId: subjectData.subjectId,
        courseId: subjectData.courseId,
        subjectName: subjectData.subjectName,
        description: subjectData.description,
        credits: Number(subjectData.credits),
        passingScore: Number(subjectData.passingScore),
      });
      navigate("/subject");
      message.success("Subject created successfully!");
      setSubjectData({
        subjectId: "",
        courseId: "",
        subjectName: "",
        description: "",
        credits: "",
        passingScore: "",
      });
    } catch {
      message.error("Failed to create subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-8 space-x-2">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 px-0"
        >
          Subject List
        </Button>
        <span className="text-gray-400">/</span>
        <span className="font-semibold text-gray-800">
          Create a new subject
        </span>
      </div>
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-4xl space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Create a New Subject
        </h2>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Subject ID
          </label>
          <Input
            name="subjectId"
            placeholder="Subject ID"
            value={subjectData.subjectId}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Course ID
          </label>
          <Input
            name="courseId"
            placeholder="Course ID"
            value={subjectData.courseId}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Subject Name
          </label>
          <Input
            name="subjectName"
            placeholder="Subject Name"
            value={subjectData.subjectName}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Description
          </label>
          <TextArea
            rows={4}
            name="description"
            placeholder="Subject Description"
            value={subjectData.description}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Credits
          </label>
          <Input
            type="number"
            name="credits"
            placeholder="Credits"
            value={subjectData.credits}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Passing Score
          </label>
          <Input
            type="number"
            name="passingScore"
            placeholder="Passing Score"
            value={subjectData.passingScore}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <Button
          type="primary"
          className="mt-6 px-6 py-3 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 w-full"
          onClick={handleCreateSubject}
          loading={loading}
        >
          {loading ? "Creating..." : "Create Subject"}
        </Button>
      </div>
    </Layout>
  );
};

export default CreateSubjectPage;
