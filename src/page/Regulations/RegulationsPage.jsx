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
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const RegulationsPage = () => {
  const [activeTab, setActiveTab] = useState('1');

  const generalRegulations = [
    {
      title: "Quy định An toàn Bay",
      icon: <SafetyOutlined className="text-red-500" />,
      rules: [
        {
          rule: "Quy định về Rượu bia và Chất kích thích",
          detail: [
            "Không được sử dụng đồ uống có cồn trong vòng 8 giờ trước khi bay",
            "Nồng độ cồn trong máu phải bằng 0 khi thực hiện nhiệm vụ",
            "Cấm sử dụng các chất kích thích và ma túy"
          ],
          severity: "critical"
        },
        {
          rule: "Quy định về Thời gian bay và Nghỉ ngơi",
          detail: [
            "Tối đa 8 giờ bay liên tục trong một ngày",
            "Tối thiểu 8 giờ nghỉ ngơi trước mỗi chuyến bay",
            "Không quá 100 giờ bay trong 30 ngày liên tiếp"
          ],
          severity: "high"
        },
        {
          rule: "Quy định về Điều kiện Thời tiết",
          detail: [
            "Tuân thủ nghiêm ngặt các giới hạn về tầm nhìn",
            "Không được bay trong điều kiện thời tiết nguy hiểm",
            "Phải có kế hoạch dự phòng cho điều kiện thời tiết xấu"
          ],
          severity: "high"
        }
      ]
    },
    {
      title: "Quy định Y tế và Sức khỏe",
      icon: <MedicineBoxOutlined className="text-blue-500" />,
      rules: [
        {
          rule: "Kiểm tra Sức khỏe Định kỳ",
          detail: [
            "Kiểm tra sức khỏe tổng quát 6 tháng/lần",
            "Kiểm tra thị lực và thính lực 12 tháng/lần",
            "Đánh giá tâm lý định kỳ hàng năm"
          ],
          severity: "high"
        },
        {
          rule: "Quy định về Bệnh lý",
          detail: [
            "Báo cáo ngay lập tức các vấn đề sức khỏe mới phát sinh",
            "Không được bay khi đang điều trị các bệnh ảnh hưởng đến khả năng làm việc",
            "Phải có giấy chứng nhận đủ sức khỏe sau khi điều trị bệnh"
          ],
          severity: "critical"
        }
      ]
    },
    {
      title: "Quy định về Đào tạo và Huấn luyện",
      icon: <BookOutlined className="text-green-500" />,
      rules: [
        {
          rule: "Đào tạo Bắt buộc",
          detail: [
            "Hoàn thành khóa đào tạo an toàn hàng năm",
            "Tham gia các buổi huấn luyện mô phỏng 6 tháng/lần",
            "Cập nhật kiến thức về quy định mới khi có thay đổi"
          ],
          severity: "high"
        },
        {
          rule: "Yêu cầu về Kỹ năng",
          detail: [
            "Duy trì khả năng giao tiếp tiếng Anh theo tiêu chuẩn ICAO",
            "Thực hiện đầy đủ các bài kiểm tra kỹ năng định kỳ",
            "Đạt yêu cầu trong các đợt đánh giá năng lực"
          ],
          severity: "high"
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
          
          {generalRegulations.map((section, index) => (
            <Card 
              key={index}
              title={
                <Space>
                  {section.icon}
                  <span className="font-semibold">{section.title}</span>
                </Space>
              }
              className="mb-6"
            >
              <Space direction="vertical" className="w-full">
                {section.rules.map((rule, ruleIndex) => (
                  <RuleCard key={ruleIndex} {...rule} />
                ))}
              </Space>
            </Card>
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

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <Card className="mb-6 shadow-lg border-none">
          <Space direction="vertical" className="w-full">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full shadow-lg border-2 border-blue-200">
                <SafetyCertificateOutlined className="text-4xl text-blue-500" />
              </div>
              <div>
                <Title level={2} className="!mb-0">Quy định & Chứng chỉ Hàng không</Title>
                <Text className="text-gray-500">
                  Hệ thống quản lý quy định và chứng chỉ số của Học viện Hàng không Việt Nam
                </Text>
              </div>
            </div>
            
            <Divider />
            
            <Alert
              message="Cập nhật Quan trọng"
              description={
                <Space direction="vertical">
                  <Text>• Các quy định được cập nhật theo tiêu chuẩn mới nhất của ICAO và CAAV</Text>
                  <Text>• Áp dụng hệ thống chứng chỉ số từ ngày 01/01/2025</Text>
                  <Text>• Tăng cường các yêu cầu về an toàn bay và sức khỏe phi công</Text>
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
    </Layout>
  );
};

export default RegulationsPage;
