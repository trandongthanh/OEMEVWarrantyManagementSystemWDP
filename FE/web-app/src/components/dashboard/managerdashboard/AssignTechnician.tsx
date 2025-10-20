// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   UserCheck,
//   Users,
//   Clock,
//   Calendar,
//   AlertCircle,
//   Loader,
// } from "lucide-react";
// import managerService, {
//   type Technician,
//   type ProcessingRecord,
// } from "@/services/managerService";

// interface AssignTechnicianModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   record: ProcessingRecord;
//   technicians: Technician[];
//   onSuccess: () => void;
// }

// export function AssignTechnicianModal({
//   isOpen,
//   onClose,
//   record,
//   technicians,
//   onSuccess,
// }: AssignTechnicianModalProps) {
//   const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
//   const [isAssigning, setIsAssigning] = useState(false);
//   const [error, setError] = useState("");

//   const handleAssign = async () => {
//     if (!selectedTechnicianId) {
//       setError("Please select a technician");
//       return;
//     }

//     setIsAssigning(true);
//     setError("");

//     try {
//       await managerService.assignTechnician({
//         processingRecordId: record.id,
//         technicianId: selectedTechnicianId,
//       });
//       onSuccess();
//     } catch (err: unknown) {
//       setError("Failed to assign technician");
//       console.error(err);
//     } finally {
//       setIsAssigning(false);
//     }
//   };

//   const getWorkloadColor = (count: number) => {
//     if (count === 0) return "text-green-600";
//     if (count <= 2) return "text-yellow-600";
//     return "text-red-600";
//   };

//   const selectedTechnician = technicians.find(
//     (tech) => tech.userId === selectedTechnicianId
//   );

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
//             onClick={onClose}
//           />

//           {/* Modal */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4"
//           >
//             <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
//               {/* Header */}
//               <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 bg-blue-100 rounded-lg">
//                     <UserCheck className="w-5 h-5 text-blue-600" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">
//                       Assign Technician
//                     </h2>
//                     <p className="text-sm text-gray-500">VIN: {record.vin}</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={onClose}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5 text-gray-500" />
//                 </button>
//               </div>

//               {/* Content */}
//               <div className="p-6 space-y-6">
//                 {/* Record Details */}
//                 <div className="bg-gray-50 rounded-xl p-4">
//                   <h3 className="font-semibold text-gray-900 mb-3">
//                     Processing Record Details
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       <span className="text-gray-600">Check-in:</span>
//                       <span className="font-medium">
//                         {new Date(record.checkInDate).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-gray-600">Odometer:</span>
//                       <span className="font-medium">
//                         {record.odometer.toLocaleString()} km
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-3">
//                     <span className="text-sm text-gray-600">Status:</span>
//                     <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
//                       {record.status.replace(/_/g, " ")}
//                     </span>
//                   </div>
//                   {record.guaranteeCases.length > 0 && (
//                     <div className="mt-3">
//                       <span className="text-sm text-gray-600">Cases:</span>
//                       <div className="mt-1 space-y-1">
//                         {record.guaranteeCases.map((gCase) => (
//                           <div
//                             key={gCase.guaranteeCaseId}
//                             className="text-sm text-gray-700 pl-4 border-l-2 border-gray-200"
//                           >
//                             {gCase.contentGuarantee}
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Current Assignment */}
//                 {record.mainTechnician && (
//                   <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
//                     <div className="flex items-center gap-2 text-yellow-800">
//                       <AlertCircle className="w-4 h-4" />
//                       <span className="font-medium">Currently Assigned</span>
//                     </div>
//                     <p className="text-yellow-700 mt-1">
//                       {record.mainTechnician.name}
//                     </p>
//                   </div>
//                 )}

//                 {/* Technician Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-3">
//                     Select Technician
//                   </label>
//                   <div className="space-y-3 max-h-60 overflow-y-auto">
//                     {technicians.map((technician) => (
//                       <motion.div
//                         key={technician.userId}
//                         initial={{ opacity: 0, y: 10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                           selectedTechnicianId === technician.userId
//                             ? "border-blue-500 bg-blue-50"
//                             : "border-gray-200 hover:border-gray-300"
//                         }`}
//                         onClick={() =>
//                           setSelectedTechnicianId(technician.userId)
//                         }
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <Users className="w-4 h-4 text-gray-400" />
//                               <span className="font-medium text-gray-900">
//                                 {technician.name}
//                               </span>
//                               <span
//                                 className={`px-2 py-1 rounded text-xs font-medium ${
//                                   technician.workSchedule[0]?.status ===
//                                   "WORKING"
//                                     ? "bg-green-100 text-green-700"
//                                     : "bg-gray-100 text-gray-700"
//                                 }`}
//                               >
//                                 {technician.workSchedule[0]?.status || "N/A"}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-4 text-sm text-gray-600">
//                               <div className="flex items-center gap-1">
//                                 <span>Active Tasks:</span>
//                                 <span
//                                   className={`font-semibold ${getWorkloadColor(
//                                     technician.activeTaskCount
//                                   )}`}
//                                 >
//                                   {technician.activeTaskCount}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <Calendar className="w-3 h-3" />
//                                 <span>
//                                   {technician.workSchedule[0]?.workDate
//                                     ? new Date(
//                                         technician.workSchedule[0].workDate
//                                       ).toLocaleDateString()
//                                     : "N/A"}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex items-center">
//                             <div
//                               className={`w-4 h-4 rounded-full border-2 ${
//                                 selectedTechnicianId === technician.userId
//                                   ? "border-blue-500 bg-blue-500"
//                                   : "border-gray-300"
//                               }`}
//                             >
//                               {selectedTechnicianId === technician.userId && (
//                                 <div className="w-full h-full rounded-full bg-white scale-50" />
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Error Message */}
//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
//                   >
//                     <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
//                     <span className="text-sm text-red-700">{error}</span>
//                   </motion.div>
//                 )}
//               </div>

//               {/* Footer */}
//               <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
//                 <button
//                   onClick={onClose}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAssign}
//                   disabled={isAssigning || !selectedTechnicianId}
//                   className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//                 >
//                   {isAssigning ? (
//                     <>
//                       <Loader className="w-4 h-4 animate-spin" />
//                       Assigning...
//                     </>
//                   ) : (
//                     <>
//                       <UserCheck className="w-4 h-4" />
//                       {record.mainTechnician ? "Reassign" : "Assign"} Technician
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }