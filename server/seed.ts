import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { adminUsers, agents, properties, inquiries } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  try {
    const [existingAdmin] = await db.select().from(adminUsers).limit(1);
    if (existingAdmin) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    await storage.createAdmin({
      username: "admin",
      password: hashedPassword,
      name: "Admin User",
      role: "admin",
    });

    const agent1 = await storage.createAgent({
      name: "Michael Roberts",
      email: "michael@homevista.com",
      phone: "+1 (555) 234-5678",
      photo: "/images/agent-1.png",
      specialization: "Luxury",
      experience: 12,
      bio: "Michael is a top-performing luxury real estate agent with over 12 years of experience in high-end properties across New York and Los Angeles.",
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      propertiesSold: 185,
    });

    const agent2 = await storage.createAgent({
      name: "Sarah Thompson",
      email: "sarah@homevista.com",
      phone: "+1 (555) 345-6789",
      photo: "/images/agent-2.png",
      specialization: "Residential",
      experience: 8,
      bio: "Sarah specializes in residential properties and has helped hundreds of families find their perfect home. Known for her attention to detail and client-first approach.",
      facebook: "https://facebook.com",
      linkedin: "https://linkedin.com",
      instagram: "https://instagram.com",
      propertiesSold: 120,
    });

    const agent3 = await storage.createAgent({
      name: "David Chen",
      email: "david@homevista.com",
      phone: "+1 (555) 456-7890",
      photo: "/images/agent-3.png",
      specialization: "Commercial",
      experience: 15,
      bio: "David is an expert in commercial real estate with a proven track record in office spaces, retail properties, and mixed-use developments.",
      twitter: "https://twitter.com",
      linkedin: "https://linkedin.com",
      propertiesSold: 95,
    });

    const propertySeedData = [
      {
        title: "Luxury Waterfront Villa",
        description: "Stunning 5-bedroom waterfront villa with panoramic ocean views. This exquisite property features floor-to-ceiling windows, a private infinity pool, chef's kitchen with premium appliances, and direct beach access. The master suite includes a spa-like bathroom and private balcony. Smart home technology throughout.",
        price: 2500000,
        propertyType: "villa",
        status: "sale",
        bedrooms: 5,
        bathrooms: 4,
        area: 4500,
        city: "Miami",
        address: "789 Ocean Drive",
        state: "FL",
        zipCode: "33139",
        amenities: ["Pool", "Garden", "Security", "Parking", "AC", "WiFi", "Gym"],
        images: ["/images/property-1.png", "/images/property-6.png"],
        featured: true,
        agentId: agent1.id,
        yearBuilt: 2022,
        garage: 3,
      },
      {
        title: "Modern Downtown Apartment",
        description: "Sleek 2-bedroom apartment in the heart of downtown Manhattan. Open concept living with premium finishes, quartz countertops, and stainless steel appliances. Building amenities include rooftop terrace, fitness center, and 24/7 concierge. Walking distance to Central Park.",
        price: 850000,
        propertyType: "apartment",
        status: "sale",
        bedrooms: 2,
        bathrooms: 2,
        area: 1200,
        city: "New York",
        address: "456 5th Avenue",
        state: "NY",
        zipCode: "10018",
        amenities: ["AC", "WiFi", "Gym", "Security", "Balcony", "Parking"],
        images: ["/images/property-2.png", "/images/property-4.png"],
        featured: true,
        agentId: agent2.id,
        yearBuilt: 2020,
        garage: 1,
      },
      {
        title: "Charming Suburban Family Home",
        description: "Beautiful 4-bedroom family home in a quiet residential neighborhood. Features a spacious backyard, updated kitchen, hardwood floors throughout, and a cozy fireplace in the living room. Close to top-rated schools and shopping centers.",
        price: 475000,
        propertyType: "house",
        status: "sale",
        bedrooms: 4,
        bathrooms: 3,
        area: 2800,
        city: "Austin",
        address: "123 Oak Lane",
        state: "TX",
        zipCode: "78701",
        amenities: ["Garden", "Parking", "Kitchen", "WiFi", "AC"],
        images: ["/images/property-3.png"],
        featured: true,
        agentId: agent2.id,
        yearBuilt: 2018,
        garage: 2,
      },
      {
        title: "Luxury Penthouse Suite",
        description: "Breathtaking penthouse with 360-degree city views. This 3-bedroom masterpiece features imported Italian marble, a private elevator, wine cellar, and wraparound terrace. Building includes valet parking and spa facilities.",
        price: 3200000,
        propertyType: "apartment",
        status: "sale",
        bedrooms: 3,
        bathrooms: 3,
        area: 3200,
        city: "Los Angeles",
        address: "1 Sunset Boulevard, PH",
        state: "CA",
        zipCode: "90028",
        amenities: ["Pool", "Gym", "Security", "Parking", "AC", "WiFi", "TV", "Balcony"],
        images: ["/images/property-4.png", "/images/property-2.png"],
        featured: true,
        agentId: agent1.id,
        yearBuilt: 2023,
        garage: 2,
      },
      {
        title: "Prime Commercial Office Space",
        description: "Modern commercial office space in a Class A building. Features open floor plan, conference rooms, fiber optic internet, and abundant natural light. Perfect for tech startups or professional services firms.",
        price: 8500,
        propertyType: "commercial",
        status: "rent",
        bedrooms: 0,
        bathrooms: 2,
        area: 5000,
        city: "San Francisco",
        address: "500 Market Street",
        state: "CA",
        zipCode: "94105",
        amenities: ["WiFi", "AC", "Security", "Parking"],
        images: ["/images/property-5.png"],
        featured: false,
        agentId: agent3.id,
        yearBuilt: 2019,
        garage: 0,
      },
      {
        title: "Beachfront Paradise Retreat",
        description: "Stunning beachfront property with private access to pristine white sand beaches. Features 4 bedrooms, outdoor kitchen, heated pool, and lush tropical landscaping. Perfect as a vacation home or rental investment.",
        price: 1800000,
        propertyType: "villa",
        status: "sale",
        bedrooms: 4,
        bathrooms: 3,
        area: 3500,
        city: "Miami",
        address: "2100 Collins Avenue",
        state: "FL",
        zipCode: "33140",
        amenities: ["Pool", "Garden", "Kitchen", "WiFi", "AC", "Security", "Balcony"],
        images: ["/images/property-6.png", "/images/property-1.png"],
        featured: true,
        agentId: agent1.id,
        yearBuilt: 2021,
        garage: 2,
      },
      {
        title: "Cozy Studio Apartment",
        description: "Well-designed studio apartment perfect for young professionals. Features modern kitchen, in-unit washer/dryer, and great natural light. Building has rooftop deck and bike storage.",
        price: 2200,
        propertyType: "apartment",
        status: "rent",
        bedrooms: 1,
        bathrooms: 1,
        area: 550,
        city: "Chicago",
        address: "200 N Michigan Ave",
        state: "IL",
        zipCode: "60601",
        amenities: ["WiFi", "AC", "Security", "Kitchen"],
        images: ["/images/property-2.png"],
        featured: false,
        agentId: agent2.id,
        yearBuilt: 2017,
        garage: 0,
      },
      {
        title: "Executive Family Estate",
        description: "Grand 6-bedroom estate on 2 acres of manicured grounds. Features a gourmet kitchen, home theater, wine cellar, tennis court, and guest house. The epitome of luxury family living.",
        price: 4500000,
        propertyType: "house",
        status: "sale",
        bedrooms: 6,
        bathrooms: 5,
        area: 7500,
        city: "Houston",
        address: "1500 River Oaks Blvd",
        state: "TX",
        zipCode: "77019",
        amenities: ["Pool", "Garden", "Gym", "Security", "Parking", "AC", "WiFi", "TV", "Kitchen"],
        images: ["/images/property-1.png", "/images/property-3.png"],
        featured: true,
        agentId: agent3.id,
        yearBuilt: 2020,
        garage: 4,
      },
    ];

    for (const propData of propertySeedData) {
      await storage.createProperty(propData);
    }

    const inquirySeedData = [
      { name: "Emily Johnson", email: "emily@example.com", phone: "+1 (555) 111-2233", message: "I'm interested in the Luxury Waterfront Villa. Can you arrange a viewing this weekend?", propertyId: 1, agentId: agent1.id, contacted: false },
      { name: "Robert Williams", email: "robert@example.com", phone: "+1 (555) 444-5566", message: "Looking for a family home in Austin. What options do you have in the $400K-$500K range?", propertyId: 3, agentId: agent2.id, contacted: true },
      { name: "Lisa Park", email: "lisa@example.com", message: "We need commercial office space for 50 employees in San Francisco. Is the Market Street space still available?", propertyId: 5, agentId: agent3.id, contacted: false },
      { name: "James Miller", email: "james@example.com", phone: "+1 (555) 777-8899", message: "Interested in investment properties in Miami. Can you send me more details on beachfront options?", contacted: false },
    ];

    for (const inqData of inquirySeedData) {
      await storage.createInquiry(inqData);
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seed error:", err);
  }
}
