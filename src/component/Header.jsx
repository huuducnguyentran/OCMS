// src/components/Header.jsx
import { Layout, Avatar } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Layout.Header className="bg-white shadow-md px-6 py-4 flex items-center justify-between w-full">
      {/* Search Bar */}
      <SearchBar />

      {/* User Info */}
      <div className="flex items-center gap-4">
        {/* Login Link */}
        <Link to="/login" className="text-blue-500 font-medium hover:underline">
          Login
        </Link>

        {/* Profile Navigation */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <span className="text-gray-700 font-medium text-lg">Subash</span>
          <Avatar src="https://via.placeholder.com/40" size="large" />
        </div>
      </div>
    </Layout.Header>
  );
};

export default Header;
