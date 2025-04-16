// src/components/SearchBar.jsx
import { useState } from "react";
import { AutoComplete, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [options, setOptions] = useState([]);
  const navigate = useNavigate();

  // Định nghĩa các options cho dropdown
  const defaultOptions = [
    {
      label: "Courses",
      options: [
        { value: "View All Courses", label: "View All Courses", path: "/course" },
        { value: "Create Course", label: "Create Course", path: "/course/create" },
      ],
    },
    {
      label: "Schedules",
      options: [
        { value: "View Schedule", label: "View Schedule", path: "/schedule" },
        { value: "Create Schedule", label: "Create Schedule", path: "/schedule/create" },
      ],
    },
    {
      label: "Subjects",
      options: [
        { value: "View Subjects", label: "View Subjects", path: "/subject" },
        { value: "Create Subject", label: "Create Subject", path: "/subject-create" },
      ],
    },
    {
      label: "Quick Access",
      options: [
        { value: "My Grades", label: "My Grades", path: "/grade" },
        { value: "My Certificates", label: "My Certificates", path: "/certificate" },
        { value: "Specialty", label: "Specialty Management", path: "/specialty" },
      ],
    },
  ];

  // Hàm xử lý search
  const handleSearch = (value) => {
    // Nếu không có giá trị search, hiển thị tất cả options
    if (!value) {
      setOptions(defaultOptions);
      return;
    }

    // Lọc options dựa trên giá trị search
    const filtered = defaultOptions.map(group => ({
      label: group.label,
      options: group.options.filter(opt => 
        opt.label.toLowerCase().includes(value.toLowerCase())
      )
    })).filter(group => group.options.length > 0);

    setOptions(filtered);
  };

  // Xử lý khi chọn một option
  const handleSelect = (value, option) => {
    if (option.path) {
      navigate(option.path);
    }
  };

  // Custom render dropdown item
  const renderItem = (item, index) => ({
    value: item.value,
    label: (
      <div className="flex items-center gap-2 p-2 hover:bg-gray-50">
        {item.icon}
        <span>{item.label}</span>
      </div>
    ),
    path: item.path
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      <AutoComplete
        popupClassName="custom-autocomplete-dropdown"
        style={{ width: "100%" }}
        options={options}
        onSearch={handleSearch}
        onSelect={handleSelect}
        placeholder="Search for anything here..."
        defaultActiveFirstOption={false}
        showSearch
        allowClear
      >
        <Input
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          className="rounded-lg border-2 hover:border-blue-400 focus:border-blue-500"
        />
      </AutoComplete>
    </div>
  );
};


export default SearchBar;
