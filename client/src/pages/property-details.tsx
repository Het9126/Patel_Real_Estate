import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin, Bed, Bath, Maximize, Calendar, Car, Phone, Mail,
  ChevronLeft, ChevronRight, ArrowLeft, Check,
  Wifi, Wind, Droplets, Dumbbell, Shield, Trees, Utensils, Tv
} from "lucide-react";
import { motion } from "framer-motion";
import PropertyCard from "@/components/PropertyCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const amenityIcons = {
  "WiFi": Wifi, "AC": Wind, "Pool": Droplets, "Gym": Dumbbell,
  "Security": Shield, "Garden": Trees, "Kitchen": Utensils, "TV": Tv,
  "Parking": Car, "Balcony": Maximize,
};

function formatPrice(price) {
  if (price >= 10000000) return `$${(price / 1000000).toFixed(1)}M`;
  if (price >= 100000) return `$${(price / 1000).toFixed(0)}K`;
  return `$${price.toLocaleString()}`;
}

export default function PropertyDetailsPage() {
  const [, params] = useRoute("/properties/:id");
  const id = params?.id;
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });

  const { data: property, isLoading } = useQuery({
    queryKey: ["/api/properties", id],
    queryFn: () => fetch(`/api/properties/${id}`).then(r => r.json()),
    enabled: !!id,
  });

  const { data: similar = [] } = useQuery({
    queryKey: ["/api/properties", "similar", id],
    queryFn: () => fetch(`/api/properties?type=${property?.propertyType}&limit=3&exclude=${id}`).then(r => r.json()),
    enabled: !!property,
  });

  const inquiryMutation = useMutation({
    mutationFn: (data) => apiRequest("POST", "/api/inquiries", data),
    onSuccess: () => {
      toast({ title: "Inquiry Sent!", description: "We'll get back to you soon." });
      setContactForm({ name: "", email: "", phone: "", message: "" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to send inquiry. Please try again.", variant: "destructive" });
    },
  });

  const handleContact = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({ title: "Required Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    inquiryMutation.mutate({
      ...contactForm,
      propertyId: parseInt(id),
      agentId: property?.agentId || null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Skeleton className="h-[400px] w-full rounded-md mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
          <p className="text-muted-foreground mb-4">The property you're looking for doesn't exist.</p>
          <Link href="/properties">
            <Button data-testid="button-back-properties">Back to Properties</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const images = property.images?.length > 0 ? property.images : ["/images/property-1.png"];
  const similarProperties = Array.isArray(similar) ? similar.filter(p => p.id !== parseInt(id)) : [];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="relative bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/7] sm:aspect-[16/6]">
            <img
              src={images[currentImage]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white"
                  onClick={() => setCurrentImage(i => (i - 1 + images.length) % images.length)}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white"
                  onClick={() => setCurrentImage(i => (i + 1) % images.length)}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}

            <div className="absolute bottom-4 left-4">
              <Link href="/properties">
                <Button variant="ghost" className="bg-black/40 text-white mb-2" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              </Link>
            </div>

            <div className="absolute bottom-4 right-4 text-sm text-white/80">
              {currentImage + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-black/80">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    i === currentImage ? "border-primary" : "border-transparent opacity-60"
                  }`}
                  data-testid={`button-thumb-${i}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">{property.status === "rent" ? "For Rent" : "For Sale"}</Badge>
                    {property.featured && <Badge className="bg-amber-500 text-white border-amber-600">Featured</Badge>}
                    <Badge variant="outline" className="capitalize">{property.propertyType}</Badge>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground" data-testid="text-property-title">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address}, {property.city}{property.state ? `, ${property.state}` : ""}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary" data-testid="text-property-price">
                    {formatPrice(property.price)}
                  </p>
                  {property.status === "rent" && <span className="text-muted-foreground">/month</span>}
                </div>
              </div>
            </motion.div>

            <Card className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: Bed, label: "Bedrooms", value: property.bedrooms },
                  { icon: Bath, label: "Bathrooms", value: property.bathrooms },
                  { icon: Maximize, label: "Area", value: `${property.area} sqft` },
                  { icon: Calendar, label: "Year Built", value: property.yearBuilt || "N/A" },
                  { icon: Car, label: "Garage", value: property.garage || 0 },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-property-description">
                {property.description}
              </p>
            </Card>

            {property.amenities?.length > 0 && (
              <Card className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map(amenity => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={amenity} className="flex items-center gap-2 text-sm" data-testid={`amenity-${amenity.toLowerCase()}`}>
                        <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-accent-foreground" />
                        </div>
                        <span className="text-foreground">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {property.agent && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="p-4 sm:p-6" data-testid="card-agent">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Listed By</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={property.agent.photo || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {property.agent.name?.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{property.agent.name}</p>
                      <p className="text-sm text-muted-foreground">{property.agent.specialization}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {property.agent.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {property.agent.email}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-4 sm:p-6" data-testid="card-inquiry">
                <h3 className="text-lg font-semibold text-foreground mb-4">Send Inquiry</h3>
                <form onSubmit={handleContact} className="space-y-3">
                  <Input
                    placeholder="Your Name *"
                    value={contactForm.name}
                    onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                    data-testid="input-inquiry-name"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={contactForm.email}
                    onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                    data-testid="input-inquiry-email"
                  />
                  <Input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={contactForm.phone}
                    onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                    data-testid="input-inquiry-phone"
                  />
                  <Textarea
                    placeholder="Your message *"
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    rows={4}
                    data-testid="input-inquiry-message"
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={inquiryMutation.isPending}
                    data-testid="button-send-inquiry"
                  >
                    {inquiryMutation.isPending ? "Sending..." : "Send Inquiry"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>

        {similarProperties.length > 0 && (
          <section className="mt-12" data-testid="section-similar">
            <h2 className="text-xl font-bold text-foreground mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.slice(0, 3).map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
