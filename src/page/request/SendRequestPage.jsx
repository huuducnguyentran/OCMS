import { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Select,
  Form,
  Typography,
  Spin,
  Alert,
} from "antd";
import { createRequest } from "../../services/requestService";
import { getAllSubject } from "../../services/subjectService";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";

const { TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const SendRequestPage = () => {
  const [requestData, setRequestData] = useState({
    requestType: 3,
    requestEntityId: "",
    description: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    // Get user role from sessionStorage
    const role = sessionStorage.getItem("role");
    console.log("Current user role:", role);
    setUserRole(role);

    // Nếu là AOC Manager, cập nhật requestType mặc định thành 6 (CreateNew)
    if (role === "AOC Manager") {
      setRequestData((prev) => ({ ...prev, requestType: 6 }));
    }

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

      // Kiểm tra cấu trúc response theo cách mới như trong CreateLearningMatrixPage
      if (response && response.allSubjects && Array.isArray(response.allSubjects)) {
        console.log("Using response.allSubjects array");
        // Map dữ liệu theo cấu trúc mới
        const formattedSubjects = response.allSubjects.map(subject => ({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          description: subject.description,
          credits: subject.credits,
          passingScore: subject.passingScore
        }));
        setSubjects(formattedSubjects);
      }
      // Duy trì các kiểm tra cũ cho các trường hợp khác
      else if (response && response.subjects && Array.isArray(response.subjects)) {
        console.log("Using response.subjects array");
        setSubjects(response.subjects);
      } else if (response && Array.isArray(response)) {
        console.log("Using response as subjects list");
        setSubjects(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        console.log("Using response.data as subjects list");
        setSubjects(response.data);
      } else if (
        response &&
        response.data &&
        response.data.subjects &&
        Array.isArray(response.data.subjects)
      ) {
        console.log("Using response.data.subjects as subjects list");
        setSubjects(response.data.subjects);
      } else if (
        response &&
        response.data &&
        response.data.allSubjects &&
        Array.isArray(response.data.allSubjects)
      ) {
        console.log("Using response.data.allSubjects as subjects list");
        const formattedSubjects = response.data.allSubjects.map(subject => ({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          description: subject.description,
          credits: subject.credits,
          passingScore: subject.passingScore
        }));
        setSubjects(formattedSubjects);
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
        } else if (
          response.data.subjects &&
          Array.isArray(response.data.subjects)
        ) {
          console.log("Setting subjects from direct API call (data.subjects)");
          setSubjects(response.data.subjects);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log("Setting subjects from direct API call (data.data)");
          setSubjects(response.data.data);
        } else if (
          response.data.data &&
          response.data.data.subjects &&
          Array.isArray(response.data.data.subjects)
        ) {
          console.log(
            "Setting subjects from direct API call (data.data.subjects)"
          );
          setSubjects(response.data.data.subjects);
        } else if (
          response.data.allSubjects &&
          Array.isArray(response.data.allSubjects)
        ) {
          console.log("Setting subjects from direct API call (data.allSubjects)");
          const formattedSubjects = response.data.allSubjects.map(subject => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            description: subject.description,
            credits: subject.credits,
            passingScore: subject.passingScore
          }));
          setSubjects(formattedSubjects);
        } else if (
          response.data.data &&
          response.data.data.allSubjects &&
          Array.isArray(response.data.data.allSubjects)
        ) {
          console.log("Setting subjects from direct API call (data.data.allSubjects)");
          const formattedSubjects = response.data.data.allSubjects.map(subject => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            description: subject.description,
            credits: subject.credits,
            passingScore: subject.passingScore
          }));
          setSubjects(formattedSubjects);
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

  const handleRequestTypeChange = (value) => {
    setRequestData({ ...requestData, requestType: value });
  };

  const handleSendRequest = async () => {
    // Validate fields based on role
    if (userRole === "AOC Manager") {
      if (
        !requestData.description ||
        requestData.description.trim() === "" ||
        !requestData.notes ||
        requestData.notes.trim() === ""
      ) {
        message.error("Please fill in all required fields!");
        return;
      }
    } else {
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
    }

    setLoading(true);
    setApiError(null);
    try {
      let payload;

      if (userRole === "AOC Manager") {
        // Create payload without requestEntityId for AOC Manager
        payload = {
          requestType: requestData.requestType, // 6, 7, or 8 based on selection
          description: requestData.description,
          notes: requestData.notes,
        };
      } else {
        payload = {
          requestType: 3,
          requestEntityId: requestData.requestEntityId,
          description: requestData.description,
          notes: requestData.notes,
        };
      }

      console.log("Sending payload:", payload);
      await createRequest(payload);

      const successMessage =
        userRole === "AOC Manager"
          ? "Plan request sent successfully!"
          : "Complaint sent successfully!";
      message.success(successMessage);

      // Reset form
      if (userRole === "AOC Manager") {
        setRequestData({
          requestType: 6,
          description: "",
          notes: "",
        });
      } else {
        setRequestData({
          requestType: 3,
          requestEntityId: "",
          description: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Request error:", error);

      // Xử lý lỗi API và lưu vào trạng thái
      if (error.response && error.response.data) {
        // Lưu thông tin lỗi từ API vào state
        setApiError(error.response.data);
      } else {
        // Trường hợp không có response.data, vẫn hiển thị thông báo lỗi chung
        const errorMessage =
          userRole === "AOC Manager"
            ? "Failed to send plan request. Please try again."
            : "Failed to send complaint. Please try again.";
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị chi tiết lỗi từ API
  const renderErrorDetails = () => {
    if (!apiError) return null;

    // Hàm tạo danh sách lỗi từ đối tượng errors
    const formatErrors = (errors) => {
      if (!errors) return [];

      const errorList = [];
      Object.keys(errors).forEach((key) => {
        if (Array.isArray(errors[key])) {
          errors[key].forEach((err) => {
            errorList.push(`${key}: ${err}`);
          });
        } else {
          errorList.push(`${key}: ${errors[key]}`);
        }
      });

      return errorList;
    };

    const errorList = apiError.errors
      ? formatErrors(apiError.errors)
      : [`${apiError.title || "Error"}: ${apiError.status || ""}`];

    return (
      <Alert
        message={apiError.title || "Request Error"}
        description={
          <div>
            <p>
              {apiError.detail || "One or more validation errors occurred."}
            </p>
            <ul className="list-disc ml-5 mt-2">
              {errorList.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
            {apiError.traceId && (
              <p className="mt-2 text-xs">
                <span className="font-semibold">Trace ID:</span>{" "}
                {apiError.traceId}
              </p>
            )}
          </div>
        }
        type="error"
        showIcon
        closable
        onClose={() => setApiError(null)}
        className="mb-4"
      />
    );
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-3xl space-y-6">
        <Title level={2} className="text-center text-gray-800 mb-6">
          {userRole === "AOC Manager"
            ? "Request create plan"
            : "Send a Complaint"}
        </Title>

        {/* Hiển thị chi tiết lỗi API nếu có */}
        {renderErrorDetails()}

        <Form layout="vertical">
          {userRole === "AOC Manager" && (
            <Form.Item
              label={
                <span className="text-lg font-semibold">Request Type</span>
              }
              required
            >
              <Select
                placeholder="Select request type"
                value={requestData.requestType}
                onChange={handleRequestTypeChange}
                className="w-full"
                size="large"
              >
                <Option value={6}>Create New</Option>
                <Option value={7}>Create Recurrent</Option>
                <Option value={8}>Create Relearn</Option>
              </Select>
            </Form.Item>
          )}

          {userRole !== "AOC Manager" && (
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
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                >
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <Option
                        key={subject.subjectId}
                        value={subject.subjectId}
                        label={`${subject.subjectName} (${subject.subjectId})`}
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
          )}

          <Form.Item
            label={<span className="text-lg font-semibold">Description</span>}
            required
          >
            <Input
              name="description"
              placeholder={
                userRole === "AOC Manager"
                  ? "Brief description of your plan request"
                  : "Brief description of your complaint"
              }
              value={requestData.description}
              onChange={handleChange}
              className="p-3 text-lg rounded-lg border border-gray-300 w-full"
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-lg font-semibold">Additional Details</span>
            }
            required
          >
            <TextArea
              rows={4}
              name="notes"
              placeholder={
                userRole === "AOC Manager"
                  ? "Provide any additional details for your plan request"
                  : "Provide any additional details or context for your complaint"
              }
              value={requestData.notes}
              onChange={handleChange}
              className="p-3 text-lg rounded-lg border border-gray-300 w-full"
              required
              maxLength={100}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className="mt-6 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full"
              onClick={handleSendRequest}
              loading={loading}
            >
              {loading ? "Sending..." : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default SendRequestPage;
