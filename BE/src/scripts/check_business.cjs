require("dotenv").config();
const db = require("../models/index.cjs");
const { Op } = require("sequelize");

const checkBusiness = async () => {
  try {
    console.log("Starting business logic check...");

    // Wait for connection if needed, or verify connection
    await db.sequelize.authenticate();
    console.log("Database connection established.");

    const { StockTransferRequest, StockReservation } = db;

    // 1. Check for APPROVED requests without reservations
    const approvedRequests = await StockTransferRequest.findAll({
      where: { status: "APPROVED" },
      include: [
        {
          model: StockReservation,
          as: "reservations",
        },
      ],
    });

    const approvedWithoutReservations = approvedRequests.filter(
      (req) => !req.reservations || req.reservations.length === 0
    );

    if (approvedWithoutReservations.length > 0) {
      console.error(
        `[ERROR] Found ${approvedWithoutReservations.length} APPROVED requests without reservations:`
      );
      approvedWithoutReservations.forEach((req) => console.error(` - ID: ${req.id}`));
    } else {
      console.log("[OK] All APPROVED requests have reservations.");
    }

    // 2. Check for RESERVED reservations linked to non-active requests
    const orphanReservations = await StockReservation.findAll({
      where: { status: "RESERVED" },
      include: [
        {
          model: StockTransferRequest,
          as: "stockTransferRequest",
        },
      ],
    });

    const invalidReservations = orphanReservations.filter(
      (res) =>
        !res.stockTransferRequest ||
        ["RECEIVED", "CANCELLED", "REJECTED"].includes(res.stockTransferRequest.status)
    );

    if (invalidReservations.length > 0) {
      console.error(
        `[ERROR] Found ${invalidReservations.length} RESERVED reservations linked to closed requests:`
      );
      invalidReservations.forEach((res) =>
        console.error(
          ` - ReservationID: ${res.reservationId}, RequestID: ${res.requestId}, Status: ${res.stockTransferRequest?.status}`
        )
      );
    } else {
      console.log("[OK] No orphaned RESERVED reservations found.");
    }

    console.log("Business check completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error checking business logic:", error);
    process.exit(1);
  }
};

checkBusiness();
