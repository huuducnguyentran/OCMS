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
  const userRole = sessionStorage.getItem("role");
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
      const allDecisionIds = filteredDecisions.map(
        (decision) => decision.decisionId
      );
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

  const areAllSelected =
    filteredDecisions.length > 0 &&
    filteredDecisions.every((decision) =>
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
    <div className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <Title level={3} className="!text-cyan-800">
        Pending Decisions
      </Title>

      {/* Filters */}
      <Card className="!mb-6 !border !border-cyan-600 !rounded-xl !shadow-sm !bg-white">
        <Title
          level={5}
          className="!mb-4 !flex !items-center !gap-2 !text-cyan-700"
        >
          <SearchOutlined />
          Filter Decisions
        </Title>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Decision Code, Title or Issued By"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              size="middle"
              allowClear
              className="!rounded-md !border-cyan-600 focus:!border-cyan-700 focus:!shadow-cyan-200"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={["Issue Date From", "To"]}
              value={filterDate}
              onChange={(dates) => setFilterDate(dates)}
              style={{ width: "100%" }}
              allowClear
              size="middle"
              className="!rounded-md !border-cyan-600"
            />
          </Col>
          <Col
            xs={24}
            md={8}
            className="flex justify-end items-center gap-3 flex-wrap"
          >
            <Button
              onClick={() => {
                setSearchText("");
                setFilterDate(null);
              }}
              size="middle"
              className="!bg-gray-100 hover:!bg-gray-200 hover:!text-cyan-700 hover:!border-cyan-600  !rounded-md"
            >
              Reset Filters
            </Button>

            <Tooltip
              title={
                !isHeadMaster ? "Only HeadMaster can select decisions" : ""
              }
            >
              <Checkbox
                checked={areAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={!isHeadMaster || filteredDecisions.length === 0}
                className="!ml-4 !text-cyan-700"
              >
                Select All
              </Checkbox>
            </Tooltip>

            <Tooltip
              title={!isHeadMaster ? "Only HeadMaster can sign decisions" : ""}
            >
              <Button
                type="primary"
                onClick={handleSignDecisions}
                disabled={!isHeadMaster || selectedDecisions.length === 0}
                size="middle"
                className="!bg-cyan-700 hover:!bg-cyan-800 disabled:!opacity-50 !text-white !rounded-md !transition-all"
              >
                Sign ({selectedDecisions.length})
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* Decision Cards */}
      {filteredDecisions.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No decisions match the filters" />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.decisionId}
              className="relative group rounded-2xl border border-cyan-200 shadow hover:shadow-lg transition-all duration-300 bg-white"
            >
              <Tooltip
                title={
                  !isHeadMaster ? "Only HeadMaster can select decisions" : ""
                }
              >
                <Checkbox
                  className="absolute top-3 right-3 z-10 p-1 rounded bg-white bg-opacity-70"
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
                  title={
                    <span className="text-base font-semibold text-cyan-900">
                      {decision.decisionCode}
                    </span>
                  }
                  bordered={false}
                  className="rounded-2xl border-none"
                  cover={
                    <iframe
                      src={decision.contentWithSas}
                      title="Decision Preview"
                      className="w-full h-64 rounded-t-2xl"
                    />
                  }
                >
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Title:</strong> {decision.title}
                    </p>
                    <p>
                      <strong>Issued By:</strong> {decision.issuedBy}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                          decision.status === 1 ? "bg-cyan-600" : "bg-gray-400"
                        }`}
                      >
                        {decision.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </p>
                    <p>
                      <strong>Issue Date:</strong>{" "}
                      {new Date(decision.issueDate).toLocaleDateString()}
                    </p>
                  </div>
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
