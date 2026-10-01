import bcrypt from "bcryptjs";
import { loadEnvFile } from "./load-env";
import { connectDB } from "../src/lib/db";
import AdminUser from "../src/models/AdminUser";

loadEnvFile();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment or .env file.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`Admin user already exists for ${email}. Skipping creation.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({
    email,
    passwordHash,
    name: "DPM Admin",
    isActive: true,
  });

  console.log(`Admin user created for ${email}.`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Failed to create admin user:", error);
  process.exit(1);
});
