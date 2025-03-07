
// import { useState } from "react";
// import { Layout, Input, Button, Upload, DatePicker } from "antd";
// import { UploadOutlined } from "@ant-design/icons";

// const { TextArea } = Input;

// const CreateNewCoursePage = () => {
//   const [courses,setCourses] = useState([]);
//   const [courseData, setCourseData] = useState({
//     title: "",
//     code: "",
//     level: "",
//     description: "",
//     startDate: null,
//     endDate: null,
//     image: null,
//     imageUrl: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setCourseData({ ...courseData, [e.target.name]: e.target.value });
//   };

//   const handleDateChange = (name, date) => {
//     setCourseData({ ...courseData, [name]: date });
//   };

//   // const handleImageUpload = (info) => {
//   //   if (info.file.status === "done") {
//   //     setCourseData({ ...courseData, image: info.file.originFileObj });
//   //   }
//   // };

//    const handleImageUpload = ({ file }) => {
//     const imageUrl = URL.createObjectURL(file);
//     setCourseData({ ...courseData, image: file, imageUrl });
//   };

//   const handleCreateCourse = () => {
//     if (!courseData.title || !courseData.code || !courseData.level || !courseData.description || !courseData.startDate || !courseData.endDate) {
//       message.error("Please fill in all required fields!");
//       return;
//     }

//     setLoading(true);

//     setTimeout(() => {
//       const newCourse = {
//         id: courses.length + 1,
//         title: courseData.title,
//         code: courseData.code,
//         level: courseData.level,
//         description: courseData.description,
//         startDate: courseData.startDate.format("YYYY-MM-DD"),
//         endDate: courseData.endDate.format("YYYY-MM-DD"),
//         image: courseData.imageUrl,
//       };

//       setCourses([...courses, newCourse]); // Lưu vào danh sách khóa học
//       message.success("Course created successfully!");

//       setCourseData({
//         title: "",
//         code: "",
//         level: "",
//         description: "",
//         startDate: null,
//         endDate: null,
//         image: null,
//         imageUrl: "",
//       });

//       setLoading(false);
//     }, 1000);
//   };


//   return (
//     <Layout className="min-h-screen flex items-center justify-center bg-gray-200 p-10">
//       <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10">
//         {/* Left Section - Course Form */}
//         <div className="space-y-6">
//           <h2 className="text-3xl font-bold text-gray-800 mb-4">
//             Create a New Course
//           </h2>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               Course Title
//             </label>
//             <Input
//               name="title"
//               placeholder="Course Title" 
//               value={courseData.title}
//               onChange={handleChange}
//               className="p-3 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 w-full"
//             />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               Course Code
//             </label>
//             <Input
//               name="code"
//               placeholder="Course Code" 
//               value={courseData.code}
//               onChange={handleChange}
//               className="p-3 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 w-full"
//             />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               Course Level
//             </label>
//             <Input
//               name="level"
//               placeholder="Course Level" 
//               value={courseData.level}
//               onChange={handleChange}
//               className="p-3 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 w-full"
//             />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">
//               Course Description
//             </label>
//             <TextArea
//               rows={5}
//               name="description"
//               placeholder="Course Description" 
//               value={courseData.description}
//               onChange={handleChange}
//               className="p-3 text-lg rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 w-full"
//             />
//           </div>

//           {/* Date Inputs */}
//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-lg font-semibold text-gray-700 mb-2">
//                 Start Date
//               </label>
//               <DatePicker
//                 className="p-3 text-lg w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
//                 onChange={(date) => handleDateChange("startDate", date)}
//               />
//             </div>
//             <div>
//               <label className="block text-lg font-semibold text-gray-700 mb-2">
//                 End Date
//               </label>
//               <DatePicker
//                 className="p-3 text-lg w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
//                 onChange={(date) => handleDateChange("endDate", date)}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Right Section - Image Upload & Button */}
//         <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md">
//           <div className="w-60 h-60 bg-gray-300 flex items-center justify-center rounded-md overflow-hidden shadow-md">
//             {courseData.image ? (
//               <img
//                 src={courseData.imageUrl}
//                 alt="Course"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-gray-600 text-lg">Put Image Here</span>
//             )}
//           </div>

//           <Upload
//             showUploadList={false}
//             beforeUpload={() => false}
//             onChange={handleImageUpload}
//           >
//             <Button
//               icon={<UploadOutlined />}
//               className="mt-6 px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//             >
//               Upload Image
//             </Button>
//           </Upload>

