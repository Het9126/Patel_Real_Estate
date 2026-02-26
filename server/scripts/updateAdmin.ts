import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const [newUser, newPass] = process.argv.slice(2);
    if (!newUser || !newPass) {
        console.error("Usage: pnpm exec tsx server/scripts/updateAdmin.ts <username> <password>");
        process.exit(1);
    }
    const hashed = await bcrypt.hash(newPass, 10);

    const [existing] = await db.select().from(adminUsers).limit(1);
    if (existing) {
        await db
            .update(adminUsers)
            .set({ username: newUser, password: hashed })
            .where(eq(adminUsers.id, existing.id));
        console.log("Updated admin to", newUser);
    } else {
        await db.insert(adminUsers).values({
            username: newUser,
            password: hashed,
            name: "Admin User",
            role: "admin",
        });
        console.log("Created admin account", newUser);
    }
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
