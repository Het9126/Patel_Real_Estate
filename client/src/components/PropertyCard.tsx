import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Maximize, Heart } from "lucide-react";
import { motion } from "framer-motion";

function formatPrice(price) {
  if (price >= 10000000) return `₹${(price / 1000000).toFixed(1)}M`;
  if (price >= 100000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price.toLocaleString()}`;
}

export default function PropertyCard({ property, index = 0, listView = false }) {
  const mainImage = property.images?.[0] || "/images/property-1.png";

  if (listView) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
      >
        <Link href={`/properties/${property.id}`}>
          <Card className="flex flex-col sm:flex-row hover-elevate cursor-pointer" data-testid={`card-property-${property.id}`}>
            <div className="relative sm:w-72 h-48 sm:h-auto shrink-0">
              <img
                src={mainImage}
                alt={property.title}
                className="w-full h-full object-cover rounded-t-md sm:rounded-l-md sm:rounded-tr-none"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <Badge variant="default" className="text-xs">
                  {property.status === "rent" ? "For Rent" : "For Sale"}
                </Badge>
                {property.featured && (
                  <Badge className="text-xs bg-amber-500 text-white border-amber-600">Featured</Badge>
                )}
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground line-clamp-1">{property.title}</h3>
                  <span className="text-primary font-bold text-lg shrink-0">{formatPrice(property.price)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{property.address}, {property.city}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{property.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.bedrooms} Beds</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms} Baths</span>
                <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{property.area} sqft</span>
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link href={`/properties/${property.id}`}>
        <Card className="group hover-elevate cursor-pointer" data-testid={`card-property-${property.id}`}>
          <div className="relative aspect-[4/3]">
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover rounded-t-md"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-md" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <Badge variant="default" className="text-xs">
                {property.status === "rent" ? "For Rent" : "For Sale"}
              </Badge>
              {property.featured && (
                <Badge className="text-xs bg-amber-500 text-white border-amber-600">Featured</Badge>
              )}
            </div>
            <div className="absolute bottom-3 left-3">
              <span className="text-white font-bold text-xl">{formatPrice(property.price)}</span>
              {property.status === "rent" && <span className="text-white/80 text-sm">/mo</span>}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground line-clamp-1 mb-1">{property.title}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{property.address}, {property.city}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{property.bedrooms}</span>
                <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{property.bathrooms}</span>
                <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{property.area}</span>
              </div>
              <Badge variant="outline" className="text-xs capitalize">{property.propertyType}</Badge>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export function PropertyCardSkeleton({ listView = false }) {
  if (listView) {
    return (
      <Card className="flex flex-col sm:flex-row animate-pulse">
        <div className="sm:w-72 h-48 sm:h-auto bg-muted rounded-t-md sm:rounded-l-md sm:rounded-tr-none" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-5 bg-muted rounded-md w-3/4" />
          <div className="h-4 bg-muted rounded-md w-1/2" />
          <div className="h-4 bg-muted rounded-md w-full" />
          <div className="flex gap-4 pt-2">
            <div className="h-4 bg-muted rounded-md w-16" />
            <div className="h-4 bg-muted rounded-md w-16" />
            <div className="h-4 bg-muted rounded-md w-16" />
          </div>
        </div>
      </Card>
    );
  }
  return (
    <Card className="animate-pulse">
      <div className="aspect-[4/3] bg-muted rounded-t-md" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded-md w-3/4" />
        <div className="h-4 bg-muted rounded-md w-1/2" />
        <div className="flex gap-3 pt-3 border-t border-border">
          <div className="h-4 bg-muted rounded-md w-12" />
          <div className="h-4 bg-muted rounded-md w-12" />
          <div className="h-4 bg-muted rounded-md w-12" />
        </div>
      </div>
    </Card>
  );
}
