import { useEffect, useState } from "react";
import {
  Card,
  Input,
  Spin,
  Empty,
  Tag,
  Typography,
  Tooltip,
  Pagination,
  message,
  Modal,
  Form,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import "animate.css";
import ClassroomService from "../../services/classroomService";

const { Title } = Typography;

const ClassroomPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewClass, setViewClass] = useState(null);
  const [editClass, setEditClass] = useState(null);
  const [form] = Form.useForm();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  const pageSize = 6;

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await ClassroomService.getAllClassrooms();
      setClasses(Array.isArray(res.data?.classes) ? res.data.classes : []);
    } catch {
      message.error("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this classroom?",
      onOk: async () => {
        try {
          await ClassroomService.deleteClassroom(id);
          message.success("Classroom deleted");
          fetchClasses();
        } catch {
          message.error("Delete failed");
        }
      },
    });
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await ClassroomService.updateClassroom(editClass.classId, values);
      message.success("Classroom updated");
      setEditClass(null);
      fetchClasses();
    } catch (err) {
      message.error("Update failed", err);
    }
  };

  const filtered = classes.filter((c) =>
    [c.classId, c.className]
      .join(" ")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const currentData = () => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate__animated animate__fadeIn">
          <HomeOutlined className="text-5xl mb-4" />
          <h1 className="text-4xl font-bold mb-4">Training Classrooms</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Browse our available classrooms used in training programs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search classrooms by name or ID..."
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="large"
          />
        </div>

        {/* Classroom Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading classrooms..." />
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            description={
              <div className="text-center space-y-4">
                <p className="text-gray-500 text-lg">
                  {searchText
                    ? `No classrooms matching "${searchText}"`
                    : "No classrooms available"}
                </p>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate__animated animate__fadeInUp">
            {currentData().map((c) => (
              <Card
                key={c.classId}
                className="hover:shadow-xl transition-shadow rounded-xl border-none bg-white overflow-hidden"
                actions={[
                  <Tooltip title="View" key="view">
                    <EyeOutlined
                      onClick={() => setViewClass(c)}
                      className="text-blue-500 hover:text-blue-700"
                    />
                  </Tooltip>,
                  <Tooltip title="Edit" key="edit">
                    <EditOutlined
                      onClick={() => {
                        form.setFieldsValue(c);
                        setEditClass(c);
                      }}
                      className="text-green-500 hover:text-green-700"
                    />
                  </Tooltip>,
                  <Tooltip title="Delete" key="delete">
                    <DeleteOutlined
                      onClick={() => handleDelete(c.classId)}
                      className="text-red-500 hover:text-red-700"
                    />
                  </Tooltip>,
                ]}
              >
                <div className="p-4">
                  <Title level={4} className="mb-2" ellipsis>
                    {c.className}
                  </Title>
                  <Tag color="blue">{c.classId}</Tag>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filtered.length > pageSize && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              onChange={(page) => setCurrentPage(page)}
              total={filtered.length}
              pageSize={pageSize}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `Total ${total} classrooms`}
            />
          </div>
        )}
      </div>
      <Tooltip title="Create New Classroom" placement="left">
        <button
          onClick={() => {
            createForm.resetFields();
            setIsCreateModalOpen(true);
          }}
          style={{ background: "black", color: "#fff" }}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 animate__animated animate__bounceIn"
        >
          <PlusOutlined className="text-xl" />
        </button>
      </Tooltip>

      {/* View Modal */}
      <Modal
        title="Classroom Details"
        open={!!viewClass}
        onCancel={() => setViewClass(null)}
        footer={null}
      >
        {viewClass && (
          <div>
            <p>
              <strong>Class ID:</strong> {viewClass.classId}
            </p>
            <p>
              <strong>Class Name:</strong> {viewClass.className}
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Classroom"
        open={!!editClass}
        onCancel={() => setEditClass(null)}
        onOk={handleEditSubmit}
        okText="Update"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Class Name"
            name="className"
            rules={[{ required: true, message: "Class name is required" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create New Classroom"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={async () => {
          try {
            const values = await createForm.validateFields();
            await ClassroomService.createClassroom(values);
            message.success("Classroom created");
            setIsCreateModalOpen(false);
            fetchClasses();
          } catch (err) {
            message.error("Creation failed", err);
          }
        }}
        okText="Create"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="Class Name"
            name="className"
            rules={[{ required: true, message: "Please enter class name" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassroomPage;
