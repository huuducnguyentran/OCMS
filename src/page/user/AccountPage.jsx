// import { AccountData } from "../data/AccountData";

// const AccountList = () => {
//   return (
//     <div className="w-full min-h-screen bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto bg-white-400 p-6 rounded-lg shadow-lg">
//         <div className="flex justify-between items-center mb-6">
//           <input
//             type="text"
//             placeholder="Search for anything here.."
//             className="border rounded-lg p-3 w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
//           />
//           <button className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
//             Edit
//           </button>
//         </div>
//         <div className="overflow-auto max-h-[500px]">
//           <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
//             <thead className="bg-blue-950 text-white sticky top-0">
//               <tr>
//                 <th className="border p-4">Id</th>
//                 <th className="border p-4">Image</th>
//                 <th className="border p-4">Full Name</th>
//                 <th className="border p-4">Date of Birth</th>
//                 <th className="border p-4">Email</th>
//                 <th className="border p-4">Phone</th>
//                 <th className="border p-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {AccountData.map((account) => (
//                 <tr key={account.Id} className="bg-white hover:bg-gray-100">
//                   <td className="border p-4">{account.Id}</td>
//                   <td className="border p-4">
//                     <img
//                       src={account.Image}
//                       alt={account.FullName}
//                       className="w-14 h-14 rounded-full border-2 border-blue-500"
//                     />
//                   </td>
//                   <td className="border p-4 font-medium text-gray-700">
//                     {account.FullName}
//                   </td>
//                   <td className="border p-4 text-gray-600">
//                     {account.DateOfBirth}
//                   </td>
//                   <td className="border p-4 text-gray-600">{account.Email}</td>
//                   <td className="border p-4 text-gray-600">{account.Phone}</td>
//                   <td className="border p-4">
//                     <span
//                       className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${
//                         account.Status === "Active"
//                           ? "bg-green-500"
//                           : "bg-red-500"
//                       }`}
//                     >
//                       {account.Status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountList;

import { useState, useEffect } from "react";
import { SearchOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getAllUsers, updateUser } from "../../services/userService";
import { Modal, Form, Input, Select, DatePicker, message, Button } from "antd";
import moment from "moment";

const AccountList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = await getAllUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      ...user,
      dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
    });
    setIsEditModalVisible(true);
  };

  const handleDeactivate = (user) => {
    Modal.confirm({
      title: 'Are you sure you want to deactivate this account?',
      content: `This will deactivate ${user.fullName}'s account.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        message.info('Deactivate function is not implemented yet');
      },
    });
  };

  const handleEditSubmit = async (values) => {
    try {
      await updateUser(selectedUser.userId, {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
      });
      message.success('Account updated successfully');
      setIsEditModalVisible(false);
      // Refresh user list
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      message.error('Failed to update account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search for anything here..."
              className="border rounded-lg p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black pr-10"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchOutlined className="absolute right-3 top-3 text-gray-500" />
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-300 shadow-lg">
          {loading ? (
            <div className="text-center p-4">Loading users...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead className="bg-blue-900 text-white sticky top-0">
                <tr>
                  <th className="border p-4 text-left">User ID</th>
                  <th className="border p-4 text-left">Username</th>
                  <th className="border p-4 text-left">Full Name</th>
                  <th className="border p-4 text-left">Gender</th>
                  <th className="border p-4 text-left">Date of Birth</th>
                  <th className="border p-4 text-left">Email</th>
                  <th className="border p-4 text-left">Phone</th>
                  <th className="border p-4 text-left">Address</th>
                  <th className="border p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter((user) =>
                    user.fullName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan="9" className="border p-4 text-center text-red-500 font-medium">
                        No result for "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    users
                      .filter((user) =>
                        user.fullName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                      )
                      .map((user) => (
                        <tr
                          key={user.userId}
                          className="bg-white hover:bg-gray-100 transition duration-200"
                        >
                          <td className="border p-4 text-gray-600">
                            {user.userId}
                          </td>
                          <td className="border p-4 text-gray-600">
                            {user.username}
                          </td>
                          <td className="border p-4 font-medium text-gray-800">
                            {user.fullName}
                          </td>
                          <td className="border p-4 text-gray-600">
                            {user.gender}
                          </td>
                          <td className="border p-4 text-gray-600">
                            {new Date(user.dateOfBirth).toLocaleDateString()}
                          </td>
                          <td className="border p-4 text-gray-600">{user.email}</td>
                          <td className="border p-4 text-gray-600">
                            {user.phoneNumber}
                          </td>
                          <td className="border p-4 text-gray-600">
                            {user.address}
                          </td>
                          <td className="border p-4 text-gray-600">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-800 bg-transparent border-0 outline-none shadow-none"
                                style={{ background: 'transparent' }}
                              >
                                <EditOutlined />
                              </button>
                              <button
                                onClick={() => handleDeactivate(user)}
                                className="text-red-600 hover:text-red-800 bg-transparent border-0 outline-none shadow-none"
                                style={{ background: 'transparent' }}
                              >
                                <DeleteOutlined />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Account"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          validateTrigger={['onChange', 'onBlur']}
        >
          <Form.Item 
            name="fullName" 
            label="Full Name"
            rules={[
              { required: true, message: 'Please input full name' },
              { max: 100, message: 'Full name cannot exceed 100 characters' },
              { 
                pattern: /^[A-Za-zÀ-ỹ\s]+$/,
                message: 'Full name can only contain letters and spaces' 
              }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="gender" 
            label="Gender"
            rules={[{ required: true, message: 'Please select gender' }]}
          >
            <Select>
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="dateOfBirth" 
            label="Date of Birth"
            rules={[
              { required: true, message: 'Please select date of birth' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const age = moment().diff(value, 'years', true);
                  if (age >= 18) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Must be at least 18 years old'));
                }
              }
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabledDate={(current) => {
                const eighteenYearsAgo = moment().subtract(18, 'years');
                return current && (current > eighteenYearsAgo || current > moment());
              }}
              format="YYYY-MM-DD"
            />
          </Form.Item>
          <Form.Item 
            name="email" 
            label="Email"
            rules={[
              { required: true, message: 'Please input email' },
              { type: 'email', message: 'Please enter a valid email' },
              { max: 100, message: 'Email cannot exceed 100 characters' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item 
            name="phoneNumber" 
            label="Phone Number"
            rules={[
              { required: true, message: 'Please input phone number' },
              { 
                pattern: /^[0-9]{10}$/, 
                message: 'Phone number must be exactly 10 digits' 
              }
            ]}
          >
            <Input 
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                form.setFieldsValue({ phoneNumber: value });
              }}
            />
          </Form.Item>
          <Form.Item 
            name="address" 
            label="Address"
            rules={[
              { required: true, message: 'Please input address' },
              { min: 10, message: 'Address must be at least 10 characters' },
              { max: 100, message: 'Address cannot exceed 100 characters' }
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => setIsEditModalVisible(false)}
              className="bg-white hover:bg-gray-50 border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountList;
