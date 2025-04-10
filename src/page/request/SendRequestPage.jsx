import { useState, useEffect } from "react";
import { Layout, Input, Button, message, Select, Form, Typography } from "antd";
import { createRequest } from "../../services/requestService";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const SendRequestPage = () => {
  const [requestData, setRequestData] = useState({
    requestType: 0, // Default to 0 (NewPlan) 
    requestEntityId: "",
    description: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("role");
    console.log("Current user role:", role);
    setUserRole(role);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
  };

  const handleSelectChange = (value) => {
    setRequestData({ ...requestData, requestType: value });
  };

  const handleSendRequest = async () => {
    // Debug log
    console.log("Current role:", userRole);
    console.log("Current request data:", requestData);
    
    // For Trainee, we only validate description
    if (userRole === "Trainee") {
      if (requestData.description.trim() === "") {
        message.error("Please enter a description!");
        return;
      }
    } else {
      // For other roles, validate all fields
      if (
        requestData.requestType === null ||
        requestData.requestEntityId.trim() === "" ||
        requestData.description.trim() === ""
      ) {
        message.error("Please fill in all required fields!");
        return;
      }
    }

    setLoading(true);
    try {
      // Create a payload based on role
      let payload;
      
      if (userRole === "Trainee") {
        payload = {
          requestType: 0, // For Trainee, use 0 instead of 3
          description: requestData.description,
          notes: requestData.notes
        };
        // No requestEntityId for Trainee
      } else {
        payload = requestData;
      }
      
      console.log("Sending payload:", payload);
      await createRequest(payload);
      message.success("Request sent successfully!");
      
      // Reset form instead of navigating away
      setRequestData({
        requestType: 0,
        requestEntityId: "",
        description: "",
        notes: ""
      });
      
      // Don't navigate away
      // navigate(-1);
    } catch (error) {
      console.error("Request error:", error);
      message.error("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Request type options based on the enum in the image
  const requestTypeOptions = [
    { value: 0, label: "NewPlan" },
    { value: 1, label: "RecurrentPlan" },
    { value: 2, label: "RelearnPlan" },
    { value: 3, label: "Complaint" },
    { value: 4, label: "PlanChange" },
    { value: 5, label: "PlanDelete" },
    { value: 6, label: "CreateNew" },
    { value: 7, label: "CreateRecurrent" },
    { value: 8, label: "CreateRelearn" },
    { value: 9, label: "CandidateImport" },
    { value: 10, label: "Update" },
    { value: 11, label: "Delete" },
    { value: 12, label: "AssignTrainee" },
    { value: 13, label: "AddTraineeAssign" }
  ];

  // Check if user is Trainee
  const isTrainee = userRole === "Trainee";

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-3xl space-y-6">
      {!isTrainee && (<Title level={2} className="text-center text-gray-800 mb-6">
          Send a Request
        </Title>)}
        {isTrainee && (<Title level={2} className="text-center text-gray-800 mb-6">
          Send a Complaint
        </Title>)}
        <Form layout="vertical">
          {!isTrainee && (
            <Form.Item 
              label={<span className="text-lg font-semibold">Request Type</span>}
              required
            >
              <Select
                value={requestData.requestType}
                onChange={handleSelectChange}
                className="w-full"
                size="large"
              >
                {requestTypeOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          {/* Show Request Entity ID field only for non-Trainee roles */}
          {!isTrainee && (
            <Form.Item 
              label={<span className="text-lg font-semibold">Request Entity ID</span>}
              required
            >
              <Input
                name="requestEntityId"
                placeholder="Enter entity ID"
                value={requestData.requestEntityId}
                onChange={handleChange}
                className="p-3 text-lg rounded-lg border border-gray-300 w-full"
              />
            </Form.Item>
          )}

          <Form.Item 
            label={<span className="text-lg font-semibold">Description</span>}
            required
          >
            <Input
              name="description"
              placeholder="Brief description"
              value={requestData.description}
              onChange={handleChange}
              className="p-3 text-lg rounded-lg border border-gray-300 w-full"
            />
          </Form.Item>

          <Form.Item 
            label={<span className="text-lg font-semibold">Notes</span>}
            required

          >
            <TextArea
              rows={4}
              name="notes"
              placeholder="Additional notes"
              value={requestData.notes}
              onChange={handleChange}
              className="p-3 text-lg rounded-lg border border-gray-300 w-full"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className="mt-6 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
              onClick={handleSendRequest}
              loading={loading}
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default SendRequestPage;
