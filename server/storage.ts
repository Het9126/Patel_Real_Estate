import {
  adminUsers, properties, agents, inquiries,
  type Admin, type InsertAdmin,
  type Property, type InsertProperty,
  type Agent, type InsertAgent,
  type Inquiry, type InsertInquiry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, ilike, gte, lte, ne, asc } from "drizzle-orm";

export interface IStorage {
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  getProperties(filters?: any): Promise<{ properties: Property[]; total: number }>;
  getPropertyById(id: number): Promise<(Property & { agent?: Agent }) | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, data: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  toggleFeatured(id: number, featured: boolean): Promise<Property | undefined>;

  getAgents(): Promise<Agent[]>;
  getAgentById(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, data: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;

  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  markContacted(id: number, contacted: boolean): Promise<Inquiry | undefined>;

  getStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [created] = await db.insert(adminUsers).values(admin).returning();
    return created;
  }

  async getProperties(filters: any = {}): Promise<{ properties: Property[]; total: number }> {
    const conditions: any[] = [];

    if (filters.search) {
      conditions.push(
        sql`(${properties.title} ILIKE ${'%' + filters.search + '%'} OR ${properties.address} ILIKE ${'%' + filters.search + '%'} OR ${properties.city} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    if (filters.city) conditions.push(ilike(properties.city, filters.city));
    if (filters.type) conditions.push(eq(properties.propertyType, filters.type));
    if (filters.status) conditions.push(eq(properties.status, filters.status));
    if (filters.bedrooms) {
      const beds = parseInt(filters.bedrooms);
      if (filters.bedrooms === "5+") {
        conditions.push(gte(properties.bedrooms, 5));
      } else if (!isNaN(beds)) {
        conditions.push(eq(properties.bedrooms, beds));
      }
    }
    if (filters.minPrice) conditions.push(gte(properties.price, parseInt(filters.minPrice)));
    if (filters.maxPrice) conditions.push(lte(properties.price, parseInt(filters.maxPrice)));
    if (filters.featured === "true") conditions.push(eq(properties.featured, true));
    if (filters.exclude) conditions.push(ne(properties.id, parseInt(filters.exclude)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (filters.sort) {
      case "price-low": orderBy = asc(properties.price); break;
      case "price-high": orderBy = desc(properties.price); break;
      case "featured": orderBy = desc(properties.featured); break;
      default: orderBy = desc(properties.createdAt);
    }

    const limit = Math.min(parseInt(filters.limit || "50"), 100);
    const page = Math.max(parseInt(filters.page || "1"), 1);
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(properties)
      .where(where);

    const rows = await db
      .select()
      .from(properties)
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return { properties: rows, total: countResult?.count || 0 };
  }

  async getPropertyById(id: number): Promise<(Property & { agent?: Agent }) | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    if (!property) return undefined;

    let agent: Agent | undefined;
    if (property.agentId) {
      const [a] = await db.select().from(agents).where(eq(agents.id, property.agentId));
      agent = a;
    }

    return { ...property, agent };
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(property).returning();
    return created;
  }

  async updateProperty(id: number, data: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updated] = await db.update(properties).set(data).where(eq(properties.id, id)).returning();
    return updated || undefined;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id)).returning();
    return result.length > 0;
  }

  async toggleFeatured(id: number, featured: boolean): Promise<Property | undefined> {
    const [updated] = await db.update(properties).set({ featured }).where(eq(properties.id, id)).returning();
    return updated || undefined;
  }

  async getAgents(): Promise<Agent[]> {
    return db.select().from(agents).orderBy(desc(agents.createdAt));
  }

  async getAgentById(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [created] = await db.insert(agents).values(agent).returning();
    return created;
  }

  async updateAgent(id: number, data: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updated] = await db.update(agents).set(data).where(eq(agents.id, id)).returning();
    return updated || undefined;
  }

  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id)).returning();
    return result.length > 0;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [created] = await db.insert(inquiries).values(inquiry).returning();
    return created;
  }

  async markContacted(id: number, contacted: boolean): Promise<Inquiry | undefined> {
    const [updated] = await db.update(inquiries).set({ contacted }).where(eq(inquiries.id, id)).returning();
    return updated || undefined;
  }

  async getStats(): Promise<any> {
    const [propCount] = await db.select({ count: sql<number>`count(*)::int` }).from(properties);
    const [agentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(agents);
    const [inqCount] = await db.select({ count: sql<number>`count(*)::int` }).from(inquiries).where(eq(inquiries.contacted, false));
    const [featuredCount] = await db.select({ count: sql<number>`count(*)::int` }).from(properties).where(eq(properties.featured, true));

    const propertyTypes = await db
      .select({ type: properties.propertyType, count: sql<number>`count(*)::int` })
      .from(properties)
      .groupBy(properties.propertyType);

    const statusBreakdown = await db
      .select({ status: properties.status, count: sql<number>`count(*)::int` })
      .from(properties)
      .groupBy(properties.status);

    const recentInquiries = await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt))
      .limit(5);

    return {
      totalProperties: propCount?.count || 0,
      totalAgents: agentCount?.count || 0,
      newInquiries: inqCount?.count || 0,
      featuredProperties: featuredCount?.count || 0,
      propertyTypes,
      statusBreakdown: statusBreakdown.map(s => ({ ...s, name: s.status === "rent" ? "For Rent" : "For Sale" })),
      recentInquiries,
    };
  }
}

export const storage = new DatabaseStorage();
