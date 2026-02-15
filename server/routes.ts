import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPropertySchema, insertAgentSchema, insertInquirySchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.SESSION_SECRET || (process.env.NODE_ENV === "development" ? "homevista-dev-secret" : (() => { throw new Error("SESSION_SECRET must be set in production"); })());

const uploadDir = path.join(process.cwd(), "client", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: "24h" });
      return res.json({ token, user: { id: admin.id, name: admin.name, username: admin.username, role: admin.role } });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/properties", async (req: Request, res: Response) => {
    try {
      const result = await storage.getProperties(req.query);
      return res.json({ properties: result.properties, total: result.total });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/properties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      const property = await storage.getPropertyById(id);
      if (!property) return res.status(404).json({ message: "Property not found" });
      return res.json(property);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/properties", authMiddleware, upload.array("images", 10), async (req: Request, res: Response) => {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const images = files.map(f => `/uploads/${f.filename}`);

      let existingImages: string[] = [];
      if (req.body.existingImages) {
        try { existingImages = JSON.parse(req.body.existingImages); } catch {}
      }

      let amenities: string[] = [];
      if (req.body.amenities) {
        try { amenities = JSON.parse(req.body.amenities); } catch {}
      }

      const propertyData = {
        title: req.body.title,
        description: req.body.description || "",
        price: parseInt(req.body.price) || 0,
        propertyType: req.body.propertyType || "apartment",
        status: req.body.status || "sale",
        bedrooms: parseInt(req.body.bedrooms) || 0,
        bathrooms: parseInt(req.body.bathrooms) || 0,
        area: parseInt(req.body.area) || 0,
        city: req.body.city,
        address: req.body.address,
        state: req.body.state || "",
        zipCode: req.body.zipCode || "",
        amenities,
        images: [...existingImages, ...images],
        featured: req.body.featured === "true",
        agentId: req.body.agentId && req.body.agentId !== "none" ? parseInt(req.body.agentId) : null,
        yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : null,
        garage: parseInt(req.body.garage) || 0,
      };

      const parsed = insertPropertySchema.safeParse(propertyData);
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      }

      const property = await storage.createProperty(parsed.data);
      return res.status(201).json(property);
    } catch (err) {
      console.error("Create property error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/properties/:id", authMiddleware, upload.array("images", 10), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const files = (req.files as Express.Multer.File[]) || [];
      const newImages = files.map(f => `/uploads/${f.filename}`);

      let existingImages: string[] = [];
      if (req.body.existingImages) {
        try { existingImages = JSON.parse(req.body.existingImages); } catch {}
      }

      const existing = await storage.getPropertyById(id);
      if (!existing) return res.status(404).json({ message: "Not found" });

      let amenities: string[] = [];
      if (req.body.amenities) {
        try { amenities = JSON.parse(req.body.amenities); } catch {}
      }

      const allImages = newImages.length > 0 ? [...(existingImages.length > 0 ? existingImages : existing.images || []), ...newImages] : (existingImages.length > 0 ? existingImages : existing.images || []);

      const property = await storage.updateProperty(id, {
        title: req.body.title || existing.title,
        description: req.body.description ?? existing.description,
        price: req.body.price ? parseInt(req.body.price) : existing.price,
        propertyType: req.body.propertyType || existing.propertyType,
        status: req.body.status || existing.status,
        bedrooms: req.body.bedrooms ? parseInt(req.body.bedrooms) : existing.bedrooms,
        bathrooms: req.body.bathrooms ? parseInt(req.body.bathrooms) : existing.bathrooms,
        area: req.body.area ? parseInt(req.body.area) : existing.area,
        city: req.body.city || existing.city,
        address: req.body.address || existing.address,
        state: req.body.state ?? existing.state,
        zipCode: req.body.zipCode ?? existing.zipCode,
        amenities: amenities.length > 0 ? amenities : existing.amenities,
        images: allImages,
        featured: req.body.featured !== undefined ? req.body.featured === "true" : existing.featured,
        agentId: req.body.agentId ? (req.body.agentId === "none" ? null : parseInt(req.body.agentId)) : existing.agentId,
        yearBuilt: req.body.yearBuilt ? parseInt(req.body.yearBuilt) : existing.yearBuilt,
        garage: req.body.garage ? parseInt(req.body.garage) : existing.garage,
      });
      return res.json(property);
    } catch (err) {
      console.error("Update property error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/properties/:id/featured", authMiddleware, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { featured } = req.body;
      const property = await storage.toggleFeatured(id, featured);
      if (!property) return res.status(404).json({ message: "Not found" });
      return res.json(property);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/properties/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProperty(id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Deleted" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/agents", async (_req: Request, res: Response) => {
    try {
      const agentsList = await storage.getAgents();
      return res.json(agentsList);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/agents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const agent = await storage.getAgentById(id);
      if (!agent) return res.status(404).json({ message: "Agent not found" });
      return res.json(agent);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/agents", authMiddleware, upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const photo = req.file ? `/uploads/${req.file.filename}` : null;
      const agent = await storage.createAgent({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        photo,
        specialization: req.body.specialization || "Residential",
        experience: parseInt(req.body.experience) || 0,
        bio: req.body.bio || null,
        facebook: req.body.facebook || null,
        twitter: req.body.twitter || null,
        linkedin: req.body.linkedin || null,
        instagram: req.body.instagram || null,
        propertiesSold: parseInt(req.body.propertiesSold) || 0,
      });
      return res.status(201).json(agent);
    } catch (err) {
      console.error("Create agent error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/agents/:id", authMiddleware, upload.single("photo"), async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getAgentById(id);
      if (!existing) return res.status(404).json({ message: "Not found" });

      const photo = req.file ? `/uploads/${req.file.filename}` : existing.photo;
      const agent = await storage.updateAgent(id, {
        name: req.body.name || existing.name,
        email: req.body.email || existing.email,
        phone: req.body.phone || existing.phone,
        photo,
        specialization: req.body.specialization || existing.specialization,
        experience: req.body.experience ? parseInt(req.body.experience) : existing.experience,
        bio: req.body.bio ?? existing.bio,
        facebook: req.body.facebook ?? existing.facebook,
        twitter: req.body.twitter ?? existing.twitter,
        linkedin: req.body.linkedin ?? existing.linkedin,
        instagram: req.body.instagram ?? existing.instagram,
        propertiesSold: req.body.propertiesSold ? parseInt(req.body.propertiesSold) : existing.propertiesSold,
      });
      return res.json(agent);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/agents/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAgent(id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Deleted" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/inquiries", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const list = await storage.getInquiries();
      return res.json(list);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/inquiries", async (req: Request, res: Response) => {
    try {
      const parsed = insertInquirySchema.safeParse({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || null,
        message: req.body.message,
        propertyId: req.body.propertyId ? parseInt(req.body.propertyId) : null,
        agentId: req.body.agentId ? parseInt(req.body.agentId) : null,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      }
      const inquiry = await storage.createInquiry(parsed.data);
      return res.status(201).json(inquiry);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/inquiries/:id/contacted", authMiddleware, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { contacted } = req.body;
      const inquiry = await storage.markContacted(id, contacted);
      if (!inquiry) return res.status(404).json({ message: "Not found" });
      return res.json(inquiry);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/stats", authMiddleware, async (_req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      return res.json(stats);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
