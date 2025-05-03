import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Empty,
  Spin,
  Button,
  Typography,
  Breadcrumb,
  Statistic,
  Row,
  Col,
  Divider,
  message,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  BookOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  PlusOutlined,
  MinusOutlined,
  TagOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { trainingPlanService } from "../../services/trainingPlanService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const { Title, Text } = Typography;

const PlanDetailPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [userRole, setUserRole] = useState(sessionStorage.getItem("role"));
  const isHeadMaster = userRole === "HeadMaster";
  const isReviewer = userRole === "Reviewer";
  const contentRef = useRef(null);

  // Log role để debug
  console.log("Current user role on PlanDetailPage:", userRole);
  console.log(
    "All session storage items:",
    Object.keys(sessionStorage).map(
      (key) => `${key}: ${sessionStorage.getItem(key)}`
    )
  );

  useEffect(() => {
    fetchPlanDetails();

    // Kiểm tra và log role người dùng trong useEffect
    const role = sessionStorage.getItem("role");
    console.log("User role from sessionStorage in useEffect:", role);

    // Nếu role khác với state hiện tại, cập nhật lại state
    if (role !== userRole) {
      console.log("Updating userRole state from", userRole, "to", role);
      setUserRole(role);
    }
  }, [planId, userRole]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await trainingPlanService.getTrainingPlanById(planId);
      console.log("Plan details response:", response);

      if (response && response.plan) {
        setPlanDetails(response.plan);
      } else {
        message.error("Could not load plan details");
      }
    } catch (error) {
      console.error("Failed to fetch plan details:", error);
      message.error("Could not load plan details");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getAllSubjects = () => {
    if (!planDetails?.courses) return [];
    return planDetails.courses.flatMap(
      (course) =>
        course.subjects?.map((subject) => ({
          ...subject,
          courseId: course.courseId,
          courseName: course.courseName,
        })) || []
    );
  };

  const getAllSchedules = () => {
    if (!planDetails?.courses) return [];
    return planDetails.courses.flatMap(
      (course) =>
        course.subjects?.flatMap(
          (subject) =>
            subject.trainingSchedules?.map((schedule) => ({
              ...schedule,
              subjectId: subject.subjectId,
              subjectName: subject.subjectName,
              courseId: course.courseId,
              courseName: course.courseName,
            })) || []
        ) || []
    );
  };

  // Hàm xuất PDF
  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      setExportLoading(true);
      message.loading({
        content: "Đang tạo PDF, vui lòng đợi...",
        key: "exportPdf",
      });

      // Lưu trữ các style hiện tại của body để khôi phục sau
      const originalBodyStyle = document.body.style.cssText;

      // Chuẩn bị phần tử để in
      const content = contentRef.current;

      // Clone node để không ảnh hưởng đến UI hiện tại
      const clonedContent = content.cloneNode(true);

      // Tạo container cho clone
      const printContainer = document.createElement("div");
      printContainer.style.position = "absolute";
      printContainer.style.width = "210mm"; // Kích thước giấy A4
      printContainer.style.backgroundColor = "#fff";
      printContainer.style.zIndex = "-9999";
      printContainer.style.visibility = "hidden";
      printContainer.style.overflow = "visible";
      printContainer.appendChild(clonedContent);
      document.body.appendChild(printContainer);

      // Xử lý đặc biệt cho phần header
      const header = printContainer.querySelector(".bg-blue-600");
      if (header) {
        header.style.backgroundColor = "#1890ff";
        header.style.color = "white";
        header.style.padding = "24px 0";
        header.style.marginBottom = "24px";

        // Xử lý title trong header
        const title = header.querySelector("h2");
        if (title) {
          title.style.color = "white";
          title.style.margin = "0 0 8px 0";
          title.style.fontSize = "24px";
          title.style.fontWeight = "bold";
        }

        // Xử lý các nút trong header
        const buttons = header.querySelectorAll("button");
        buttons.forEach((button) => {
          button.style.display = "none"; // Ẩn các nút khi xuất PDF
        });
      }

      // Áp dụng style cho các thẻ trong clone để đảm bảo hiển thị đúng
      const allElements = printContainer.querySelectorAll("*");
      allElements.forEach((el) => {
        // Đảm bảo hiển thị đúng các phần tử
        if (el.style) {
          // Tránh sử dụng màu oklch
          if (window.getComputedStyle(el).background.includes("oklch")) {
            el.style.background = "#fff";
          }
          if (window.getComputedStyle(el).color.includes("oklch")) {
            el.style.color = "#000";
          }

          // Đảm bảo tất cả thẻ sẽ được in
          el.style.display = window.getComputedStyle(el).display;
          el.style.position = window.getComputedStyle(el).position;
          el.style.overflow = "visible";

          // Đảm bảo chiều rộng của các thẻ
          if (el.tagName === "TABLE") {
            el.style.width = "100%";
            el.style.tableLayout = "fixed";
          }
        }
      });

      // Điều chỉnh các thành phần Ant Design
      // Cards
      const cards = printContainer.querySelectorAll(".ant-card");
      cards.forEach((card) => {
        card.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
        card.style.border = "1px solid #f0f0f0";
        card.style.borderRadius = "8px";
        card.style.marginBottom = "16px";
        card.style.background = "#ffffff";
      });

      // Card headers
      const cardHeads = printContainer.querySelectorAll(".ant-card-head");
      cardHeads.forEach((head) => {
        head.style.borderBottom = "1px solid #f0f0f0";
        head.style.padding = "16px 24px";
      });

      // Card bodies
      const cardBodies = printContainer.querySelectorAll(".ant-card-body");
      cardBodies.forEach((body) => {
        body.style.padding = "24px";
      });

      // Tables
      const tables = printContainer.querySelectorAll(".ant-table");
      tables.forEach((table) => {
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
      });

      // Table headers
      const tableHeaders = printContainer.querySelectorAll(
        ".ant-table-thead th"
      );
      tableHeaders.forEach((header) => {
        header.style.background = "#fafafa";
        header.style.fontWeight = "bold";
        header.style.padding = "12px 8px";
        header.style.borderBottom = "1px solid #f0f0f0";
      });

      // Table cells
      const tableCells = printContainer.querySelectorAll(".ant-table-tbody td");
      tableCells.forEach((cell) => {
        cell.style.padding = "12px 8px";
        cell.style.borderBottom = "1px solid #f0f0f0";
      });

      // Tags
      const tags = printContainer.querySelectorAll(".ant-tag");
      tags.forEach((tag) => {
        // Get the original color if possible
        const className = Array.from(tag.classList).find((cls) =>
          cls.startsWith("ant-tag-")
        );
        let bgColor = "#f0f0f0";
        let textColor = "#000000";

        if (className) {
          if (className.includes("blue")) {
            bgColor = "#e6f7ff";
            textColor = "#1890ff";
          } else if (className.includes("green")) {
            bgColor = "#f6ffed";
            textColor = "#52c41a";
          } else if (className.includes("red")) {
            bgColor = "#fff1f0";
            textColor = "#f5222d";
          } else if (className.includes("orange")) {
            bgColor = "#fff7e6";
            textColor = "#fa8c16";
          } else if (className.includes("purple")) {
            bgColor = "#f9f0ff";
            textColor = "#722ed1";
          } else if (className.includes("cyan")) {
            bgColor = "#e6fffb";
            textColor = "#13c2c2";
          }
        }

        tag.style.backgroundColor = bgColor;
        tag.style.color = textColor;
        tag.style.border = `1px solid ${textColor}`;
        tag.style.padding = "2px 8px";
        tag.style.margin = "2px";
        tag.style.borderRadius = "4px";
        tag.style.fontSize = "12px";
        tag.style.display = "inline-block";
      });

      // Statistics
      const statistics = printContainer.querySelectorAll(".ant-statistic");
      statistics.forEach((stat) => {
        const title = stat.querySelector(".ant-statistic-title");
        const content = stat.querySelector(".ant-statistic-content");

        if (title) {
          title.style.fontSize = "14px";
          title.style.color = "#8c8c8c";
        }

        if (content) {
          content.style.fontSize = "24px";
          content.style.fontWeight = "bold";
        }
      });

      // Thiết lập các thuộc tính html2canvas
      const canvas = await html2canvas(printContainer, {
        scale: 2, // Tăng độ phân giải
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 30000,
        windowWidth: 1024,
        windowHeight: 768,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Thêm style để đảm bảo bố cục đúng trên PDF
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            * { 
              -webkit-print-color-adjust: exact !important; 
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body { margin: 0; padding: 0; }
            .ant-card { page-break-inside: avoid; }
            .ant-table-wrapper { page-break-inside: avoid; }
            .ant-table { width: 100% !important; }
            @media print {
              .ant-tag { 
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      // Dọn dẹp
      document.body.removeChild(printContainer);
      document.body.style.cssText = originalBodyStyle;

      // Tạo PDF với chất lượng cao hơn
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight;

      // Thêm các trang tiếp theo nếu cần
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          "FAST"
        );
        heightLeft -= pageHeight;
        page++;
      }

      // Tên file dựa trên tên kế hoạch đào tạo
      const fileName = `training-plan-${planDetails?.planId || "export"}.pdf`;
      pdf.save(fileName);

      message.success({
        content: "PDF đã được tạo thành công!",
        key: "exportPdf",
      });
    } catch (error) {
      console.error("Lỗi khi xuất PDF:", error);
      message.error({
        content: "Có lỗi xảy ra khi tạo PDF: " + error.message,
        key: "exportPdf",
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Spin size="large" />
          <Text className="block mt-4 text-gray-600">
            Loading plan details...
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(isHeadMaster ? "/request" : "/plan")}
                className="flex items-center bg-white/10 border-white/20 text-white hover:bg-white/20"
                ghost
              >
                {isHeadMaster ? "Back to Requests" : "Back to Plans"}
              </Button>
              <Breadcrumb className="text-white/60">
                <Breadcrumb.Item>
                  <a
                    href={isHeadMaster ? "/requests" : "/plan"}
                    className="text-white/60 hover:text-white"
                  >
                    {isHeadMaster ? "Requests" : "Plans"}
                  </a>
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-white">
                  Details
                </Breadcrumb.Item>
              </Breadcrumb>
            </div>
            {(isReviewer) && (
              <Tooltip title="Export PDF">
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={handleExportPDF}
                  loading={exportLoading}
                  style={{ background: "#f5222d", borderColor: "#f5222d" }}
                >
                  {exportLoading ? "Exporting..." : "Export PDF"}
                </Button>
              </Tooltip>
            )}
          </div>

          <Title level={2} className="text-white mb-2">
            {planDetails?.planName || "Training Plan Details"}
          </Title>
          <Text className="text-white/80">Plan ID: {planDetails?.planId}</Text>
        </div>
      </div>

      <div
        ref={contentRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Total Courses"
                value={planDetails?.courses?.length || 0}
                prefix={<BookOutlined className="text-blue-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Total Subjects"
                value={getAllSubjects().length}
                prefix={<TeamOutlined className="text-green-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Total Schedules"
                value={getAllSchedules().length}
                prefix={<ClockCircleOutlined className="text-purple-500" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              bordered={false}
              className="h-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Statistic
                title="Specialty"
                value={planDetails?.specialtyId || "N/A"}
                prefix={<TagOutlined className="text-indigo-500" />}
              />
            </Card>
          </Col>
        </Row>

        {/* Basic Information */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-blue-500" />
              <span>Basic Information</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Plan Level</Text>
                  <Tag color="blue" className="mt-1 text-base px-3 py-1">
                    {planDetails?.planLevel || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">Start Date</Text>
                  <Text strong className="text-base">
                    {planDetails?.startDate
                      ? new Date(planDetails.startDate).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-500 block">Specialty ID</Text>
                  <Tag color="cyan" className="mt-1 text-base px-3 py-1">
                    {planDetails?.specialtyId || "N/A"}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="space-y-4">
                <div>
                  <Text className="text-gray-500 block">Status</Text>
                  <Tag
                    color={
                      planDetails?.trainingPlanStatus === "Approved"
                        ? "green"
                        : "orange"
                    }
                    className="mt-1 text-base px-3 py-1"
                  >
                    {planDetails?.trainingPlanStatus || "N/A"}
                  </Tag>
                </div>
                <div>
                  <Text className="text-gray-500 block">End Date</Text>
                  <Text strong className="text-base">
                    {planDetails?.endDate
                      ? new Date(planDetails.endDate).toLocaleDateString()
                      : "N/A"}
                  </Text>
                </div>
                <div>
                  <Text className="text-gray-500 block">Created By</Text>
                  <Text strong className="text-base">
                    {planDetails?.createByUserId || "N/A"}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={24}>
              <Divider orientation="left">Description</Divider>
              <Text className="text-base">
                {planDetails?.desciption || "No description available"}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Courses Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <BookOutlined className="text-green-500" />
              <span>Courses</span>
            </div>
          }
          className="mb-8 shadow-sm hover:shadow-md transition-shadow"
        >
          {planDetails?.courses?.length > 0 ? (
            <Table
              dataSource={planDetails.courses}
              columns={[
                {
                  title: "Course ID",
                  dataIndex: "courseId",
                  key: "courseId",
                  width: "15%",
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: "Course Name",
                  dataIndex: "courseName",
                  key: "courseName",
                  width: "25%",
                },
                {
                  title: "Level",
                  dataIndex: "courseLevel",
                  key: "courseLevel",
                  width: "15%",
                  render: (level) => <Tag color="blue">{level || "N/A"}</Tag>,
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                  render: (status) => (
                    <Tag color={status === "Approved" ? "green" : "default"}>
                      {status || "N/A"}
                    </Tag>
                  ),
                },
                {
                  title: "Progress",
                  dataIndex: "progress",
                  key: "progress",
                  render: (progress) => (
                    <Tag color={progress === "NotYet" ? "orange" : "green"}>
                      {progress || "N/A"}
                    </Tag>
                  ),
                },
              ]}
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    dataSource={record.subjects || []}
                    columns={[
                      {
                        title: "Subject ID",
                        dataIndex: "subjectId",
                        key: "subjectId",
                        width: "15%",
                        render: (text) => <Text strong>{text}</Text>,
                      },
                      {
                        title: "Subject Name",
                        dataIndex: "subjectName",
                        key: "subjectName",
                        width: "25%",
                      },
                      {
                        title: "Credits",
                        dataIndex: "credits",
                        key: "credits",
                        width: "10%",
                        render: (credits) => (
                          <Tag color="blue">{credits || "N/A"}</Tag>
                        ),
                      },
                      {
                        title: "Passing Score",
                        dataIndex: "passingScore",
                        key: "passingScore",
                        width: "15%",
                        render: (score) => (
                          <Tag color="green">{score || "N/A"}</Tag>
                        ),
                      },
                      {
                        title: "Instructor",
                        key: "instructor",
                        width: "15%",
                        render: (_, record) => {
                          const instructor = record.instructors?.[0];
                          return instructor ? (
                            <Tag color="purple">{instructor.instructorId}</Tag>
                          ) : (
                            <Tag color="default">No Instructor</Tag>
                          );
                        },
                      },
                      {
                        title: "Schedules",
                        key: "schedules",
                        width: "20%",
                        render: (_, record) => (
                          <div className="space-y-1">
                            {record.trainingSchedules?.map(
                              (schedule, index) => (
                                <Tag key={index} color="cyan">
                                  {schedule.classTime} - {schedule.daysOfWeek}
                                </Tag>
                              )
                            ) || <Tag color="default">No Schedule</Tag>}
                          </div>
                        ),
                      },
                    ]}
                    pagination={false}
                    size="small"
                    rowKey="subjectId"
                    className="bg-gray-50 rounded-lg"
                  />
                ),
                expandIcon: ({ expanded, onExpand, record }) =>
                  expanded ? (
                    <Button
                      icon={<MinusOutlined />}
                      onClick={(e) => onExpand(record, e)}
                      type="text"
                      className="text-blue-500"
                    ></Button>
                  ) : (
                    <Button
                      icon={<PlusOutlined />}
                      onClick={(e) => onExpand(record, e)}
                      type="text"
                      className="text-gray-500 hover:text-blue-500"
                    ></Button>
                  ),
              }}
              size="middle"
              pagination={false}
              rowKey="courseId"
              className="shadow-sm"
            />
          ) : (
            <Empty description="No courses assigned" />
          )}
        </Card>

        {/* Training Schedules Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <ScheduleOutlined className="text-indigo-500" />
              <span>Training Schedules</span>
            </div>
          }
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          {getAllSchedules().length > 0 ? (
            <Table
              dataSource={getAllSchedules()}
              columns={[
                {
                  title: "Schedule ID",
                  dataIndex: "scheduleID",
                  key: "scheduleID",
                  width: "15%",
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: "Subject",
                  key: "subject",
                  width: "25%",
                  render: (_, record) => (
                    <div>
                      <Text strong>{record.subjectName}</Text>
                      <Text className="block text-xs text-gray-500">
                        {record.subjectId}
                      </Text>
                    </div>
                  ),
                },
                {
                  title: "Time",
                  key: "time",
                  width: "20%",
                  render: (_, record) => (
                    <div className="space-y-1">
                      <Text strong>{record.classTime}</Text>
                      <Tag color="blue" className="block w-fit">
                        {record.daysOfWeek}
                      </Tag>
                      <Text className="block text-xs text-gray-500">
                        Duration: {record.subjectPeriod}
                      </Text>
                    </div>
                  ),
                },
                {
                  title: "Location",
                  key: "location",
                  width: "20%",
                  render: (_, record) => (
                    <div>
                      <Text strong>Room: {record.room}</Text>
                      <Text className="block text-xs text-gray-500">
                        {record.location}
                      </Text>
                    </div>
                  ),
                },
                {
                  title: "Status",
                  key: "status",
                  width: "10%",
                  render: (_, record) => (
                    <Tag
                      color={record.status === "Incoming" ? "blue" : "default"}
                    >
                      {record.status}
                    </Tag>
                  ),
                },
                {
                  title: "Instructor",
                  dataIndex: "instructorID",
                  key: "instructor",
                  width: "10%",
                  render: (instructorId) => (
                    <Tag color="purple">{instructorId || "N/A"}</Tag>
                  ),
                },
              ]}
              size="middle"
              pagination={false}
              rowKey="scheduleID"
              className="shadow-sm"
            />
          ) : (
            <Empty description="No schedules assigned" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default PlanDetailPage;
