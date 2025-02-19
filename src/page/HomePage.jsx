import { Layout } from "antd";

const HomePage = () => (
  <Layout className="min-h-screen flex w-screen">
    <Layout className="flex flex-col w-full h-screen">
      <Layout.Content className="p-6 bg-gray-100 flex-grow">
        <h2 className="text-2xl font-semibold">Prepare for your career</h2>
        <h2 className="text-2xl font-semibold mt-6">
          First step to learn about more
        </h2>
      </Layout.Content>
    </Layout>
  </Layout>
);

export default HomePage;
