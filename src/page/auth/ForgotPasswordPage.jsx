import { Input, Button, message, Form } from "antd";
import { useState, useEffect } from "react";
import { forgotPassword } from "../../services/authServices";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined, MailOutlined } from "@ant-design/icons";
import * as THREE from "three";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleForgotPassword = async () => {
    if (!email) {
      message.error("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      const responseMessage = await forgotPassword(email);
      message.success(responseMessage || "Password reset email sent!");
    } catch (errorMessage) {
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background gradient with cyan theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-950" />

      {/* 3D Animation Container */}
      <div id="animation-container" className="absolute inset-0" />

      {/* Back Button */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 !text-cyan-300 hover:!text-cyan-100 z-20"
      >
        Back to Login
      </Button>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Left Side - Form */}
              <div className="w-full md:w-1/2 p-8 bg-white/5">
                <div className="text-white mb-8">
                  <h2 className="text-3xl font-bold mb-2">Forgot Password?</h2>
                  <p className="text-cyan-200/80">
                    Enter your email to reset your password
                  </p>
                </div>

                <Form className="space-y-6">
                  <Form.Item>
                    <Input
                      prefix={<MailOutlined className="text-gray-400" />}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 !bg-white/10 !border-gray-500/30 !text-white rounded-lg"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    loading={loading}
                    onClick={handleForgotPassword}
                    className="w-full h-12 text-lg font-medium !bg-gradient-to-r from-cyan-600 to-cyan-700 border-0 rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all duration-300"
                  >
                    Send Reset Link
                  </Button>
                </Form>
              </div>

              {/* Right Side - Branding */}
              <div className="w-full md:w-1/2 p-8 bg-gradient-to-br from-cyan-900/30 to-cyan-950/30 backdrop-blur-lg">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 to-cyan-100">
                      FlightVault
                    </span>
                  </h1>
                  <p className="text-cyan-200/80 text-lg mb-8">
                    Your Gateway to the Skies
                  </p>
                  <div className="space-y-4">
                    <div className="text-gray-300 bg-white/5 p-6 rounded-lg">
                      <p className="text-sm opacity-80 leading-relaxed">
                        Do not worry! It happens to the best of us. Enter your
                        email address and we will send you instructions to reset
                        your password.
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

export default ForgotPassword;
