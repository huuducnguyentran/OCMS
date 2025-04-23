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
const { RangePicker } = DatePicker;

const DecisionActivePage = () => {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Title level={3} className="text-blue-800 mb-6">
        Active Decisions List
      </Title>

      {/* Filters */}
      <div className="mb-10 p-6 bg-white rounded-2xl shadow border border-gray-200">
        <Row gutter={[16, 16]}>
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
          ))}
        </div>
      )}
    </div>
  );
};

export default DecisionActivePage;
