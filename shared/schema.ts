import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  propertyType: text("property_type").notNull(),
  status: text("status").notNull().default("sale"),
  bedrooms: integer("bedrooms").notNull().default(0),
  bathrooms: integer("bathrooms").notNull().default(0),
  area: integer("area").notNull().default(0),
  city: text("city").notNull(),
  address: text("address").notNull(),
  state: text("state").notNull().default(""),
  zipCode: text("zip_code").notNull().default(""),
  amenities: text("amenities").array().default(sql`'{}'::text[]`),
  images: text("images").array().default(sql`'{}'::text[]`),
  featured: boolean("featured").notNull().default(false),
  agentId: integer("agent_id"),
  latitude: decimal("latitude"),
  longitude: decimal("longitude"),
  yearBuilt: integer("year_built"),
  garage: integer("garage").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  photo: text("photo"),
  specialization: text("specialization").notNull().default("Residential"),
  experience: integer("experience").notNull().default(0),
  bio: text("bio"),
  facebook: text("facebook"),
  twitter: text("twitter"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  propertiesSold: integer("properties_sold").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  propertyId: integer("property_id"),
  agentId: integer("agent_id"),
  contacted: boolean("contacted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertiesRelations = relations(properties, ({ one }) => ({
  agent: one(agents, { fields: [properties.agentId], references: [agents.id] }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  properties: many(properties),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  property: one(properties, { fields: [inquiries.propertyId], references: [properties.id] }),
  agent: one(agents, { fields: [inquiries.agentId], references: [agents.id] }),
}));

export const insertAdminSchema = createInsertSchema(adminUsers).omit({ id: true, createdAt: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true });
export const insertAgentSchema = createInsertSchema(agents).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true });

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof adminUsers.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
