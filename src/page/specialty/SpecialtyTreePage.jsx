import { useState, useEffect } from "react";
import { Tree, Card, Button, message, Spin, Typography, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { specialtyService } from "../../services/specialtyServices";
import { ArrowLeftOutlined, BranchesOutlined } from "@ant-design/icons";

const { Title } = Typography;

const SpecialtyTreePage = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Fetch specialty tree data
  const fetchSpecialtyTree = async () => {
    try {
      setLoading(true);
      const response = await specialtyService.getSpecialtyTree();
      if (response.success) {
        setTreeData(processTreeData(response.data));
        const allKeys = getAllKeys(response.data);
        setExpandedKeys(allKeys);
      }
    } catch (error) {
      message.error("Failed to fetch specialty tree");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialtyTree();
  }, []);

  const processTreeData = (data) => {
    return data.map((node) => ({
      key: node.specialtyId,
      title: (
        <div className="flex items-center justify-between py-1">
          <Tooltip title={node.description}>
            <span className="font-medium text-cyan-800">
              {node.specialtyName}
            </span>
          </Tooltip>
          {node.status === 1 && (
            <span className="text-red-500 text-xs ml-2">(Inactive)</span>
          )}
        </div>
      ),
      children: node.children ? processTreeData(node.children) : undefined,
      isLeaf: !node.children || node.children.length === 0,
    }));
  };

  const getAllKeys = (data) => {
    let keys = [];
    data.forEach((node) => {
      keys.push(node.specialtyId);
      if (node.children) {
        keys = [...keys, ...getAllKeys(node.children)];
      }
    });
    return keys;
  };

  const onSelect = (selectedKeys, info) => {
    setSelectedKeys(selectedKeys);
    if (info.node) {
      console.log("Selected node:", info.node);
    }
  };

  const onExpand = (expandedKeys) => {
    setExpandedKeys(expandedKeys);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-100 p-6">
      <Card className="!max-w-6xl !mx-auto !shadow-xl !border !border-cyan-600">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            className="!mb-4 !text-cyan-700 !border-cyan-600 hover:!bg-cyan-100"
            onClick={() => navigate("/specialty")}
          >
            Back to Specialties
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <Title level={2} className="!mb-1 !text-cyan-800">
                Specialty Hierarchy
              </Title>
              <p className="text-cyan-700">
                View and navigate through the specialty structure
              </p>
            </div>
            <Button
              type="primary"
              icon={<BranchesOutlined />}
              onClick={() =>
                setExpandedKeys(expandedKeys.length ? [] : getAllKeys(treeData))
              }
              className="!bg-cyan-700 hover:!bg-cyan-800 !border-none !text-white"
            >
              {expandedKeys.length ? "Collapse All" : "Expand All"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-cyan-200 p-6">
            <Tree
              treeData={treeData}
              showLine={{ showLeafIcon: false }}
              showIcon
              expandedKeys={expandedKeys}
              selectedKeys={selectedKeys}
              onSelect={onSelect}
              onExpand={onExpand}
              className="specialty-tree"
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default SpecialtyTreePage;
