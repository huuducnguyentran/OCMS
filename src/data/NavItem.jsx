const navItems = [
  // 1. General
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

  // 2. Learning Activities
  {
    key: "3",
    label: "Specialty",
    icon: "ImportOutlined",
    path: "/specialty",
    roles: ["Admin", "Training staff", "HR"],
  },
  {
    key: "4",
    label: "Course",
    icon: "BookOutlined",
    path: "/course",
    roles: ["Training staff", "Trainee", "Reviewer"],
    children: [
      {
        key: "4-1",
        label: "All Courses",
        path: "/all-courses",
        roles: ["Training staff", "Reviewer"],
      },
      {
        key: "4-2",
        label: "Trainee Courses",
        path: "/assigned-trainee-courses",
        roles: ["Trainee"],
      },
    ],
  },
  {
    key: "5",
    label: "Learning Matrix",
    icon: "BookOutlined",
    path: "/learning-matrix",
    roles: ["Admin", "Training staff", "HR", "Reviewer"],
  },
  {
    key: "6",
    label: "Subject",
    icon: "ReadOutlined",
    path: "/subject",
    roles: ["Training staff", "user"],
  },

  {
    key: "7",
    label: "Schedule",
    icon: "ScheduleOutlined",
    path: "/schedule",
    roles: ["Training staff", "Trainee", "Instructor"],
    children: [
      {
        key: "7-1",
        label: "All Schedule",
        path: "/schedule",
        roles: ["Training staff", "Instructor", "Trainee"],
      },
    ],
  },
  {
    key: "8",
    label: "Plan",
    icon: "AccountBookOutlined",
    path: "/plan",
    roles: ["Training staff", "Trainee", "Reviewer"],
  },
  {
    key: "9",
    label: "Accomplishments",
    icon: "FileDoneOutlined",
    path: "/accomplishments",
    roles: ["Trainee"],
  },

  // 3. Assessment & Grades
  {
    key: "10",
    label: "Grade",
    icon: "FileExcelOutlined",
    path: "/grade-view",
    roles: ["Instructor", "Training staff", "Reviewer", "Trainee"],
    children: [
      {
        key: "10-1",
        label: "Import Grade",
        path: "/grade",
        roles: ["Instructor"],
      },
      {
        key: "10-2",
        label: "View Grade",
        path: "/grade-view",
        roles: ["Instructor", "Training staff", "Reviewer"],
      },
      {
        key: "10-3",
        label: "My Grades",
        path: "/trainee-grade",
        roles: ["Trainee"],
      },
    ],
  },

  // 4. Requests
  {
    key: "11",
    label: "Request",
    icon: "SelectOutlined",
    path: "/request",
    roles: ["Training staff", "HeadMaster"],
  },
  {
    key: "12",
    label: "Send Request",
    icon: "FileAddOutlined",
    path: "/send-request",
    roles: ["Trainee", "AOC Manager", "Instructor"],
  },

  // 5. Certification & Decisions
  {
    key: "13",
    label: "Certificate",
    icon: "FileProtectOutlined",
    path: "/certificate",
    roles: ["Admin", "AOC Manager", "Training staff", "HeadMaster"],
    children: [
      {
        key: "13-1",
        label: "Certificate Pending",
        path: "/certificate-pending",
        roles: ["Admin", "HR", "Training staff", "HeadMaster"],
      },
      {
        key: "13-2",
        label: "Certificate Active",
        path: "/certificate-active",
        roles: ["Admin", "AOC Manager", "Training staff", "HeadMaster"],
      },
      {
        key: "13-3",
        label: "Certificate Revoked",
        path: "/certificate-revoked",
        roles: ["Admin", "Training staff", "HeadMaster"],
      },
    ],
  },
  {
    key: "14",
    label: "Certificate Template",
    icon: "FileProtectOutlined",
    path: "/certificate-template",
    roles: ["Admin"],
  },
  {
    key: "15",
    label: "Decision",
    icon: "FileProtectOutlined",
    path: "/decision",
    roles: ["Admin", "HR", "Training staff", "HeadMaster"],
    children: [
      {
        key: "15-1",
        label: "Decision Pending",
        path: "/decision-pending",
        roles: ["Admin", "HR", "Training staff", "HeadMaster"],
      },
      {
        key: "15-2",
        label: "Decision Active",
        path: "/decision-active",
        roles: ["Admin", "HR", "Training staff", "HeadMaster"],
      },
    ],
  },
  {
    key: "16",
    label: "Decision Template",
    icon: "FileProtectOutlined",
    path: "/decision-template",
    roles: ["Admin"],
  },

  // 6. Admin & HR
  {
    key: "17",
    label: "Accounts",
    icon: "TeamOutlined",
    path: "/accounts",
    roles: ["Admin", "Reviewer"],
    children: [
      {
        key: "17-1",
        label: "View Accounts",
        path: "/accounts",
        roles: ["Admin", "Reviewer"],
      },
      {
        key: "17-2",
        label: "Create Account",
        path: "/create-account",
        roles: ["Admin"],
      },
    ],
  },
  {
    key: "18",
    label: "Candidates",
    icon: "SolutionOutlined",
    path: "/candidates",
    roles: ["Admin", "HR", "Reviewer"],
    children: [
      {
        key: "18-1",
        label: "View Candidates",
        path: "/candidates-view",
        roles: ["Admin", "HR", "Reviewer"],
      },
      {
        key: "18-2",
        label: "Import Candidates",
        path: "/candidates-import",
        roles: ["Admin", "HR"],
      },
    ],
  },
  {
    key: "19",
    label: "Assign Trainee",
    icon: "DeploymentUnitOutlined",
    path: "/assign-trainee",
    roles: ["Training staff"],
    children: [
      {
        key: "19-1",
        label: "Import Assign Trainee",
        path: "/import-assign-trainee",
        roles: ["Training staff"],
      },
      {
        key: "19-2",
        label: "Assigned Trainee",
        path: "/assigned-trainee",
        roles: ["Training staff"],
      },
    ],
  },
  {
    key: "20",
    label: "Department",
    icon: "FileProtectOutlined",
    path: "/department",
    roles: ["HR", "AOC Manager", "Admin", "Reviewer"],
  },

  // 7. System/Other

  {
    key: "21",
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
  {
    key: "22",
    label: "Reports",
    icon: "FileExcelOutlined",
    path: "/export-certificate",
  },
  {
    key: "23",
    label: "Classroom",
    icon: "FileExcelOutlined",
    path: "/class",
    roles: ["Training staff"],
  },
];

export default navItems;
