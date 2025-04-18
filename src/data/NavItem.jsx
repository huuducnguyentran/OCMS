const navItems = [
  {
    key: "1",
    label: "Home",
    icon: "HomeOutlined",
    path: "/home",
    roles: [
      "Admin",
      "HeadMaster",
      "Training staff",
      "HR",
      "Instructor",
      "Reviewer",
      "Trainee",
      "AOC Manager",
    ],
  },
  {
    key: "2",
    label: "Plan",
    icon: "AccountBookOutlined", // Planning/documentation
    path: "/plan",
    roles: ["Training staff", "Trainee", "Reviewer", "HR"],
  },
  {
    key: "3",
    label: "Schedule",
    icon: "ScheduleOutlined",
    path: "/schedule",
    roles: ["Training staff", "Trainee", "Instructor"],
    children: [
      {
        key: "3-1",
        label: "All Schedule",
        path: "/schedule",
        roles: ["Training staff", "Instructor", "Trainee"],
      },
    ],
  },
  {
    key: "4",
    label: "Notifications",
    icon: "BellOutlined",
    path: "/notifications",
    roles: [
      "Admin",
      "HeadMaster",
      "Training staff",
      "HR",
      "Instructor",
      "Reviewer",
      "Trainee",
      "AOC Manager",
    ],
  },
  {
    key: "5",
    label: "Accomplishments",
    icon: "FileDoneOutlined", // Achievement
    path: "/accomplishments",
    roles: ["Trainee"],
  },
  {
    key: "6",
    label: "Accounts",
    icon: "TeamOutlined", // Better for multiple user accounts
    path: "/accounts",
    roles: ["Admin", "Reviewer"],
  },
  {
    key: "7",
    label: "Candidates",
    icon: "SolutionOutlined", // Person review/interview
    path: "/candidates",
    roles: ["Admin", "HR"],
    children: [
      {
        key: "7-1",
        label: "View Candidates",
        path: "/candidates-view",
        roles: ["Admin", "HR"],
      },
      {
        key: "7-2",
        label: "Import Candidates",
        path: "/candidates-import",
        roles: ["Admin", "HR"],
      },
    ],
  },
  {
    key: "8",
    label: "Grade",
    icon: "FileExcelOutlined",
    path: "/grade-view",
    roles: ["Instructor", "Admin", "Training staff", "Reviewer"],
    children: [
      {
        key: "8-1",
        label: "Import Grade",
        path: "/grade",
        roles: ["Admin", "Instructor"],
      },
      {
        key: "8-2",
        label: "View Grade",
        path: "/grade-view",
        roles: ["Admin", "Instructor", "Training staff", "Reviewer", "Trainee"],
      },
    ],
  },
  {
    key: "9",
    label: "Request",
    icon: "SelectOutlined",
    path: "/request",
    roles: ["Admin", "Training staff", "HeadMaster"],
  },
  {
    key: "10",
    label: "Send Request",
    icon: "FileAddOutlined",
    path: "/send-request",
    roles: ["Trainee", "Training staff", "HR", "AOC Manager"],
  },
  {
    key: "11",
    label: "Assign Trainee",
    icon: "DeploymentUnitOutlined",
    path: "/assign-trainee",
    roles: ["Admin", "Training staff", "HeadMaster"],
    children: [
      {
        key: "11-1",
        label: "Import Assign Trainee",
        path: "/import-assign-trainee",
        roles: ["Admin", "Training staff", "HeadMaster", "Trainee"],
      },
      {
        key: "11-2",
        label: "Assigned Trainee",
        path: "/assigned-trainee",
        roles: ["Admin", "Training staff", "HeadMaster", "Trainee"],
      },
    ],
  },
  {
    key: "12",
    label: "Subject",
    icon: "ReadOutlined",
    path: "/subject",
    roles: ["Admin", "Training staff", "user"],
  },
  {
    key: "13",
    label: "Course",
    icon: "BookOutlined",
    path: "/course",
    roles: ["Training staff", "Trainee"],
    children: [
      {
        key: "13-1",
        label: "All Courses",
        path: "/all-courses",
        roles: ["Training staff"],
      },
      {
        key: "13-2",
        label: "Trainee Courses",
        path: "/assigned-trainee-courses/:id",
        roles: ["Trainee"],
      },
    ],
  },
  {
    key: "14",
    label: "Certificate",
    icon: "FileProtectOutlined",
    path: "/certificate",
    roles: ["Admin", "HR", "AOC Manager", "Training staff"],
    children: [
      {
        key: "14-1",
        label: "Certificate Pending",
        path: "/certificate-pending",
        roles: ["Admin", "HR", "AOC Manager", "Training staff"],
      },
      {
        key: "14-2",
        label: "Certificate Active",
        path: "/certificate-active",
        roles: ["Admin", "HR", "AOC Manager", "Training staff"],
      },
    ],
  },
  {
    key: "15",
    label: "Certificate Template",
    icon: "FileProtectOutlined",
    path: "/certificate-template",
    roles: ["Admin", "HR", "AOC Manager"],
  },
  {
    key: "16",
    label: "Specialty",
    icon: "ImportOutlined",
    path: "/specialty",
    roles: ["Admin", "Training staff"],
  },
  {
    key: "17",
    label: "Regulations",
    icon: "FileProtectOutlined",
    path: "/regulations",
    roles: [
      "Admin",
      "Training staff",
      "Trainee",
      "Instructor",
      "Reviewer",
      "HeadMaster",
      "HR",
      "AOC Manager",
    ],
  },
];

export default navItems;
