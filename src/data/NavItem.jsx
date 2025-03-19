const navItems = [
  { key: "1", label: "Home", icon: "HomeOutlined", path: "/" },
  { key: "2", label: "Course", icon: "BookOutlined", path: "/course" },
  { key: "3", label: "Schedule", icon: "ScheduleOutlined", path: "/schedule" },
  {
    key: "4",
    label: "Notifications",
    icon: "BellOutlined",
    path: "/notifications",
  },
  {
    key: "5",
    label: "Accomplishments",
    icon: "LineChartOutlined",
    path: "/accomplishments",
  },
  {
    key: "6",
    label: "Get Technical Help",
    icon: "QuestionCircleOutlined",
    path: "/help",
  },
  {
    key: "7",
    label: "Accounts",
    icon: "UserOutlined",
    path: "/accounts",
  },
  {
    key: "8",
    label: "Candidates",
    path: "/candidates",
    icon: "ImportOutlined",
    children: [
      { key: "8-1", label: "View Candidates", path: "/candidates" },
      { key: "8-2", label: "Import Candidates", path: "/candidates-import" },
    ],
  },
  {
    key: "9",
    label: "Grade",
    icon: "FileExcelOutlined",
    path: "/grade",
  },
];

export default navItems;
