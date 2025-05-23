import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Empty, Spin, Input, Tag, Typography, Badge,
  Tooltip, Select, Pagination, Button, Modal, message, Layout, Row, Col, Divider, Avatar, Statistic
} from "antd";
import {
  PlusOutlined, SearchOutlined, EditOutlined, InfoCircleOutlined,
  DeleteOutlined, UserOutlined, QuestionCircleOutlined, FilterOutlined,
  BookOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import InstructorAssService from "../../services/instructorAssServices";


const { Title, Paragraph } = Typography;
const { Option } = Select;

export default function InstructorAssignmentList() {
  const navigate = useNavigate();
  const [data, setData]         = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterCourse, setFilterCourse] = useState(null);
  const [filterInstr, setFilterInstr]   = useState(null);
  const [page, setPage]         = useState(1);
  const pageSize = 9;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await InstructorAssService.getAllInstructorAssignments();
        const arr = res.data.data || [];
        setData(arr);
        setFiltered(arr);
      } catch (e) {
        message.error("Cannot load assignments");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // derive select options
  const courses     = [...new Set(data.map(a => a.courseSubjectSpecialtyId))];
  const instructors = [...new Set(data.map(a => a.instructorId))];

  // filter whenever search or select changes
  useEffect(() => {
    let f = data;
    if (search) {
      const q = search.toLowerCase();
      f = f.filter(a =>
        a.assignmentId.toLowerCase().includes(q) ||
        a.instructorId.toLowerCase().includes(q) ||
        a.courseSubjectSpecialtyId.toLowerCase().includes(q)
      );
    }
    if (filterCourse) f = f.filter(a => a.courseSubjectSpecialtyId === filterCourse);
    if (filterInstr)  f = f.filter(a => a.instructorId === filterInstr);
    setFiltered(f);
    setPage(1);
  }, [search, filterCourse, filterInstr, data]);

  const onDelete = id => {
    Modal.confirm({
      title: "Confirm deletion",
      icon: <QuestionCircleOutlined />,
      content: "This cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          await InstructorAssService.deleteInstructorAssignment(id);
          message.success("Deleted");
          // reload
          const res = await InstructorAssService.getAllInstructorAssignments();
          setData(res.data.data || []);
        } catch {
          message.error("Delete failed");
        }
      }
    });
  };

  // pagination slice
  const slice = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full px-6 py-8">
        <div className="bg-white p-8 shadow-xl rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Title level={2} className="text-gray-800 m-0">Instructor Assignments</Title>
              <p className="text-gray-500 mt-2">Manage instructor subject assignments</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/instructor-assignment/create")}
              className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white"
              size="large"
            >
              Create Assignment
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search ID/Instructor/Subject"
                  allowClear
                  onChange={e => setSearch(e.target.value)}
                  className="rounded-lg"
                  size="large"
                />
              </Col>
              <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                <Select
                  allowClear
                  placeholder="Filter by Subject"
                  onChange={v => setFilterCourse(v)}
                  style={{ width: '100%' }}
                  className="rounded-lg"
                  size="large"
                  suffixIcon={<BookOutlined className="text-gray-400" />}
                >
                  {courses.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Col>
              <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                <Select
                  allowClear
                  placeholder="Filter by Instructor"
                  onChange={v => setFilterInstr(v)}
                  style={{ width: '100%' }}
                  className="rounded-lg"
                  size="large"
                  suffixIcon={<TeamOutlined className="text-gray-400" />}
                >
                  {instructors.map(i => <Option key={i} value={i}>{i}</Option>)}
                </Select>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spin size="large" tip="Loading assignments..." />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <Empty 
                description={
                  <span className="text-gray-500 text-lg">No instructor assignments found</span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/instructor-assignment/create")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700"
                  size="large"
                >
                  Create New Assignment
                </Button>
              </Empty>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slice.map(item => (
                  <Card
                    key={item.assignmentId}
                    hoverable
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                    actions={[
                      <Tooltip title="Edit Assignment">
                        <Button 
                          type="text" 
                          icon={<EditOutlined className="text-blue-500" />} 
                          onClick={() => navigate(`/instructor-assignment/edit/${item.assignmentId}`)}
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
                      </Tooltip>
                    ]}
                  >
                    <div className="mb-4">
                      <Tag color={item.requestStatus === "Pending" ? "gold" : "green"} className="px-3 py-1 text-sm">
                        {item.requestStatus || "Pending"}
                      </Tag>
                    </div>
                    
                    <Paragraph className="mb-2">
                      <strong className="text-gray-700">ID:</strong> 
                      <Tag color="blue" className="ml-2">{item.assignmentId}</Tag>
                    </Paragraph>
                    
                    <Paragraph className="mb-2">
                      <BookOutlined className="mr-2 text-blue-500" />
                      <strong className="text-gray-700">Subject:</strong> 
                      <span className="ml-2">{item.courseSubjectSpecialtyId}</span>
                    </Paragraph>
                    
                    <Paragraph className="mb-2">
                      <TeamOutlined className="mr-2 text-green-500" />
                      <strong className="text-gray-700">Instructor:</strong> 
                      <span className="ml-2">{item.instructorId}</span>
                    </Paragraph>
                    
                    <Paragraph className="mb-2">
                      <CalendarOutlined className="mr-2 text-orange-500" />
                      <strong className="text-gray-700">Date:</strong> 
                      <span className="ml-2">{new Date(item.assignDate).toLocaleString()}</span>
                    </Paragraph>
                    
                    {item.notes && (
                      <>
                        <Divider className="my-3" />
                        <Paragraph className="text-gray-600 italic">
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
                  onChange={p => setPage(p)}
                  showSizeChanger={false}
                  className="bg-white px-4 py-2 rounded-lg shadow-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
