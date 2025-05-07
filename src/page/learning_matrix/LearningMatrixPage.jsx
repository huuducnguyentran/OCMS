import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Table,
  Typography,
  Button,
  Input,
  Spin,
  Tag,
  Tooltip,
  Modal,
  message,
  Select,
  Form,
  Space,
  Breadcrumb,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  BookOutlined,
  TeamOutlined,
  BarsOutlined,
  ReloadOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { learningMatrixService } from "../../services/learningMatrixService";
import { courseService } from "../../services/courseService";
import { getAllSubject } from "../../services/subjectService";
import { specialtyService } from "../../services/specialtyServices";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

const LearningMatrixPage = () => {
  const [learningMatrixData, setLearningMatrixData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [form] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [matrixData, setMatrixData] = useState({});
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState(null);
  const [distinctCourses, setDistinctCourses] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    fetchData();
    fetchCourses();
    fetchSubjects();
    fetchSpecialties();
  }, []);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await getAllSubject();
      if (response && response.subjects) {
        setSubjects(response.subjects);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      message.error("Unable to load subject list");
    }
  };

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      const response = await specialtyService.getAllSpecialties();
      if (response && response.data) {
        setSpecialties(response.data);
      }
    } catch (error) {
      console.error("Error fetching specialties:", error);
      message.error("Unable to load specialty list");
    }
  };

  // Extract distinct courses and organize data when raw data changes
  useEffect(() => {
    if (learningMatrixData.length > 0 && subjects.length > 0 && specialties.length > 0) {
      // Extract distinct courses
      const uniqueCourses = Array.from(
        new Set(
          learningMatrixData.map(item => JSON.stringify({
            courseId: item.courseId,
            courseName: item.course?.courseName || item.courseId
          }))
        )
      ).map(item => JSON.parse(item));
      
      setDistinctCourses(uniqueCourses);
      
      // Set first course as default selected if none selected
      if (!selectedCourseId && uniqueCourses.length > 0) {
        setSelectedCourseId(uniqueCourses[0].courseId);
      }
      
      // Organize data in matrix format
      const matrix = {};
      
      // Group by courseId
      uniqueCourses.forEach(course => {
        matrix[course.courseId] = {
          courseName: course.courseName,
          matrix: {}
        };
        
        // Initialize matrix for this course
        specialties.forEach(specialty => {
          matrix[course.courseId].matrix[specialty.specialtyId] = {};
          
          subjects.forEach(subject => {
            matrix[course.courseId].matrix[specialty.specialtyId][subject.subjectId] = null;
          });
        });
      });
      
      // Fill matrix with data
      learningMatrixData.forEach(item => {
        if (
          matrix[item.courseId] && 
          matrix[item.courseId].matrix[item.specialtyId] &&
          matrix[item.courseId].matrix[item.specialtyId][item.subjectId] !== undefined
        ) {
          matrix[item.courseId].matrix[item.specialtyId][item.subjectId] = item;
        }
      });
      
      setMatrixData(matrix);
    }
  }, [learningMatrixData, subjects, specialties]);

  // Load learning matrix data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await learningMatrixService.getAllCourseSubjectSpecialties();
      if (response && response.data) {
        setLearningMatrixData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error("Error fetching learning matrix data:", error);
      message.error("Unable to load learning matrix data");
    } finally {
      setLoading(false);
    }
  };

  // Load course list
  const fetchCourses = async () => {
    try {
      const courseResponse = await courseService.getAllCourses();
      if (courseResponse && courseResponse.data) {
        setCourses(courseResponse.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Unable to load course list");
    }
  };

  // Handle course change
  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
  };

  // Handle delete matrix item
  const handleDeleteMatrixItem = (item) => {
    if (!item || !item.id) return;
    
    Modal.confirm({
      title: "Confirm Delete",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete the relationship between course ${item.courseId}, subject ${item.subjectId} and specialty ${item.specialtyId}?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await learningMatrixService.deleteCourseSubjectSpecialty(item.id);
          message.success("Deleted successfully");
          fetchData();
        } catch (error) {
          console.error("Delete error:", error);
          message.error("Unable to delete. Please try again later.");
        }
      },
    });
  };

  // Handle add matrix item
  const handleAddMatrixItem = (courseId, specialtyId, subjectId) => {
    Modal.confirm({
      title: "Confirm Add",
      icon: <CheckOutlined />,
      content: `Are you sure you want to add this relationship?`,
      okText: "Add",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await learningMatrixService.createCourseSubjectSpecialty({
            courseId,
            specialtyId,
            subjectId,
            notes: "auto-added"
          });
          message.success("Added successfully");
          fetchData();
        } catch (error) {
          console.error("Add error:", error);
          console.log("Error response:", error.response?.data);
          
          // Display error message from API
          if (error.response && error.response.data) {
            const errorData = error.response.data;
            console.log("Error data:", errorData);
            
            if (errorData.error && errorData.error.includes("already exist")) {
              message.error("This subject already exists for this specialty. Please choose a different combination.");
            } else if (errorData.error) {
              message.error(errorData.error);
            } else if (errorData.message) {
              message.error(errorData.message);
            } else {
              message.error("Unable to add learning matrix. Please check the information.");
            }
          } else {
            message.error("Unable to add learning matrix. Server error.");
          }
        }
      },
    });
  };

  // Handle delete all subjects for a specialty
  const handleDeleteAllSubjectsForSpecialty = (specialtyId) => {
    if (!selectedCourseId) {
      message.warning("No course selected");
      return;
    }

    Modal.confirm({
      title: "Confirm Delete All Subjects",
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ALL subjects for specialty ${specialtyId} in course ${selectedCourseId}?`,
      okText: "Delete All",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await learningMatrixService.deleteAllSubjectSpecialties({
            courseId: selectedCourseId,
            specialtyId: specialtyId
          });
          message.success(`All subjects deleted for specialty ${specialtyId}`);
          fetchData();
        } catch (error) {
          console.error("Error deleting subjects:", error);
          if (error.response && error.response.data) {
            const errorData = error.response.data;
            if (errorData.error) {
              message.error(errorData.error);
            } else if (errorData.message) {
              message.error(errorData.message);
            } else {
              message.error("Failed to delete subjects");
            }
          } else {
            message.error("Server error. Failed to delete subjects");
          }
        }
      },
    });
  };

  // Render matrix table for the selected course
  const renderMatrixTable = () => {
    if (!selectedCourseId || !matrixData[selectedCourseId]) {
      return <div>No course selected or no data available.</div>;
    }

    const courseMatrix = matrixData[selectedCourseId].matrix;
    
    // Count relationships for each subject
    const subjectCounts = {};
    subjects.forEach(subject => {
      subjectCounts[subject.subjectId] = 0;
      specialties.forEach(specialty => {
        if (courseMatrix[specialty.specialtyId][subject.subjectId]) {
          subjectCounts[subject.subjectId]++;
        }
      });
    });
    
    // Count relationships for each specialty
    const specialtyCounts = {};
    specialties.forEach(specialty => {
      specialtyCounts[specialty.specialtyId] = 0;
      subjects.forEach(subject => {
        if (courseMatrix[specialty.specialtyId][subject.subjectId]) {
          specialtyCounts[specialty.specialtyId]++;
        }
      });
    });
    
    // Sort subjects by relationship count (descending)
    const sortedSubjects = [...subjects].sort((a, b) => {
      return subjectCounts[b.subjectId] - subjectCounts[a.subjectId];
    });
    
    // Sort specialties by relationship count (descending)
    const sortedSpecialties = [...specialties].sort((a, b) => {
      return specialtyCounts[b.specialtyId] - specialtyCounts[a.specialtyId];
    });
    
    // Create columns - first column for specialties, then one for each subject
    const columns = [
      {
        title: "",
        key: "actions",
        width: 50,
        render: (_, record) => (
          <Button
            danger
            shape="circle"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAllSubjectsForSpecialty(record.specialtyId)}
            title={`Delete all subjects for ${record.specialtyName}`}
          />
        ),
      },
      {
        title: "Specialty",
        dataIndex: "specialty",
        key: "specialty",
        fixed: "left",
        width: 200,
        render: (text, record) => (
          <div style={{ fontWeight: "bold" }}>
            <div>{record.specialtyName}</div>
            <div><Tag color="purple">{record.specialtyId}</Tag></div>
            <div><small>({specialtyCounts[record.specialtyId]} relations)</small></div>
          </div>
        ),
      },
      ...sortedSubjects.map(subject => ({
        title: () => (
          <div style={{ textAlign: "center", minWidth: 150 }}>
            <div>{subject.subjectName}</div>
            <div><Tag color="green">{subject.subjectId}</Tag></div>
            <div><small>({subjectCounts[subject.subjectId]} relations)</small></div>
          </div>
        ),
        dataIndex: subject.subjectId,
        key: subject.subjectId,
        width: 120,
        align: "center",
        render: (text, record) => {
          const item = courseMatrix[record.specialtyId][subject.subjectId];
          return item ? (
            <Button 
              type="primary" 
              shape="circle" 
              icon={hoveredItem === `${record.specialtyId}-${subject.subjectId}` 
                ? <DeleteOutlined /> 
                : <CheckOutlined />} 
              onClick={() => handleDeleteMatrixItem(item)}
              onMouseEnter={() => setHoveredItem(`${record.specialtyId}-${subject.subjectId}`)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ 
                backgroundColor: hoveredItem === `${record.specialtyId}-${subject.subjectId}` 
                  ? "#ff4d4f" 
                  : "#52c41a", 
                borderColor: hoveredItem === `${record.specialtyId}-${subject.subjectId}` 
                  ? "#ff4d4f" 
                  : "#52c41a", 
                cursor: "pointer" 
              }}
            />
          ) : (
            <Button 
              shape="circle" 
              icon={<PlusOutlined />} 
              onClick={() => handleAddMatrixItem(selectedCourseId, record.specialtyId, subject.subjectId)}
            />
          );
        },
      })),
    ];
    
    // Create data rows - one for each specialty
    const dataSource = sortedSpecialties.map(specialty => ({
      key: specialty.specialtyId,
      specialtyId: specialty.specialtyId,
      specialtyName: specialty.specialtyName,
      specialty: specialty.specialtyName,
      ...subjects.reduce((acc, subject) => {
        acc[subject.subjectId] = courseMatrix[specialty.specialtyId][subject.subjectId];
        return acc;
      }, {})
    }));
    
    return (
      <Table 
        columns={columns} 
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: "max-content" }}
        bordered
      />
    );
  };

  return (
    <Layout className="site-layout" style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "16px 16px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Training Management</Breadcrumb.Item>
          <Breadcrumb.Item>Learning Matrix</Breadcrumb.Item>
        </Breadcrumb>
        
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <BarsOutlined style={{ fontSize: "24px", marginRight: "16px" }} />
              <Title level={3} style={{ margin: 0 }}>
                Learning Matrix
              </Title>
            </div>
          }
          extra={
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/learning-matrix/create")}
                style={{ borderRadius: "6px", height: "40px" }}
              >
                Add New
              </Button>
            </Space>
          }
          bordered={false}
          style={{ borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}
        >
          <Spin spinning={loading}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <Text strong style={{ marginRight: 8 }}>Select Course:</Text>
                  <Select
                    style={{ width: 300 }}
                    value={selectedCourseId}
                    onChange={handleCourseChange}
                  >
                    {distinctCourses.map(course => (
                      <Option key={course.courseId} value={course.courseId}>
                        {course.courseName} ({course.courseId})
                      </Option>
                    ))}
                  </Select>
                </div>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchData}
                  style={{ borderRadius: "6px" }}
                >
                  Refresh Data
                </Button>
              </div>
              
              {renderMatrixTable()}
            </div>
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
};

export default LearningMatrixPage; 