//           <Button
//             type="primary"
//             className="mt-8 px-6 py-3 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 w-full"
//             onClick={handleCreateCourse} 
//             loading={loading}
//           >
//              {loading ? "Creating..." : "Create Course"}
//           </Button>
//         </div>
//       </div>

//        {/* Hiển thị danh sách khóa học */}
//        <div className="mt-10 w-full max-w-4xl">
//         <h2 className="text-2xl font-bold mb-4">Course List</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {courses.map((course) => (
//             <div key={course.id} className="p-4 bg-red-500 shadow-md rounded-lg">
//                <h3 className="text-xl font-semibold">{course.title}</h3>
//                <p><strong>Code:</strong> {course.code}</p>
//                <p><strong>Level:</strong> {course.level}</p>
//                <p><strong>Start Date:</strong> {course.startDate}</p>
//                <p><strong>End Date:</strong> {course.endDate}</p>
//                {course.image && <img src={course.image} alt={course.title} className="w-full h-40 object-cover mt-2 rounded-md" />}
//             </div>
//            ))}
//          </div>
//        </div>
//     </Layout>
//   );
// };

// export default CreateNewCoursePage;


// import { useState } from "react";
// import { Layout, Input, Button, Upload, DatePicker, message } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";

// const { TextArea } = Input;

// const CreateNewCoursePage = () => {
//   const [courses, setCourses] = useState([]);
//   const [courseData, setCourseData] = useState({
//     title: "",
//     code: "",
//     level: "",
//     description: "",
//     startDate: null,
//     endDate: null,
//     image: null,
//     imageUrl: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate(); // Hook điều hướng trang

//   const handleChange = (e) => {
//     setCourseData({ ...courseData, [e.target.name]: e.target.value });
//   };

//   const handleDateChange = (name, date) => {
//     setCourseData({ ...courseData, [name]: date });
//   };

//   const handleImageUpload = ({ file }) => {
//     const imageUrl = URL.createObjectURL(file);
//     setCourseData({ ...courseData, image: file, imageUrl });
//   };

//   const handleCreateCourse = () => {
//     if (!courseData.title || !courseData.code || !courseData.level || !courseData.description || !courseData.startDate || !courseData.endDate) {
//       message.error("Please fill in all required fields!");
//       return;
//     }

//     setLoading(true);

//     setTimeout(() => {
//       const newCourse = {
//         id: courses.length + 1,
//         title: courseData.title,
//         code: courseData.code,
//         level: courseData.level,
//         description: courseData.description,
//         startDate: courseData.startDate.format("YYYY-MM-DD"),
//         endDate: courseData.endDate.format("YYYY-MM-DD"),
//         image: courseData.imageUrl,
//       };

//       setCourses([...courses, newCourse]);
//       message.success("Course created successfully!");

//       setCourseData({
//         title: "",
//         code: "",
//         level: "",
//         description: "",
//         startDate: null,
//         endDate: null,
//         image: null,
//         imageUrl: "",
//       });

//       setLoading(false);

//       navigate("/course"); // Điều hướng về CoursePage sau khi tạo khóa học
//     }, 1000);
//   };

//   return (
//     <Layout className="min-h-screen flex items-center justify-center bg-gray-200 p-10">
//       <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10">
//         <div className="space-y-6">
//           <h2 className="text-3xl font-bold text-gray-800 mb-4">Create a New Course</h2>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">Course Title</label>
//             <Input name="title" placeholder="Course Title" value={courseData.title} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">Course Code</label>
//             <Input name="code" placeholder="Course Code" value={courseData.code} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">Course Level</label>
//             <Input name="level" placeholder="Course Level" value={courseData.level} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700 mb-2">Course Description</label>
//             <TextArea rows={5} name="description" placeholder="Course Description" value={courseData.description} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
//           </div>

//           <div className="grid grid-cols-2 gap-6">
//             <div>
//               <label className="block text-lg font-semibold text-gray-700 mb-2">Start Date</label>
//               <DatePicker className="p-3 text-lg w-full rounded-lg border border-gray-300" onChange={(date) => handleDateChange("startDate", date)} />
//             </div>
//             <div>
//               <label className="block text-lg font-semibold text-gray-700 mb-2">End Date</label>
//               <DatePicker className="p-3 text-lg w-full rounded-lg border border-gray-300" onChange={(date) => handleDateChange("endDate", date)} />
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md">
//           <div className="w-60 h-60 bg-gray-300 flex items-center justify-center rounded-md overflow-hidden shadow-md">
//             {courseData.image ? <img src={courseData.imageUrl} alt="Course" className="w-full h-full object-cover" /> : <span className="text-gray-600 text-lg">Put Image Here</span>}
//           </div>

