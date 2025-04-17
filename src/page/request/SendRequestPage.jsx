import { useState, useEffect } from "react";
import { Layout, Input, Button, message, Select, Form, Typography, Spin } from "antd";
import { createRequest } from "../../services/requestService";
import { getAllSubject } from "../../services/subjectService";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const SendRequestPage = () => {
  const [requestData, setRequestData] = useState({
    requestType: 3, // Default to 3 (Complaint)
    requestEntityId: "",
    description: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from sessionStorage
    const role = sessionStorage.getItem("role");
    console.log("Current user role:", role);
    setUserRole(role);
    
    console.log("Component mounted, fetching subjects...");
    // Fetch subjects when component mounts
    fetchSubjects();
  }, []);

  // Function to fetch all subjects
  const fetchSubjects = async () => {
    setSubjectsLoading(true);
    try {
      const response = await getAllSubject();
      console.log("Subjects API response:", response);
      
      // Kiểm tra cấu trúc response
      if (response && response.subjects && Array.isArray(response.subjects)) {
        console.log("Using response.subjects array");
        setSubjects(response.subjects);
      } else if (response && Array.isArray(response)) {
        console.log("Using response as subjects list");
        setSubjects(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log("Using response.data as subjects list");
        setSubjects(response.data);
      } else if (response && response.data && response.data.subjects && Array.isArray(response.data.subjects)) {
        console.log("Using response.data.subjects as subjects list");
        setSubjects(response.data.subjects);
      } else {
        console.error("Unexpected response format for subjects:", response);
        // Thử gọi API trực tiếp nếu cách thông thường không hoạt động
        fetchSubjectsDirectly();
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      message.error("Failed to load subjects. Please try again.");
      // Thử phương thức thay thế
      fetchSubjectsDirectly();
    } finally {
      setSubjectsLoading(false);
    }
  };

  // Phương thức backup gọi API trực tiếp
  const fetchSubjectsDirectly = async () => {
    try {
      console.log("Trying to fetch subjects directly...");
      const response = await axiosInstance.get(`/${API.GET_ALL_SUBJECTS}`);
      console.log("Direct API response:", response);
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          console.log("Setting subjects from direct API call (array)");
          setSubjects(response.data);
        } else if (response.data.subjects && Array.isArray(response.data.subjects)) {
          console.log("Setting subjects from direct API call (data.subjects)");
          setSubjects(response.data.subjects);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log("Setting subjects from direct API call (data.data)");
          setSubjects(response.data.data);
        } else if (response.data.data && response.data.data.subjects && Array.isArray(response.data.data.subjects)) {
          console.log("Setting subjects from direct API call (data.data.subjects)");
          setSubjects(response.data.data.subjects);
        } else {
          console.error("Unexpected direct response format:", response.data);
          setSubjects([]);
        }
      } else {
        console.error("No data in direct API response");
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error in direct API call:", error);
      setSubjects([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
  };

  const handleSubjectChange = (value) => {
    console.log("Selected subject ID:", value);
    setRequestData({ ...requestData, requestEntityId: value });
  };

  const handleSendRequest = async () => {
    // Debug log
    console.log("Current role:", userRole);
    console.log("Current request data:", requestData);

    // Validate all fields
    if (
      !requestData.requestEntityId ||
      requestData.requestEntityId.trim() === "" ||
      !requestData.description ||
      requestData.description.trim() === "" ||
      !requestData.notes ||
      requestData.notes.trim() === ""
    ) {
      message.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      // Create payload with complaint type (3)
      const payload = {
        requestType: 3, // Always use 3 (Complaint)
        requestEntityId: requestData.requestEntityId,
        description: requestData.description,
        notes: requestData.notes,
      };

      console.log("Sending payload:", payload);
      await createRequest(payload);
      message.success("Complaint sent successfully!");

      // Reset form
      setRequestData({
        requestType: 3,
        requestEntityId: "",
        description: "",
        notes: "",
      });
    } catch (error) {
      console.error("Request error:", error);
      message.error("Failed to send complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-3xl space-y-6">
        <Title level={2} className="text-center text-gray-800 mb-6">
          Send a Complaint
        </Title>
        
        <Form layout="vertical">
          <Form.Item
            label={<span className="text-lg font-semibold">Subject</span>}
            required
          >
            {subjectsLoading ? (
              <div className="flex justify-center p-3">
                <Spin size="small" />
              </div>
            ) : (
              <Select
                placeholder="Select subject"
                value={requestData.requestEntityId || undefined}
                onChange={handleSubjectChange}
                className="w-full"
                size="large"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children?.toLowerCase() ?? '').includes(input.toLowerCase())
                }
              >
                {subjects.length > 0 ? (
                  subjects.map((subject) => (
                    <Option 
                      key={subject.subjectId} 
                      value={subject.subjectId}
                    >
                      {subject.subjectName} ({subject.subjectId})
                    </Option>
                  ))
                ) : (
                  <Option disabled>No subjects available</Option>
                )}
              </Select>
            )}
          </Form.Item>

          <Form.Item
            label={<span className="text-lg font-semibold">Description</span>}
            required
          >
            <Input
              name="description"
              placeholder="Brief description of your complaint"
              value={requestData.description}
              onChange={handleChange}
              className="p-3 text-lg rounded-lg border border-gray-300 w-full"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-lg font-semibold">Additional Details</span>}
            required
          >
            <TextArea
              rows={4}
              name="notes"
              placeholder="Provide any additional details or context for your complaint"
              value={requestData.notes}
              onChange={handleChange}
              className="p-3 text-lg rounded-lg border border-gray-300 w-full"
              required
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className="mt-6 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
              onClick={handleSendRequest}
              loading={loading}
            >
              {loading ? "Sending..." : "Submit Complaint"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default SendRequestPage;
