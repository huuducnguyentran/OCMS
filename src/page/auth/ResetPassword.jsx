// src/pages/ResetPassword.jsx
import { Input, Button, Form, Alert, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik } from "formik";
import { ResetPasswordSchema } from "../../../utils/validationSchemas";
import { useState, useEffect } from "react";
import axios from "axios";
import * as THREE from "three";
import { BASE_URL } from "../../../utils/environment";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      setErrorMessage("Invalid or expired password reset link.");
    }
    setToken(resetToken || "");

    // Background animation like login page
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
    if (container) container.appendChild(renderer.domElement);

    const createSky = () => {
      const geometry = new THREE.SphereGeometry(1000, 60, 40);
      geometry.scale(-1, 1, 1);
      const uniforms = {
        topColor: { value: new THREE.Color(0x0066ff) },
        bottomColor: { value: new THREE.Color(0x000033) },
        offset: { value: 500 },
        exponent: { value: 0.7 },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
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
            gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h,0.0),exponent),0.0)), 1.0);
          }
        `,
        side: THREE.BackSide,
      });
      return new THREE.Mesh(geometry, material);
    };

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
      return new THREE.Points(geometry, material);
    };

    const sky = createSky();
    const stars = createStars();
    scene.add(sky);
    scene.add(stars);

    camera.position.z = 1;
    camera.position.y = 50;
    camera.rotation.x = -Math.PI * 0.1;

    const animate = () => {
      requestAnimationFrame(animate);
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
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
  }, [location.search]);

  const handleResetPassword = async (values, { setSubmitting }) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await axios.post(`${BASE_URL}/Auth/reset-password`, {
        token,
        newPassword: values.newPassword,
      });

      message.success("Password reset successful! Please login.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900" />
      <div id="animation-container" className="absolute inset-0" />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden p-8">
            <h2 className="text-2xl font-bold text-center text-white mb-6">
              Reset Your Password
            </h2>

            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                className="mb-4"
              />
            )}

            <Formik
              initialValues={{ newPassword: "", confirmPassword: "" }}
              validationSchema={ResetPasswordSchema}
              onSubmit={handleResetPassword}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
              }) => (
                <Form onFinish={handleSubmit} className="space-y-6">
                  <Form.Item
                    validateStatus={
                      errors.newPassword && touched.newPassword ? "error" : ""
                    }
                    help={touched.newPassword && errors.newPassword}
                  >
                    <Input.Password
                      name="newPassword"
                      placeholder="New Password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      className="h-12 bg-white/10 border-gray-500/30 text-white rounded-lg"
                      value={values.newPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>

                  <Form.Item
                    validateStatus={
                      errors.confirmPassword && touched.confirmPassword
                        ? "error"
                        : ""
                    }
                    help={touched.confirmPassword && errors.confirmPassword}
                  >
                    <Input.Password
                      name="confirmPassword"
                      placeholder="Confirm New Password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      className="h-12 bg-white/10 border-gray-500/30 text-white rounded-lg"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg"
                  >
                    Reset Password
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
