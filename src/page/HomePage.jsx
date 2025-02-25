import { SearchOutlined } from "@ant-design/icons";
import { Input, Layout } from "antd";

const HomePage = () => (
  <Layout className="min-h-screen flex w-full overflow-hidden">
    <Layout className="flex flex-col w-full h-screen overflow-hidden">
      <Layout.Content className="p-6 bg-gray-100 flex-grow overflow-auto">
        {/* Search Bar */}
        <div className="bg-white p-3 rounded-lg shadow-md flex items-center mb-6">
          <Input
            type="text"
            placeholder="Search for anything here.."
            className="w-full p-2 outline-none"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            title="Total Accounts"
            count={213}
            color="blue"
            percentage={4}
          />
          <Card
            title="Total Actives"
            count={162}
            color="green"
            percentage={4}
          />
          <Card
            title="Total Deactivates"
            count={41}
            color="red"
            percentage={4}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PieChart title="Active account" percentage={81} color="red" />
          <PieChart title="Employee Growth" percentage={22} color="green" />
        </div>
      </Layout.Content>
    </Layout>
  </Layout>
);

// eslint-disable-next-line react/prop-types
const Card = ({ title, count, color, percentage }) => (
  <div
    className={`bg-white p-6 rounded-lg shadow-md flex flex-col items-center w-full`}
  >
    <div
      className={`w-12 h-12 rounded-full bg-${color}-200 flex items-center justify-center mb-2`}
    >
      <span className="text-xl">👤</span>
    </div>
    <h3 className="text-2xl font-bold">{count}</h3>
    <p className="text-gray-600">{title}</p>
    <p className="text-sm text-gray-500">🔹 {percentage}% (30 days)</p>
  </div>
);

// eslint-disable-next-line react/prop-types
const PieChart = ({ title, percentage, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center w-full">
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="lightgray"
          strokeWidth="4"
        />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke={color === "green" ? "#006400" : color}
          strokeWidth="4"
          strokeDasharray={`${percentage} 100`}
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-700">
        {percentage}%
      </span>
    </div>
    <p className="mt-2 text-gray-500">{title}</p>
  </div>
);

export default HomePage;
