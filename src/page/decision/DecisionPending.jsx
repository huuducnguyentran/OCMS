import { useEffect, useState, useMemo } from "react";
import {
  Card,
  Spin,
  Empty,
  Input,
  DatePicker,
  Row,
  Col,
  Typography,
  message,
  Button,
  Checkbox,
  Tooltip,
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import {
  getPendingDecision,
  signDecision,
} from "../../services/decisionService";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const DecisionPendingPage = () => {
  const [decisions, setDecisions] = useState([]);
  const [selectedDecisions, setSelectedDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const isHeadMaster = userRole === "HeadMaster";

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const data = await getPendingDecision();
        setDecisions(data);
      } catch (error) {
        console.error("Failed to fetch decisions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, []);

  const handleCheckboxChange = (decisionId, checked) => {
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can select decisions for signing");
      return;
    }
    
    setSelectedDecisions((prev) =>
      checked ? [...prev, decisionId] : prev.filter((id) => id !== decisionId)
    );
  };

  const handleSelectAll = (checked) => {
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can select decisions for signing");
      return;
    }
    
    if (checked) {
      const allDecisionIds = filteredDecisions.map(decision => decision.decisionId);
      setSelectedDecisions(allDecisionIds);
    } else {
      setSelectedDecisions([]);
    }
  };

  const handleSignDecisions = async () => {
    if (!isHeadMaster) {
      message.warning("Only HeadMaster can sign decisions");
      return;
    }
    
    if (selectedDecisions.length === 0) {
      message.warning("Please select at least one decision.");
      return;
    }

    try {
      for (const id of selectedDecisions) {
        await signDecision(id);
      }
      message.success("Selected decisions signed successfully!");

      const updated = await getPendingDecision();
      setDecisions(updated);
      setSelectedDecisions([]);
    } catch (error) {
      console.error("Signing failed:", error);
      message.error("Failed to sign one or more decisions.");
    }
  };

  const filteredDecisions = useMemo(() => {
    return decisions.filter((decision) => {
      const searchLower = searchText.toLowerCase();
      const matchSearch = 
        decision.decisionCode.toLowerCase().includes(searchLower) ||
        decision.title.toLowerCase().includes(searchLower) ||
        decision.issuedBy.toLowerCase().includes(searchLower);
        
      const decisionDate = dayjs(decision.issueDate);
      const matchDate =
        filterDate && filterDate.length === 2
          ? decisionDate.isAfter(
              filterDate[0].startOf("day").subtract(1, "ms")
            ) && decisionDate.isBefore(filterDate[1].endOf("day").add(1, "ms"))
          : true;

      return matchSearch && matchDate;
    });
  }, [decisions, searchText, filterDate]);

  const areAllSelected = filteredDecisions.length > 0 && 
    filteredDecisions.every(decision => 
      selectedDecisions.includes(decision.decisionId)
    );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3}>Pending Decisions List</Title>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Decision Code, Title or Issued By"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={["From Date", "To Date"]}
              value={filterDate}
              onChange={(dates) => setFilterDate(dates)}
              style={{ width: "100%" }}
              allowClear
            />
          </Col>
          <Col xs={24} md={8} className="flex justify-end items-center gap-3">
            <Tooltip title={isHeadMaster ? "" : "Only HeadMaster can select decisions"}>
              <Checkbox 
                checked={areAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={!isHeadMaster || filteredDecisions.length === 0}
              >
                Select All
              </Checkbox>
            </Tooltip>
            <Tooltip title={isHeadMaster ? "" : "Only HeadMaster can sign decisions"}>
              <Button
                type="primary"
                onClick={handleSignDecisions}
                disabled={!isHeadMaster || selectedDecisions.length === 0}
                size="large"
              >
                Sign Selected ({selectedDecisions.length})
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </div>

      {/* Decision List */}
      {filteredDecisions.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No decisions match the filters" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.decisionId}
              className="relative group rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all bg-white"
            >
              <Tooltip title={isHeadMaster ? "" : "Only HeadMaster can select decisions"}>
                <Checkbox
                  className="absolute top-2 right-2 z-10 bg-white p-1 rounded"
                  checked={selectedDecisions.includes(decision.decisionId)}
                  onChange={(e) =>
                    handleCheckboxChange(decision.decisionId, e.target.checked)
                  }
                  disabled={!isHeadMaster}
                />
              </Tooltip>
              <div
                onClick={() => navigate(`/decision/${decision.decisionId}`)}
                className="cursor-pointer"
              >
                <Card
                  title={decision.decisionCode}
                  bordered
                  className="rounded-2xl shadow-md hover:shadow-lg transition"
                  cover={
                    <iframe
                      src={decision.contentWithSas}
                      title="Decision Preview"
                      className="w-full h-64 rounded-t-2xl"
                    />
                  }
                >
                  <p>
                    <strong>Title:</strong> {decision.title}
                  </p>
                  <p>
                    <strong>Issued By:</strong> {decision.issuedBy}
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong className="text-gray-800">Status:</strong>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs ${
                        decision.status === 1 ? "bg-green-500" : "bg-gray-400"
                      }`}
                    >
                      {decision.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </p>
                  <p>
                    <strong>Issue Date:</strong>{" "}
                    {new Date(decision.issueDate).toLocaleDateString()}
                  </p>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionPendingPage;
