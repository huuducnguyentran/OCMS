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

  const handleImageUpload = ({ file }) => {
    if (!file) return;
    
    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      message.error('Chỉ chấp nhận file ảnh định dạng JPG, PNG hoặc GIF!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCourseData(prev => ({
        ...prev,
        image: file,
        imageUrl: reader.result
      }));
    };
    reader.readAsDataURL(file);
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
            {courseData.imageUrl ? (
              <img 
                src={courseData.imageUrl} 
                alt="Course preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 text-lg">Put Image Here</span>
            )}
          </div>

          <Upload 
            accept="image/*"
            showUploadList={false} 
            beforeUpload={() => false}
            onChange={handleImageUpload}
          >
            <Button 
              icon={<UploadOutlined />} 
              className="mt-6 px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Upload Image
            </Button>
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




