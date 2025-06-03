import { useState, useEffect } from "react";
import {
  Table,
  message,
  Typography,
  Button,
  Space,
  Tag,
  Input,
  Popconfirm,
  Dropdown,
  Select,
  Modal,
  Form,
  InputNumber,
} from "antd";
import {
  ReloadOutlined,
  FileExcelOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  FilterOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  gradeServices,
  exportCourseResults,
} from "../../services/gradeServices";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const { Title } = Typography;
const { Search } = Input;

const ViewGradePage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [userRole, setUserRole] = useState("");
  const [subjectList, setSubjectList] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const isInstructor = sessionStorage.getItem("role") === "Instructor";
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

  const handleChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setSortedInfo(sorter);
  };
  useEffect(() => {
    // Lấy role người dùng từ session
    const role = sessionStorage.getItem("role");
    setUserRole(role);
  }, []);

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 70,
      fixed: "left",
      align: "center",
      render: (_, __, index) => {
        // Tính số thứ tự dựa trên trang hiện tại và số bản ghi mỗi trang
        const { current, pageSize } = pagination;
        return (current - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Trainee Assign ID",
      dataIndex: "traineeAssignId",
      key: "traineeAssignId",
      width: 120,
      sorter: (a, b) => a.traineeAssignID.localeCompare(b.traineeAssignID),
      sortOrder:
        sortedInfo.columnKey === "traineeAssignId" ? sortedInfo.order : null,
      // filteredValue: [searchText],
      // onFilter: (value, record) => {
      //   return record.subjectId.toLowerCase().includes(value.toLowerCase());
      // },
    },
    {
      title: "Trainee",
      dataIndex: "fullname",
      key: "fullname",
      width: 120,
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      sortOrder: sortedInfo.columnKey === "fullname" ? sortedInfo.order : null,
      // filteredValue: [searchText],
      // onFilter: (value, record) => {
      //   return record.subjectId.toLowerCase().includes(value.toLowerCase());
      // },
    },
    {
      title: "Subject ID",
      dataIndex: "subjectId",
      key: "subjectId",
      width: 120,
      sorter: (a, b) => a.fullname.localeCompare(b.fullname),
      sortOrder: sortedInfo.columnKey === "fullname" ? sortedInfo.order : null,
      // filteredValue: [searchText],
      // onFilter: (value, record) => {
      //   return record.subjectId.toLowerCase().includes(value.toLowerCase());
      // },
    },
    {
      title: "Progress Scores",
      children: [
        {
          title: "Participation",
          dataIndex: "participantScore",
          key: "participantScore",
          width: 110,
          sorter: (a, b) => a.participantScore - b.participantScore,
          sortOrder:
            sortedInfo.columnKey === "participantScore"
              ? sortedInfo.order
              : null,
          render: (score) => (
            <Tag
              color={score >= 5 ? "success" : "error"}
              className="w-16 text-center"
            >
              {score}
            </Tag>
          ),
        },
        {
          title: "Assignment",
          dataIndex: "assignmentScore",
          key: "assignmentScore",
          width: 110,
          sorter: (a, b) => a.assignmentScore - b.assignmentScore,
          sortOrder:
            sortedInfo.columnKey === "assignmentScore"
              ? sortedInfo.order
              : null,
          render: (score) => (
            <Tag
              color={score >= 5 ? "success" : "error"}
              className="w-16 text-center"
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
          sorter: (a, b) => a.finalExamScore - b.finalExamScore,
          sortOrder:
            sortedInfo.columnKey === "finalExamScore" ? sortedInfo.order : null,
          render: (score) => (
            <Tag
              color={score >= 5 ? "success" : "error"}
              className="w-16 text-center"
            >
              {score}
            </Tag>
          ),
        },
        {
          title: "Resit",
          dataIndex: "finalResitScore",
          key: "finalResitScore",
          width: 100,
          sorter: (a, b) => a.finalResitScore - b.finalResitScore,
          sortOrder:
            sortedInfo.columnKey === "finalResitScore"
              ? sortedInfo.order
              : null,
          render: (score) => (
            <Tag
              color={score === 0 ? "default" : score >= 5 ? "success" : "error"}
              className="w-16 text-center"
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
      sorter: (a, b) => a.totalScore - b.totalScore,
      sortOrder:
        sortedInfo.columnKey === "totalScore" ? sortedInfo.order : null,
      render: (score) => {
        const roundedScore = Number(score).toFixed(2);
        const formattedScore = parseFloat(roundedScore);

        return (
          <Tag
            color={score >= 5 ? "success" : "error"}
            className="w-16 text-center font-semibold"
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
      sorter: (a, b) => a.gradeStatus.localeCompare(b.gradeStatus),
      sortOrder:
        sortedInfo.columnKey === "gradeStatus" ? sortedInfo.order : null,
      render: (_, record) => {
        const isPending =
          record.participantScore === -1 ||
          record.assignmentScore === -1 ||
          record.finalExamScore === -1;

        if (isPending) return null;

        const status = record.totalScore >= 5 ? "Pass" : "Fail";
        const color = status === "Pass" ? "success" : "error";

        return (
          <Tag color={color} className="px-4 py-1">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Graded By",
      dataIndex: "gradedByInstructorId",
      key: "gradedByInstructorId",
      width: 120,
      sorter: (a, b) =>
        a.gradedByInstructorId.localeCompare(b.gradedByInstructorId),
      sortOrder:
        sortedInfo.columnKey === "gradedByInstructorId"
          ? sortedInfo.order
          : null,
    },
    {
      title: "Evaluation Date",
      dataIndex: "evaluationDate",
      key: "evaluationDate",
      width: 180,
      sorter: (a, b) => new Date(a.evaluationDate) - new Date(b.evaluationDate),
      sortOrder:
        sortedInfo.columnKey === "evaluationDate" ? sortedInfo.order : null,
      render: (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => {
        // Nếu người dùng là Reviewer, không hiển thị nút hành động
        if (userRole === "Reviewer") {
          return null;
        }

        const items = [
          isInstructor && {
            key: "edit",
            label: "Edit Grade",
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },

          {
            key: "delete",
            label: (
              <Popconfirm
                title="Delete Grade"
                description="Are you sure to delete this grade?"
                onConfirm={() => handleDelete(record)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ className: "bg-red-500 hover:bg-red-100" }}
              >
                <div className="flex items-center text-red-500 hover:text-red-100">
                  {/* <DeleteOutlined className="mr-2" /> */}
                  Delete Grade
                </div>
              </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="custom-dropdown"
          >
            <Button
              icon={<MoreOutlined />}
              className="!border-none shadow-none hover:bg-gray-100 hover:text-cyan-700"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        );
      },
    },
  ];

  // Hàm trả về danh sách cột dựa trên vai trò người dùng
  const getTableColumns = () => {
    // Nếu người dùng là Reviewer, không hiển thị cột Actions
    if (userRole === "Reviewer") {
      return columns.filter((col) => col.key !== "actions");
    }
    return columns;
  };

  const getUniqueSubjects = (gradeData) => {
    const subjects = [...new Set(gradeData.map((grade) => grade.subjectId))];
    return subjects.map((subject) => ({
      value: subject,
      label: subject,
    }));
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await gradeServices.getAllGrades();

      if (response && Array.isArray(response)) {
        const formattedGrades = response.map((grade) => {
          // Kiểm tra điểm có hợp lệ không
          const isPending =
            grade.participantScore === -1 ||
            grade.assignmentScore === -1 ||
            grade.finalExamScore === -1;

          let gradeStatus = "Pending";
          if (!isPending) {
            gradeStatus = grade.totalScore >= 5 ? "Pass" : "Fail";
          }

          return {
            ...grade,
            key: grade.gradeId,
            gradeStatus, // Ghi đè status
          };
        });
        setGrades(formattedGrades);
        setFilteredGrades(formattedGrades);
        setSearchText("");
        setSubjectList(getUniqueSubjects(formattedGrades));
      } else {
        message.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
      message.error("Unable to load grades");
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    filterGrades(searchText, value);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    filterGrades(value, selectedSubject);
  };

  const filterGrades = (search, subject) => {
    let filtered = [...grades];

    if (search) {
      filtered = filtered.filter(
        (grade) =>
          grade.gradeId.toLowerCase().includes(search.toLowerCase()) ||
          grade.traineeAssignID.toLowerCase().includes(search.toLowerCase()) ||
          grade.subjectId.toLowerCase().includes(search.toLowerCase()) ||
          grade.fullname.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (subject && subject !== "all") {
      filtered = filtered.filter((grade) => grade.subjectId === subject);
    }

    setFilteredGrades(filtered);
  };

  const handleEdit = (record) => {
    navigate(`/grade-update/${record.gradeId}`, {
      state: {
        gradeData: {
          gradeId: record.gradeId,
          traineeAssignId: record.traineeAssignId,
          subjectId: record.subjectId,
          participantScore: record.participantScore,
          assignmentScore: record.assignmentScore,
          finalExamScore: record.finalExamScore,
          finalResultScore: record.finalResitScore || 0,
          remarks: record.remarks || "",
        },
      },
    });
  };

  const handleDelete = async (record) => {
    try {
      setLoading(true);
      if (!record || !record.gradeId) {
        throw new Error("Grade ID is required");
      }
      await gradeServices.deleteGrade(record.gradeId);
      message.success("Grade deleted successfully");
      await fetchGrades();
    } catch (error) {
      message.error(JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
    }
  };
  const handleExportCourseResults = async () => {
    try {
      message.loading({
        content: "Preparing to export...",
        key: "exportLoading",
      });
      await exportCourseResults();
      message.success({
        content: "Exported successfully",
        key: "exportLoading",
      });
    } catch (error) {
      console.error("Error exporting trainee info:", error);
      message.error({
        content: "Unable to export. Please try again",
        key: "exportLoading",
      });
    }
  };

  const handleExportData = () => {
    try {
      message.loading({ content: "Đang chuẩn bị xuất file...", key: "export" });

      // Chuẩn bị dữ liệu để xuất
      const dataToExport = filteredGrades.map((grade) => ({
        "Grade ID": grade.gradeId,
        "Trainee ID": grade.traineeAssignID,
        Subject: grade.subjectId,
        "Participation Score": grade.participantScore,
        "Assignment Score": grade.assignmentScore,
        "Final Exam Score": grade.finalExamScore,
        "Resit Score": grade.finalResitScore || "-",
        "Total Score": Number(grade.totalScore).toFixed(2),
        Status: grade.gradeStatus,
        Remarks: grade.remarks || "",
        "Graded By": grade.gradedByInstructorId,
        "Evaluation Date": grade.evaluationDate
          ? new Date(grade.evaluationDate).toLocaleString()
          : "",
      }));

      // Tạo workbook và worksheet
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");

      // Tạo tên file với timestamp
      const date = new Date();
      const fileName = `grades_${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}.xlsx`;

      // Xuất file
      XLSX.writeFile(workbook, fileName);
      message.success({ content: "Xuất file thành công!", key: "export" });
    } catch (error) {
      console.error("Error exporting data:", error);
      message.error({
        content: "Không thể xuất file. Vui lòng thử lại!",
        key: "export",
      });
    }
  };

  const handleCreate = async (values) => {
    try {
      setCreating(true);
      const gradeData = {
        traineeAssignID: values.traineeAssignID,
        subjectId: values.subjectId,
        participantScore: values.participantScore,
        assignmentScore: values.assignmentScore,
        finalExamScore: values.finalExamScore,
        finalResitScore: values.finalResitScore || 0,
        remarks: values.remarks || "",
      };

      await gradeServices.createGrade(gradeData);
      message.success("Grade created successfully");
      setIsModalVisible(false);
      createForm.resetFields();
      fetchGrades(); // Refresh data
    } catch (error) {
      const errMsg =
        error?.response?.data?.message ||
        error.message ||
        "Failed to create grade";
      message.error(errMsg);
    } finally {
      setCreating(false);
    }
  };

  const CreateGradeModal = () => (
    <Modal
      title={
        <div className="flex items-center gap-2 text-cyan-700">
          <PlusOutlined className="!text-cyan-600" />
          <span className="font-semibold text-lg">Create New Grade</span>
        </div>
      }
      open={isModalVisible}
      onCancel={() => setIsModalVisible(false)}
      footer={null}
      width={700}
      className="rounded-xl"
    >
      <Form
        form={createForm}
        layout="vertical"
        onFinish={handleCreate}
        className="mt-6"
      >
        <div className="grid grid-cols-2 gap-6">
          <Form.Item
            name="traineeAssignID"
            label="Trainee Assign ID"
            rules={[
              { required: true, message: "Please input trainee assign ID!" },
            ]}
            className="!text-cyan-700"
          >
            <Input
              placeholder="Enter trainee assign ID"
              className="!border-cyan-500 focus:!border-cyan-500 focus:!ring-1 focus:!ring-cyan-400"
            />
          </Form.Item>

          <Form.Item
            name="subjectId"
            label="Subject"
            rules={[{ required: true, message: "Please select subject!" }]}
            className="!text-cyan-700"
          >
            <Select
              placeholder="Select subject"
              options={subjectList}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              className="!border-cyan-500 focus:!border-cyan-500 focus:!ring-1 focus:!ring-cyan-400"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <Form.Item
            name="participantScore"
            label="Participation Score"
            rules={[
              { required: true, message: "Please input participation score!" },
              {
                type: "number",
                min: 0,
                max: 10,
                message: "Score must be between 0 and 10!",
              },
            ]}
            className="!text-cyan-700"
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              className="w-full !border-cyan-500 focus:!border-cyan-500 focus:!ring-1 focus:!ring-cyan-400 !rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="assignmentScore"
            label="Assignment Score"
            rules={[
              { required: true, message: "Please input assignment score!" },
              {
                type: "number",
                min: 0,
                max: 10,
                message: "Score must be between 0 and 10!",
              },
            ]}
            className="!text-cyan-700"
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              className="w-full !border-cyan-500 focus:!border-cyan-600 focus:!ring-1 focus:!ring-cyan-500 !rounded-md"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <Form.Item
            name="finalExamScore"
            label="Final Exam Score"
            rules={[
              { required: true, message: "Please input final exam score!" },
              {
                type: "number",
                min: 0,
                max: 10,
                message: "Score must be between 0 and 10!",
              },
            ]}
            className="text-cyan-700"
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              className="w-full !border-cyan-500 focus:!border-cyan-600 focus:!ring-1 focus:!ring-cyan-500 !rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="finalResitScore"
            label="Resit Score"
            rules={[
              {
                type: "number",
                min: 0,
                max: 10,
                message: "Score must be between 0 and 10!",
              },
            ]}
            className="!text-cyan-700"
          >
            <InputNumber
              min={0}
              max={10}
              step={0.1}
              className="w-full !border-cyan-500 focus:!border-cyan-600 focus:!ring-1 focus:!ring-cyan-500 !rounded-md"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="remarks"
          label="Remarks"
          className="!text-cyan-700 !mt-4"
        >
          <Input.TextArea
            rows={4}
            placeholder="Enter remarks"
            className="!border-cyan-500 focus:!border-cyan-600 focus:!ring-1 focus:!ring-cyan-500 !rounded-md"
          />
        </Form.Item>

        <Form.Item className="!mb-0 !flex !justify-end !gap-3 !mt-6">
          <Button
            onClick={() => setIsModalVisible(false)}
            className="!text-cyan-600 hover:!text-cyan-800 border !border-cyan-500 hover:!border-cyan-600"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={creating}
            className="!bg-cyan-600 hover:!bg-cyan-700 !border-cyan-600 !ml-2"
          >
            Create Grade
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-100 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        {/* Title and Controls */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <Title
              level={2}
              className="!flex !items-center !text-cyan-700 !mb-4 !md:mb-0"
            >
              <FileExcelOutlined className="!text-3xl !text-cyan-600 !mr-2" />
              Grade List
            </Title>
            <Space size="middle" wrap>
              {isInstructor && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsModalVisible(true)}
                  className="!bg-cyan-600 hover:!bg-cyan-700 !text-white"
                  size="large"
                >
                  Create Grade
                </Button>
              )}
              <Select
                placeholder="Filter by Subject"
                onChange={handleSubjectChange}
                value={selectedSubject}
                style={{ width: 200 }}
                size="large"
                options={[
                  { value: "all", label: "All Subjects" },
                  ...subjectList,
                ]}
                suffixIcon={<FilterOutlined className="!text-cyan-600" />}
                className="rounded-lg"
              />
              <Search
                placeholder="Search by Grade ID, Trainee ID, Full Name, or Subject ID"
                allowClear
                enterButton={
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: "#0891B2", // Tailwind's cyan-800
                      borderColor: "#0891B2",
                    }}
                    icon={<SearchOutlined />}
                  />
                }
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 400 }}
                className="rounded-lg"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchGrades}
                loading={loading}
                type="primary"
                size="large"
                className="!bg-cyan-600 hover:!bg-cyan-700 text-white"
              >
                Refresh
              </Button>
            </Space>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {searchText && (
            <Tag color="cyan" className="text-sm px-3 py-1">
              Search: {searchText}
            </Tag>
          )}
          {selectedSubject !== "all" && (
            <Tag color="cyan" className="text-sm px-3 py-1">
              Subject: {selectedSubject}
            </Tag>
          )}
          {(searchText || selectedSubject !== "all") && (
            <Tag color="cyan" className="text-sm px-3 py-1">
              Found {filteredGrades.length} results
            </Tag>
          )}
        </div>

        {/* Table */}
        <Table
          loading={loading}
          columns={getTableColumns()}
          dataSource={filteredGrades}
          onChange={handleChange}
          pagination={{
            ...pagination,
            total: filteredGrades.length,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} records`,
          }}
          className="shadow-md border border-cyan-400 rounded-xl"
          scroll={{ x: 1500 }}
          bordered
          size="middle"
        />

        {/* Export Buttons for Reviewer */}
        {userRole === "Reviewer" && (
          <div className="mt-6 flex flex-wrap justify-end gap-4">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExportData}
              className="!bg-cyan-600 hover:!bg-cyan-700 !border-0 !text-white"
            >
              Export All Information
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
              onClick={handleExportCourseResults}
              className="!bg-cyan-600 hover:!bg-cyan-700 !border-0 !text-white"
            >
              Export Course Results
            </Button>
          </div>
        )}

        {/* Modal */}
        <CreateGradeModal />
      </div>
    </div>
  );
};

const styles = `
.custom-dropdown .ant-dropdown-menu {
  padding: 4px;
  min-width: 160px;
}

.custom-dropdown .ant-dropdown-menu-item {
  padding: 8px 12px;
  border-radius: 4px;
}

.custom-dropdown .ant-dropdown-menu-item:hover {
  background-color: #f5f5f5;
}

.custom-dropdown .ant-dropdown-menu-item-danger:hover {
  background-color: #fff1f0;
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ViewGradePage;
