import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Tree,
  Card,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BranchesOutlined,
} from "@ant-design/icons";
import { specialtyService } from "../../services/specialtyServices";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const SpecialtyPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const navigate = useNavigate();

  // Fetch specialties data
  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await specialtyService.getAllSpecialties();
      if (response.success) {
        setSpecialties(response.data);
        // Transform data for tree view
        const transformedData = transformToTreeData(response.data);
        setTreeData(transformedData);
      }
    } catch (error) {
      message.error("Failed to fetch specialties");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  // Transform flat data to tree structure
  const transformToTreeData = (data) => {
    // First, find root level specialties (those with no parent)
    const rootSpecialties = data.filter((item) => !item.parentSpecialtyId);

    // Transform each root specialty into tree node format
    return rootSpecialties.map((specialty) => ({
      key: specialty.specialtyId,
      title: specialty.specialtyName,
      children: transformChildren(data, specialty.specialtyId),
    }));
  };

  // Helper function to transform children
  const transformChildren = (data, parentId) => {
    const children = data.filter((item) => item.parentSpecialtyId === parentId);
    return children.map((child) => ({
      key: child.specialtyId,
      title: child.specialtyName,
      children: transformChildren(data, child.specialtyId),
    }));
  };

  // Table columns configuration
  const columns = [
    {
      title: "ID",
      dataIndex: "specialtyId",
      key: "specialtyId",
      width: 120,
    },
    {
      title: "Name",
      dataIndex: "specialtyName",
      key: "specialtyName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Parent Specialty",
      dataIndex: "parentSpecialtyName",
      key: "parentSpecialtyName",
      render: (text) => text || "None",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 0 ? "success" : "error"} className="px-3 py-1">
          {status === 0 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            className="hover:text-blue-600 hover:border-blue-600"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            className="hover:text-red-600 hover:border-red-600"
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  // Handlers
  const handleEdit = (record) => {
    navigate(`/specialty/edit/${record.specialtyId}`);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Specialty",
      content: (
        <div>
          <p>Are you sure you want to delete this specialty?</p>
          <p>
            <strong>Name:</strong> {record.specialtyName}
          </p>
          {record.description && (
            <p>
              <strong>Description:</strong> {record.description}
            </p>
          )}
          {record.parentSpecialtyName && (
            <p>
              <strong>Parent Specialty:</strong> {record.parentSpecialtyName}
            </p>
          )}
          <p className="text-red-500 mt-2">
            Warning: This action cannot be undone.
          </p>
        </div>
      ),
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      okButtonProps: {
        className: "bg-red-500",
      },
      onOk: async () => {
        try {
          setLoading(true); // Add loading state to table
          const response = await specialtyService.deleteSpecialty(
            record.specialtyId
          );

          if (response.success) {
            message.success("Specialty deleted successfully");
            // Check if the deleted specialty has children
            const hasChildren = specialties.some(
              (s) => s.parentSpecialtyId === record.specialtyId
            );
            if (hasChildren) {
              message.info("Child specialties have been updated");
            }
            await fetchSpecialties(); // Refresh the list
          } else {
            throw new Error(response.message || "Failed to delete specialty");
          }
        } catch (error) {
          message.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to delete specialty"
          );
        } finally {
          setLoading(false);
        }
      },
      onCancel() {
        // Optional: Add any cancel handling if needed
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="mb-6 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1">
              Specialties Management
            </Title>
            <p className="text-gray-500">
              Manage and organize medical specialties
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              icon={<BranchesOutlined />}
              onClick={() => navigate("/specialty/tree")}
              className="h-10 flex items-center"
            >
              View Tree
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 hover:bg-blue-700 h-10 flex items-center"
              onClick={() => navigate("/specialty/create")}
            >
              Add Specialty
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tree View */}
        <Card className="shadow-md">
          <Title level={4} className="!mb-4">
            Specialty Hierarchy
          </Title>
          <div className="border rounded-lg p-4 bg-gray-50">
            <Tree
              treeData={treeData}
              defaultExpandAll
              showLine={{ showLeafIcon: false }}
              showIcon
              className="bg-white p-3 rounded-lg"
            />
          </div>
        </Card>

        {/* Table View */}
        <div className="lg:col-span-3">
          <Card className="shadow-md">
            <Table
              columns={columns}
              dataSource={specialties}
              loading={loading}
              rowKey="specialtyId"
              scroll={{ x: true }}
              pagination={{
                pageSize: 10,
              }}
              className="border rounded-lg"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyPage;
