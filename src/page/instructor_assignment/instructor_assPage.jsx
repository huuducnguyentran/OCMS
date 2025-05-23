import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Empty,
  Spin,
  Input,
  Tag,
  Typography,
  Tooltip,
  Select,
  Pagination,
  Button,
  Modal,
  message,
  Layout,
  Row,
  Col,
  Divider,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import InstructorAssService from "../../services/instructorAssServices";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function InstructorAssignmentList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterInstr, setFilterInstr] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await InstructorAssService.getAllInstructorAssignments();
        const arr = res.data.data || [];
        setData(arr);
        setFiltered(arr);
      } catch (error) {
        message.error("Cannot load assignments", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const courses = [...new Set(data.map((a) => a.courseSubjectSpecialtyId))];
  const instructors = [...new Set(data.map((a) => a.instructorId))];

  useEffect(() => {
    let f = data;
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(
        (a) =>
          a.assignmentId.toLowerCase().includes(q) ||
          a.instructorId.toLowerCase().includes(q) ||
          a.courseSubjectSpecialtyId.toLowerCase().includes(q)
      );
    }
    if (filterCourse)
      f = f.filter((a) => a.courseSubjectSpecialtyId === filterCourse);
    if (filterInstr) f = f.filter((a) => a.instructorId === filterInstr);
    setFiltered(f);
    setPage(1);
  }, [search, filterCourse, filterInstr, data]);

  const onDelete = (id) => {
    Modal.confirm({
      title: "Confirm deletion",
      icon: <QuestionCircleOutlined />,
      content: "This cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await InstructorAssService.deleteInstructorAssignment(id);
          message.success("Deleted");
          const res = await InstructorAssService.getAllInstructorAssignments();
          setData(res.data.data || []);
        } catch {
          message.error("Delete failed");
        }
      },
    });
  };

  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout className="!min-h-screen !bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      <div className="w-full px-6 py-8">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-cyan-400">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={2} className="!text-cyan-800 !m-0">
                Instructor Assignments
              </Title>
              <p className="!text-cyan-600 !mt-2">
                Manage instructor subject assignments
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/instructor-assignment/create")}
              className="!bg-cyan-700 hover:!bg-cyan-800 !border-none !text-white !transition-all"
              size="large"
            >
              Create Assignment
            </Button>
          </div>

          <div className="bg-cyan-50 p-4 rounded-xl mb-6 shadow-inner">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8}>
                <Input
                  prefix={<SearchOutlined className="!text-cyan-600" />}
                  placeholder="Search ID/Instructor/Subject"
                  allowClear
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg"
                  size="large"
                />
              </Col>
              <Col xs={24} sm={8}>
                <Select
                  allowClear
                  placeholder="Filter by Subject"
                  onChange={(v) => setFilterCourse(v)}
                  style={{ width: "100%" }}
                  className="rounded-lg"
                  size="large"
                  suffixIcon={<BookOutlined className="!text-cyan-600" />}
                >
                  {courses.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={8}>
                <Select
                  allowClear
                  placeholder="Filter by Instructor"
                  onChange={(v) => setFilterInstr(v)}
                  style={{ width: "100%" }}
                  className="rounded-lg"
                  size="large"
                  suffixIcon={<TeamOutlined className="!text-cyan-600" />}
                >
                  {instructors.map((i) => (
                    <Option key={i} value={i}>
                      {i}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" tip="Loading assignments..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-cyan-50 rounded-xl">
              <Empty
                description={
                  <span className="text-cyan-600 text-lg">
                    No instructor assignments found
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/instructor-assignment/create")}
                  className="!mt-4 !bg-cyan-700 hover:!bg-cyan-800 !text-white"
                  size="large"
                >
                  Create New Assignment
                </Button>
              </Empty>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slice.map((item) => (
                  <Card
                    key={item.assignmentId}
                    hoverable
                    className="transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
                    actions={[
                      <Tooltip title="Edit Assignment">
                        <Button
                          type="text"
                          icon={<EditOutlined className="!text-cyan-600" />}
                          onClick={() =>
                            navigate(
                              `/instructor-assignment/edit/${item.assignmentId}`
                            )
                          }
                          className="!text-cyan-600 hover:!text-cyan-800"
                        >
                          Edit
                        </Button>
                      </Tooltip>,
                      <Tooltip title="Delete Assignment">
                        <Button
                          type="text"
                          icon={<DeleteOutlined className="text-red-500" />}
                          onClick={() => onDelete(item.assignmentId)}
                          danger
                        >
                          Delete
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <div className="mb-4">
                      <Tag
                        color={
                          item.requestStatus === "Pending" ? "gold" : "green"
                        }
                        className="px-3 py-1 text-sm"
                      >
                        {item.requestStatus || "Pending"}
                      </Tag>
                    </div>

                    <Paragraph className="!mb-2">
                      <strong className="text-cyan-800">ID:</strong>
                      <Tag color="cyan" className="!ml-2">
                        {item.assignmentId}
                      </Tag>
                    </Paragraph>

                    <Paragraph className="!mb-2">
                      <BookOutlined className="!mr-2 !text-cyan-500" />
                      <strong className="text-cyan-800">Subject:</strong>
                      <span className="ml-2">
                        {item.courseSubjectSpecialtyId}
                      </span>
                    </Paragraph>

                    <Paragraph className="!mb-2">
                      <TeamOutlined className="!mr-2 !text-cyan-500" />
                      <strong className="text-cyan-800">Instructor:</strong>
                      <span className="ml-2">{item.instructorId}</span>
                    </Paragraph>

                    <Paragraph className="!mb-2">
                      <CalendarOutlined className="!mr-2 !text-cyan-500" />
                      <strong className="text-cyan-800">Date:</strong>
                      <span className="ml-2">
                        {new Date(item.assignDate).toLocaleString()}
                      </span>
                    </Paragraph>

                    {item.notes && (
                      <>
                        <Divider className="!my-3" />
                        <Paragraph className="!text-cyan-700 italic">
                          <strong>Notes:</strong> {item.notes}
                        </Paragraph>
                      </>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex justify-center mt-8 mb-4">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={filtered.length}
                  onChange={(p) => setPage(p)}
                  showSizeChanger={false}
                  className="!bg-white !px-4 !py-2 !rounded-lg !shadow-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
