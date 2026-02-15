import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, MapPin, Building2, Home as HomeIcon, ArrowRight, Star, ChevronLeft, ChevronRight, TrendingUp, Shield, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "house", label: "House" },
  { value: "commercial", label: "Commercial" },
  { value: "plot", label: "Plot" },
];

const cities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "San Francisco", "Miami", "Seattle", "Denver", "Austin",
];

export default function HomePage() {
  const [, navigate] = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCities, setShowCities] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ["/api/properties", "featured"],
    queryFn: () => fetch("/api/properties?featured=true&limit=6").then(r => r.json()),
  });
  const featured = featuredData?.properties || [];

  const { data: agentsData = [], isLoading: loadingAgents } = useQuery({
    queryKey: ["/api/agents"],
  });

  const handleLocationChange = (val) => {
    setSearchLocation(val);
    if (val.length > 0) {
      setFilteredCities(cities.filter(c => c.toLowerCase().includes(val.toLowerCase())));
      setShowCities(true);
    } else {
      setShowCities(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set("city", searchLocation);
    if (propertyType !== "all") params.set("type", propertyType);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 5000000) params.set("maxPrice", priceRange[1].toString());
    navigate(`/properties?${params.toString()}`);
  };

  const maxVisible = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const canNext = featuredIndex + maxVisible < featured.length;
  const canPrev = featuredIndex > 0;

  return (
    <div>
      <section className="relative min-h-[600px] flex items-center" data-testid="section-hero">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.png" alt="Real Estate" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">Trusted by 10,000+ Families</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Find Your <span className="text-primary">Dream Home</span> Today
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Discover the finest properties across the country. From luxury villas to cozy apartments, we have something for everyone.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-4 sm:p-6 max-w-4xl bg-card/95 backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter city..."
                      value={searchLocation}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      onFocus={() => searchLocation && setShowCities(true)}
                      onBlur={() => setTimeout(() => setShowCities(false), 200)}
                      className="pl-9"
                      data-testid="input-hero-location"
                    />
                  </div>
                  {showCities && filteredCities.length > 0 && (
                    <div className="absolute z-20 top-full mt-1 w-full bg-popover border border-popover-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {filteredCities.map(city => (
                        <button
                          key={city}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                          onMouseDown={() => { setSearchLocation(city); setShowCities(false); }}
                          data-testid={`option-city-${city.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <MapPin className="inline w-3.5 h-3.5 mr-2 text-muted-foreground" />
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Property Type</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Price Range: ${(priceRange[0] / 1000).toFixed(0)}K - ${(priceRange[1] / 1000000).toFixed(1)}M
                  </label>
                  <Slider
                    min={0}
                    max={5000000}
                    step={50000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-3"
                    data-testid="slider-price-range"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full" data-testid="button-hero-search">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-6 mt-8"
          >
            {[
              { num: "1,500+", label: "Properties" },
              { num: "200+", label: "Happy Clients" },
              { num: "50+", label: "Expert Agents" },
              { num: "25+", label: "Cities" },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.num}</p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background" data-testid="section-featured">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
            <div>
              <Badge variant="outline" className="mb-2">Featured Listings</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Handpicked Properties</h2>
              <p className="text-muted-foreground mt-1">Explore our curated collection of premium properties</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" disabled={!canPrev} onClick={() => setFeaturedIndex(Math.max(0, featuredIndex - 1))} data-testid="button-carousel-prev">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" disabled={!canNext} onClick={() => setFeaturedIndex(featuredIndex + 1)} data-testid="button-carousel-next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map(i => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(featuredIndex, featuredIndex + 3).map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/properties">
              <Button variant="outline" data-testid="button-view-all-properties">
                View All Properties
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card" data-testid="section-why-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Why Choose Us</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Your Trusted Real Estate Partner</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Best Market Value", desc: "We analyze market trends to get you the best deal on your dream property." },
              { icon: Shield, title: "Secure Transactions", desc: "All property transactions are verified and secured with legal compliance." },
              { icon: Headphones, title: "24/7 Support", desc: "Our dedicated team is always available to assist you throughout the process." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 text-center hover-elevate">
                  <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background" data-testid="section-agents">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-2">Our Team</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Top Real Estate Agents</h2>
            <p className="text-muted-foreground mt-1">Meet our experienced professionals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingAgents ? (
              [0, 1, 2].map(i => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-muted rounded-full" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded-md w-2/3" />
                      <div className="h-3 bg-muted rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-md w-full" />
                </Card>
              ))
            ) : (
              agentsData.slice(0, 3).map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 hover-elevate" data-testid={`card-agent-preview-${agent.id}`}>
                    <div className="flex items-center gap-4 mb-3">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={agent.photo || ""} alt={agent.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {agent.name?.split(" ").map(n => n[0]).join("") || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">{agent.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500" />
                        {agent.experience}+ years exp
                      </span>
                      <span>{agent.propertiesSold || 0} properties sold</span>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          <div className="text-center mt-8">
            <Link href="/agents">
              <Button variant="outline" data-testid="button-view-all-agents">
                View All Agents
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary" data-testid="section-cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6">
              Get in touch with our expert agents today and start your journey towards your dream home.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/properties">
                <Button variant="secondary" data-testid="button-cta-browse">
                  Browse Properties
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white backdrop-blur-sm" data-testid="button-cta-contact">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
