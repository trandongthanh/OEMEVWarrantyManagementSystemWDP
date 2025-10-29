/**
 * Notification Helper for Socket.IO
 * Provides utility functions to emit notifications to users
 */

/**
 * Emit notification to a specific user
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} userId - Target user ID
 * @param {object} notificationData - Notification payload
 */
export function emitToUser(io, userId, notificationData) {
  const room = `user_${userId}`;
  io.to(room).emit("notification", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    ...notificationData,
  });
  console.log(
    `📤 Notification sent to user ${userId}:`,
    notificationData.title
  );
}

/**
 * Emit notification to all technicians in a service center
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} serviceCenterId - Service center ID
 * @param {object} notificationData - Notification payload
 */
export function emitToServiceCenterTechnicians(
  io,
  serviceCenterId,
  notificationData
) {
  const room = `service_center_technician_${serviceCenterId}`;
  io.to(room).emit("caseAssigned", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    type: "case_assigned",
    priority: "high",
    ...notificationData,
  });
  console.log(
    `📤 Notification sent to technicians in service center ${serviceCenterId}`
  );
}

/**
 * Emit notification to service center staff
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} serviceCenterId - Service center ID
 * @param {object} notificationData - Notification payload
 */
export function emitToServiceCenterStaff(
  io,
  serviceCenterId,
  notificationData
) {
  const room = `service_center_staff_${serviceCenterId}`;
  io.to(room).emit("notification", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    ...notificationData,
  });
  console.log(
    `📤 Notification sent to staff in service center ${serviceCenterId}`
  );
}

/**
 * Emit notification to service center manager
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} serviceCenterId - Service center ID
 * @param {object} notificationData - Notification payload
 */
export function emitToServiceCenterManager(
  io,
  serviceCenterId,
  notificationData
) {
  const room = `service_center_manager_${serviceCenterId}`;
  io.to(room).emit("notification", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    ...notificationData,
  });
  console.log(
    `📤 Notification sent to manager in service center ${serviceCenterId}`
  );
}

/**
 * Emit notification to parts coordinators at company
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} companyId - Company ID
 * @param {object} notificationData - Notification payload
 */
export function emitToPartsCoordinatorCompany(io, companyId, notificationData) {
  const room = `parts_coordinator_company_${companyId}`;
  io.to(room).emit("stockTransferRequest", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    type: "stock_transfer_request",
    priority: "medium",
    ...notificationData,
  });
  console.log(
    `📤 Stock transfer notification sent to parts coordinators at company ${companyId}`
  );
}

/**
 * Emit notification to EMV staff at company
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} companyId - Company ID
 * @param {object} notificationData - Notification payload
 */
export function emitToEMVStaff(io, companyId, notificationData) {
  const room = `emv_staff_${companyId}`;
  io.to(room).emit("notification", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    ...notificationData,
  });
  console.log(`📤 Notification sent to EMV staff at company ${companyId}`);
}

/**
 * Emit notification to parts coordinators at service center
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} companyId - Company/Service Center ID
 * @param {object} notificationData - Notification payload
 */
export function emitToPartsCoordinatorServiceCenter(
  io,
  companyId,
  notificationData
) {
  const room = `parts_coordinator_service_center_${companyId}`;
  io.to(room).emit("notification", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    ...notificationData,
  });
  console.log(
    `📤 Notification sent to parts coordinators at service center ${companyId}`
  );
}

/**
 * Emit case assigned notification
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} userId - Target technician user ID
 * @param {object} caseData - Case information
 */
export function emitCaseAssigned(io, userId, caseData) {
  emitToUser(io, userId, {
    type: "case_assigned",
    priority: "high",
    title: "New Case Assigned",
    message: `Case ${caseData.caseId} has been assigned to you`,
    actionUrl: `/dashboard/technician/cases/${caseData.caseId}`,
    data: caseData,
  });
}

/**
 * Emit case updated notification
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} userId - Target user ID
 * @param {object} caseData - Case information
 */
export function emitCaseUpdated(io, userId, caseData) {
  emitToUser(io, userId, {
    type: "case_updated",
    priority: "medium",
    title: "Case Updated",
    message: `Case ${caseData.caseId} has been updated`,
    actionUrl: `/dashboard/cases/${caseData.caseId}`,
    data: caseData,
  });
}

/**
 * Emit appointment scheduled notification
 * @param {object} io - Socket.IO server instance (notificationNamespace)
 * @param {string} userId - Target user ID
 * @param {object} appointmentData - Appointment information
 */
export function emitAppointmentScheduled(io, userId, appointmentData) {
  io.to(`user_${userId}`).emit("appointmentScheduled", {
    notificationId: generateNotificationId(),
    timestamp: new Date().toISOString(),
    type: "appointment_scheduled",
    priority: "high",
    title: "Appointment Scheduled",
    message: `Your appointment has been scheduled for ${appointmentData.date}`,
    actionUrl: `/dashboard/appointments/${appointmentData.appointmentId}`,
    data: appointmentData,
  });
  console.log(`📤 Appointment notification sent to user ${userId}`);
}

/**
 * Generate unique notification ID
 */
function generateNotificationId() {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Example usage in your services:
 *
 * // In task assignment service
 * import { emitCaseAssigned } from '../socket/notificationHelper.js';
 *
 * async function assignCaseToTechnician(caseId, technicianId) {
 *   // Your assignment logic...
 *
 *   // Send notification
 *   const notificationNamespace = getNotificationNamespace(); // You'll need to export this from socket.js
 *   emitCaseAssigned(notificationNamespace, technicianId, {
 *     caseId: caseId,
 *     caseNumber: 'CASE-123',
 *     customerName: 'John Doe',
 *     vehicleModel: 'Tesla Model 3'
 *   });
 * }
 */
