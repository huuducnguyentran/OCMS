import { useEffect, useState } from "react";
import { Layout, Input, Button, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { getSubjectById, updateSubject } from "../../services/subjectService";

const { TextArea } = Input;

const UpdateSubjectPage = () => {
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { subjectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const data = await getSubjectById(subjectId);
        setSubjectData(data.subject);
      } catch {
        message.error("Failed to load subject data.");
      }
    };
    fetchSubject();
  }, [subjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!subjectData) return;

    const requiredFields = [
      "subjectName",
      "description",
      "credits",
      "passingScore",
    ];
    const hasEmpty = requiredFields.some((field) => !subjectData[field]);

    if (hasEmpty) {
      return message.error("Please fill in all required fields.");
    }

    setLoading(true);
    try {
      await updateSubject(subjectId, {
        ...subjectData,
        credits: Number(subjectData.credits),
        passingScore: Number(subjectData.passingScore),
      });
      message.success("Subject updated successfully!");
      navigate("/subject");
    } catch {
      message.error("Failed to update subject. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!subjectData) {
    return <div className="p-10 text-lg">Loading subject details...</div>;
  }

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="flex items-center mb-8 space-x-2">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 px-0"
        >
          Back to Subjects
        </Button>
        <span className="text-gray-400">/</span>
        <span className="font-semibold text-gray-800">Edit Subject</span>
      </div>

      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-4xl space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Edit Subject</h2>

        {/* Subject Name */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Subject Name
          </label>
          <Input
            name="subjectName"
            value={subjectData.subjectName}
            onChange={handleChange}
            className="text-lg p-3 rounded-lg border border-gray-300 w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Description
          </label>
          <TextArea
            rows={4}
            name="description"
            value={subjectData.description}
            onChange={handleChange}
            className="text-lg p-3 rounded-lg border border-gray-300 w-full"
          />
        </div>

        {/* Credits */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Credits
          </label>
          <Input
            type="number"
            name="credits"
            value={subjectData.credits}
            onChange={handleChange}
            className="text-lg p-3 rounded-lg border border-gray-300 w-full"
          />
        </div>

        {/* Passing Score */}
        <div>
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Passing Score
          </label>
          <Input
            type="number"
            name="passingScore"
            value={subjectData.passingScore}
            onChange={handleChange}
            className="text-lg p-3 rounded-lg border border-gray-300 w-full"
          />
        </div>

        <Button
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="w-full bg-green-500 text-white text-lg hover:bg-green-600 rounded-lg py-3"
        >
          {loading ? "Updating..." : "Update Subject"}
        </Button>
      </div>
    </Layout>
  );
};

export default UpdateSubjectPage;
