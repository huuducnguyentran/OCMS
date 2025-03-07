import { Link } from "react-router-dom";
import accomplishments from "../data/AccomplishmentData";

const AccomplishmentsPage = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <div className="w-full bg-white p-6 rounded-lg shadow-lg">
        {/* Title */}
        <h1 className="text-xl font-bold underline mb-4">
          All Completed Certification
        </h1>

        {/* Scrollable List */}
        <div className="max-h-[300px] overflow-y-auto space-y-4">
          {accomplishments.map((item) => (
            <Link
              key={item.id}
              to={`/accomplishment/${item.id}`}
              className=" bg-gray-200 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-gray-600">{item.date}</p>
              </div>
              <span
                className={`${item.color} text-white px-3 py-1 rounded-md text-sm`}
              >
                {item.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccomplishmentsPage;
