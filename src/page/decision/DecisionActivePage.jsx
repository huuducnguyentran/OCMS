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
} from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import { getActiveDecision } from "../../services/decisionService";

const { Title } = Typography;

const DecisionActivePage = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [filterDate, setFilterDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const data = await getActiveDecision();
        setDecisions(data);
      } catch (error) {
        console.error("Failed to fetch decisions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, []);

  const filteredDecisions = useMemo(() => {
    return decisions.filter((decision) => {
      const matchCode = decision.decisionCode
        .toLowerCase()
        .includes(searchCode.toLowerCase());
      const matchDate = filterDate
        ? dayjs(decision.issueDate).isSame(filterDate, "day")
        : true;

      return matchCode && matchDate;
    });
  }, [decisions, searchCode, filterDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Title level={3}>Active Decisions List</Title>

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by Decision Code"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker
              placeholder="Filter by Issue Date"
              value={filterDate}
              onChange={(date) => setFilterDate(date)}
              style={{ width: "100%" }}
              allowClear
            />
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
                <p>
                  <strong>Status:</strong>{" "}
                  {decision.status === 1 ? "Active" : "Inactive"}
                </p>
                <p>
                  <strong>Issue Date:</strong>{" "}
                  {new Date(decision.issueDate).toLocaleDateString()}
                </p>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionActivePage;
