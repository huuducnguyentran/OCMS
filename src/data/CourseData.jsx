// src/data/CourseData.jsx
const courseData = [
  {
    semester: 1,
    title: "Introduction to Aviation",
    duration: "3 months",
    major: "Aviation Science",
    slot: 2,
    weeklyFrequency: 3,
    room: "A101",
    days: ["Monday", "Wednesday", "Friday"],
  },
  {
    semester: 2,
    title: "Principles of Flight",
    duration: "3 months",
    major: "Aviation Science",
    slot: 3,
    weeklyFrequency: 4,
    room: "B202",
    days: ["Tuesday", "Thursday", "Saturday", "Sunday"],
  },
  {
    semester: 3,
    title: "Aircraft Systems and Maintenance",
    duration: "4 months",
    major: "Aeronautical Engineering",
    slot: 4,
    weeklyFrequency: 2,
    room: "C303",
    days: ["Monday", "Thursday"],
  },
  {
    semester: 4,
    title: "Navigation and Meteorology",
    duration: "4 months",
    major: "Aviation Science",
    slot: 5,
    weeklyFrequency: 3,
    room: "D404",
    days: ["Wednesday", "Friday"],
  },
  {
    semester: 5,
    title: "Aviation Safety and Regulations",
    duration: "4 months",
    major: "Aviation Management",
    slot: 1,
    weeklyFrequency: 2,
    room: "E505",
    days: ["Tuesday", "Thursday"],
  },
  {
    semester: 6,
    title: "Flight Operations and Air Traffic Control",
    duration: "5 months",
    major: "Aviation Management",
    slot: 3,
    weeklyFrequency: 3,
    room: "F606",
    days: ["Monday", "Wednesday"],
  },
];

const slotData = [
  { slot: 1, timeFrame: "7:00 AM - 9:00 AM" },
  { slot: 2, timeFrame: "9:00 AM - 11:00 AM" },
  { slot: 3, timeFrame: "11:00 AM - 1:00 PM" },
  { slot: 4, timeFrame: "1:00 PM - 3:00 PM" },
  { slot: 5, timeFrame: "3:00 PM - 5:00 PM" },
];

export { courseData, slotData };
