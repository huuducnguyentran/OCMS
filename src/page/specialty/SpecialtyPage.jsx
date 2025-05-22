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

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      const response = await specialtyService.getAllSpecialties();
      if (response.success) {
        setSpecialties(response.data);
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

  const transformToTreeData = (data) => {
    const rootSpecialties = data.filter((item) => !item.parentSpecialtyId);
    return rootSpecialties.map((specialty) => ({
      key: specialty.specialtyId,
      title: specialty.specialtyName,
      children: transformChildren(data, specialty.specialtyId),
    }));
  };

  const transformChildren = (data, parentId) => {
    const children = data.filter((item) => item.parentSpecialtyId === parentId);
    return children.map((child) => ({
      key: child.specialtyId,
      title: child.specialtyName,
      children: transformChildren(data, child.specialtyId),
    }));
  };

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
        <Tag
          color={status === 0 ? "cyan" : "red"}
          className="px-3 py-1 font-medium"
        >
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
            className="!border-cyan-600 !text-cyan-600 hover:!border-cyan-700 hover:!text-cyan-700"
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
        className: "bg-red-600 hover:bg-red-700",
      },
      onOk: async () => {
        try {
          setLoading(true);
          const response = await specialtyService.deleteSpecialty(
            record.specialtyId
          );
          if (response.success) {
            message.success("Specialty deleted successfully");
            const hasChildren = specialties.some(
              (s) => s.parentSpecialtyId === record.specialtyId
            );
            if (hasChildren) {
              message.info("Child specialties have been updated");
            }
            await fetchSpecialties();
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
    });
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <Card className="!mb-6 !shadow-md border !border-cyan-600">
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="!mb-1 text-cyan-700">
              Specialties Management
            </Title>
            <p className="!text-cyan-500">
              Manage and organize medical specialties
            </p>
          </div>
          <div className="!flex gap-4">
            <Button
              icon={<BranchesOutlined />}
              onClick={() => navigate("/specialty/tree")}
              className="h-10 !border-cyan-600 !text-cyan-600 hover:!border-cyan-700 hover:!text-cyan-700"
            >
              View Tree
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="!bg-cyan-600 hover:!bg-cyan-700 h-10 flex items-center"
              onClick={() => navigate("/specialty/create")}
            >
              Add Specialty
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="!shadow-md border !border-cyan-600">
          <Title level={4} className="!mb-4 !text-cyan-700">
            Specialty Hierarchy
          </Title>
          <div className="border rounded-lg p-4 bg-cyan-50">
            <Tree
              treeData={treeData}
              defaultExpandAll
              showLine={{ showLeafIcon: false }}
              className="bg-white p-3 rounded-lg"
            />
          </div>
        </Card>

        <div className="lg:col-span-3">
          <Card className="!shadow-md border !border-cyan-600">
            <Table
              columns={columns}
              dataSource={specialties}
              loading={loading}
              rowKey="specialtyId"
              scroll={{ x: true }}
              pagination={{ pageSize: 10 }}
              className="border rounded-lg"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyPage;
