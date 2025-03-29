const navItems = [
  {
    key: "1",
    label: "Home",
    icon: "HomeOutlined",
    path: "/home",
    roles: ["Admin", "HeadMaster"],
  },
  {
    key: "2",
    label: "Course",
    icon: "BookOutlined",
    path: "/course",
    roles: ["Admin"],
  },
  {
    key: "3",
    label: "Schedule",
    icon: "ScheduleOutlined",
    path: "/schedule",
    roles: ["Admin"],
  },
  {
    key: "4",
    label: "Notifications",
    icon: "BellOutlined",
    path: "/notifications",
    roles: ["Admin", "HeadMaster"],
  },
  {
    key: "5",
    label: "Accomplishments",
    icon: "LineChartOutlined",
    path: "/accomplishments",
    roles: ["Admin"],
  },
  {
    key: "6",
    label: "Accounts",
    icon: "UserOutlined",
    path: "/accounts",
    roles: ["Admin"],
  },
  {
    key: "7",
    label: "Candidates",
    icon: "ImportOutlined",
    path: "/candidates",
    roles: ["Admin"],
    children: [
      {
        key: "7-1",
        label: "View Candidates",
        path: "/candidates-view",
        roles: ["Admin"],
      },
      {
        key: "7-2",
        label: "Import Candidates",
        path: "/candidates-import",
        roles: ["Admin"],
      },
    ],
  },
  {
    key: "8",
    label: "Grade",
    icon: "FileExcelOutlined",
    path: "/grade",
    roles: ["Admin"],
  },
  {
    key: "9",
    label: "Request",
    icon: "SelectOutlined",
    path: "/request",
    roles: ["Admin", "HeadMaster", "user"],
  },
];

export default navItems;
