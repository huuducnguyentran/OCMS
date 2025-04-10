import { useState, useEffect } from "react";
import { Layout, Input, Button, DatePicker, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { trainingPlanService } from '../../services/trainingPlanService';

const { TextArea } = Input;

const EditPlanPage = () => {
  const { planId } = useParams();
  console.log("EditPlanPage - planId from params:", planId);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trainingPlanData, setTrainingPlanData] = useState({
    planName: "",
    Desciption: "",
    planLevel: 0,
    startDate: null,
    endDate: null,
    specialtyId: ""
  });

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data for planId:", planId);
        const response = await trainingPlanService.getTrainingPlanById(planId);
        console.log("Fetched plan data:", response);
        
        setTrainingPlanData({
          planName: response.planName,
          Desciption: response.desciption,
          planLevel: response.planLevel,
          startDate: dayjs(response.startDate),
          endDate: dayjs(response.endDate),
          specialtyId: response.specialtyId
        });
      } catch (error) {
        console.error("Error fetching plan:", error);
        message.error("Failed to load plan data");
        navigate("/plan"); // Navigate back on error
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlanData();
    }
  }, [planId]);

  const handleChange = (e) => {
    setTrainingPlanData({ ...trainingPlanData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name, date) => {
    setTrainingPlanData({ ...trainingPlanData, [name]: date });
  };

  const handleUpdatePlan = async () => {
    try {
      setLoading(true);
      const formattedData = {
        planName: trainingPlanData.planName,
        Desciption: trainingPlanData.Desciption,
        planLevel: 0,
        startDate: trainingPlanData.startDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        endDate: trainingPlanData.endDate.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        specialtyId: trainingPlanData.specialtyId
      };

      await trainingPlanService.updateTrainingPlan(planId, formattedData);
      message.success("Training plan updated successfully");
      navigate("/plan", { state: { refresh: true } });
    } catch (error) {
      console.error("Failed to update plan:", error);
      message.error("Failed to update training plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="min-h-screen flex items-center justify-center bg-gray-200 p-10">
      <div className="bg-white p-10 shadow-xl rounded-lg w-full max-w-6xl">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Edit Training Plan: {planId}
          </h2>

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
              name="Desciption" 
              placeholder="Description" 
              value={trainingPlanData.Desciption} 
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
                value={trainingPlanData.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                showTime
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-gray-700 mb-2">End Date</label>
              <DatePicker
                className="p-3 text-lg w-full rounded-lg border border-gray-300"
                value={trainingPlanData.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                showTime
              />
            </div>
          </div>

          <Button 
            type="primary" 
            className="mt-8 px-6 py-3 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full" 
            onClick={handleUpdatePlan} 
            loading={loading}
          >
            {loading ? "Updating..." : "Update Training Plan"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default EditPlanPage; 