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
          title: "General Regulations",
          items: [
            "Comply with ICAO flight plan regulations",
            "Ensure flight coordination safety",
            "Continuous weather information monitoring"
          ]
        },
        {
          title: "Professional Requirements",
          items: [
            "Licensed Flight Dispatcher certification",
            "Minimum 2 years industry experience",
            "Aviation English communication skills"
          ]
        },
        {
          title: "Responsibilities",
          items: [
            "Flight planning and monitoring",
            "Crew coordination",
            "Weather conditions and route monitoring"
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
          title: "Transportation Regulations",
          items: [
            "Dangerous goods regulations compliance",
            "Special baggage handling procedures",
            "Packaging and storage standards"
          ]
        },
        {
          title: "Safety and Security",
          items: [
            "Baggage and cargo security screening",
            "Lost baggage handling procedures",
            "Warehouse safety assurance"
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
          title: "Emergency Procedures",
          items: [
            "Emergency evacuation procedures",
            "In-flight emergency handling",
            "Ground rescue team coordination"
          ]
        },
        {
          title: "Safety Training",
          items: [
            "Regular safety training",
            "Emergency scenario practice",
            "Updated safety procedure implementation"
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
          title: "Recruitment and Training",
          items: [
            "Aviation personnel recruitment process",
            "Professional training programs",
            "Regular performance evaluation"
          ]
        },
        {
          title: "Career Development",
          items: [
            "Career progression path",
            "Compensation policies",
            "Advanced training opportunities"
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
          title: "Marketing Strategy",
          items: [
            "Marketing plan development",
            "Service product development",
            "Brand management"
          ]
        },
        {
          title: "Sales Regulations",
          items: [
            "Pricing and promotion policies",
            "Booking and payment procedures",
            "Customer service standards"
          ]
        }
      ]
    }
  ];

  const certificateTypes = [
    {
      title: "Airline Transport Pilot License (ATPL)",
      icon: <ThunderboltOutlined className="text-yellow-500" />,
      requirements: [
        "Minimum 1500 flight hours accumulated",
        "Completion of approved ATPL training program",
        "Pass ATPL theoretical examinations",
        "Pass practical test according to standards",
        "Valid Class 1 medical certificate",
        "ICAO English Level 4 or higher"
      ],
      validity: "24 months",
      notes: [
        "Must maintain required flight hours to maintain validity",
        "Requires check every 12 months"
      ]
    },
    {
      title: "Commercial Pilot License (CPL)",
      icon: <GlobalOutlined className="text-blue-500" />,
      requirements: [
        "Minimum 250 flight hours accumulated",
        "Completion of approved CPL training program",
        "Pass CPL theoretical examinations",
        "Pass practical test according to standards",
        "Valid Class 1 medical certificate"
      ],
      validity: "24 months",
      notes: [
        "Additional training required for ATPL upgrade",
        "Requires check every 12 months"
      ]
    },
    {
      title: "Flight Engineer Certificate",
      icon: <ToolOutlined className="text-purple-500" />,
      requirements: [
        "Graduate from flight engineering program",
        "Minimum 100 hours practical aircraft experience",
        "Pass specialized theoretical examinations",
        "Valid Class 2 medical certificate or higher"
      ],
      validity: "24 months",
      notes: [
        "Regular technical knowledge updates required",
        "Must maintain minimum annual practical hours"
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
          <Title level={5}>Requirements:</Title>
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
          <Title level={5}>Important Notes:</Title>
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
            View Details
          </Button>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              try {
                handleDownloadWord(specialization.code);
              } catch (error) {
                console.error('Error downloading document:', error);
                message.error('An error occurred while downloading the document. Please try again later.');
              }
            }}
          >
            Download PDF
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
          Safety Regulations
        </span>
      ),
      children: (
        <Space direction="vertical" className="w-full">
          <Alert
            message="Important Notice"
            description={
              <Space direction="vertical">
                <Text>• Latest update: January 2025</Text>
                <Text>• Applicable to all students and trainees</Text>
                <Text>• Compliant with latest IATA and ICAO standards</Text>
              </Space>
            }
            type="info"
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
          Aviation Certificates
        </span>
      ),
      children: (
        <Space direction="vertical" className="w-full">
          <Alert
            message="Digital Certificate System"
            description="All certificates are issued digitally and authenticated with digital signatures from the Civil Aviation Authority of Vietnam."
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
      fullTitle: "Flight Dispatch",
      description: "Advanced training program in flight dispatch and management, meeting IATA and ICAO standards.",
      duration: "2 years",
      credits: 120,
      certification: "International Flight Dispatch Certificate",
      subjects: [
        {
          name: "Flight Dispatch Fundamentals",
          credits: 4,
          description: "Basic principles of flight dispatch"
        },
        {
          name: "Aviation Meteorology",
          credits: 3,
          description: "Aviation weather analysis and forecasting"
        },
        {
          name: "Flight Planning",
          credits: 4,
          description: "Flight plan creation and management"
        },
        {
          name: "Flight Safety",
          credits: 3,
          description: "Flight safety procedures and regulations"
        }
      ],
      requirements: [
        "High school diploma or equivalent",
        "Meet health requirements",
        "English proficiency IELTS 5.5 or equivalent",
        "Pass entrance interview"
      ],
      careerOpportunities: [
        "Flight Dispatcher at airlines",
        "Flight Planning Specialist",
        "Flight Operations Center Coordinator",
        "Flight Operations Manager"
      ]
    },
    "SPEC-001-GO-001-BAC-002": {
      fullTitle: "Baggage and Cargo Services",
      description: "Training program in baggage and cargo management in aviation industry.",
      duration: "2 years",
      credits: 90,
      certification: "Aviation Cargo Management Certificate",
      subjects: [
        {
          name: "Baggage Handling Procedures",
          credits: 3,
          description: "Baggage handling processes and standards"
        },
        {
          name: "Dangerous Goods Management",
          credits: 4,
          description: "Regulations and handling of dangerous goods"
        },
        {
          name: "Baggage Management Systems",
          credits: 3,
          description: "Software and management systems usage"
        },
        {
          name: "Aviation Logistics",
          credits: 3,
          description: "Supply chain management in air transport"
        },
        {
          name: "Warehouse Safety",
          credits: 3,
          description: "Cargo warehouse safety procedures"
        }
      ],
      requirements: [
        "High school diploma or equivalent",
        "Good health, ability to work shifts",
        "Strong organizational and management skills",
        "Basic English communication skills"
      ],
      careerOpportunities: [
        "Baggage Coordination Officer",
        "Cargo Warehouse Manager",
        "Ground Service Supervisor",
        "Aviation Logistics Specialist",
        "Passenger Service Manager"
      ]
    },
    "SPEC-001-HRI-001": {
      fullTitle: "Human Resources in Aviation",
      description: "Advanced training program in aviation human resource management, focusing on management skills, recruitment, and talent development.",
      duration: "2 years",
      credits: 95,
      certification: "Aviation Human Resources Management Certificate",
      subjects: [
        {
          name: "Aviation Human Resource Management",
          credits: 4,
          description: "Principles and methods of personnel management in aviation environment"
        },
        {
          name: "Recruitment and Training",
          credits: 3,
          description: "Aviation personnel recruitment and training processes"
        },
        {
          name: "Aviation Labor Law",
          credits: 3,
          description: "Legal regulations on labor in aviation industry"
        },
        {
          name: "Organizational Development",
          credits: 3,
          description: "Development strategy and change management in organizations"
        },
        {
          name: "Performance Management",
          credits: 3,
          description: "Performance evaluation and improvement"
        }
      ],
      requirements: [
        "High school diploma or equivalent",
        "GPA ≥ 7.0",
        "English proficiency IELTS 5.5 or equivalent",
        "Good communication skills"
      ],
      careerOpportunities: [
        "HR Specialist in airlines",
        "Training and Development Manager",
        "Aviation Recruitment Specialist",
        "Senior HR Manager",
        "Aviation HR Consultant"
      ]
    },
    "SPEC-001-AMA-002": {
      fullTitle: "Airline Marketing and Sales",
      description: "Training program in aviation marketing and sales, focusing on business strategy and market development.",
      duration: "2 years",
      credits: 100,
      certification: "Aviation Marketing and Business Certificate",
      subjects: [
        {
          name: "Aviation Marketing",
          credits: 4,
          description: "Marketing strategies and techniques in aviation industry"
        },
        {
          name: "Revenue Management",
          credits: 3,
          description: "Revenue optimization and airline ticket pricing"
        },
        {
          name: "Digital Marketing",
          credits: 3,
          description: "Digital marketing and e-commerce in aviation"
        },
        {
          name: "Customer Relationship Management",
          credits: 3,
          description: "Building and maintaining customer relationships"
        },
        {
          name: "Market Analysis",
          credits: 3,
          description: "Aviation market research and analysis"
        }
      ],
      requirements: [
        "High school diploma or equivalent",
        "GPA ≥ 7.0",
        "English proficiency IELTS 6.0 or equivalent",
        "Strong analytical and creative skills"
      ],
      careerOpportunities: [
        "Aviation Marketing Specialist",
        "Sales and Revenue Manager",
        "Product Development Specialist",
        "Aviation Brand Manager",
        "Customer Relations Specialist",
        "Business Strategy Manager"
      ]
    },
    "CC-SAE-001": {
      fullTitle: "Safety and Emergency Procedures",
      description: "Advanced training program in safety procedures and emergency handling in aviation, meeting international aviation safety standards.",
      duration: "1.5 years",
      credits: 85,
      certification: "Aviation Safety and Emergency Certificate",
      subjects: [
        {
          name: "Basic Aviation Safety",
          credits: 4,
          description: "Basic aviation safety principles and regulations"
        },
        {
          name: "Emergency Procedures",
          credits: 4,
          description: "Handling emergency situations in air and on ground"
        },
        {
          name: "Aviation Security",
          credits: 3,
          description: "Security measures in aviation operations"
        },
        {
          name: "Crisis Management",
          credits: 3,
          description: "Skills for managing and handling crisis situations"
        },
        {
          name: "Incident Investigation",
          credits: 3,
          description: "Methods for investigating and analyzing aviation incidents"
        }
      ],
      requirements: [
        "High school diploma or equivalent",
        "Good health, no cardiovascular conditions",
        "Ability to work under high pressure",
        "English proficiency IELTS 5.5 or equivalent"
      ],
      careerOpportunities: [
        "Aviation Safety Specialist",
        "Emergency Coordinator",
        "Airport Safety Supervisor",
        "Safety Risk Assessment Expert",
        "Aviation Safety Trainer"
      ],
      additionalInfo: {
        facilities: [
          "Emergency simulation room",
          "Advanced safety training equipment",
          "Practical training center"
        ],
        partnerships: [
          "Cooperation with major airlines",
          "International training partnerships",
          "Internships at international airports"
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
          <Text type="secondary" className="text-lg">Program Code: {data.code}</Text>
        </div>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card className="info-card">
              <Title level={4}>Overview</Title>
              <Paragraph>{data.description}</Paragraph>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="Duration" value={data.duration} />
                </Col>
                <Col span={12}>
                  <Statistic title="Credits" value={data.credits} />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card title="Curriculum" className="course-card">
              <Table
                dataSource={data.subjects}
                columns={[
                  {
                    title: 'Subject',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Credits',
                    dataIndex: 'credits',
                    key: 'credits',
                    width: 100,
                  },
                  {
                    title: 'Description',
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
              <Card title="Entry Requirements" className="requirements-card">
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
              <Card title="Career Opportunities" className="career-card">
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

  const handleDownloadWord = (specializationCode) => {
    try {
      const data = specializationDetails[specializationCode];
      if (!data) {
        message.error('Program information not found');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('VIETNAM AVIATION ACADEMY', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text(data.fullTitle, pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mã ngành: ${specializationCode}`, pageWidth / 2, 40, { align: 'center' });
      
      // Add program info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROGRAM INFORMATION', 14, 55);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Duration:', 14, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(data.duration, 70, 65);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Credits:', 14, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(data.credits.toString(), 70, 72);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Certificate:', 14, 79);
      doc.setFont('helvetica', 'normal');
      doc.text(data.certification, 70, 79);
      
      // Add description
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROGRAM DESCRIPTION', 14, 90);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(data.description, pageWidth - 30);
      doc.text(descLines, 14, 100);
      
      // Add subjects section without autoTable
      let yPosition = 100 + (descLines.length * 7);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CURRICULUM', 14, yPosition);
      
      // Manual table creation
      yPosition += 10;
      
      // Header for courses
      doc.setFillColor(66, 139, 202);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.rect(14, yPosition, pageWidth - 28, 10, 'F');
      doc.text('Subject', 20, yPosition + 7);
      doc.text('Credits', 110, yPosition + 7);
      doc.text('Description', 140, yPosition + 7);
      
      yPosition += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      
      // Loop through subjects to create manual table
      data.subjects.forEach((subject, index) => {
        const isEven = index % 2 === 0;
        if (isEven) {
          doc.setFillColor(240, 240, 240);
          doc.rect(14, yPosition - 5, pageWidth - 28, 10, 'F');
        }
        
        // Check if we need to add a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(subject.name, 20, yPosition);
        doc.text(subject.credits.toString(), 110, yPosition);
        
        // Handle long descriptions
        const descText = doc.splitTextToSize(subject.description, 60);
        doc.text(descText, 140, yPosition);
        
        yPosition += (descText.length > 1) ? descText.length * 7 + 5 : 12;
      });
      
      // Check if we need a new page for requirements
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add requirements
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ENTRY REQUIREMENTS', 14, yPosition);
      
      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      data.requirements.forEach((req) => {
        doc.text(`• ${req}`, 14, yPosition);
        yPosition += 7;
      });
      
      // Check if we need a new page for career opportunities
      yPosition += 10;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Add career opportunities
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CAREER OPPORTUNITIES', 14, yPosition);
      
      yPosition += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      data.careerOpportunities.forEach((opp) => {
        doc.text(`• ${opp}`, 14, yPosition);
        yPosition += 7;
      });
      
      // Add footer with current date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Created on: ${new Date().toLocaleDateString('en-US')}`, 14, 280);
      
      // Save the document
      doc.save(`${specializationCode}-ProgramInfo.pdf`);
      message.success('Document downloaded successfully!');

    } catch (error) {
      console.error('Error creating PDF:', error);
      message.error('An error occurred while creating the document. Please try again later.');
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-6 shadow-lg border-none">
          <Space direction="vertical" className="w-full">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full shadow-lg">
                <SafetyCertificateOutlined className="text-4xl text-blue-500" />
              </div>
              <div>
                <Title level={2} className="!mb-0">Aviation Specialization Regulations</Title>
                <Text className="text-gray-500">
                  Regulations and training standards management system of Vietnam Aviation Academy
                </Text>
              </div>
            </div>
            
            <Divider />
            
            <Alert
              message="Important Notice"
              description={
                <Space direction="vertical">
                  <Text>• Latest update: January 2025</Text>
                  <Text>• Applicable to all students and trainees</Text>
                  <Text>• Compliant with latest IATA and ICAO standards</Text>
                </Space>
              }
              type="info"
              showIcon
              className="border-l-4"
            />
          </Space>
        </Card>

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
            <span>Training Program Details</span>
          </div>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={1000}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => window.print()}>
            Print Document
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => {
              if (selectedSpecialization?.code) {
                handleDownloadWord(selectedSpecialization.code);
              } else {
                message.error('No program information available for download');
              }
            }}
          >
            Download PDF
          </Button>
        ]}
      >
        <PdfContent data={selectedSpecialization} />
      </Modal>
    </Layout>
  );
};

export default RegulationsPage;
    