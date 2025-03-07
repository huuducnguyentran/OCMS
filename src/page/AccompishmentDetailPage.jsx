import { useParams } from "react-router-dom";
import accomplishments from "../data/AccomplishmentData";
import { Button } from "antd";

const AccomplishmentDetail = () => {
  const { id } = useParams();
  const accomplishment = accomplishments.find((item) => item.id === id);

  if (!accomplishment) {
    return <div className="p-8 text-center">Certification not found</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <h1 className="text-xl font-bold text-gray-700 mb-4">
        All Completed Certification &gt;{" "}
        <span className="font-extrabold">{accomplishment.title}</span>
      </h1>

      {/* Content */}
      <div className="flex gap-8">
        {/* Certificate Image */}
        <div className="w-2/3 bg-gray-300  rounded-lg"></div>

        {/* User Information */}
        <div className="w-1/3 bg-gray-200 p-6 rounded-lg shadow-lg">
          <img
            src={accomplishment.user.avatar}
            alt="User"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <p className="text-center font-semibold">
            {accomplishment.user.name}
          </p>
          <div className="text-gray-700 mt-4 space-y-1">
            <p>
              <strong>Date of birth:</strong> {accomplishment.user.dob}
            </p>
            <p>
              <strong>Certification number:</strong>{" "}
              {accomplishment.user.certNumber}
            </p>
            <p>
              <strong>Date issue:</strong> {accomplishment.user.issueDate}
            </p>
            <p>
              <strong>Training time frame:</strong>{" "}
              {accomplishment.user.trainingTime}
            </p>
            <p>
              <strong>Complete score:</strong> {accomplishment.user.score}
            </p>
            <p>
              <strong>Academic ranking:</strong> {accomplishment.user.ranking}
            </p>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <Button
        style={{
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          marginTop: "20px",
        }}
      >
        EXPORT
      </Button>
    </div>
  );
};

export default AccomplishmentDetail;
