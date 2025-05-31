import {
  Card,
  Empty,
  Modal,
  message,
  Spin,
  Input,
  Tag,
  Typography,
  Tooltip,
  Select,
  Pagination,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  EyeOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import "animate.css";
import { getAllSubject, deleteSubject } from "../../services/subjectService";
import { trainingScheduleService } from "../../services/trainingScheduleService";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SubjectPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState(null);

  const pageSize = 9;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const role = sessionStorage.getItem("role");
        const userId = sessionStorage.getItem("userID");
        if (role === "Trainee") {
          const response = await trainingScheduleService.getTraineeSubjects();
          if (Array.isArray(response)) {
            const traineeSubjects = response.map((subject) => ({
              subjectId: subject.subjectId,
              subjectName: subject.subjectName,
              courseId: subject.courseId,
              description: subject.description,
              credits: subject.credits,
              passingScore: subject.passingScore,
            }));
            setSubjects(traineeSubjects);
            setFilteredSubjects(traineeSubjects);

            const traineeSchedules = response.flatMap((subject) =>
              subject.trainingSchedules.map((schedule) => ({
                ...schedule,
                subjectName: subject.subjectName,
                subjectId: subject.subjectId,
                courseId: subject.courseId,
              }))
            );
            setScheduleData(traineeSchedules);
          }
        } else if (role === "Instructor") {
          const response = await getAllSubject();
          if (response && response.allSubjects) {
            const instructorSubjects = response.allSubjects.filter(
              (subject) =>
                subject.instructors &&
                subject.instructors.some(
                  (instructor) => instructor.instructorId === userId
                )
            );
            setSubjects(instructorSubjects);
            setFilteredSubjects(instructorSubjects);
          }
        } else {
          const response = await getAllSubject();
          if (response && response.allSubjects) {
            setSubjects(response.allSubjects);
            setFilteredSubjects(response.allSubjects);
          } else if (Array.isArray(response)) {
            setSubjects(response);
            setFilteredSubjects(response);
          }
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        message.error("Không thể tải dữ liệu môn học");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const filtered = subjects.filter(
      (subject) =>
        subject.subjectName.toLowerCase().includes(searchText.toLowerCase()) ||
        subject.subjectId.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchText, subjects]);

  const handleDeleteClick = (id) => {
    setDeletingSubjectId(id);
    setDeleteModalVisible(true);
  };

  // Handle delete subject
  const handleConfirmDelete = async () => {
    try {
      const response = await deleteSubject(deletingSubjectId);

      if (response && response.message) {
        if (response.allSubjects) {
          setSubjects(response.allSubjects);
        } else {
          setSubjects(
            subjects.filter((s) => s.subjectId !== deletingSubjectId)
          );
        }
        message.success(response.message || "Subject deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
      const err = error?.response?.data;
      message.error(err?.message || err?.error || "Failed to delete subject.");
    } finally {
      setDeleteModalVisible(false);
      setDeletingSubjectId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setDeletingSubjectId(null);
  };

  const handleSubjectChange = async (subjectId) => {
    try {
      setLoading(true);
      const role = sessionStorage.getItem("role");

      if (role === "Trainee") {
        // Nếu là Trainee, luôn gọi API getTraineeSubjects
        const response = await trainingScheduleService.getTraineeSubjects();

        if (subjectId) {
          // Nếu chọn một môn cụ thể, lọc chỉ hiển thị môn đó
          const filteredSchedules = response.flatMap((subject) =>
            subject.subjectId === subjectId
              ? subject.trainingSchedules.map((schedule) => ({
                  ...schedule,
                  subjectName: subject.subjectName,
                  subjectId: subject.subjectId,
                  courseId: subject.courseId,
                }))
              : []
          );
          setScheduleData(filteredSchedules);
        } else {
          // Nếu không chọn môn nào, hiển thị tất cả môn của trainee
          const allTraineeSchedules = response.flatMap((subject) =>
            subject.trainingSchedules.map((schedule) => ({
              ...schedule,
              subjectName: subject.subjectName,
              subjectId: subject.subjectId,
              courseId: subject.courseId,
            }))
          );
          setScheduleData(allTraineeSchedules);
        }
      }
      // ... rest of the code for other roles
    } catch (error) {
      console.error("Error in handleSubjectChange:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const renderSubjectSelector = () => {
    const role = sessionStorage.getItem("role");

    if (role === "Trainee") {
      return (
        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-lg text-indigo-600" />
            <span className="font-medium">My Subjects:</span>
            <Select
              style={{ width: 350 }}
              placeholder="Chọn môn học của bạn"
              onChange={(value) => handleSubjectChange(value)}
              value={selectedSubjectId}
              allowClear
            >
              {subjects.map((subject) => (
                <Option key={subject.subjectId} value={subject.subjectId}>
                  <div className="flex flex-col">
                    <div className="font-medium">{subject.subjectName}</div>
                    <div className="text-xs text-gray-500">
                      Course: {subject.courseId || "N/A"}
                      {subject.specialtyId &&
                        ` • Specialty: ${subject.specialtyId}`}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        </div>
      );
    }

    // Return existing subject selector for other roles
    return (
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <CalendarOutlined className="text-lg text-indigo-600" />
          <span className="font-medium">Select Subject:</span>
          <Select
            style={{ width: 350 }}
            placeholder="Select a subject"
            onChange={(value) => handleSubjectChange(value)}
            value={selectedSubjectId}
            allowClear
          >
            {subjects.map((subject) => (
              <Option key={subject.subjectId} value={subject.subjectId}>
                <div className="flex flex-col">
                  <div className="font-medium">{subject.subjectName}</div>
                  <div className="text-xs text-gray-500">
                    ID: {subject.subjectId}
                    {subject.specialtyId &&
                      ` • Specialty: ${subject.specialtyId}`}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  };

  // Tính toán danh sách môn học hiển thị trên trang hiện tại
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredSubjects.slice(startIndex, endIndex);
  };

  // Xử lý khi thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Cuộn lên đầu khi chuyển trang
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-800 text-white py-12 mb-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate__animated animate__fadeIn">
            <BookOutlined className="text-5xl mb-4" />
            <h1 className="text-4xl font-bold mb-4">Training Subjects</h1>
            <p className="text-lg text-cyan-100 max-w-2xl mx-auto">
              Explore our curated collection of training subjects to support
              your learning goals.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-cyan-600">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search subjects by name or ID..."
            onChange={(e) => setSearchText(e.target.value)}
            className="!border-cyan-400"
            allowClear
            size="large"
          />
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Loading subjects..." />
          </div>
        ) : filteredSubjects.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center space-y-4">
                <p className="text-gray-500 text-lg">
                  {searchText
                    ? `No subjects matching "${searchText}"`
                    : "No subjects available"}
                </p>
                <button
                  onClick={() => navigate("/subject-create")}
                  className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 transition"
                >
                  Create your first subject
                </button>
              </div>
            }
          />
        ) : (
          <div className="animate__animated animate__fadeInUp">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCurrentPageData().map((subject) => (
                <Card
                  key={subject.subjectId}
                  className="hover:shadow-xl transition duration-300 rounded-2xl border !border-cyan-600 bg-white overflow-hidden"
                  actions={[
                    <Tooltip title="View Details" key="view-tooltip">
                      <EyeOutlined
                        className="!text-cyan-600 text-lg hover:!text-cyan-800"
                        onClick={() =>
                          navigate(`/subject/${subject.subjectId}`)
                        }
                      />
                    </Tooltip>,
                    !["Trainee", "Instructor"].includes(
                      sessionStorage.getItem("role")
                    ) && (
                      <Tooltip title="Edit Subject" key="edit-tooltip">
                        <EditOutlined
                          className="!text-emerald-500 text-lg hover:!text-emerald-700"
                          onClick={() =>
                            navigate(`/subject-edit/${subject.subjectId}`)
                          }
                        />
                      </Tooltip>
                    ),
                    !["Trainee", "Instructor"].includes(
                      sessionStorage.getItem("role")
                    ) && (
                      <Tooltip title="Delete Subject" key="delete-tooltip">
                        <DeleteOutlined
                          className="!text-rose-500 text-lg hover:!text-rose-700"
                          onClick={() => handleDeleteClick(subject.subjectId)}
                        />
                      </Tooltip>
                    ),
                  ].filter(Boolean)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Title
                          level={4}
                          className="text-xl font-semibold text-gray-800 mb-2"
                          ellipsis={{ rows: 2 }}
                        >
                          {subject.subjectName}
                        </Title>
                        <div className="flex gap-2 mb-2">
                          <Tag color="cyan">{subject.subjectId}</Tag>
                          {subject.specialtyId && (
                            <Tag color="geekblue">{subject.specialtyId}</Tag>
                          )}
                        </div>
                      </div>
                      <BookOutlined className="!text-2xl !text-cyan-500" />
                    </div>

                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      className="!text-gray-600 !mb-4"
                    >
                      {subject.description || "No description provided"}
                    </Paragraph>

                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                      <Tooltip title="Credits">
                        <Tag
                          color={
                            subject.credits <= 3
                              ? "green"
                              : subject.credits <= 6
                              ? "orange"
                              : "red"
                          }
                          className="px-3 py-1 flex items-center gap-1"
                        >
                          <BookOutlined /> {subject.credits} Credits
                        </Tag>
                      </Tooltip>
                      <Tooltip title="Passing Score">
                        <Tag
                          color={
                            subject.passingScore <= 4
                              ? "green"
                              : subject.passingScore <= 7
                              ? "orange"
                              : "red"
                          }
                          className="px-3 py-1 flex items-center gap-1"
                        >
                          <TrophyOutlined /> Pass: {subject.passingScore}
                        </Tag>
                      </Tooltip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {filteredSubjects.length > pageSize && (
              <div className="flex justify-center mt-10">
                <Pagination
                  current={currentPage}
                  onChange={handlePageChange}
                  total={filteredSubjects.length}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total) => `Total ${total} subjects`}
                />
              </div>
            )}
          </div>
        )}

        {/* Floating Action Button */}
        {!["Trainee", "Instructor"].includes(
          sessionStorage.getItem("role")
        ) && (
          <Tooltip title="Create New Subject" placement="left">
            <button
              onClick={() => navigate("/subject-create")}
              className="!fixed !bottom-8 !right-8 !w-14 !h-14 !rounded-full !bg-cyan-600 hover:!bg-cyan-700 !text-white !shadow-lg !flex !items-center !justify-center !transition animate__animated animate__bounceIn"
            >
              <PlusOutlined className="text-xl" />
            </button>
          </Tooltip>
        )}
        <Modal
          title="Confirm Delete"
          open={deleteModalVisible}
          onCancel={handleCancelDelete}
          footer={[
            <Button
              key="cancel"
              onClick={handleCancelDelete}
              className=" !border-cyan-600 !text-cyan-600  hover:!border-cyan-800 hover:!text-cyan-900"
            >
              Cancel
            </Button>,
            <Button
              key="delete"
              onClick={handleConfirmDelete}
              className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
              danger
            >
              Delete
            </Button>,
          ]}
        >
          <div className="flex items-start gap-3">
            <QuestionCircleOutlined className="!text-red-500 !text-xl !mt-1" />
            <p className="!text-gray-700">
              Are you sure you want to delete this subject? This action cannot
              be undone.
            </p>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SubjectPage;
