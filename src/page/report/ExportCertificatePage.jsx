import React, { useEffect } from 'react';
import { Button, message, Typography, Card } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { exportCertificate } from '../../services/reportService';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ExportCertificatePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('role');
    if (userRole !== 'Reviewer') {
      message.error('Bạn không có quyền truy cập trang này');
    }
  }, [navigate]);

  const handleExport = async () => {
    try {
      message.loading({ content: 'Đang xuất file...', key: 'export' });
      await exportCertificate();
      message.success({ content: 'Xuất file thành công!', key: 'export' });
    } catch (error) {
      message.error({ content: 'Có lỗi xảy ra khi xuất file', key: 'export' });
      console.error('Error exporting certificates:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <Title level={2}>
        <FileExcelOutlined /> Xuất Chứng Chỉ
      </Title>
      
      <Card style={{ marginTop: '16px' }}>
        <Text>
          Trang này cho phép bạn xuất danh sách chứng chỉ ra file Excel.
          File xuất ra sẽ chứa thông tin chi tiết về các chứng chỉ trong hệ thống.
        </Text>
        
        <div style={{ marginTop: '24px' }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất File Excel
          </Button>
        </div>
      </Card>
    </div>
</div>
  );
};

export default ExportCertificatePage; 