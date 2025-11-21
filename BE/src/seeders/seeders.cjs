'use strict';
require('dotenv').config();
const { Sequelize } = require('sequelize');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');

// =========== DATABASE CONNECTION ============
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

// =========== UP: SEEDING LOGIC ============
async function runSeed(queryInterface) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  // IDs to reference across tables
  const companyId = randomUUID();
  const serviceCenterD1Id = randomUUID();
  const serviceCenterD7Id = randomUUID();

  const roleAdminId = randomUUID();
  const roleManagerId = randomUUID();
  const roleTechnicianId = randomUUID();
  const roleStaffId = randomUUID();
  const rolePartsCoordinatorCompanyId = randomUUID();
  const rolePartsCoordinatorServiceCenterId = randomUUID();

  const centralWarehouseId = randomUUID();
  const d1WarehouseId = randomUUID();

  const modelSId = randomUUID();
  const model3Id = randomUUID();

  const batteryTypeId = randomUUID();
  const bumperTypeId = randomUUID();
  const screenTypeId = randomUUID();

  const customerId = randomUUID();
  const vehicleVin =
    'VIN' + Math.random().toString().slice(2, 16).toUpperCase();

  const adminUserId = randomUUID();
  const managerD1UserId = randomUUID();
  const tech1D1UserId = randomUUID();
  const tech2D1UserId = randomUUID();
  const staffD1UserId = randomUUID();
  const partsCoordinatorCompanyUserId = randomUUID();
  const partsCoordinatorD1UserId = randomUUID();

  console.log('Seeding VehicleCompany...');
  await queryInterface.bulkInsert('vehicle_company', [
    {
      vehicle_company_id: companyId,
      name: 'EMV Auto',
      address: '123 Innovation Drive, Tech City',
      phone: '02811112222',
      email: 'contact@emv-auto.com',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding Role...');
  await queryInterface.bulkInsert('role', [
    {
      role_id: roleAdminId,
      role_name: 'emv_admin',
      max_tasks: 99,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: roleManagerId,
      role_name: 'service_center_manager',
      max_tasks: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: roleTechnicianId,
      role_name: 'service_center_technician',
      max_tasks: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: roleStaffId,
      role_name: 'service_center_staff',
      max_tasks: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: rolePartsCoordinatorCompanyId,
      role_name: 'parts_coordinator_company',
      max_tasks: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      role_id: rolePartsCoordinatorServiceCenterId,
      role_name: 'parts_coordinator_service_center',
      max_tasks: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding ServiceCenter...');
  await queryInterface.bulkInsert('service_center', [
    {
      service_center_id: serviceCenterD1Id,
      name: 'EMV Service Center - District 1',
      address: '1 Vo Van Kiet, District 1, HCMC',
      phone: '02838111222',
      vehicle_company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      service_center_id: serviceCenterD7Id,
      name: 'EMV Service Center - District 7',
      address: '10 Nguyen Van Linh, District 7, HCMC',
      phone: '02838777888',
      vehicle_company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding User...');
  await queryInterface.bulkInsert('user', [
    {
      user_id: adminUserId,
      user_name: 'emvadmin',
      password: hashedPassword,
      email: 'admin@emv-auto.com',
      phone: '0901000001',
      address: 'EMV HQ',
      name: 'EMV Super Admin',
      employee_code: 'EMV001',
      role_id: roleAdminId,
      vehicle_company_id: companyId,
      service_center_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: managerD1UserId,
      user_name: 'managerd1',
      password: hashedPassword,
      email: 'manager.d1@emv-auto.com',
      phone: '0901000002',
      address: 'Service Center D1',
      name: 'Manager D1',
      employee_code: 'EMV002',
      role_id: roleManagerId,
      vehicle_company_id: companyId,
      service_center_id: serviceCenterD1Id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: tech1D1UserId,
      user_name: 'tech1d1',
      password: hashedPassword,
      email: 'tech1.d1@emv-auto.com',
      phone: '0901000003',
      address: 'Service Center D1',
      name: 'Technician A',
      employee_code: 'EMV003',
      role_id: roleTechnicianId,
      vehicle_company_id: companyId,
      service_center_id: serviceCenterD1Id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: tech2D1UserId,
      user_name: 'tech2d1',
      password: hashedPassword,
      email: 'tech2.d1@emv-auto.com',
      phone: '0901000004',
      address: 'Service Center D1',
      name: 'Technician B',
      employee_code: 'EMV004',
      role_id: roleTechnicianId,
      vehicle_company_id: companyId,
      service_center_id: serviceCenterD1Id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: staffD1UserId,
      user_name: 'staffd1',
      password: hashedPassword,
      email: 'staff.d1@emv-auto.com',
      phone: '0901000005',
      address: 'Service Center D1',
      name: 'Staff D1',
      employee_code: 'EMV005',
      role_id: roleStaffId,
      vehicle_company_id: companyId,
      service_center_id: serviceCenterD1Id,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: partsCoordinatorCompanyUserId,
      user_name: 'partscoordinator_hq',
      password: hashedPassword,
      email: 'parts.hq@emv-auto.com',
      phone: '0901000006',
      address: 'EMV HQ',
      name: 'Parts Coordinator HQ',
      employee_code: 'EMV006',
      role_id: rolePartsCoordinatorCompanyId,
      vehicle_company_id: companyId,
      service_center_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      user_id: partsCoordinatorD1UserId,
      user_name: 'partscoordinator_d1',
      password: hashedPassword,
      email: 'parts.d1@emv-auto.com',
      phone: '0901000007',
      address: 'Service Center D1',
      name: 'Parts Coordinator D1',
      employee_code: 'EMV007',
      role_id: rolePartsCoordinatorServiceCenterId,
      vehicle_company_id: companyId,
      service_center_id: serviceCenterD1Id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding Warehouse...');
  await queryInterface.bulkInsert('warehouse', [
    {
      warehouse_id: centralWarehouseId,
      name: 'EMV Central Warehouse',
      address: '123 Innovation Drive, Tech City',
      priority: 1,
      vehicle_company_id: companyId,
      service_center_id: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      warehouse_id: d1WarehouseId,
      name: 'D1 Service Warehouse',
      address: '1 Vo Van Kiet, District 1, HCMC',
      priority: 10,
      vehicle_company_id: null,
      service_center_id: serviceCenterD1Id,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding VehicleModel...');
  await queryInterface.bulkInsert('vehicle_model', [
    {
      vehicle_model_id: modelSId,
      vehicle_model_name: 'EMV Model S',
      sku: 'EMV-S-2024',
      year_of_launch: '2024-01-01',
      general_warranty_duration: 36,
      general_warranty_mileage: 100000,
      vehicle_company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      vehicle_model_id: model3Id,
      vehicle_model_name: 'EMV Model 3',
      sku: 'EMV-3-2025',
      year_of_launch: '2025-01-01',
      general_warranty_duration: 36,
      general_warranty_mileage: 100000,
      vehicle_company_id: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding TypeComponent...');
  await queryInterface.bulkInsert('type_component', [
    {
      type_component_id: batteryTypeId,
      name: 'HV Battery 100kWh',
      price: 10000,
      sku: 'EMV-BAT-100',
      category: 'HIGH_VOLTAGE_BATTERY',
      make_brand: 'EMV Parts',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      type_component_id: bumperTypeId,
      name: 'Front Bumper Model S',
      price: 500,
      sku: 'EMV-BMP-S-F',
      category: 'BODY_CHASSIS',
      make_brand: 'EMV Parts',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      type_component_id: screenTypeId,
      name: 'Infotainment Screen 17-inch',
      price: 800,
      sku: 'EMV-INF-17',
      category: 'INFOTAINMENT_ADAS',
      make_brand: 'EMV Parts',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding Stock...');
  await queryInterface.bulkInsert('stock', [
    {
      stock_id: randomUUID(),
      quantity_in_stock: 50,
      warehouse_id: centralWarehouseId,
      type_component_id: batteryTypeId,
      reorder_point: 10,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      stock_id: randomUUID(),
      quantity_in_stock: 200,
      warehouse_id: centralWarehouseId,
      type_component_id: bumperTypeId,
      reorder_point: 50,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      stock_id: randomUUID(),
      quantity_in_stock: 150,
      warehouse_id: centralWarehouseId,
      type_component_id: screenTypeId,
      reorder_point: 40,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      stock_id: randomUUID(),
      quantity_in_stock: 5,
      warehouse_id: d1WarehouseId,
      type_component_id: batteryTypeId,
      reorder_point: 2,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      stock_id: randomUUID(),
      quantity_in_stock: 0,
      warehouse_id: d1WarehouseId,
      type_component_id: bumperTypeId,
      reorder_point: 5,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      stock_id: randomUUID(),
      quantity_in_stock: 10,
      warehouse_id: d1WarehouseId,
      type_component_id: screenTypeId,
      reorder_point: 3,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding Customer...');
  await queryInterface.bulkInsert('customer', [
    {
      id: customerId,
      full_name: 'Nguyen Van A',
      email: 'nguyenvana@email.com',
      phone: '0987654321',
      address: '456 Le Loi, District 1, HCMC',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding Vehicle...');
  await queryInterface.bulkInsert('vehicle', [
    {
      vin: vehicleVin,
      date_of_manufacture: '2024-02-15',
      place_of_manufacture: 'EMV Auto Factory',
      vehicle_model_id: modelSId,
      license_plate: '51A-123.45',
      owner_id: customerId,
      purchase_date: '2024-03-01',
      outstanding_recall_campaign_ids: '[]', // Added default value
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding VehicleProcessingRecord...');
  const processingRecordId = randomUUID();
  await queryInterface.bulkInsert('vehicle_processing_record', [
    {
      vehicle_processing_record_id: processingRecordId,
      vin: vehicleVin,
      check_in_date: new Date(),
      odometer: 15000,
      status: 'IN_DIAGNOSIS',
      created_by_staff_id: staffD1UserId,
      main_technician_id: tech1D1UserId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding GuaranteeCase...');
  const guaranteeCaseId = randomUUID();
  await queryInterface.bulkInsert('guarantee_case', [
    {
      guarantee_case_id: guaranteeCaseId,
      vehicle_processing_record_id: processingRecordId,
      status: 'IN_DIAGNOSIS',
      content_guarantee:
        'Customer reports front bumper is cracked after a minor incident.',
      lead_tech_id: tech1D1UserId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding CaseLine...');
  const caseLineId = randomUUID();
  await queryInterface.bulkInsert('case_line', [
    {
      id: caseLineId,
      guarantee_case_id: guaranteeCaseId,
      diagnostic_tech_id: tech1D1UserId,
      diagnosis_text:
        'Visual inspection confirms a crack on the front bumper. Replacement is necessary.',
      correction_text: 'Replace front bumper.',
      warranty_status: 'INELIGIBLE',
      type_component_id: bumperTypeId,
      quantity: 1,
      status: 'WAITING_FOR_PARTS',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding TaskAssignment...');
  await queryInterface.bulkInsert('task_assignment', [
    {
      task_assignment_id: randomUUID(),
      technician_id: tech1D1UserId,
      case_line_id: caseLineId,
      task_type: 'DIAGNOSIS',
      is_active: false,
      completed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      task_assignment_id: randomUUID(),
      technician_id: tech2D1UserId,
      case_line_id: caseLineId,
      task_type: 'REPAIR',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('Seeding StockTransferRequest...');
  const transferRequestId = randomUUID();
  await queryInterface.bulkInsert('StockTransferRequests', [
    {
      id: transferRequestId,
      requesting_warehouse_id: d1WarehouseId,
      requested_by_user_id: adminUserId,
      status: 'APPROVED',
      request_type: 'CASELINE',
      requested_at: new Date(),
      approved_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  await queryInterface.bulkInsert('StockTransferRequestItems', [
    {
      id: randomUUID(),
      request_id: transferRequestId,
      type_component_id: bumperTypeId,
      quantity_requested: 1,
      caseline_id: caseLineId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
}

// =========== DOWN: CLEANUP LOGIC ============
async function cleanDB(queryInterface) {
  console.log('Cleaning up database...');
  await queryInterface.bulkDelete('StockTransferRequestItems', null, {});
  await queryInterface.bulkDelete('StockTransferRequests', null, {});
  await queryInterface.bulkDelete('task_assignment', null, {});
  await queryInterface.bulkDelete('case_line', null, {});
  await queryInterface.bulkDelete('guarantee_case', null, {});
  await queryInterface.bulkDelete('vehicle_processing_record', null, {});
  await queryInterface.bulkDelete('vehicle', null, {});
  await queryInterface.bulkDelete('customer', null, {});
  await queryInterface.bulkDelete('stock', null, {});
  await queryInterface.bulkDelete('type_component', null, {});
  await queryInterface.bulkDelete('vehicle_model', null, {});
  await queryInterface.bulkDelete('warehouse', null, {});
  await queryInterface.bulkDelete('user', null, {});
  await queryInterface.bulkDelete('service_center', null, {});
  await queryInterface.bulkDelete('role', null, {});
  await queryInterface.bulkDelete('vehicle_company', null, {});
  console.log('Cleanup complete.');
}


// =========== MAIN EXECUTION ============
async function main() {
  const command = process.argv[2] || 'up'; // Default to 'up'

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    const queryInterface = sequelize.getQueryInterface();

    if (command === 'down') {
      await cleanDB(queryInterface);
    } else if (command === 'up') {
      await runSeed(queryInterface);
    } else {
      console.log(`Unknown command: ${command}. Use 'up' or 'down'.`);
    }

    if (command === 'up') {
        console.log('\n✅ Seeding completed successfully!');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

main();