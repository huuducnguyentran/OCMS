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
  Empty,
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
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredSpecialties, setFilteredSpecialties] = useState([]);
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
      if (response && response.allSubjects) {
        setSubjects(response.allSubjects);
      } else if (Array.isArray(response)) {
        setSubjects(response);
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
    if (learningMatrixData.length > 0) {
      console.log("Learning matrix data:", learningMatrixData);
      
      // Extract distinct courses
      const uniqueCourses = Array.from(
        new Set(
          learningMatrixData.map(item => JSON.stringify({
            courseId: item.courseId,
            courseName: item.courseName || item.courseId
          }))
        )
      ).map(item => JSON.parse(item));
      
      setDistinctCourses(uniqueCourses);
      
      // Set first course as default selected if none selected
      if (!selectedCourseId && uniqueCourses.length > 0) {
        setSelectedCourseId(uniqueCourses[0].courseId);
      }
      
      // Organize data in matrix format only if subjects and specialties are loaded
      if (subjects.length > 0 && specialties.length > 0) {
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
        
        // Determine which data to process
        const dataToProcess = selectedCourseId && selectedSpecialtyId && filteredData.length > 0
          ? filteredData  // Use filtered data when course & specialty are selected
          : learningMatrixData; // Otherwise use all data
        
        console.log("Data to process for matrix:", dataToProcess);
          
        // Fill matrix with data
        dataToProcess.forEach(item => {
          if (
            matrix[item.courseId] && 
            matrix[item.courseId].matrix[item.specialtyId] &&
            matrix[item.courseId].matrix[item.specialtyId][item.subjectId] !== undefined
          ) {
            matrix[item.courseId].matrix[item.specialtyId][item.subjectId] = item;
          }
        });
        
        setMatrixData(matrix);
        
        // Initially set filtered subjects and specialties to all
        if (!selectedCourseId || !selectedSpecialtyId) {
          setFilteredSubjects(subjects);
          setFilteredSpecialties(specialties);
        }
      }
    }
  }, [learningMatrixData, subjects, specialties, filteredData, selectedCourseId, selectedSpecialtyId]);

  // Load learning matrix data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await learningMatrixService.getAllCourseSubjectSpecialties();
      
      console.log("API Response:", response);
      
      if (response && response.data) {
        // Cấu trúc API mới
        console.log("Setting matrix data from response:", response.data);
        setLearningMatrixData(response.data);
        setFilteredData(response.data);
      } else if (Array.isArray(response)) {
        // Trường hợp API trả về mảng trực tiếp
        console.log("Setting matrix data from array response");
        setLearningMatrixData(response);
        setFilteredData(response);
      } else {
        console.error("Unexpected API response format:", response);
        message.error("Unexpected API response format");
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

  // Fetch subjects for specific course and specialty
  const fetchSubjectsForCourseAndSpecialty = async () => {
    if (!selectedCourseId || !selectedSpecialtyId) return;
    
    try {
      setLoading(true);
      const response = await learningMatrixService.getSubjectsForCourseAndSpecialty(
        selectedCourseId,
        selectedSpecialtyId
      );
      
      console.log("Subjects for course and specialty response:", response);
      
      if (response && response.data && response.data.length > 0) {
        // Map subjects from API response
        const subjectsFromApi = response.data.map(item => {
          // Find detailed subject info from original list or use API info
          const subjectDetails = subjects.find(s => s.subjectId === item.subjectId) || {};
          return {
            ...subjectDetails,
            subjectId: item.subjectId,
            subjectName: item.subjectName || subjectDetails.subjectName,
            description: item.description || subjectDetails.description,
            isPartOfSpecialty: true
          };
        });
        
        setFilteredSubjects(subjectsFromApi);
        
        // Find specialty details and use API name if available
        const selectedSpecialtyData = specialties.find(specialty => 
          specialty.specialtyId === selectedSpecialtyId
        );
        
        if (selectedSpecialtyData) {
          const specialtyWithApiName = {
            ...selectedSpecialtyData,
            specialtyName: response.data[0]?.specialtyName || selectedSpecialtyData.specialtyName
          };
          
          setFilteredSpecialties([specialtyWithApiName]);
        } else {
          // If specialty not found in list, create one from API data
          const firstItem = response.data[0];
          if (firstItem) {
            setFilteredSpecialties([{
              specialtyId: firstItem.specialtyId,
              specialtyName: firstItem.specialtyName
            }]);
          }
        }
        
        // Use the API response directly for filtered data
        setFilteredData(response.data);
        
        console.log("Updated filtered subjects:", subjectsFromApi);
        console.log("Updated filtered specialties:", filteredSpecialties);
      } else {
        // No data from API
        setFilteredSubjects([]);
        
        // Still show selected specialty
        const selectedSpecialtyData = specialties.find(specialty => 
          specialty.specialtyId === selectedSpecialtyId
        );
        
        if (selectedSpecialtyData) {
          setFilteredSpecialties([selectedSpecialtyData]);
        } else {
          setFilteredSpecialties([]);
        }
        
        setFilteredData([]);
      }
    } catch (error) {
      console.error("Error loading subjects for course and specialty:", error);
      message.error("Không thể tải danh sách môn học cho khóa học và chuyên ngành này");
      
      // Show empty lists in case of error
      setFilteredSubjects([]);
      setFilteredSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle specialty change 
  const handleSpecialtyChange = (value) => {
    setSelectedSpecialtyId(value);
    
    // If specialty is cleared, reset data
    if (!value) {
      setFilteredSubjects(subjects);
      setFilteredSpecialties(specialties);
      setFilteredData(learningMatrixData);
    } else if (selectedCourseId) {
      // If both course and specialty are selected, load specific data
      fetchSubjectsForCourseAndSpecialty();
    }
  };

  // Handle course change
  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    
    // When course changes, reload data if specialty is selected
    if (selectedSpecialtyId) {
      // Reset specialty to trigger useEffect
      const currentSpecialtyId = selectedSpecialtyId;
      setSelectedSpecialtyId(null);
      setTimeout(() => {
        setSelectedSpecialtyId(currentSpecialtyId);
      }, 0);
    } else {
      // If no specialty selected, show all specialties
      setFilteredSpecialties(specialties);
      setFilteredSubjects(subjects);
    }
  };

  // Tự động tải dữ liệu khi cả khóa học và chuyên ngành được chọn
  useEffect(() => {
    if (selectedCourseId && selectedSpecialtyId) {
      fetchSubjectsForCourseAndSpecialty();
    }
  }, [selectedCourseId, selectedSpecialtyId]);

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

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    
    if (!value.trim()) {
      // If search text is empty, reset filters
      setFilteredSubjects(subjects);
      setFilteredSpecialties(specialties);
      return;
    }
    
    const searchLower = value.toLowerCase();
    
    // Filter subjects based on search
    const matchedSubjects = subjects.filter(subject => 
      subject.subjectName?.toLowerCase().includes(searchLower) || 
      subject.subjectId?.toLowerCase().includes(searchLower)
    );
    
    // Filter specialties based on search
    const matchedSpecialties = specialties.filter(specialty => 
      specialty.specialtyName?.toLowerCase().includes(searchLower) || 
      specialty.specialtyId?.toLowerCase().includes(searchLower)
    );
    
    setFilteredSubjects(matchedSubjects);
    setFilteredSpecialties(matchedSpecialties);
  };

  // Render matrix table for the selected course
  const renderMatrixTable = () => {
    if (!selectedCourseId || !matrixData[selectedCourseId]) {
      return <div>Chưa chọn khóa học hoặc không có dữ liệu.</div>;
    }

    const courseMatrix = matrixData[selectedCourseId].matrix;
    
    // Filter specialties based on selection
    let displaySpecialties = [...filteredSpecialties];
    if (selectedSpecialtyId) {
      displaySpecialties = displaySpecialties.filter(specialty => 
        specialty.specialtyId === selectedSpecialtyId
      );
    }
    
    // Kiểm tra nếu không có môn học nào
    if (filteredSubjects.length === 0 && selectedSpecialtyId) {
      const selectedSpecialty = specialties.find(s => s.specialtyId === selectedSpecialtyId);
      
      return (
        <div className="text-center p-8">
          <Card
            title={
              <div>
                <div className="text-lg font-bold">List of subjects in {selectedSpecialty?.specialtyName} ({selectedSpecialtyId})</div>
                <div className="text-sm text-gray-500">Course: {matrixData[selectedCourseId].courseName} ({selectedCourseId})</div>
              </div>
            }
            bordered={false}
            className="mt-4"
          >
            <Empty 
              description={
                <span>No subjects found for course <b>{matrixData[selectedCourseId].courseName}</b> and specialty <b>{selectedSpecialtyId}</b></span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button 
              onClick={() => navigate('/learning-matrix/create')} 
              type="primary" 
              icon={<PlusOutlined />}
              style={{ marginTop: 16 }}
            >
              Add new relationship
            </Button>
          </Card>
        </div>
      );
    }
    
    // Hiển thị bảng danh sách môn học khi chọn chuyên ngành (tương tự như trong CreateTrainingPlanPage.jsx)
    if (selectedSpecialtyId) {
      const selectedSpecialty = specialties.find(s => s.specialtyId === selectedSpecialtyId);
      
      // Cấu hình cột cho bảng môn học
      const subjectColumns = [
        {
          title: "Subject Code",
          dataIndex: "subjectId",
          key: "subjectId",
          width: 150,
          ellipsis: true,
        },
        {
          title: "Subject Name",
          dataIndex: "subjectName",
          key: "subjectName",
          width: 300,
          ellipsis: true
        },
        {
          title: "Description",
          dataIndex: "description",
          key: "description",
          ellipsis: true,
        }
        
      ];
      
      return (
        <div>
          <Card 
            title={
              <div>
                <div className="text-lg font-bold">List of subjects in {selectedSpecialty?.specialtyName} ({selectedSpecialtyId})</div>
                <div className="text-sm text-gray-500">Course: {matrixData[selectedCourseId].courseName} ({selectedCourseId})</div>
              </div>
            }
            
          >
            <Table 
              dataSource={filteredSubjects} 
              columns={subjectColumns} 
              rowKey="subjectId"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      );
    }
    
    // Count relationships for each subject
    const subjectCounts = {};
    filteredSubjects.forEach(subject => {
      subjectCounts[subject.subjectId] = 0;
      displaySpecialties.forEach(specialty => {
        if (courseMatrix[specialty.specialtyId] && 
            courseMatrix[specialty.specialtyId][subject.subjectId]) {
          subjectCounts[subject.subjectId]++;
        }
      });
    });
    
    // Count relationships for each specialty
    const specialtyCounts = {};
    displaySpecialties.forEach(specialty => {
      specialtyCounts[specialty.specialtyId] = 0;
      filteredSubjects.forEach(subject => {
        if (courseMatrix[specialty.specialtyId] && 
            courseMatrix[specialty.specialtyId][subject.subjectId]) {
          specialtyCounts[specialty.specialtyId]++;
        }
      });
    });
    
    // Sort subjects by relationship count (descending)
    const sortedSubjects = [...filteredSubjects].sort((a, b) => {
      return subjectCounts[b.subjectId] - subjectCounts[a.subjectId];
    });
    
    // Sort specialties by relationship count (descending)
    const sortedSpecialties = [...displaySpecialties].sort((a, b) => {
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
        title: "Specialty/Subject",
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
          if (!courseMatrix[record.specialtyId]) return null;
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
        if (courseMatrix[specialty.specialtyId]) {
          acc[subject.subjectId] = courseMatrix[specialty.specialtyId][subject.subjectId];
        }
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
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
                  
                  <div>
                    <Text strong style={{ marginRight: 8 }}>Select Specialty:</Text>
                    <Select
                      style={{ width: 300 }}
                      value={selectedSpecialtyId}
                      onChange={handleSpecialtyChange}
                      allowClear
                      placeholder="All specialties"
                    >
                      {specialties.map(specialty => (
                        <Option key={specialty.specialtyId} value={specialty.specialtyId}>
                          {specialty.specialtyName} ({specialty.specialtyId})
                        </Option>
                      ))}
                    </Select>
                  </div>
                  
                  <div style={{ width: "300px" }}>
                    <Input.Search
                      placeholder="Search by subject or specialty name/ID"
                      allowClear
                      enterButton={<SearchOutlined />}
                      size="middle"
                      value={searchText}
                      onChange={(e) => handleSearch(e.target.value)}
                      onSearch={handleSearch}
                    />
                  </div>
                </div>
                
                <Space>
                  {searchText && (
                    <div style={{ marginRight: "8px" }}>
                      <Text type="secondary">
                        Found: {filteredSubjects.length} subjects, {filteredSpecialties.length} specialties
                      </Text>
                    </div>
                  )}
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                      fetchData();
                      setSearchText('');
                      handleSearch('');
                    }}
                    style={{ borderRadius: "6px" }}
                  >
                    Refresh Data
                  </Button>
                </Space>
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