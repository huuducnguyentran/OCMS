import React, { useState } from 'react';
import {
  Layout,
  Typography,
  Collapse,
  List,
  Tag,
  Card,
  Tabs,
  Alert,
  Space,
  Button,
  Tooltip,
  Divider,
  Badge,
  Modal,
  Table,
  Image,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import {
  SafetyCertificateOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FileProtectOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  MedicineBoxOutlined,
  ToolOutlined,
  GlobalOutlined,
  BookOutlined,
  InfoCircleOutlined,
  SendOutlined,
  ShoppingOutlined,
  ShopOutlined,
  DownloadOutlined,
  RightOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, TableCell, TableRow, TextRun, HeadingLevel, AlignmentType, BorderStyle, WidthType } from 'docx';
import { saveAs } from 'file-saver';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const RegulationsPage = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState(null);

  const specializations = [
    {
      code: "SPEC-001-GO-001-FD-001",
      title: "Flight Dispatch",
      icon: <SendOutlined className="text-blue-500" />,
      color: "blue",
      regulations: [
        {
          title: "Quy định Chung",
          items: [
            "Tuân thủ các quy định của ICAO về kế hoạch bay",
            "Đảm bảo an toàn trong điều phối chuyến bay",
            "Kiểm tra và cập nhật thông tin thời tiết liên tục"
          ]
        },
        {
          title: "Yêu cầu Chuyên môn",
          items: [
            "Chứng chỉ Flight Dispatcher được cấp phép",
            "Kinh nghiệm tối thiểu 2 năm trong ngành",
            "Khả năng giao tiếp tiếng Anh chuyên ngành"
          ]
        },
        {
          title: "Trách nhiệm",
          items: [
            "Lập và theo dõi kế hoạch bay",
            "Phối hợp với phi hành đoàn",
            "Giám sát điều kiện thời tiết và đường bay"
          ]
        }
      ]
    },
    {
      code: "SPEC-001-GO-001-BAC-002",
      title: "Baggage and Cargo Services",
      icon: <ShoppingOutlined className="text-orange-500" />,
      color: "orange",
      regulations: [
        {
          title: "Quy định Vận chuyển",
          items: [
            "Tuân thủ quy định về hàng hóa nguy hiểm",
            "Quy trình xử lý hành lý đặc biệt",
            "Tiêu chuẩn đóng gói và bảo quản"
          ]
        },
        {
          title: "An toàn và An ninh",
          items: [
            "Kiểm tra an ninh hành lý và hàng hóa",
            "Quy trình xử lý sự cố thất lạc",
            "Bảo đảm an toàn kho bãi"
          ]
        }
      ]
    },
    {
      code: "CC-SAE-001",
      title: "Safety and Emergency Procedures",
      icon: <SafetyOutlined className="text-red-500" />,
      color: "red",
      regulations: [
        {
          title: "Quy trình Khẩn cấp",
          items: [
            "Quy trình sơ tán khẩn cấp",
            "Xử lý tình huống khẩn cấp trên không",
            "Phối hợp với đội cứu hộ mặt đất"
          ]
        },
        {
          title: "Huấn luyện An toàn",
          items: [
            "Đào tạo an toàn định kỳ",
            "Thực hành tình huống khẩn cấp",
            "Cập nhật quy trình an toàn mới"
          ]
        }
      ]
    },
    {
      code: "SPEC-001-HRI-001",
      title: "Human Resources in Aviation",
      icon: <TeamOutlined className="text-green-500" />,
      color: "green",
      regulations: [
        {
          title: "Tuyển dụng và Đào tạo",
          items: [
            "Quy trình tuyển dụng nhân sự hàng không",
            "Chương trình đào tạo chuyên môn",
            "Đánh giá năng lực định kỳ"
          ]
        },
        {
          title: "Phát triển Nghề nghiệp",
          items: [
            "Lộ trình thăng tiến",
            "Chính sách đãi ngộ",
            "Đào tạo nâng cao"
          ]
        }
      ]
    },
    {
      code: "SPEC-001-AMA-002",
      title: "Airline Marketing and Sales",
      icon: <ShopOutlined className="text-purple-500" />,
      color: "purple",
      regulations: [
        {
          title: "Chiến lược Marketing",
          items: [
            "Xây dựng kế hoạch marketing",
            "Phát triển sản phẩm dịch vụ",
            "Quản lý thương hiệu"
          ]
        },
        {
          title: "Quy định Bán hàng",
          items: [
            "Chính sách giá và khuyến mãi",
            "Quy trình đặt vé và thanh toán",
            "Chăm sóc khách hàng"
          ]
        }
      ]
    }
  ];

  const certificateTypes = [
    {
      title: "Chứng chỉ Phi công Vận tải Hàng không (ATPL)",
      icon: <ThunderboltOutlined className="text-yellow-500" />,
      requirements: [
        "Tối thiểu 1500 giờ bay tích lũy",
        "Hoàn thành chương trình đào tạo ATPL được phê duyệt",
        "Đạt các bài kiểm tra lý thuyết ATPL",
        "Đạt kiểm tra thực hành theo tiêu chuẩn",
        "Có chứng chỉ sức khỏe loại 1 còn hiệu lực",
        "Đạt trình độ tiếng Anh ICAO cấp độ 4 trở lên"
      ],
      validity: "24 tháng",
      notes: [
        "Phải duy trì đủ giờ bay theo quy định để giữ hiệu lực",
        "Yêu cầu kiểm tra định kỳ mỗi 12 tháng"
      ]
    },
    {
      title: "Chứng chỉ Phi công Thương mại (CPL)",
      icon: <GlobalOutlined className="text-blue-500" />,
      requirements: [
        "Tối thiểu 250 giờ bay tích lũy",
        "Hoàn thành chương trình đào tạo CPL được phê duyệt",
        "Đạt các bài kiểm tra lý thuyết CPL",
        "Đạt kiểm tra thực hành theo tiêu chuẩn",
        "Có chứng chỉ sức khỏe loại 1 còn hiệu lực"
      ],
      validity: "24 tháng",
      notes: [
        "Cần hoàn thành đào tạo bổ sung để nâng cấp lên ATPL",
        "Yêu cầu kiểm tra định kỳ mỗi 12 tháng"
      ]
    },
    {
      title: "Chứng chỉ Kỹ thuật Bay (Flight Engineer)",
      icon: <ToolOutlined className="text-purple-500" />,
      requirements: [
        "Tốt nghiệp chương trình đào tạo kỹ thuật bay",
        "Tối thiểu 100 giờ thực hành trên tàu bay",
        "Đạt các bài kiểm tra lý thuyết chuyên ngành",
        "Có chứng chỉ sức khỏe loại 2 trở lên"
      ],
      validity: "24 tháng",
      notes: [
        "Yêu cầu cập nhật kiến thức kỹ thuật định kỳ",
        "Phải duy trì số giờ thực hành tối thiểu hàng năm"
      ]
    }
  ];

  // Style cho các thẻ severity
  const severityStyles = {
    critical: {
      color: 'red',
      backgroundColor: '#fff1f0',
      border: '1px solid #ffa39e',
      icon: <WarningOutlined className="text-red-500" />
    },
    high: {
      color: 'orange',
      backgroundColor: '#fff7e6',
      border: '1px solid #ffd591',
      icon: <WarningOutlined className="text-orange-500" />
    },
    medium: {
      color: 'blue',
      backgroundColor: '#e6f7ff',
      border: '1px solid #91d5ff',
      icon: <InfoCircleOutlined className="text-blue-500" />
    }
  };

  // Components
  const RuleCard = ({ rule, detail, severity }) => (
    <Card 
      className="w-full hover:shadow-lg transition-all duration-300 border-l-4"
      style={{ borderLeftColor: severityStyles[severity].color }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Space>
            {severityStyles[severity].icon}
            <Text strong className="text-lg">{rule}</Text>
          </Space>
          <Tag 
            style={{
              backgroundColor: severityStyles[severity].backgroundColor,
              color: severityStyles[severity].color,
              border: severityStyles[severity].border
            }}
          >
            {severity.toUpperCase()}
          </Tag>
        </div>
        <List
          dataSource={detail}
          renderItem={item => (
            <List.Item className="py-2">
              <Space>
                <CheckCircleOutlined className="text-green-500" />
                <Text>{item}</Text>
              </Space>
            </List.Item>
          )}
          split={false}
        />
      </div>
    </Card>
  );

  const CertificateCard = ({ certificate }) => (
    <Card 
      className="mb-6 hover:shadow-xl transition-all duration-300"
      title={
        <Space>
          {certificate.icon}
          <span>{certificate.title}</span>
        </Space>
      }
      extra={
        <Tag color="blue" className="px-3 py-1">
          <ClockCircleOutlined className="mr-1" />
          {certificate.validity}
        </Tag>
      }
    >
      <Space direction="vertical" className="w-full">
        <div>
          <Title level={5}>Yêu cầu:</Title>
          <List
            dataSource={certificate.requirements}
            renderItem={req => (
              <List.Item>
                <Space>
                  <CheckCircleOutlined className="text-green-500" />
                  <Text>{req}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
        
        <Divider />
        
        <div>
          <Title level={5}>Lưu ý quan trọng:</Title>
          <List
            dataSource={certificate.notes}
            renderItem={note => (
              <List.Item>
                <Space>
                  <WarningOutlined className="text-orange-500" />
                  <Text>{note}</Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  );

  const SpecializationCard = ({ specialization }) => (
    <Card 
      className="mb-6 hover:shadow-xl transition-all duration-300"
      title={
        <Space>
          {specialization.icon}
          <span className="font-semibold">{specialization.title}</span>
        </Space>
      }
      extra={
        <Tag color={specialization.color}>{specialization.code}</Tag>
      }
    >
      <Space direction="vertical" className="w-full">
        <Collapse ghost>
          {specialization.regulations.map((regulation, index) => (
            <Panel 
              header={
                <Space>
                  <BookOutlined className={`text-${specialization.color}-500`} />
                  <Text strong>{regulation.title}</Text>
                </Space>
              }
              key={index}
            >
              <List
                dataSource={regulation.items}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <CheckCircleOutlined className={`text-${specialization.color}-500`} />
                      <Text>{item}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>
        
        <Divider />
        
        <div className="flex justify-end gap-2">
          <Button 
            type="default"
            icon={<FilePdfOutlined />}
            onClick={() => showPdfModal(specialization.code)}
            className={`border-${specialization.color}-500 text-${specialization.color}-500`}
          >
            Xem chi tiết
          </Button>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              try {
                handleDownloadWord(specialization.code);
              } catch (error) {
                console.error('Lỗi khi tải Word:', error);
                message.error('Có lỗi xảy ra khi tải tài liệu. Vui lòng thử lại sau.');
              }
            }}
          >
            Tải về Word
          </Button>
        </div>
      </Space>
    </Card>
  );

  const items = [
    {
      key: '1',
      label: (
        <span className="text-base">
          <SafetyOutlined className="mr-2" />
          Quy định An toàn
        </span>
      ),
      children: (
        <Space direction="vertical" className="w-full">
          <Alert
            message="Lưu ý Quan trọng"
            description="Các quy định này được cập nhật theo tiêu chuẩn hàng không mới nhất của ICAO và Cục Hàng không Việt Nam. Việc tuân thủ nghiêm ngặt là bắt buộc để đảm bảo an toàn."
            type="warning"
            showIcon
            className="mb-6"
          />
          
          {specializations.map((spec, index) => (
            <SpecializationCard key={index} specialization={spec} />
          ))}
        </Space>
      ),
    },
    {
      key: '2',
      label: (
        <span className="text-base">
          <SafetyCertificateOutlined className="mr-2" />
          Chứng chỉ Hàng không
        </span>
      ),
      children: (
        <Space direction="vertical" className="w-full">
          <Alert
            message="Hệ thống Chứng chỉ Số"
            description="Tất cả chứng chỉ được cấp dưới dạng số và được xác thực bằng chữ ký số của Cục Hàng không Việt Nam."
            type="info"
            showIcon
            className="mb-6"
          />
          
          {certificateTypes.map((cert, index) => (
            <CertificateCard key={index} certificate={cert} />
          ))}
        </Space>
      ),
    }
  ];

  const specializationDetails = {
    "SPEC-001-GO-001-FD-001": {
      fullTitle: "Flight Dispatch - Điều phái bay",
      description: "Chương trình đào tạo chuyên sâu về điều phái và quản lý bay, đáp ứng tiêu chuẩn IATA và ICAO.",
      duration: "2 năm",
      credits: 120,
      certification: "Chứng chỉ Điều phái bay quốc tế",
      subjects: [
        {
          name: "Cơ sở Điều phái bay",
          credits: 4,
          description: "Các nguyên tắc cơ bản về điều phái bay"
        },
        {
          name: "Khí tượng Hàng không",
          credits: 3,
          description: "Phân tích và dự báo thời tiết hàng không"
        },
        {
          name: "Kế hoạch bay",
          credits: 4,
          description: "Lập và quản lý kế hoạch bay"
        },
        {
          name: "An toàn bay",
          credits: 3,
          description: "Quy trình và quy định an toàn bay"
        }
      ],
      requirements: [
        "Tốt nghiệp THPT hoặc tương đương",
        "Đạt yêu cầu về sức khỏe",
        "Tiếng Anh IELTS 5.5 hoặc tương đương",
        "Pass phỏng vấn đầu vào"
      ],
      careerOpportunities: [
        "Nhân viên điều phái bay tại các hãng hàng không",
        "Chuyên viên kế hoạch bay",
        "Điều phối viên trung tâm điều hành bay",
        "Chuyên viên quản lý hoạt động bay"
      ]
    },
    "SPEC-001-GO-001-BAC-002": {
      fullTitle: "Baggage and Cargo Services - Dịch vụ Hành lý và Hàng hóa",
      description: "Chương trình đào tạo về quản lý và xử lý hành lý, hàng hóa trong ngành hàng không.",
      duration: "2 năm",
      credits: 90,
      certification: "Chứng chỉ Quản lý Hàng hóa Hàng không",
      subjects: [
        {
          name: "Quy trình Xử lý Hành lý",
          credits: 3,
          description: "Quy trình và tiêu chuẩn xử lý hành lý"
        },
        {
          name: "Quản lý Hàng hóa Nguy hiểm",
          credits: 4,
          description: "Quy định và xử lý hàng hóa nguy hiểm"
        },
        {
          name: "Hệ thống Quản lý Hành lý",
          credits: 3,
          description: "Sử dụng phần mềm và hệ thống quản lý"
        },
        {
          name: "Logistics Hàng không",
          credits: 3,
          description: "Quản lý chuỗi cung ứng trong vận tải hàng không"
        },
        {
          name: "An toàn Kho bãi",
          credits: 3,
          description: "Quy trình đảm bảo an toàn trong kho bãi hàng hóa"
        }
      ],
      requirements: [
        "Tốt nghiệp THPT hoặc tương đương",
        "Sức khỏe tốt, có khả năng làm việc ca",
        "Kỹ năng tổ chức và quản lý tốt",
        "Tiếng Anh giao tiếp cơ bản"
      ],
      careerOpportunities: [
        "Nhân viên điều phối hành lý",
        "Chuyên viên quản lý kho hàng hóa",
        "Giám sát viên dịch vụ mặt đất",
        "Chuyên viên logistics hàng không",
        "Quản lý dịch vụ hành khách"
      ]
    },
    "SPEC-001-HRI-001": {
      fullTitle: "Human Resources in Aviation - Quản trị Nhân lực Hàng không",
      description: "Chương trình đào tạo chuyên sâu về quản lý nguồn nhân lực trong ngành hàng không, tập trung vào các kỹ năng quản lý, tuyển dụng và phát triển nhân tài.",
      duration: "2 năm",
      credits: 95,
      certification: "Chứng chỉ Quản trị Nhân lực Hàng không",
      subjects: [
        {
          name: "Quản trị Nhân lực Hàng không",
          credits: 4,
          description: "Các nguyên tắc và phương pháp quản lý nhân sự trong môi trường hàng không"
        },
        {
          name: "Tuyển dụng và Đào tạo",
          credits: 3,
          description: "Quy trình tuyển dụng và đào tạo nhân viên hàng không"
        },
        {
          name: "Luật Lao động Hàng không",
          credits: 3,
          description: "Các quy định pháp lý về lao động trong ngành hàng không"
        },
        {
          name: "Phát triển Tổ chức",
          credits: 3,
          description: "Chiến lược phát triển và quản lý thay đổi trong tổ chức"
        },
        {
          name: "Quản lý Hiệu suất",
          credits: 3,
          description: "Đánh giá và nâng cao hiệu suất làm việc"
        }
      ],
      requirements: [
        "Tốt nghiệp THPT hoặc tương đương",
        "Điểm trung bình học tập ≥ 7.0",
        "Tiếng Anh IELTS 5.5 hoặc tương đương",
        "Kỹ năng giao tiếp tốt"
      ],
      careerOpportunities: [
        "Chuyên viên nhân sự tại các hãng hàng không",
        "Quản lý đào tạo và phát triển",
        "Chuyên viên tuyển dụng hàng không",
        "Quản lý nhân sự cấp cao",
        "Tư vấn nhân sự hàng không"
      ]
    },
    "SPEC-001-AMA-002": {
      fullTitle: "Airline Marketing and Sales - Marketing và Kinh doanh Hàng không",
      description: "Chương trình đào tạo về marketing và bán hàng trong ngành hàng không, tập trung vào chiến lược kinh doanh và phát triển thị trường.",
      duration: "2 năm",
      credits: 100,
      certification: "Chứng chỉ Marketing và Kinh doanh Hàng không",
      subjects: [
        {
          name: "Marketing Hàng không",
          credits: 4,
          description: "Chiến lược và kỹ thuật marketing trong ngành hàng không"
        },
        {
          name: "Quản lý Doanh thu",
          credits: 3,
          description: "Tối ưu hóa doanh thu và định giá vé máy bay"
        },
        {
          name: "Digital Marketing",
          credits: 3,
          description: "Marketing số và thương mại điện tử trong hàng không"
        },
        {
          name: "Quản lý Quan hệ Khách hàng",
          credits: 3,
          description: "Xây dựng và duy trì quan hệ khách hàng"
        },
        {
          name: "Phân tích Thị trường",
          credits: 3,
          description: "Nghiên cứu và phân tích thị trường hàng không"
        }
      ],
      requirements: [
        "Tốt nghiệp THPT hoặc tương đương",
        "Điểm trung bình học tập ≥ 7.0",
        "Tiếng Anh IELTS 6.0 hoặc tương đương",
        "Kỹ năng phân tích và sáng tạo tốt"
      ],
      careerOpportunities: [
        "Chuyên viên marketing hàng không",
        "Quản lý bán hàng và doanh thu",
        "Chuyên viên phát triển sản phẩm",
        "Quản lý thương hiệu hàng không",
        "Chuyên viên quan hệ khách hàng",
        "Quản lý chiến lược kinh doanh"
      ]
    },
    "CC-SAE-001": {
      fullTitle: "Safety and Emergency Procedures - Quy trình An toàn và Khẩn cấp",
      description: "Chương trình đào tạo chuyên sâu về quy trình an toàn và xử lý tình huống khẩn cấp trong ngành hàng không, đáp ứng các tiêu chuẩn quốc tế về an toàn hàng không.",
      duration: "1.5 năm",
      credits: 85,
      certification: "Chứng chỉ An toàn và Khẩn cấp Hàng không",
      subjects: [
        {
          name: "An toàn Hàng không Cơ bản",
          credits: 4,
          description: "Nguyên tắc và quy định an toàn hàng không cơ bản"
        },
        {
          name: "Quy trình Khẩn cấp",
          credits: 4,
          description: "Các quy trình xử lý tình huống khẩn cấp trên không và mặt đất"
        },
        {
          name: "An ninh Hàng không",
          credits: 3,
          description: "Biện pháp đảm bảo an ninh trong hoạt động hàng không"
        },
        {
          name: "Quản lý Khủng hoảng",
          credits: 3,
          description: "Kỹ năng quản lý và xử lý các tình huống khủng hoảng"
        },
        {
          name: "Điều tra Sự cố",
          credits: 3,
          description: "Phương pháp điều tra và phân tích sự cố hàng không"
        }
      ],
      requirements: [
        "Tốt nghiệp THPT hoặc tương đương",
        "Sức khỏe tốt, không mắc các bệnh về tim mạch",
        "Khả năng làm việc dưới áp lực cao",
        "Tiếng Anh IELTS 5.5 hoặc tương đương"
      ],
      careerOpportunities: [
        "Chuyên viên an toàn hàng không",
        "Điều phối viên khẩn cấp",
        "Giám sát viên an toàn sân bay",
        "Chuyên gia đánh giá rủi ro an toàn",
        "Huấn luyện viên an toàn hàng không"
      ],
      additionalInfo: {
        facilities: [
          "Phòng mô phỏng tình huống khẩn cấp",
          "Thiết bị huấn luyện an toàn tiên tiến",
          "Trung tâm đào tạo thực hành"
        ],
        partnerships: [
          "Hợp tác với các hãng hàng không lớn",
          "Liên kết đào tạo quốc tế",
          "Thực tập tại các sân bay quốc tế"
        ]
      }
    }
  };

  const showPdfModal = (specializationCode) => {
    const specData = specializationDetails[specializationCode];
    if (specData) {
      setSelectedSpecialization({
        ...specData,
        code: specializationCode
      });
      setIsModalVisible(true);
    }
  };

  const PdfContent = ({ data }) => {
    if (!data) return null;

    return (
      <div className="pdf-content p-6">
        <div className="text-center mb-8">
          <Title level={2}>{data.fullTitle}</Title>
          <Text type="secondary" className="text-lg">Mã ngành: {data.code}</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card className="info-card">
              <Title level={4}>Tổng quan</Title>
              <Paragraph>{data.description}</Paragraph>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Thời gian đào tạo" value={data.duration} />
                </Col>
                <Col span={12}>
                  <Statistic title="Tín chỉ" value={data.credits} />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Chương trình học" className="course-card">
              <Table
                dataSource={data.subjects}
                columns={[
                  {
                    title: 'Môn học',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Tín chỉ',
                    dataIndex: 'credits',
                    key: 'credits',
                    width: 100,
                  },
                  {
                    title: 'Mô tả',
                    dataIndex: 'description',
                    key: 'description',
                  }
                ]}
                pagination={false}
              />
            </Card>
          </Col>

          {data.requirements && (
            <Col span={12}>
              <Card title="Yêu cầu đầu vào" className="requirements-card">
                <List
                  dataSource={data.requirements}
                  renderItem={item => (
                    <List.Item>
                      <CheckCircleOutlined className="text-green-500 mr-2" />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          )}

          {data.careerOpportunities && (
            <Col span={12}>
              <Card title="Cơ hội nghề nghiệp" className="career-card">
                <List
                  dataSource={data.careerOpportunities}
                  renderItem={item => (
                    <List.Item>
                      <RightOutlined className="text-blue-500 mr-2" />
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  const handleDownloadWord = async (specializationCode) => {
    try {
      const data = specializationDetails[specializationCode];
      if (!data) {
        message.error('Không tìm thấy thông tin ngành học');
        return;
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'HỌC VIỆN HÀNG KHÔNG VIỆT NAM',
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: data.fullTitle,
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Mã ngành: ${specializationCode}`,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'THÔNG TIN CHƯƠNG TRÌNH',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: {
                before: 400,
                after: 200,
              },
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Thời gian đào tạo: ',
                  bold: true,
                }),
                new TextRun(data.duration),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Số tín chỉ: ',
                  bold: true,
                }),
                new TextRun(data.credits.toString()),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Chứng chỉ: ',
                  bold: true,
                }),
                new TextRun(data.certification),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'MÔ TẢ CHƯƠNG TRÌNH',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: {
                before: 400,
                after: 200,
              },
            }),

            new Paragraph({
              children: [
                new TextRun(data.description),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'CHƯƠNG TRÌNH HỌC',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: {
                before: 400,
                after: 200,
              },
            }),

            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Môn học', bold: true })],
                      })],
                      width: {
                        size: 30,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Tín chỉ', bold: true })],
                      })],
                      width: {
                        size: 15,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: 'Mô tả', bold: true })],
                      })],
                      width: {
                        size: 55,
                        type: WidthType.PERCENTAGE,
                      },
                    }),
                  ],
                }),
                ...data.subjects.map(subject =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(subject.name)],
                      }),
                      new TableCell({
                        children: [new Paragraph(subject.credits.toString())],
                      }),
                      new TableCell({
                        children: [new Paragraph(subject.description)],
                      }),
                    ],
                  }),
                ),
              ],
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'YÊU CẦU ĐẦU VÀO',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: {
                before: 400,
                after: 200,
              },
            }),

            ...data.requirements.map(req =>
              new Paragraph({
                children: [
                  new TextRun(`• ${req}`),
                ],
                spacing: {
                  before: 100,
                },
              }),
            ),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'CƠ HỘI NGHỀ NGHIỆP',
                  bold: true,
                  size: 28,
                }),
              ],
              spacing: {
                before: 400,
                after: 200,
              },
            }),

            ...data.careerOpportunities.map(opp =>
              new Paragraph({
                children: [
                  new TextRun(`• ${opp}`),
                ],
                spacing: {
                  before: 100,
                },
              }),
            ),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`,
                  size: 20,
                }),
              ],
              spacing: {
                before: 400,
              },
            }),
          ],
        }],
      });

      // Tạo và tải xuống file
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${specializationCode}-ThongTinNganh.docx`);
      message.success('Tải tài liệu thành công!');

    } catch (error) {
      console.error('Lỗi khi tạo Word:', error);
      message.error('Có lỗi xảy ra khi tạo tài liệu. Vui lòng thử lại sau.');
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <Card className="mb-6 shadow-lg border-none">
          <Space direction="vertical" className="w-full">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full shadow-lg">
                <SafetyCertificateOutlined className="text-4xl text-blue-500" />
              </div>
              <div>
                <Title level={2} className="!mb-0">Quy định Chuyên ngành Hàng không</Title>
                <Text className="text-gray-500">
                  Hệ thống quản lý quy định và tiêu chuẩn đào tạo của Học viện Hàng không Việt Nam
                </Text>
              </div>
            </div>
            
            <Divider />
            
            <Alert
              message="Thông báo Quan trọng"
              description={
                <Space direction="vertical">
                  <Text>• Cập nhật mới nhất: Tháng 1/2025</Text>
                  <Text>• Áp dụng cho tất cả sinh viên và học viên</Text>
                  <Text>• Tuân thủ tiêu chuẩn IATA và ICAO mới nhất</Text>
                </Space>
              }
              type="info"
              showIcon
              className="border-l-4"
            />
          </Space>
        </Card>

        {/* Main Content */}
        <Card className="shadow-lg border-none">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={items}
            className="regulations-tabs"
            size="large"
          />
        </Card>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <FilePdfOutlined className="text-red-500" />
            <span>Chi tiết Chương trình Đào tạo</span>
          </div>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            In tài liệu
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              if (selectedSpecialization?.code) {
                handleDownloadWord(selectedSpecialization.code);
              } else {
                message.error('Không có thông tin ngành học để tải');
              }
            }}
          >
            Tải về Word
          </Button>
        ]}
      >
        <PdfContent data={selectedSpecialization} />
      </Modal>
    </Layout>
  );
};

export default RegulationsPage;
  