import { Layout, Card, Button, Empty, Tag, Popconfirm, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { trainingPlanService } from '../../services/trainingPlanService';
import "animate.css";

const PlanPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrainingPlans = async () => {
    try {
      setLoading(true);
      const response = await trainingPlanService.getAllTrainingPlans();
      setTrainingPlans(response.plans);
    } catch (error) {
      console.error("Failed to fetch training plans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingPlans();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchTrainingPlans();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'blue';
      case 'Pending': return 'orange';
      default: return 'default';
    }
  };

  const handleEdit = (planId) => {
    console.log("Editing plan with ID:", planId);
    if (planId) {
      navigate(`/plan/edit/${planId}`);
    } else {
      message.error("Invalid plan ID");
    }
  };

  const handleDelete = async (planId) => {
    try {
      await trainingPlanService.deleteTrainingPlan(planId);
      message.success("Training plan deleted successfully");
      fetchTrainingPlans();
    } catch (error) {
      console.error("Failed to delete training plan:", error);
      message.error("Failed to delete training plan");
    }
  };

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <Layout className="max-w-[1500px] mx-auto">
        <Layout.Content className="flex flex-col items-center">
          <div className="w-full flex flex-col items-center text-center mb-10">
            <h2 className="text-4xl font-extrabold text-indigo-900 animate__animated animate__fadeInDown">
              Training Plans
            </h2>
            <p className="text-lg text-gray-700 mt-2">
              Manage and view all training plans
            </p>
          </div>

          <Button
            type="primary"
            shape="circle"
            icon={<PlusOutlined />}
            size="large"
            className="fixed bottom-6 right-6 shadow-lg bg-blue-500 hover:bg-blue-600 animate__animated animate__bounceIn"
            onClick={() => navigate("/plan/create")}
          />

          {trainingPlans.length === 0 ? (
            <div className="flex justify-center items-center h-96 animate__animated animate__fadeIn">
              <Empty description={<span className="text-lg text-gray-600">No training plans available</span>} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full animate__animated animate__fadeInUp">
              {trainingPlans.map((plan) => (
                <Card
                  key={plan.planId}
                  hoverable
                  className="rounded-xl shadow-xl overflow-hidden flex flex-col transform transition duration-500 hover:scale-105 bg-white"
                  actions={[
                    <Button
                      icon={<EditOutlined />}
                      type="link"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(plan.planId);
                      }}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      title="Delete Training Plan"
                      description="Are you sure you want to delete this training plan?"
                      onConfirm={(e) => {
                        e.stopPropagation();
                        handleDelete(plan.planId);
                      }}
                      onCancel={(e) => e.stopPropagation()}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        type="link"
                        danger
                        onClick={(e) => e.stopPropagation()}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <div className="flex flex-col flex-grow p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-indigo-900">{plan.planName}</h3>
                      <Tag color={getStatusColor(plan.trainingPlanStatus)}>{plan.trainingPlanStatus}</Tag>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{plan.desciption}</p>
                    
                    <div className="mt-auto">
                      <p className="text-gray-700">
                        <strong>Plan ID:</strong> {plan.planId}
                      </p>
                      <p className="text-gray-700">
                        <strong>Level:</strong> {plan.planLevel}
                      </p>
                      <p className="text-gray-700">
                        <strong>Specialty:</strong> {plan.specialtyName}
                      </p>
                      <p className="text-gray-700">
                        <strong>Created by:</strong> {plan.createByUserName}
                      </p>
                      <div className="mt-2">
                        <p className="text-gray-600">
                          <strong>Start Date:</strong> {new Date(plan.startDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          <strong>End Date:</strong> {new Date(plan.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default PlanPage;
