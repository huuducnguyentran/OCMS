// src/component/MainLayout.jsx
import { Layout } from "antd";

import PropTypes from "prop-types";
import Navbar from "../component/NabBar";
import Header from "../component/Header";
import Footer from "../component/Footer";

const MainLayout = ({ children }) => (
  <Layout className="min-h-screen flex w-screen">
    <Navbar />
    <Layout className="flex flex-col w-full">
      <Header />
      {children}
      <Footer />
    </Layout>
  </Layout>
);

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default MainLayout;
