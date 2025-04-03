import { useState } from "react";
import { Layout, Input, Button, DatePicker, message } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { trainingPlanService } from '../../services/trainingPlanService';

const { TextArea } = Input;

const CreateTrainingPlanPage = () => {
  const [trainingPlanData, setTrainingPlanData] = useState({
    planName: "",
    description: "",
    planLevel: 0,
    startDate: null,  
    endDate: null,
    specialtyId: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setTrainingPlanData({ ...trainingPlanData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, date) => {
    setTrainingPlanData({ ...trainingPlanData, [name]: date });
  };

  const handleCreateTrainingPlan = async () => {
    // Validate required fields
    if (!trainingPlanData.planName?.trim()) {
      message.error("Plan Name is required!");
      return;
    }
    
    if (!trainingPlanData.description?.trim()) {
      message.error("Description is required!");
      return;
    }

    if (!trainingPlanData.specialtyId?.trim()) {
      message.error("Specialty ID is required!");
      return;
    }

    if (!trainingPlanData.startDate || !trainingPlanData.endDate) {
      message.error("Start Date and End Date are required!");
      return;
    }

    setLoading(true);
    const formattedData = {
      "planName": trainingPlanData.planName,
      "Desciption": trainingPlanData.description,
      "planLevel": 0,
      "startDate": trainingPlanData.startDate ? trainingPlanData.startDate.toISOString() : "2025-03-28T12:16:01.703Z",
      "endDate": trainingPlanData.endDate ? trainingPlanData.endDate.toISOString() : "2025-03-28T12:16:01.703Z",
      "specialtyId": trainingPlanData.specialtyId
    };

    try {
      console.log('Sending data:', formattedData);
      await trainingPlanService.createTrainingPlan(formattedData);
      message.success("Training Plan created successfully!");
      navigate("/course", { state: { refresh: true } });
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      message.error(`Failed to create Training Plan: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gray-200 p-10">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-6xl">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Create Training Plan</h2>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Plan Name</label>
            <Input 
              name="planName" 
              placeholder="Plan Name" 
              value={trainingPlanData.planName} 
              onChange={handleChange} 
              className="p-3 text-lg rounded-lg border border-gray-300 w-full" 
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Description</label>
            <TextArea 
              rows={5} 
              name="description" 
              placeholder="Description" 
              value={trainingPlanData.description} 
              onChange={handleChange} 
              className="p-3 text-lg rounded-lg border border-gray-300 w-full" 
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Plan Level</label>
            <Input 
              type="number" 
              name="planLevel" 
              placeholder="Plan Level" 
              value={trainingPlanData.planLevel} 
              onChange={handleChange} 
              className="p-3 text-lg rounded-lg border border-gray-300 w-full" 
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-2">Specialty ID</label>
            <Input 
              name="specialtyId" 
              placeholder="Specialty ID" 
              value={trainingPlanData.specialtyId} 
              onChange={handleChange} 
              className="p-3 text-lg rounded-lg border border-gray-300 w-full" 
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">Start Date</label>
              <DatePicker
                className="p-3 text-lg w-full rounded-lg border border-gray-300"
                value={trainingPlanData.startDate ? dayjs(trainingPlanData.startDate) : null}
                onChange={(date) => handleDateChange("startDate", date)}
                showTime
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">End Date</label>
              <DatePicker
                className="p-3 text-lg w-full rounded-lg border border-gray-300"
                value={trainingPlanData.endDate ? dayjs(trainingPlanData.endDate) : null}
                onChange={(date) => handleDateChange("endDate", date)}
                showTime
              />
            </div>
          </div>

          <Button 
            type="primary" 
            className="mt-8 px-6 py-3 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 w-full" 
            onClick={handleCreateTrainingPlan} 
            loading={loading}
          >
            {loading ? "Creating..." : "Create Training Plan"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTrainingPlanPage;




