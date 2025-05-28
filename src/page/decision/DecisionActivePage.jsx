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
  Layout,
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
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-6">
      <Title level={3} className="!text-cyan-700 mb-8">
        Active Decisions
      </Title>

      {/* Filters */}
      <Card className="!mb-6 !border !border-cyan-600 !rounded-xl !shadow-sm !bg-white">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={12} lg={14}>
            <Input
              placeholder="Search by Decision Code, Title or Issued By"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined className="text-cyan-500" />}
              size="large"
              allowClear
              className="!rounded-md !border-cyan-600 focus:!border-cyan-700 focus:!shadow-cyan-200"
            />
          </Col>
          <Col xs={24} sm={12} md={12} lg={10}>
            <RangePicker
              placeholder={["From Date", "To Date"]}
              value={filterDate}
              onChange={(dates) => setFilterDate(dates)}
              size="large"
              style={{ width: "100%" }}
              className="!rounded-md !border-cyan-600 focus:!border-cyan-700 focus:!shadow-cyan-200"
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Decisions */}
      {filteredDecisions.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Empty description="No decisions match the filters" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.decisionId}
              onClick={() => navigate(`/decision/${decision.decisionId}`)}
              className="cursor-pointer"
            >
              <Card
                title={
                  <span className="text-cyan-700 font-semibold">
                    {decision.decisionCode}
                  </span>
                }
                bordered={false}
                className="!rounded-2xl !shadow-md hover:!shadow-lg !transition-all !duration-200 !border !border-cyan-100"
                cover={
                  <iframe
                    src={decision.contentWithSas}
                    title="Decision Preview"
                    className="w-full h-64 rounded-t-2xl border-b"
                  />
                }
              >
                <p className="mb-1">
                  <span className="font-medium text-gray-600">Title:</span>{" "}
                  {decision.title}
                </p>
                <p className="mb-1">
                  <span className="font-medium text-gray-600">Issued By:</span>{" "}
                  {decision.issuedBy}
                </p>
                <p className="mb-1">
                  <span className="font-medium text-gray-600">Status:</span>{" "}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                      decision.status === 1 ? "bg-cyan-600" : "bg-gray-400"
                    }`}
                  >
                    {decision.status === 1 ? "Active" : "Inactive"}
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Issue Date:</span>{" "}
                  {new Date(decision.issueDate).toLocaleDateString()}
                </p>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default DecisionActivePage;
