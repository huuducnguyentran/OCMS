import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Spin,
  message,
  Tag,
  Card,
  Divider,
  Row,
  Col,
  Breadcrumb,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  getPendingDecision,
  getActiveDecision,
  signDecision,
} from "../../services/decisionService";

const { Title, Text } = Typography;

const DecisionDetailPage = () => {
  const { decisionId } = useParams();
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("role");
  const isHeadMaster = userRole === "HeadMaster";

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        setLoading(true);
        // Thử lấy từ danh sách decision pending
        let pendingData = await getPendingDecision();
        let foundDecision = pendingData.find(
          (d) => d.decisionId === decisionId
        );

        // Nếu không tìm thấy trong pending, thử lấy từ active
        if (!foundDecision) {
          let activeData = await getActiveDecision();
          foundDecision = activeData.find((d) => d.decisionId === decisionId);
        }

        if (foundDecision) {
          setDecision(foundDecision);
        } else {
          message.error("Decision not found");
        }
      } catch (error) {
        console.error("Failed to fetch decision:", error);
        message.error("Failed to load decision details");
      } finally {
        setLoading(false);
      }
    };

    fetchDecision();
  }, [decisionId]);

  const handleSignDecision = async () => {
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can sign decisions");
      return;
    }

    try {
      await signDecision(decisionId);
      message.success("Decision signed successfully!");

      // Cập nhật lại thông tin quyết định sau khi ký
      const updatedPendingData = await getPendingDecision();
      let updatedDecision = updatedPendingData.find(
        (d) => d.decisionId === decisionId
      );

      if (!updatedDecision) {
        const updatedActiveData = await getActiveDecision();
        updatedDecision = updatedActiveData.find(
          (d) => d.decisionId === decisionId
        );
      }

      if (updatedDecision) {
        setDecision(updatedDecision);
      }
    } catch (error) {
      console.error("Signing failed:", error);
      message.error("Failed to sign decision.");
    }
  };

  const getBackPath = () => {
    if (!decision) return "/decision-pending";
    return decision.status === 1 ? "/decision-active" : "/decision-pending";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8 space-x-2">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/decision-pending")}
              className="text-blue-600 hover:text-blue-800 px-0"
            >
              Back
            </Button>
          </div>
          <Card className="shadow-md rounded-xl text-center py-16">
            <Title level={3}>Decision not found</Title>
            <Text className="text-gray-500">
              The decision you are looking for does not exist or has been
              removed.
            </Text>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb className="mb-2">
            <Breadcrumb.Item>
              <a onClick={() => navigate("/home")}>Home</a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={() => navigate(getBackPath())}>
                {decision.status === 1
                  ? "Active Decisions"
                  : "Pending Decisions"}
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{decision.decisionCode}</Breadcrumb.Item>
          </Breadcrumb>

          <div className="flex justify-between items-center">
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(getBackPath())}
              className="flex items-center text-blue-600 hover:text-blue-800 text-lg font-medium 
                       transition-all duration-300 hover:-translate-x-1 p-0"
            >
              Back
            </Button>

            {decision.status === 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleSignDecision}
                disabled={!isHeadMaster}
                className={`text-white ${
                  isHeadMaster
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                }`}
                title={
                  isHeadMaster
                    ? "Sign this decision"
                    : "Only HeadMaster can sign decisions"
                }
              >
                Sign Decision
              </Button>
            )}
          </div>
        </div>

        {/* Main Title Card */}
        <Card className="mb-6 shadow-md border-0 rounded-xl">
          <Title level={2} className="mb-2 text-indigo-800">
            {decision.title}
          </Title>
          <div className="flex items-center space-x-2 text-gray-500">
            <FileTextOutlined />
            <Text>{decision.decisionCode}</Text>
            <Divider type="vertical" />
            <ClockCircleOutlined />
            <Text>{new Date(decision.issueDate).toLocaleDateString()}</Text>
          </div>
        </Card>
        <br></br>
        {/* Content in Two Columns */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} md={8}>
            <Card className="h-full shadow-md border-0 rounded-xl">
              <Title level={4} className="mb-4 text-indigo-700">
                Decision Information
              </Title>

              <Space direction="vertical" size="large" className="w-full">
                <div>
                  <Text strong className="text-gray-500 block mb-1">
                    Decision ID
                  </Text>
                  <Text className="text-lg">{decision.decisionId}</Text>
                </div>

                <div>
                  <Text strong className="text-gray-500 block mb-1">
                    Decision Code
                  </Text>
                  <Text className="text-lg">{decision.decisionCode}</Text>
                </div>

                <div>
                  <Text strong className="text-gray-500 block mb-1">
                    Issued By
                  </Text>
                  <div className="flex items-center space-x-2">
                    <UserOutlined className="text-blue-500" />
                    <Text className="text-lg">{decision.issuedBy}</Text>
                  </div>
                </div>

                <div>
                  <Text strong className="text-gray-500 block mb-1">
                    Status
                  </Text>
                  <Tag
                    color={decision.status === 1 ? "success" : "processing"}
                    icon={
                      decision.status === 1 ? (
                        <CheckCircleOutlined />
                      ) : (
                        <ClockCircleOutlined />
                      )
                    }
                    className="px-3 py-1 text-base"
                  >
                    {decision.status === 1 ? "Active" : "Pending"}
                  </Tag>
                </div>

                <div>
                  <Text strong className="text-gray-500 block mb-1">
                    Issue Date
                  </Text>
                  <div className="flex items-center space-x-2">
                    <ClockCircleOutlined className="text-green-500" />
                    <Text className="text-lg">
                      {new Date(decision.issueDate).toLocaleString()}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card className="shadow-md border-0 rounded-xl">
              <Title level={4} className="mb-4 text-indigo-700">
                Decision Preview
              </Title>

              {decision.contentWithSas ? (
                <div className="border rounded-lg overflow-hidden shadow-inner">
                  <iframe
                    src={decision.contentWithSas}
                    title="Decision Preview"
                    className="w-full h-[700px] border-0"
                    onError={() =>
                      message.error("Failed to load decision preview.")
                    }
                  />
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <FileTextOutlined
                    style={{ fontSize: "48px" }}
                    className="text-gray-300 mb-4"
                  />
                  <Text className="text-gray-500 block">
                    No preview available
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DecisionDetailPage;
