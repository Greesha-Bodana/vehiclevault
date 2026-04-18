const bcrypt = require("bcrypt");
const userSchema = require("../models/UserModel");

const seedDefaultUsers = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@vehiclevault.com").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
  const subadminEmail = (process.env.SUBADMIN_EMAIL || "subadmin@vehiclevault.com").toLowerCase().trim();
  const subadminPassword = process.env.SUBADMIN_PASSWORD || "Subadmin@123";

  const createUser = async (email, password, role, name) => {
    const existing = await userSchema.findOne({ email });
    if (existing) {
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userSchema.create({
      name,
      email,
      password: hashedPassword,
      role
    });
    console.log(`Seeded ${role} account: ${email}`);
  };

  await createUser(adminEmail, adminPassword, "admin", "VehicleVault Admin");
  await createUser(subadminEmail, subadminPassword, "subadmin", "VehicleVault Subadmin");
};

module.exports = seedDefaultUsers;
