import { useState, useEffect } from "react";
import {
  Table,
  message,
  Typography,
  Card,
  Tag,
  Spin,
  Row,
  Col,
  Statistic,
  Empty,
  Input,
} from "antd";
import {
  FileExcelOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { gradeServices } from "../../services/gradeServices";
import { getSubjectById } from "../../services/subjectService";

const { Title } = Typography;
const { Search } = Input;

const TraineeGradePage = () => {
  const [grades, setGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchTraineeGrades();
  }, []);

  const fetchTraineeGrades = async () => {
    try {
      setLoading(true);
      const userId = sessionStorage.getItem("userID");
      if (!userId) {
        message.error("User ID not found");
        return;
      }

      const response = await gradeServices.getTraineeGrades(userId);

      if (response && Array.isArray(response)) {
        const enrichedGrades = await enrichGradesWithSubjectNames(response);
        setGrades(enrichedGrades);
        setFilteredGrades(enrichedGrades);
        calculateStats(enrichedGrades);
      } else {
        message.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching trainee grades:", error);
      message.error("Unable to load trainee grades");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch subject names for grades that don't have them
  const enrichGradesWithSubjectNames = async (gradesData) => {
    const enhancedGrades = await Promise.all(
      gradesData.map(async (grade) => {
        // If the grade already has a subject name, use it
        if (grade.subjectName) {
          return {
            ...grade,
            key: grade.gradeId || grade.id,
          };
        }

        // Otherwise, fetch the subject details
        try {
          const subjectResponse = await getSubjectById(grade.subjectId);
          if (subjectResponse && subjectResponse.subject) {
            return {
              ...grade,
              subjectName: subjectResponse.subject.subjectName,
              key: grade.gradeId || grade.id,
            };
          }
        } catch (error) {
          console.error(`Error fetching subject ${grade.subjectId}:`, error);
        }

        // If we couldn't get the subject name, return the original grade
        return {
          ...grade,
          key: grade.gradeId || grade.id,
        };
      })
    );

    return enhancedGrades;
  };

  const calculateStats = (gradesData) => {
    if (!gradesData.length) {
      setStats({
        total: 0,
        passed: 0,
        failed: 0,
        avgScore: 0,
      });
      return;
    }

    const total = gradesData.length;
    const passed = gradesData.filter((g) => g.gradeStatus === "Pass").length;
    const failed = total - passed;

    const totalScore = gradesData.reduce(
      (sum, grade) => sum + Number(grade.totalScore || 0),
      0
    );
    const avgScore = total > 0 ? (totalScore / total).toFixed(2) : 0;

    setStats({
      total,
      passed,
      failed,
      avgScore,
    });
  };

  // Handle search functionality
  const handleSearch = (value) => {
    setSearchText(value);

    if (!value.trim()) {
      setFilteredGrades(grades);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = grades.filter(
      (grade) =>
        (grade.subjectName &&
          grade.subjectName.toLowerCase().includes(searchLower)) ||
        (grade.subjectId && grade.subjectId.toLowerCase().includes(searchLower))
    );

    setFilteredGrades(filtered);
  };

  // Column definitions for the table
  const columns = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => index + 1,
      align: "center",
    },
    {
      title: "Subject",
      dataIndex: "subjectName",
      key: "subjectName",
      render: (subjectName, record) => (
        <div>
          <div className="font-semibold">{subjectName || record.subjectId}</div>
          <div className="text-xs text-gray-500">ID: {record.subjectId}</div>
        </div>
      ),
    },
    {
      title: "Component Scores",
      children: [
        {
          title: "Participation",
          dataIndex: "participantScore",
          key: "participantScore",
          width: 100,
          render: (score) => (
            <Tag
              color={score >= 5 ? "success" : "error"}
              className="text-center w-16"
            >
              {score}
            </Tag>
          ),
        },
        {
          title: "Assignment",
          dataIndex: "assignmentScore",
          key: "assignmentScore",
          width: 100,
          render: (score) => (
            <Tag
              color={score >= 5 ? "success" : "error"}
              className="text-center w-16"
            >
              {score}
            </Tag>
          ),
        },
      ],
    },
    {
      title: "Exam Scores",
      children: [
        {
          title: "Final",
          dataIndex: "finalExamScore",
          key: "finalExamScore",
          width: 100,
          render: (score) => (
            <Tag
              color={score >= 5 ? "success" : "error"}
              className="text-center w-16"
            >
              {score || "-"}
            </Tag>
          ),
        },
        {
          title: "Resit",
          dataIndex: "finalResitScore",
          key: "finalResitScore",
          width: 100,
          render: (score) => (
            <Tag
              color={
                score === 0 || !score
                  ? "default"
                  : score >= 5
                  ? "success"
                  : "error"
              }
              className="text-center w-16"
            >
              {score || "-"}
            </Tag>
          ),
        },
      ],
    },
    {
      title: "Total",
      dataIndex: "totalScore",
      key: "totalScore",
      width: 100,
      render: (score) => {
        const formattedScore = score ? Number(score).toFixed(2) : "0";
        return (
          <Tag
            color={score >= 5 ? "success" : "error"}
            className="text-center w-16 font-semibold"
          >
            {formattedScore}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "gradeStatus",
      key: "gradeStatus",
      width: 120,
      render: (status) => (
        <Tag
          color={status === "Pass" ? "success" : "error"}
          className="px-4 py-1"
          icon={
            status === "Pass" ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {status === "Pass" ? "Pass" : "Fail"}
        </Tag>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 200,
      ellipsis: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Title level={2} className="text-center mb-6 text-gray-800">
          <FileExcelOutlined className="text-green-600 mr-2" />
          My Grades
        </Title>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-8">
          <Col span={6}>
            <Card className="bg-white shadow-md">
              <Statistic
                title="Total Subjects"
                value={stats.total}
                prefix={<BookOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-white shadow-md">
              <Statistic
                title="Passed"
                value={stats.passed}
                prefix={<CheckCircleOutlined className="text-green-500" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-white shadow-md">
              <Statistic
                title="Failed"
                value={stats.failed}
                prefix={<CloseCircleOutlined className="text-red-500" />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="bg-white shadow-md">
              <Statistic
                title="Average Score"
                value={stats.avgScore}
                precision={2}
                prefix={<TrophyOutlined className="text-yellow-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Search Box */}
        <Card className="mb-8 bg-white shadow-md">
          <Search
            placeholder="Search by subject name or ID"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="mb-4"
          />
        </Card>
        <br></br>
        {/* Grades Table */}
        <Card className="bg-white shadow-md">
          {loading ? (
            <div className="flex justify-center items-center p-10">
              <Spin size="large" tip="Loading grades..." />
            </div>
          ) : filteredGrades.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredGrades}
              rowKey="key"
              bordered
              size="middle"
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
              rowClassName={(record) =>
                record.gradeStatus === "Pass" ? "bg-green-50" : ""
              }
            />
          ) : (
            <Empty
              description={
                searchText ? "No matching grades found" : "No grades found"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-10"
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default TraineeGradePage;
