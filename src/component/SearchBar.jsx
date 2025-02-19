// src/components/SearchBar.jsx
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const SearchBar = () => (
  <div className="w-full max-w-lg mx-auto">
    <Input
      placeholder="Search for anything here..."
      className="w-full p-2 border rounded-md"
      prefix={<SearchOutlined className="text-gray-400" />} // Search icon
    />
  </div>
);

export default SearchBar;
