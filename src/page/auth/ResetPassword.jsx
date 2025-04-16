// src/pages/ResetPassword.jsx
import { Input, Button, message, Form } from "antd";
import { useState, useEffect } from "react";
import { resetPassword } from "../../services/authServices";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined, LockOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import * as THREE from 'three';

const ResetPassword = () => {
  // Get token from URL query params
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if no token provided
  useEffect(() => {
    if (!token) {
      message.error("Invalid password reset link. Please request a new link.");
      navigate("/forgot-password");
    }
  }, [token, navigate]);

  // Check password confirmation
  useEffect(() => {
    if (confirmPassword === "") {
      setPasswordMatch(null);
    } else if (newPassword === confirmPassword) {
      setPasswordMatch(true);
    } else {
      setPasswordMatch(false);
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    const container = document.getElementById('animation-container');
    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Create sky with gradient
    const createSky = () => {
      const geometry = new THREE.SphereGeometry(1000, 60, 40);
      geometry.scale(-1, 1, 1);

      const uniforms = {
        topColor: { value: new THREE.Color(0x0066ff) },
        bottomColor: { value: new THREE.Color(0x000033) },
        offset: { value: 500 },
        exponent: { value: 0.7 }
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
        side: THREE.BackSide
      });

      return new THREE.Mesh(geometry, skyMaterial);
    };

    // Create stars
    const createStars = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];

      for (let i = 0; i < 15000; i++) {
        const x = Math.random() * 3000 - 1500;
        const y = Math.random() * 3000 - 1500;
        const z = Math.random() * 3000 - 1500;
        vertices.push(x, y, z);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });

      const stars = new THREE.Points(geometry, material);
      stars.userData = {
        originalOpacity: material.opacity
      };
      return stars;
    };

    const sky = createSky();
    const stars = createStars();
    scene.add(sky);
    scene.add(stars);

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

      stars.material.opacity = stars.userData.originalOpacity * (0.8 + 0.2 * Math.sin(time * 2));

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  const handleReset = async () => {
    if (!token) {
      message.error("Invalid reset token. Please request a new password reset.");
      return;
    }

    if (!newPassword) {
      message.error("Please enter a new password.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await resetPassword(token, newPassword);
      message.success(responseMessage || "Password has been reset successfully!");
      navigate("/login");
    } catch (errorMessage) {
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Static gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900" />

      {/* 3D Animation Container */}
      <div id="animation-container" className="absolute inset-0" />

      {/* Back Button */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/login")}
        className="absolute top-4 left-4 text-blue-300 hover:text-blue-200 z-20"
      >
        Back to Login
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Reset Password Form */}
              <div className="w-full md:w-1/2 p-8 bg-white/5">
                <div className="text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">Reset Password</h2>
                  <p className="text-blue-200/80">Enter your new password</p>
                </div>

                <Form className="space-y-6">
                  <Form.Item>
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 bg-white/10 border-gray-500/30 text-white rounded-lg"
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div className="relative">
                      <Input.Password
                        prefix={<LockOutlined className="text-gray-400" />}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`h-12 bg-white/10 text-white rounded-lg ${
                          passwordMatch === false 
                            ? "border-red-500" 
                            : passwordMatch === true 
                              ? "border-green-500" 
                              : "border-gray-500/30"
                        }`}
                        autoComplete="new-password"
                      />
                      {passwordMatch !== null && (
                        <span className="absolute right-3 top-3">
                          {passwordMatch ? (
                            <CheckCircleFilled className="text-green-500 text-lg" />
                          ) : (
                            <CloseCircleFilled className="text-red-500 text-lg" />
                          )}
                        </span>
                      )}
                    </div>
                    {passwordMatch === false && (
                      <div className="text-red-500 text-sm mt-1">
                        Passwords do not match
                      </div>
                    )}
                  </Form.Item>

                  <Button
                    type="primary"
                    loading={loading}
                    onClick={handleReset}
                    disabled={!newPassword || passwordMatch !== true}
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 border-0 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset Password
                  </Button>
                </Form>
              </div>

              {/* Right Side - Branding */}
              <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-lg">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">
                      FlightVault
                    </span>
                  </h1>
                  <p className="text-blue-200/80 text-lg mb-8">
                    Your Gateway to the Skies
                  </p>
                  <div className="space-y-4">
                    <div className="text-gray-300 bg-white/5 p-6 rounded-lg">
                      <p className="text-sm opacity-80 leading-relaxed">
                        Set a new password to secure your account. Make sure to choose a strong and secure password.
                      </p>
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

export default ResetPassword;
