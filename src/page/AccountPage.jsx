// import { AccountData } from "../data/AccountData";

// const AccountList = () => {
//   return (
//     <div className="w-full min-h-screen bg-gray-100 p-6">
//       <div className="max-w-7xl mx-auto bg-white-400 p-6 rounded-lg shadow-lg">
//         <div className="flex justify-between items-center mb-6">
//           <input
//             type="text"
//             placeholder="Search for anything here.."
//             className="border rounded-lg p-3 w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
//           />
//           <button className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
//             Edit
//           </button>
//         </div>
//         <div className="overflow-auto max-h-[500px]">
//           <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-lg">
//             <thead className="bg-blue-950 text-white sticky top-0">
//               <tr>
//                 <th className="border p-4">Id</th>
//                 <th className="border p-4">Image</th>
//                 <th className="border p-4">Full Name</th>
//                 <th className="border p-4">Date of Birth</th>
//                 <th className="border p-4">Email</th>
//                 <th className="border p-4">Phone</th>
//                 <th className="border p-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {AccountData.map((account) => (
//                 <tr key={account.Id} className="bg-white hover:bg-gray-100">
//                   <td className="border p-4">{account.Id}</td>
//                   <td className="border p-4">
//                     <img
//                       src={account.Image}
//                       alt={account.FullName}
//                       className="w-14 h-14 rounded-full border-2 border-blue-500"
//                     />
//                   </td>
//                   <td className="border p-4 font-medium text-gray-700">
//                     {account.FullName}
//                   </td>
//                   <td className="border p-4 text-gray-600">
//                     {account.DateOfBirth}
//                   </td>
//                   <td className="border p-4 text-gray-600">{account.Email}</td>
//                   <td className="border p-4 text-gray-600">{account.Phone}</td>
//                   <td className="border p-4">
//                     <span
//                       className={`px-4 py-1 rounded-full text-white text-sm font-semibold ${
//                         account.Status === "Active"
//                           ? "bg-green-500"
//                           : "bg-red-500"
//                       }`}
//                     >
//                       {account.Status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountList;

import { AccountData } from "../data/AccountData";
import { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";

const AccountList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-100 to-indigo-200 p-8 animate__animated animate__fadeIn">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search for anything here..."
              className="border rounded-lg p-3 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black pr-10"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchOutlined className="absolute right-3 top-3 text-gray-500" />
          </div>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md">
            Edit
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-auto max-h-[500px] rounded-lg border border-gray-300 shadow-lg">
          <table className="w-full border-collapse">
            <thead className="bg-blue-900 text-white sticky top-0">
              <tr>
                <th className="border p-4 text-left">Id</th>
                <th className="border p-4 text-left">Image</th>
                <th className="border p-4 text-left">Full Name</th>
                <th className="border p-4 text-left">Date of Birth</th>
                <th className="border p-4 text-left">Email</th>
                <th className="border p-4 text-left">Phone</th>
                <th className="border p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {AccountData.filter((account) =>
                account.FullName.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((account) => (
                <tr key={account.Id} className="bg-white hover:bg-gray-100 transition duration-200">
                  <td className="border p-4">{account.Id}</td>
                  <td className="border p-4">
                    <img
                      src={account.Image}
                      alt={account.FullName}
                      className="w-14 h-14 rounded-full border-2 border-blue-500 shadow-sm"
                    />
                  </td>
                  <td className="border p-4 font-medium text-gray-800">{account.FullName}</td>
                  <td className="border p-4 text-gray-600">{account.DateOfBirth}</td>
                  <td className="border p-4 text-gray-600">{account.Email}</td>
                  <td className="border p-4 text-gray-600">{account.Phone}</td>
                  <td className="border p-4">
                    <span
                      className={`px-4 py-1 rounded-full text-white text-sm font-semibold shadow-md transition duration-300 ${
                        account.Status === "Active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {account.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountList;
