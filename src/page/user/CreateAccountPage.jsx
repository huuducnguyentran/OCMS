import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Card,
  Typography,
  Layout,
  Spin,
  Upload,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { createUser, getAllSpecialties } from "../../services/userService";
import { getAllDepartments } from "../../services/departmentServices";
import dayjs from "dayjs";
import {
  CreateAccountSchema,
  validateField,
} from "../../../utils/validationSchemas";

const { Title, Text } = Typography;
const { Option } = Select;

const CreateAccountPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const roleOptions = [
    { label: "HeadMaster", value: 2 },
    { label: "Training Staff", value: 3 },
    { label: "HR", value: 4 },
    { label: "Instructor", value: 5 },
    { label: "Reviewer", value: 6 },
    { label: "AOC Manager", value: 8 },
  ];

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      message.error("Please log in to continue");
      navigate("/login");
      return;
    }
    fetchSpecialties();
    fetchDepartment();
  }, [navigate]);
  const fetchDepartment = async () => {
    try {
      setLoadingDepartments(true);
      const response = await getAllDepartments();
      
      let departmentList = [];
      if (Array.isArray(response)) {
        departmentList = response;
      } 
      
      // Lọc các phòng ban có trạng thái là 0 (active)
      const activeDepartments = departmentList.filter(
        (department) => department.status === 0
      );
      
      setDepartments(activeDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please log in again");
        sessionStorage.clear();
        navigate("/login");
      } else {
        message.error("Cannot load department list");
      }
    } finally {
      setLoadingDepartments(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true);
      const response = await getAllSpecialties();
      if (response.data) {
        const activeSpecialties = response.data.filter(
          (specialty) => specialty.status === 0
        );
        setSpecialties(activeSpecialties);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        message.error("Session expired. Please log in again");
        sessionStorage.clear();
        navigate("/login");
      } else {
        message.error("Cannot load specialty list");
      }
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const handleFieldChange = async (changedFields, allFields) => {
    const fieldName = changedFields[0]?.name[0];
    if (!fieldName) return;

    const value = form.getFieldValue(fieldName);

    try {
      // Xử lý đặc biệt cho dateOfBirth
      if (fieldName === "dateOfBirth" && value) {
        const dateValue = value.toDate();
        const age = calculateAge(dateValue);

        if (dateValue > new Date()) {
          setFormErrors((prev) => ({
            ...prev,
            dateOfBirth: "Date of birth cannot be in the future",
          }));
          return;
        }

        if (age < 18) {
          setFormErrors((prev) => ({
            ...prev,
            dateOfBirth: "User must be at least 18 years old",
          }));
          return;
        }

        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.dateOfBirth;
          return newErrors;
        });
        return;
      }

      // Xử lý đặc biệt cho email
      if (fieldName === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setFormErrors((prev) => ({
            ...prev,
            email: "Invalid email format",
          }));
          return;
        }
        if (value.length > 100) {
          setFormErrors((prev) => ({
            ...prev,
            email: "Email must not exceed 100 characters",
          }));
          return;
        }
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
        return;
      }

      await validateField(fieldName, value);
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        [fieldName]: error.message,
      }));
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const formData = {
        ...values,
        status: 0,
        isAssign: false,
      };

      await CreateAccountSchema.validate(formData, { abortEarly: false });

      const userData = {
        fullName: values.fullName.trim(),
        gender: values.gender,
        dateOfBirth: dayjs(values.dateOfBirth).format("YYYY-MM-DD"),
        address: values.address.trim(),
        phoneNumber: values.phoneNumber.trim(),
        email: values.email.trim(),
        roleId: Number(values.roleId),
        specialtyId: values.specialtyId,
        departmentId: values.departmentId?.trim() || null,
        status: 0,
        isAssign: false,
      };

      await createUser(userData);
      message.success("Create account successfully!");
      navigate("/accounts");
    } catch (error) {
      if (error.name === "ValidationError") {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFormErrors(errors);
        message.error("Please check the information again");
      } else if (error.response?.status === 401) {
        message.error("Session expired. Please log in again");
        sessionStorage.clear();
        navigate("/login");
      } else if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, value]) => {
          message.error(`${key}: ${value[0]}`);
        });
      } else {
        message.error("Cannot create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setFormErrors({});
  };

  const handleAvatarChange = (info) => {
    if (info.file) {
      setAvatarFile(info.file.originFileObj);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Card className="max-w-7xl mx-auto shadow-lg rounded-xl border-0">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <Title level={2} className="mb-0 text-indigo-800">
              Create New Account
            </Title>
            <Text type="secondary">
              Fill in the information to create a new user account
            </Text>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/accounts")}
            className="hover:bg-gray-100"
          >
            Back
          </Button>
        </div>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFieldsChange={handleFieldChange}
            initialValues={{
              gender: "Male",
              isAssign: false,
              status: 0,
            }}
            className="space-y-6"
          >
            {/* Personal Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Title level={4} className="mb-4 text-indigo-700">
                Personal Information
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  validateStatus={formErrors.fullName ? "error" : ""}
                  help={formErrors.fullName}
                  className="mb-4"
                  required
                >
                  <Input
                    placeholder="Enter full name"
                    className="rounded-lg"
                    size="large"
                    required
                  />
                </Form.Item>

                <Form.Item
                  name="gender"
                  label="Gender"
                  validateStatus={formErrors.gender ? "error" : ""}
                  help={formErrors.gender}
                  className="mb-4"
                  required
                >
                  <Select
                    placeholder="Select gender"
                    className="rounded-lg"
                    size="large"
                    required
                  >
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  validateStatus={formErrors.dateOfBirth ? "error" : ""}
                  help={formErrors.dateOfBirth}
                  className="mb-4"
                  rules={[
                    {
                      required: true,
                      message: "Date of birth is required",
                    },
                    {
                      validator: async (_, value) => {
                        if (value) {
                          const age = calculateAge(value.toDate());
                          if (age < 18) {
                            throw new Error(
                              "User must be at least 18 years old"
                            );
                          }
                          if (value.toDate() > new Date()) {
                            throw new Error(
                              "Date of birth cannot be in the future"
                            );
                          }
                        }
                      },
                    },
                  ]}
                >
                  <DatePicker
                    className="w-full rounded-lg"
                    placeholder="Select date of birth"
                    format="DD/MM/YYYY"
                    size="large"
                    onChange={(date) => {
                      form.setFieldsValue({ dateOfBirth: date });
                      handleFieldChange([{ name: ["dateOfBirth"] }]);
                    }}
                    disabledDate={(current) => {
                      const eighteenYearsAgo = new Date();
                      eighteenYearsAgo.setFullYear(
                        eighteenYearsAgo.getFullYear() - 18
                      );
                      return (
                        current &&
                        (current > new Date() || current > eighteenYearsAgo)
                      );
                    }}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Title level={4} className="mb-4 text-indigo-700">
                Contact Information
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="email"
                  label="Email"
                  validateStatus={formErrors.email ? "error" : ""}
                  help={formErrors.email}
                  className="mb-4"
                  rules={[
                    {
                      required: true,
                      message: "Email is required",
                    },
                    {
                      type: "email",
                      message: "Invalid email format",
                    },
                    {
                      max: 100,
                      message: "Email must not exceed 100 characters",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter email"
                    className="rounded-lg"
                    size="large"
                    onChange={(e) => {
                      form.setFieldsValue({ email: e.target.value });
                      handleFieldChange([{ name: ["email"] }]);
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="phoneNumber"
                  label="Phone Number"
                  validateStatus={formErrors.phoneNumber ? "error" : ""}
                  help={formErrors.phoneNumber}
                  className="mb-4"
                  required
                >
                  <Input
                    placeholder="Enter phone number"
                    className="rounded-lg"
                    size="large"
                    maxLength={10}
                    required
                  />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Address"
                  validateStatus={formErrors.address ? "error" : ""}
                  help={formErrors.address}
                  className="mb-4 md:col-span-2"
                  required
                >
                  <Input
                    placeholder="Enter address"
                    className="rounded-lg"
                    size="large"
                    required
                  />
                </Form.Item>
              </div>
            </div>

            {/* Role & Department Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Title level={4} className="mb-4 text-indigo-700">
                Role & Department
              </Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="roleId"
                  label="Role"
                  validateStatus={formErrors.roleId ? "error" : ""}
                  help={formErrors.roleId}
                  className="mb-4"
                  required
                >
                  <Select
                    placeholder="Select role"
                    className="rounded-lg"
                    size="large"
                    required
                  >
                    {roleOptions.map((role) => (
                      <Option key={role.value} value={role.value}>
                        {role.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="specialtyId"
                  label="Specialty"
                  validateStatus={formErrors.specialtyId ? "error" : ""}
                  help={formErrors.specialtyId}
                  className="mb-4"
                  required
                >
                  <Select
                    placeholder="Select specialty"
                    loading={loadingSpecialties}
                    showSearch
                    optionFilterProp="children"
                    className="rounded-lg"
                    size="large"
                  >
                    {specialties.map((specialty) => (
                      <Option
                        key={specialty.specialtyId}
                        value={specialty.specialtyId}
                      >
                        {specialty.specialtyName} ({specialty.specialtyId})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="departmentId"
                  label="Department"
                  validateStatus={formErrors.departmentId ? "error" : ""}
                  help={formErrors.departmentId}
                  className="mb-4"
                >
                    <Select
                    placeholder="Select department"
                    loading={loadingDepartments}
                    showSearch
                    optionFilterProp="children"
                    className="rounded-lg"
                    size="large"
                  >
                    {departments.map((department) => (
                      <Option
                        key={department.departmentId}
                        value={department.departmentId}
                      >
                        {department.departmentName} ({department.departmentId})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
            </div>

            {/* Avatar Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Title level={4} className="mb-4 text-indigo-700">
                Profile Picture
              </Title>
              <Form.Item name="avatar" className="mb-4">
                <Upload
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleAvatarChange}
                  className="upload-list-inline"
                >
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    className="rounded-lg"
                  >
                    Upload Image
                  </Button>
                </Upload>
              </Form.Item>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                onClick={handleReset}
                size="large"
                className="rounded-lg min-w-[120px]"
              >
                Reset
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
                className="rounded-lg min-w-[120px]"
              >
                Create Account
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </Layout>
  );
};

export default CreateAccountPage;
