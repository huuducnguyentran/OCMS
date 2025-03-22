import React, { useState, useEffect } from 'react';
import { List, Typography, Spin, Badge, Tag, Button, Modal, Form, Input, Select, message, Empty } from 'antd';
import { BellOutlined, SendOutlined, CheckCircleOutlined, FilterOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;
const { Title, Text } = Typography;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState('all');
  const [form] = Form.useForm();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userID = localStorage.getItem('userID') || 'HM-1';
      const response = await axios.get(`https://ocms-vjvn.azurewebsites.net/api/notifications/${userID}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.data) {
        const sortedNotifications = response.data.data.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sortedNotifications);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to fetch notifications');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(`https://ocms-vjvn.azurewebsites.net/api/notifications/mark-as-read/${notificationId}`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.notificationId === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      message.success('Marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      message.error('Failed to mark as read');
    }
  };

  const handleSendNotification = async (values) => {
    try {
      await axios.post('https://ocms-vjvn.azurewebsites.net/api/notifications/send', {
        userId: values.userId,
        title: values.title,
        message: values.message,
        notificationType: values.notificationType
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      message.success('Notification sent successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchNotifications(); // Refresh list
    } catch (error) {
      console.error('Error sending notification:', error);
      message.error('Failed to send notification');
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'CandidateImport': return '#1890ff';
      case 'Request': return '#52c41a';
      case 'Warning': return '#faad14';
      case 'Error': return '#f5222d';
      default: return '#722ed1';
    }
  };

  const getTypeBackgroundColor = (type) => {
    switch(type) {
      case 'CandidateImport': return '#e6f7ff';
      case 'Request': return '#f6ffed';
      case 'Warning': return '#fffbe6';
      case 'Error': return '#fff1f0';
      default: return '#f9f0ff';
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.notificationType === filter);
  };

  const handleMarkAllAsRead = async () => {
    try {
      // In a real application, you would call an API endpoint to mark all as read
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length === 0) {
        message.info('No unread notifications');
        return;
      }
      
      setLoading(true);
      // For demo purposes, we'll update them one by one
      for (const notification of unreadNotifications) {
        await handleMarkAsRead(notification.notificationId);
      }
      setLoading(false);
      message.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      message.error('Failed to mark all as read');
      setLoading(false);
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-full text-white">
                <BellOutlined className="text-lg" />
              </div>
              <Title level={4} className="m-0">
                Notifications Center
              </Title>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                type="default" 
                className="flex items-center"
                onClick={() => setFilter('unread')}
                icon={<CheckCircleOutlined />}
              >
                <Badge count={unreadCount} size="small">
                  Unread
                </Badge>
              </Button>
              
              <Button 
                type="default" 
                className="flex items-center"
                onClick={() => setFilter('all')}
                icon={<FilterOutlined />}
              >
                All
              </Button>
              
              <Button 
                type="default" 
                icon={<ReloadOutlined />} 
                onClick={fetchNotifications}
              />
              
              <Button 
                type="primary" 
                icon={<SendOutlined />} 
                onClick={() => setIsModalVisible(true)}
              >
                Send
              </Button>
            </div>
          </div>
          
          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button 
              type={filter === 'all' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? '' : 'border-gray-300'}
            >
              All
            </Button>
            <Button 
              type={filter === 'unread' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? '' : 'border-gray-300'}
            >
              Unread
            </Button>
            <Button 
              type={filter === 'CandidateImport' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('CandidateImport')}
              className={filter === 'CandidateImport' ? '' : 'border-gray-300'}
            >
              Candidate Import
            </Button>
            <Button 
              type={filter === 'Request' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('Request')}
              className={filter === 'Request' ? '' : 'border-gray-300'}
            >
              Request
            </Button>
            <Button 
              type={filter === 'Other' ? 'primary' : 'default'}
              size="small"
              onClick={() => setFilter('Other')}
              className={filter === 'Other' ? '' : 'border-gray-300'}
            >
              Other
            </Button>
          </div>
          
          {unreadCount > 0 && (
            <div className="mt-3 flex justify-end">
              <Button 
                type="link" 
                onClick={handleMarkAllAsRead}
                className="text-blue-500 hover:text-blue-700 p-0"
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm p-6">
            <Spin size="large" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Empty 
              description={
                <span className="text-gray-500">No notifications found</span>
              } 
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((item) => (
              <div
                key={item.notificationId}
                className={`
                  bg-white rounded-lg shadow-sm hover:shadow-md 
                  transition-all duration-300 cursor-pointer overflow-hidden
                  ${!item.isRead ? 'border-l-4 border-blue-500' : ''}
                `}
                onClick={() => !item.isRead && handleMarkAsRead(item.notificationId)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {item.notificationType === 'CandidateImport' ? (
                        <UserOutlined className="text-lg p-2 bg-blue-50 text-blue-500 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {item.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-medium">
                          {item.title}
                        </h3>
                        {!item.isRead && (
                          <Badge status="processing" />
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 text-sm">
                        {item.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag
                          style={{ 
                            backgroundColor: getTypeBackgroundColor(item.notificationType),
                            color: getTypeColor(item.notificationType),
                            border: 'none'
                          }}
                        >
                          {item.notificationType}
                        </Tag>
                        <Text type="secondary" className="text-xs">
                          {formatDate(item.createdAt)}
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send Notification Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-2">
              <SendOutlined className="text-blue-500" />
              <span>Send New Notification</span>
            </div>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSendNotification}
            className="mt-4"
          >
            <Form.Item
              name="userId"
              label="User ID"
              rules={[{ required: true, message: 'Please input user ID!' }]}
            >
              <Input 
                placeholder="Enter user ID (e.g. HM-1)"
                prefix={<UserOutlined className="text-gray-400" />}
              />
            </Form.Item>

            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please input title!' }]}
            >
              <Input 
                placeholder="Enter notification title"
              />
            </Form.Item>

            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: 'Please input message!' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Enter notification message"
              />
            </Form.Item>

            <Form.Item
              name="notificationType"
              label="Type"
              rules={[{ required: true, message: 'Please select type!' }]}
            >
              <Select 
                placeholder="Select notification type"
              >
                <Select.Option value="CandidateImport">Candidate Import</Select.Option>
                <Select.Option value="Request">Request</Select.Option>
                <Select.Option value="Warning">Warning</Select.Option>
                <Select.Option value="Error">Error</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item className="mb-0 flex justify-end space-x-2">
              <Button 
                onClick={() => setIsModalVisible(false)}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                icon={<SendOutlined />}
              >
                Send
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default NotificationsPage;