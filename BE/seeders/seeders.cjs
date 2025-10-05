// seeder.cjs
const { faker } = require("@faker-js/faker");
const { Sequelize } = require("sequelize");
const bcrypt = require("bcrypt");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

// Import các model cần thiết (đã loại bỏ Component)
const {
  VehicleCompany,
  VehicleModel,
  Vehicle,
  ServiceCenter,
  TypeComponent,
  WarrantyComponent,
  User,
  Role,
  Warehouse,
  Stock,
  Customer, // Thêm Customer
} = require("../models/index.cjs");

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const generateData = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connection has been established successfully.");

    console.log("🔥 Resetting database...");
    await sequelize.sync({ force: true });
    console.log("✅ Database reset successfully.");

    // --- 1. SEED CORE DATA ---
    console.log("🌱 Seeding Core Data...");

    const createdCompany = await VehicleCompany.create({
      name: "VinFast",
      address: "Hải Phòng, Việt Nam",
      phone: faker.phone.number(),
      email: "info@vinfast.vn",
    });

    const createdRoles = await Role.bulkCreate(
      [
        { roleName: "service_center_staff" },
        { roleName: "service_center_manager" },
        { roleName: "service_center_technician" },
        { roleName: "emv_admin" },
      ],
      { returning: true }
    );

    const typeComponentData = [
      {
        name: "Bộ sạc trong xe 11kW",
        sku: "VF-OBC-11",
        price: 800,
        category: "CHARGING_SYSTEM",
      },
      {
        name: "Má phanh trước VF8",
        sku: "VF8-BRK-FRT",
        price: 150,
        category: "BRAKING",
      },
      {
        name: "Cảm biến ABS bánh sau",
        sku: "VF-ABS-SEN-R",
        price: 50,
        category: "BRAKING",
      },
      {
        name: "Giảm xóc trước",
        sku: "VF-SUS-FRT",
        price: 200,
        category: "SUSPENSION_STEERING",
      },
      {
        name: "Màn hình trung tâm 15.6 inch",
        sku: "VF-INF-15.6",
        price: 1200,
        category: "INFOTAINMENT_ADAS",
      },
      {
        name: "Ắc quy 12V",
        sku: "VF-BAT-12V",
        price: 120,
        category: "LOW_VOLTAGE_SYSTEM",
      },
    ];
    const createdTypeComponents = await TypeComponent.bulkCreate(
      typeComponentData,
      { returning: true }
    );

    console.log("✅ Seeded Core Data (Company, Roles, TypeComponents).");

    // --- 2. SEED LOCATIONS & PEOPLE ---
    console.log("🌱 Seeding Locations & People...");

    const createdServiceCenters = await ServiceCenter.bulkCreate(
      [
        {
          name: "VinFast Thảo Điền",
          address: "12 Quốc Hương, Thảo Điền, TP. Thủ Đức",
          phone: faker.phone.number(),
          vehicleCompanyId: createdCompany.vehicleCompanyId,
        },
        {
          name: "VinFast Long Biên",
          address: "Vincom Plaza Long Biên, Hà Nội",
          phone: faker.phone.number(),
          vehicleCompanyId: createdCompany.vehicleCompanyId,
        },
      ],
      { returning: true }
    );

    const centralWarehouse = await Warehouse.create({
      name: "Tổng kho VinFast Việt Nam",
      address: "Hải Phòng",
      vehicleCompanyId: createdCompany.vehicleCompanyId,
    });
    const thaoDienWarehouse = await Warehouse.create({
      name: "Kho VinFast Thảo Điền",
      address: "12 Quốc Hương",
      serviceCenterId: createdServiceCenters[0].serviceCenterId,
    });
    const longBienWarehouse = await Warehouse.create({
      name: "Kho VinFast Long Biên",
      address: "Vincom Long Biên",
      serviceCenterId: createdServiceCenters[1].serviceCenterId,
    });

    const hashedPassword = await bcrypt.hash("123456", 10);
    await User.bulkCreate([
      {
        username: "admin-vinfast",
        name: "Admin Hãng",
        password: hashedPassword,
        email: "admin@vinfast.vn",
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        roleId: createdRoles.find((r) => r.roleName === "emv_admin").roleId,
        vehicleCompanyId: createdCompany.vehicleCompanyId,
      },
      {
        username: "manager-thaodien",
        name: "Quản lý Thảo Điền",
        password: hashedPassword,
        email: "manager.td@vinfast.vn",
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        roleId: createdRoles.find(
          (r) => r.roleName === "service_center_manager"
        ).roleId,
        serviceCenterId: createdServiceCenters[0].serviceCenterId,
      },
      {
        username: "staff-thaodien",
        name: "SA Thảo Điền",
        password: hashedPassword,
        email: "staff.td@vinfast.vn",
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        roleId: createdRoles.find((r) => r.roleName === "service_center_staff")
          .roleId,
        serviceCenterId: createdServiceCenters[0].serviceCenterId,
      },
      {
        username: "tech-thaodien",
        name: "Tech Thảo Điền",
        password: hashedPassword,
        email: "tech.td@vinfast.vn",
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        roleId: createdRoles.find(
          (r) => r.roleName === "service_center_technician"
        ).roleId,
        serviceCenterId: createdServiceCenters[0].serviceCenterId,
      },
    ]);
    console.log(
      `✅ Seeded Locations & People. Default password for all is "123456"`
    );

    // --- 3. SEED INVENTORY (STOCK) ---
    console.log("🌱 Seeding Inventory...");
    const stockData = [];
    for (const type of createdTypeComponents) {
      stockData.push({
        typeComponentId: type.typeComponentId,
        warehouseId: centralWarehouse.warehouseId,
        quantityInStock: faker.number.int({ min: 200, max: 500 }),
      });
      stockData.push({
        typeComponentId: type.typeComponentId,
        warehouseId: thaoDienWarehouse.warehouseId,
        quantityInStock: faker.number.int({ min: 20, max: 50 }),
      });
      stockData.push({
        typeComponentId: type.typeComponentId,
        warehouseId: longBienWarehouse.warehouseId,
        quantityInStock: faker.number.int({ min: 10, max: 40 }),
      });
    }
    await Stock.bulkCreate(stockData);
    console.log(`✅ Seeded ${stockData.length} stock records.`);

    // --- 4. SEED VEHICLES (NEW & SOLD) ---
    console.log("🌱 Seeding Vehicles & Customers...");
    const createdModels = await VehicleModel.bulkCreate(
      [
        {
          vehicleModelName: "VF 8 Eco",
          yearOfLaunch: "2022-01-01",
          generalWarrantyDuration: 120,
          generalWarrantyMileage: 200000,
          vehicleCompanyId: createdCompany.vehicleCompanyId,
        },
        {
          vehicleModelName: "VF 9 Plus",
          yearOfLaunch: "2022-01-01",
          generalWarrantyDuration: 120,
          generalWarrantyMileage: 200000,
          vehicleCompanyId: createdCompany.vehicleCompanyId,
        },
      ],
      { returning: true }
    );

    const vehicles = [];
    // 10 new, unactivated vehicles
    for (let i = 0; i < 10; i++) {
      vehicles.push({
        vin: `VIN-NEW-${i}`,
        dateOfManufacture: faker.date.past(),
        placeOfManufacture: "Hải Phòng",
        vehicleModelId:
          faker.helpers.arrayElement(createdModels).vehicleModelId,
        isActivated: false,
        ownerId: null,
        purchaseDate: null,
        licensePlate: null,
      });
    }
    // 5 sold, activated vehicles
    const customers = await Customer.bulkCreate(
      Array.from({ length: 5 }, () => ({
        fullName: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
      })),
      { returning: true }
    );

    for (let i = 0; i < 5; i++) {
      vehicles.push({
        vin: `VIN-SOLD-${i}`,
        dateOfManufacture: faker.date.past(),
        placeOfManufacture: "Hải Phòng",
        vehicleModelId:
          faker.helpers.arrayElement(createdModels).vehicleModelId,
        isActivated: true,
        ownerId: customers[i].id,
        purchaseDate: faker.date.recent({ days: 365 }),
        licensePlate: `51K-${faker.number.int({
          min: 100,
          max: 999,
        })}.${faker.number.int({ min: 10, max: 99 })}`,
      });
    }

    await Vehicle.bulkCreate(vehicles, { ignoreDuplicates: true });
    console.log(`✅ Seeded ${vehicles.length} vehicles.`);

    console.log("\n🎉 Seeding finished successfully!");
  } catch (error) {
    console.error("❌ Unable to seed database:", error);
  } finally {
    await sequelize.close();
  }
};

generateData();
