// src/pages/LoginPage.jsx
import { Input, Button, message, Layout, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { authServices } from "../../services/authServices";
import { useAuth } from "../../context/useAuth";
import { Formik } from "formik";
import { LoginSchema } from "../../../utils/validationSchemas";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await authServices.loginUser(values);
      const { token, userID, roles } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userID", userID);
      localStorage.setItem("role", roles?.[0] || "user");
      localStorage.setItem("tokenExpiry", Date.now() + 60 * 60 * 1000); // 1hr

      setIsAuthenticated(true);
      message.success("Login successful!");
      navigate("/home");
    } catch {
      message.error("Invalid username or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout className="w-screen h-screen flex items-center justify-center !bg-gray-900">
      <Layout.Content className="w-full max-w-4xl bg-gray-800 flex shadow-lg h-[80vh]">
        {/* Left Side - Login Form */}
        <div className="w-1/2 p-8 flex flex-col justify-center">
          <h2 className="text-white text-3xl font-semibold mb-6">Login</h2>

          <Formik
            initialValues={{ username: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  validateStatus={
                    errors.username && touched.username ? "error" : ""
                  }
                  help={touched.username && errors.username}
                >
                  <Input
                    name="username"
                    placeholder="Username"
                    className="p-3"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Form.Item>

                <Form.Item
                  validateStatus={
                    errors.password && touched.password ? "error" : ""
                  }
                  help={touched.password && errors.password}
                >
                  <Input.Password
                    name="password"
                    placeholder="Password"
                    className="p-3"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Form.Item>

                <div className="text-right text-white text-sm mb-4">
                  <a href="/forgot-password">Forgot password?</a>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full py-2"
                  loading={isSubmitting}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Right Side - Branding */}
        <div className="w-1/2 bg-gray-700 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-white">
            <span className="text-red-500">F</span>
            <span className="text-green-500">l</span>
            <span className="text-blue-500">i</span>
            <span className="text-yellow-500">g</span>
            <span className="text-white">ht</span>
            <span className="text-white font-bold">Vault</span>
          </h1>
          <p className="text-gray-300 mt-2 italic text-lg">
            Choose your paths to the sky
          </p>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default LoginPage;
