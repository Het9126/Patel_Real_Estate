import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, Grid3X3, List, X, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard, { PropertyCardSkeleton } from "@/components/PropertyCard";

const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "house", label: "House" },
  { value: "commercial", label: "Commercial" },
  { value: "plot", label: "Plot" },
];

const CITIES = ["All Cities", "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "San Francisco", "Miami", "Seattle", "Denver", "Austin"];
const BEDROOMS = ["Any", "1", "2", "3", "4", "5+"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "featured", label: "Featured" },
];

export default function PropertiesPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");

  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState(params.get("search") || "");
  const [city, setCity] = useState(params.get("city") || "All Cities");
  const [propertyType, setPropertyType] = useState(params.get("type") || "all");
  const [status, setStatus] = useState("all");
  const [bedrooms, setBedrooms] = useState("Any");
  const [priceRange, setPriceRange] = useState([
    parseInt(params.get("minPrice") || "0"),
    parseInt(params.get("maxPrice") || "5000000"),
  ]);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const perPage = 9;

  const queryParams = new URLSearchParams();
  if (searchText) queryParams.set("search", searchText);
  if (city !== "All Cities") queryParams.set("city", city);
  if (propertyType !== "all") queryParams.set("type", propertyType);
  if (status !== "all") queryParams.set("status", status);
  if (bedrooms !== "Any") queryParams.set("bedrooms", bedrooms);
  if (priceRange[0] > 0) queryParams.set("minPrice", priceRange[0].toString());
  if (priceRange[1] < 5000000) queryParams.set("maxPrice", priceRange[1].toString());
  queryParams.set("sort", sortBy);
  queryParams.set("page", page.toString());
  queryParams.set("limit", perPage.toString());

  const { data, isLoading } = useQuery({
    queryKey: ["/api/properties", queryParams.toString()],
    queryFn: () => fetch(`/api/properties?${queryParams.toString()}`).then(r => r.json()),
  });

  const properties = data?.properties || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / perPage);

  const activeFilters = [];
  if (city !== "All Cities") activeFilters.push({ label: city, clear: () => setCity("All Cities") });
  if (propertyType !== "all") activeFilters.push({ label: propertyType, clear: () => setPropertyType("all") });
  if (status !== "all") activeFilters.push({ label: status === "rent" ? "For Rent" : "For Sale", clear: () => setStatus("all") });
  if (bedrooms !== "Any") activeFilters.push({ label: `${bedrooms} Beds`, clear: () => setBedrooms("Any") });

  const clearAll = () => {
    setSearchText(""); setCity("All Cities"); setPropertyType("all");
    setStatus("all"); setBedrooms("Any"); setPriceRange([0, 5000000]);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${total} properties found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              data-testid="button-grid-view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              data-testid="button-list-view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="flex-1 min-w-[200px] max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or address..."
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                className="pl-9"
                data-testid="input-search-properties"
              />
            </div>
          </form>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                    <Select value={city} onValueChange={(v) => { setCity(v); setPage(1); }}>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Property Type</label>
                    <Select value={propertyType} onValueChange={(v) => { setPropertyType(v); setPage(1); }}>
                      <SelectTrigger data-testid="select-type-filter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                    <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Bedrooms</label>
                    <Select value={bedrooms} onValueChange={(v) => { setBedrooms(v); setPage(1); }}>
                      <SelectTrigger data-testid="select-bedrooms">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BEDROOMS.map(b => (
                          <SelectItem key={b} value={b}>{b === "Any" ? "Any" : `${b} Bed${b === "1" ? "" : "s"}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">
                      Price: ₹{(priceRange[0] / 1000).toFixed(0)}K - ₹{(priceRange[1] / 1000000).toFixed(1)}cr
                    </label>
                    <Slider
                      min={0} max={5000000} step={50000}
                      value={priceRange}
                      onValueChange={(v) => { setPriceRange(v); setPage(1); }}
                      className="mt-3"
                      data-testid="slider-filter-price"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4">
                  <Button variant="ghost" onClick={clearAll} data-testid="button-clear-filters">
                    <X className="w-4 h-4 mr-1" /> Clear All
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {activeFilters.map((f, i) => (
              <Badge key={i} variant="secondary" className="gap-1 capitalize">
                {f.label}
                <button onClick={f.clear} className="ml-1">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} listView={viewMode === "list"} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search filters</p>
            <Button variant="outline" onClick={clearAll} data-testid="button-clear-empty">Clear Filters</Button>
          </Card>
        ) : (
          <>
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} listView={viewMode === "list"} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        size="icon"
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  data-testid="button-next-page"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
