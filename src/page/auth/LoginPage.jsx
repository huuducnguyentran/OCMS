// src/pages/LoginPage.jsx
import { Input, Button, message, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { authServices } from "../../services/authServices";
import { useAuth } from "../../context/useAuth";
import { Formik } from "formik";
import { LoginSchema } from "../../../utils/validationSchemas";
import { useEffect } from "react";
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import * as THREE from "three";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById("animation-container");
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Tạo bầu trời với gradient
    const createSky = () => {
      const geometry = new THREE.SphereGeometry(1000, 60, 40);
      geometry.scale(-1, 1, 1);

      const uniforms = {
        topColor: { value: new THREE.Color(0x0066ff) },
        bottomColor: { value: new THREE.Color(0x000033) },
        offset: { value: 500 },
        exponent: { value: 0.7 },
      };

      const skyMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + offset).y;
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
          }
        `,
        side: THREE.BackSide,
      });

      return new THREE.Mesh(geometry, skyMaterial);
    };

    // Tạo các ngôi sao
    const createStars = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];

      for (let i = 0; i < 15000; i++) {
        const x = Math.random() * 3000 - 1500;
        const y = Math.random() * 3000 - 1500;
        const z = Math.random() * 3000 - 1500;
        vertices.push(x, y, z);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
      );

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      });

      const stars = new THREE.Points(geometry, material);
      stars.userData = {
        originalOpacity: material.opacity,
      };
      return stars;
    };

    const sky = createSky();
    const stars = createStars();
    scene.add(sky);
    scene.add(stars);

    // Thêm ánh sáng
    const ambientLight = new THREE.AmbientLight(0x555555, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    camera.position.z = 1;
    camera.position.y = 50;
    camera.rotation.x = -Math.PI * 0.1;

    let time = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.0005;

      camera.position.y = 50 + Math.sin(time) * 10;
      camera.position.x = Math.sin(time * 0.5) * 20;
      camera.lookAt(scene.position);

      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;

      stars.material.opacity =
        stars.userData.originalOpacity * (0.8 + 0.2 * Math.sin(time * 2));

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const response = await authServices.loginUser(values);
      const { token, userID, roles } = response.data;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("userID", userID);
      sessionStorage.setItem("role", roles?.[0] || "user");
      sessionStorage.setItem("tokenExpiry", Date.now() + 60 * 60 * 1000);

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
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background gradient tĩnh */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900" />

      {/* 3D Animation Container */}
      <div id="animation-container" className="absolute inset-0" />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Login Form */}
              <div className="w-full md:w-1/2 p-8 bg-white/5">
                <div className="text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                  <p className="text-blue-200/80">
                    Sign in to continue your journey
                  </p>
                </div>

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
                    <Form onFinish={handleSubmit} className="space-y-6">
                      <Form.Item
                        validateStatus={
                          errors.username && touched.username ? "error" : ""
                        }
                        help={touched.username && errors.username}
                      >
                        <Input
                          name="username"
                          placeholder="Username"
                          prefix={<UserOutlined className="text-gray-400" />}
                          className="h-12 bg-white/10 border-gray-500/30 text-white rounded-lg"
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
                          prefix={<LockOutlined className="text-gray-400" />}
                          className="h-12 bg-white/10 border-gray-500/30 text-white rounded-lg"
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>

                      <div className="flex justify-between items-center">
                        <label className="text-gray-300 flex items-center cursor-pointer"></label>
                        <a
                          href="/forgot-password"
                          className="text-blue-300 hover:text-blue-200"
                        >
                          Forgot password?
                        </a>
                      </div>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isSubmitting}
                        className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 border-0 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                      >
                        Sign In
                      </Button>
                    </Form>
                  )}
                </Formik>
              </div>

              {/* Right Side - Branding */}
              <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-lg">
                <div className="text-center">
                  <div className="mb-8"></div>
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                      FlightVault
                    </span>
                  </h1>
                  <p className="text-blue-200/80 text-lg mb-8">
                    Your Gateway to the Skies
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-300 bg-white/5 p-3 rounded-lg">
                      <CheckCircleOutlined className="mr-3 text-blue-400" />
                      <span>Professional Training Programs</span>
                    </div>
                    <div className="flex items-center text-gray-300 bg-white/5 p-3 rounded-lg">
                      <CheckCircleOutlined className="mr-3 text-blue-400" />
                      <span>Expert Instructors</span>
                    </div>
                    <div className="flex items-center text-gray-300 bg-white/5 p-3 rounded-lg">
                      <CheckCircleOutlined className="mr-3 text-blue-400" />
                      <span>Comprehensive Learning</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
