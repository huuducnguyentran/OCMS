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
      dataIndex: "traineeAssignID",
      key: "traineeAssignID",
      width: 120,
      sorter: (a, b) => a.traineeAssignID.localeCompare(b.traineeAssignID),
      sortOrder:
        sortedInfo.columnKey === "traineeAssignID" ? sortedInfo.order : null,
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
      render: (status) => (
        <Tag
          color={status === "Pass" ? "success" : "error"}
          className="px-4 py-1"
        >
          {status}
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
                okButtonProps={{ className: "bg-red-500 hover:bg-red-600" }}
              >
                <div className="flex items-center text-red-500">
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
              className="border-none shadow-none hover:bg-gray-100"
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
        const formattedGrades = response.map((grade) => ({
          ...grade,
          key: grade.gradeId,
        }));
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
          traineeAssignID: record.traineeAssignID,
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

  useEffect(() => {
    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <Title level={2} className="text-center mb-8 text-gray-800">
              <FileExcelOutlined className="text-green-600 mr-2" />
              Grade List
            </Title>
            <Space size="large">
              <Select
                placeholder="Filter by Subject"
                onChange={handleSubjectChange}
                value={selectedSubject}
                style={{ width: 200 }}
                options={[
                  { value: "all", label: "All Subjects" },
                  ...subjectList,
                ]}
                suffixIcon={<FilterOutlined />}
                className="rounded-lg"
              />
              <Search
                placeholder="Search by Grade ID, Trainee ID, Full Name, or Subject ID"
                allowClear
                enterButton={<SearchOutlined />}
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
              >
                Refresh
              </Button>
            </Space>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {searchText && (
            <Tag color="blue" className="text-sm px-3 py-1">
              Search: {searchText}
            </Tag>
          )}
          {selectedSubject !== "all" && (
            <Tag color="green" className="text-sm px-3 py-1">
              Subject: {selectedSubject}
            </Tag>
          )}
          {(searchText || selectedSubject !== "all") && (
            <Tag color="blue" className="text-sm px-3 py-1">
              Found {filteredGrades.length} results
            </Tag>
          )}
        </div>

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
          className="shadow-sm"
          scroll={{ x: 1500 }}
          bordered
          size="middle"
        />

        {userRole === "Reviewer" && (
          <div className="mt-6 flex justify-end">
            <div className="flex items-center gap-2 p-5">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleExportData}
                className="bg-green-600 hover:bg-green-700 border-0"
              >
                Export All Information
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                onClick={handleExportCourseResults}
                className="bg-green-600 hover:bg-green-700 border-0"
              >
                Export Course Results
              </Button>
            </div>
          </div>
        )}
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
