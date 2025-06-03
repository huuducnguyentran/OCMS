import { useState, useEffect } from "react";
import {
  Layout,
  Input,
  Button,
  message,
  Form,
  Spin,
  Card,
  Typography,
  Divider,
  AutoComplete,
  Select,
  Tabs,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { courseService } from "../../services/courseService";

const { Title, Text } = Typography;

const CreateCoursePage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialCourses, setInitialCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState("import");

  useEffect(() => {
    fetchInitialCourses();
  }, []);

  const fetchInitialCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getAllCourses();
      if (response.data) {
        const filteredCourses = response.data.filter(
          (course) =>
            course.courseLevel === "Initial" && course.progress !== "Pending"
        );
        setInitialCourses(filteredCourses);
      }
    } catch (error) {
      console.error("Failed to fetch initial courses:", error);
      message.error("Failed to load initial courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCreateCourse = async (values) => {
    try {
      setLoading(true);
      const formattedData = {
        courseLevel: values.courseLevel,
        courseName: values.courseName,
        description: values.description,
        courseRelatedId: values.courseRelatedId || "",
      };
      await courseService.createCourse(formattedData);
      message.success("Course created successfully!");
      form.resetFields();
      navigate("/all-courses", { state: { refresh: true } });
    } catch (error) {
      const errorData = error?.response?.data;
      const errorMsg =
        errorData?.message ||
        errorData?.error ||
        error.message ||
        "Failed to create course";
      message.error(`Failed to create course: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (file) => {
    try {
      const result = await courseService.importCourse(file);
      message.success("Course imported successfully!");
      console.log(result);
    } catch (error) {
      message.error("Failed to import course", error);
    }
  };

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100 !p-6 !sm:p-8">
      <Card
        className="!min-w-5xl !mx-auto !rounded-xl !border !border-cyan-600 !shadow-lg"
        title={
          <div className="flex items-center justify-between">
            <Title level={3} className="!text-cyan-700 m-0">
              {mode === "manual" ? "Create New Course" : "Import Courses"}
            </Title>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/all-courses")}
              className="!border-cyan-400 !text-cyan-700 hover:!text-cyan-900 hover:!border-cyan-600"
            >
              Back to Courses
            </Button>
          </div>
        }
      >
        <Tabs
          activeKey={mode}
          onChange={setMode}
          className="mb-6"
          tabBarStyle={{ color: "#0891b2", fontWeight: "500" }}
        >
          <Tabs.TabPane key="import" tab="Import from File" />
          <Tabs.TabPane
            key="manual"
            className="active:!text-cyan-700"
            tab="Create Manually"
          />
        </Tabs>

        <Spin spinning={loading || loadingCourses} size="large">
          {mode === "manual" ? (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateCourse}
              initialValues={{ courseLevel: "Initial" }}
              size="large"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item
                  name="courseName"
                  label={
                    <Text strong className="!text-cyan-700">
                      Course Name
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Course name is required" },
                    { max: 255, message: "Max 255 characters" },
                  ]}
                >
                  <Input
                    placeholder="Enter course name"
                    maxLength={255}
                    className="rounded-md"
                  />
                </Form.Item>

                <Form.Item
                  name="courseLevel"
                  label={
                    <Text strong className="!text-cyan-700">
                      Course Level
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Course level is required" },
                  ]}
                >
                  <Select
                    placeholder="Select course level"
                    className="rounded-md"
                    options={[
                      { value: "Initial", label: "Initial" },
                      { value: "Recurrent", label: "Recurrent" },
                      { value: "Relearn", label: "Relearn" },
                      { value: "Professional", label: "Professional" },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  name="courseRelatedId"
                  label={
                    <Text strong className="!text-cyan-700">
                      Course Related ID
                    </Text>
                  }
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const level = getFieldValue("courseLevel");
                        if (
                          (level === "Recurrent" || level === "Relearn") &&
                          !value
                        ) {
                          return Promise.reject(
                            new Error("Required for Recurrent/Relearn")
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                    { max: 20, message: "Max 20 characters" },
                  ]}
                >
                  <AutoComplete
                    placeholder="Select or enter related course ID"
                    options={initialCourses.map((c) => ({
                      value: c.courseId,
                      label: `${c.courseName} (${c.courseId})`,
                    }))}
                    filterOption={(input, option) =>
                      option?.value
                        ?.toLowerCase()
                        .includes(input.toLowerCase()) ||
                      option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Input className="py-2 px-4 rounded-md" />
                  </AutoComplete>
                </Form.Item>

                <Form.Item
                  name="description"
                  label={
                    <Text strong className="!text-cyan-700">
                      Description
                    </Text>
                  }
                  rules={[
                    { required: true, message: "Description is required" },
                    { max: 255, message: "Max 255 characters" },
                  ]}
                  className="md:col-span-2"
                >
                  <Input.TextArea
                    placeholder="Enter course description"
                    autoSize={{ minRows: 3 }}
                    maxLength={255}
                    className="rounded-md"
                  />
                </Form.Item>
              </div>

              <Divider className="my-8 border-gray-200" />

              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => form.resetFields()}
                  icon={<ReloadOutlined />}
                  className="!border-cyan-500 !text-cyan-600 hover:!border-cyan-700 hover:!text-cyan-700"
                >
                  Reset
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  loading={loading}
                  className="!bg-cyan-700 hover:!bg-cyan-800 !border-none"
                >
                  {loading ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </Form>
          ) : (
            <div className="w-full space-y-6">
              <Upload.Dragger
                accept=".csv,.xlsx"
                multiple={false}
                beforeUpload={(file) => {
                  setSelectedFile(file);
                  return false;
                }}
                showUploadList={false}
                className="w-full min-h-[200px] p-8 border-2 border-dashed border-cyan-400 rounded-xl bg-white"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 32, color: "#06b6d4" }} />
                </p>
                <p className="text-lg font-medium text-gray-700">
                  Click or drag file to this area
                </p>
                <p className="text-sm text-gray-500">
                  Only .csv or .xlsx files are supported.
                </p>
              </Upload.Dragger>

              {selectedFile && (
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border p-4 rounded-lg bg-cyan-50 border-cyan-200 shadow-sm">
                  <Text className="text-gray-800">{selectedFile.name}</Text>
                  <div className="flex gap-3 justify-end">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={() => setSelectedFile(null)}
                      className="border-cyan-400 text-cyan-600 hover:text-white hover:bg-cyan-500"
                    >
                      Remove
                    </Button>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      loading={loading}
                      onClick={async () => {
                        setLoading(true);
                        await handleImport(selectedFile);
                        setLoading(false);
                        setSelectedFile(null);
                      }}
                      className="bg-cyan-600 hover:bg-cyan-700 border-none"
                    >
                      Confirm Import
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Spin>
      </Card>
    </Layout>
  );
};

export default CreateCoursePage;
