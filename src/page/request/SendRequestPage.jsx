import { useState } from "react";
import { Layout, Input, Button, message, Select } from "antd";
import { createRequest } from "../../services/requestService";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const SendRequestPage = () => {
  const [requestData, setRequestData] = useState({
    requestType: 0,
    requestEntityId: "",
    description: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData({ ...requestData, [name]: value });
  };

  const handleSelectChange = (value) => {
    setRequestData({ ...requestData, requestType: value });
  };

  const handleSendRequest = async () => {
    const { requestType, requestEntityId, description } = requestData;

    if (
      requestType === null ||
      requestEntityId.trim() === "" ||
      description.trim() === ""
    ) {
      message.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    try {
      await createRequest(requestData);
      message.success("Request sent successfully!");
      navigate(-1);
    } catch {
      message.error("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-3xl space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Send a Request
        </h2>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Request Type
          </label>
          <Select
            value={requestData.requestType}
            onChange={handleSelectChange}
            className="w-full"
            size="large"
          >
            <Option value={3}>Complain</Option>
          </Select>
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Request Entity ID
          </label>
          <Input
            name="requestEntityId"
            placeholder="Enter entity ID"
            value={requestData.requestEntityId}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Description
          </label>
          <Input
            name="description"
            placeholder="Brief description"
            value={requestData.description}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Notes (optional)
          </label>
          <TextArea
            rows={4}
            name="notes"
            placeholder="Additional notes"
            value={requestData.notes}
            onChange={handleChange}
            className="p-3 text-lg rounded-lg border border-gray-300 w-full"
          />
        </div>

        <Button
          type="primary"
          className="mt-6 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
          onClick={handleSendRequest}
          loading={loading}
        >
          {loading ? "Sending..." : "Send Request"}
        </Button>
      </div>
    </Layout>
  );
};

export default SendRequestPage;
