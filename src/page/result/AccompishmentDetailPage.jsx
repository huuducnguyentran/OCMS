import { useParams } from "react-router-dom";
import accomplishments from "../data/AccomplishmentData";
import { Button } from "antd";
import { DownloadOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const AccomplishmentDetail = () => {
  const { id } = useParams();
  const accomplishment = accomplishments.find((item) => item.id === id);

  if (!accomplishment) {
    return <div className="p-8 text-center">Certification not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 space-x-2">
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-800 px-0"
          >
            All Completed Certification
          </Button>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-800">{accomplishment.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-12 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-8">
                <div className="w-full h-full bg-white/50 rounded-xl flex items-center justify-center">
                  <span className="text-2xl text-gray-400">Certificate Preview</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={accomplishment.user.avatar}
                    alt="User"
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-800">
                  {accomplishment.user.name}
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Date of birth", value: accomplishment.user.dob },
                  { label: "Certification number", value: accomplishment.user.certNumber },
                  { label: "Date issue", value: accomplishment.user.issueDate },
                  { label: "Training time frame", value: accomplishment.user.trainingTime },
                  { label: "Complete score", value: accomplishment.user.score },
                  { label: "Academic ranking", value: accomplishment.user.ranking }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-800">{item.value}</p>
                  </div>
                ))}
              </div>
              
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                size="large"
                className="w-full mt-8 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 
                         hover:from-blue-700 hover:to-indigo-700 border-0 rounded-xl
                         shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Export Certificate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccomplishmentDetail;