//           <Upload showUploadList={false} beforeUpload={() => false} onChange={handleImageUpload}>
//             <Button icon={<UploadOutlined />} className="mt-6 px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600">Upload Image</Button>
//           </Upload>

//           <Button type="primary" className="mt-8 px-6 py-3 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 w-full" onClick={handleCreateCourse} loading={loading}>
//             {loading ? "Creating..." : "Create Course"}
//           </Button>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default CreateNewCoursePage;

import { useState, useEffect } from "react";
import { Layout, Input, Button, Upload, DatePicker, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { TextArea } = Input;

const CreateNewCoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState({
    title: "",
    code: "",
    level: "",
    description: "",
    startDate: null,
    endDate: null,
    image: null,
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load courses từ localStorage khi trang load
  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("courses")) || [];
    setCourses(storedCourses);
  }, []);

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, date) => {
    setCourseData({ ...courseData, [name]: date });
  };

  // const handleImageUpload = ({ file }) => {
  //   const imageUrl = URL.createObjectURL(file);
  //   setCourseData({ ...courseData, image: file, imageUrl });
  // };
  const handleImageUpload = ({ file }) => {
  const reader = new FileReader();
  reader.readAsDataURL(file); // Chuyển hình ảnh thành base64
  reader.onload = () => {
    setCourseData({ ...courseData, imageUrl: reader.result });
  };
};

  const handleCreateCourse = () => {
    if (!courseData.title || !courseData.code || !courseData.level || !courseData.description || !courseData.startDate || !courseData.endDate) {
      message.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newCourse = {
        id: courses.length ? Math.max(...courses.map((c) => c.id)) + 1 : 1, // Tạo ID không bị trùng
        title: courseData.title,
        code: courseData.code,
        level: courseData.level,
        description: courseData.description,
        startDate: courseData.startDate.format("YYYY-MM-DD"),
        endDate: courseData.endDate.format("YYYY-MM-DD"),
        image: courseData.imageUrl, // Lưu đường dẫn ảnh để xem lại
      };

      const updatedCourses = [...courses, newCourse];
      setCourses(updatedCourses);
      localStorage.setItem("courses", JSON.stringify(updatedCourses)); 
      message.success("Course created successfully!");

      setCourseData({
        title: "",
        code: "",
        level: "",
        description: "",
        startDate: null,
        endDate: null,
        image: null,
        imageUrl: "",
      });

      setLoading(false);

      navigate("/course");
    }, 1000);
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gray-200 p-10">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Create a New Course</h2>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Course Title</label>
            <Input name="title" placeholder="Course Title" value={courseData.title} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Course Code</label>
            <Input name="code" placeholder="Course Code" value={courseData.code} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Course Level</label>
            <Input name="level" placeholder="Course Level" value={courseData.level} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Course Description</label>
            <TextArea rows={5} name="description" placeholder="Course Description" value={courseData.description} onChange={handleChange} className="p-3 text-lg rounded-lg border border-gray-300 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">Start Date</label>
              <DatePicker
                className="p-3 text-lg w-full rounded-lg border border-gray-300"
                value={courseData.startDate ? dayjs(courseData.startDate) : null}
                onChange={(date) => handleDateChange("startDate", date)}
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">End Date</label>
              <DatePicker
                className="p-3 text-lg w-full rounded-lg border border-gray-300"
                value={courseData.endDate ? dayjs(courseData.endDate) : null}
                onChange={(date) => handleDateChange("endDate", date)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md">
          <div className="w-60 h-60 bg-gray-300 flex items-center justify-center rounded-md overflow-hidden shadow-md">
            {courseData.image ? <img src={courseData.imageUrl} alt="Course" className="w-full h-full object-cover" /> : <span className="text-gray-600 text-lg">Put Image Here</span>}
          </div>

          <Upload showUploadList={false} beforeUpload={() => false} onChange={handleImageUpload}>
            <Button icon={<UploadOutlined />} className="mt-6 px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600">Upload Image</Button>
          </Upload>

          <Button type="primary" className="mt-8 px-6 py-3 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 w-full" onClick={handleCreateCourse} loading={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateNewCoursePage;




