import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

const PROPERTY_TYPES = ["apartment", "villa", "house", "commercial", "plot"];
const AMENITY_OPTIONS = ["WiFi", "AC", "Pool", "Gym", "Security", "Garden", "Kitchen", "TV", "Parking", "Balcony"];

function PropertyForm({ property = null, onClose }) {
  const { toast } = useToast();
  const isEdit = !!property;

  const [form, setForm] = useState({
    title: property?.title || "",
    description: property?.description || "",
    price: property?.price?.toString() || "",
    propertyType: property?.propertyType || "apartment",
    status: property?.status || "sale",
    bedrooms: property?.bedrooms?.toString() || "0",
    bathrooms: property?.bathrooms?.toString() || "0",
    area: property?.area?.toString() || "0",
    city: property?.city || "",
    address: property?.address || "",
    state: property?.state || "",
    zipCode: property?.zipCode || "",
    amenities: property?.amenities || [],
    yearBuilt: property?.yearBuilt?.toString() || "",
    garage: property?.garage?.toString() || "0",
    agentId: property?.agentId?.toString() || "",
    featured: property?.featured || false,
  });
  const [imageFiles, setImageFiles] = useState([]);

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const url = isEdit ? `/api/properties/${property.id}` : "/api/properties";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { ...getAuthHeaders() },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isEdit ? "Property Updated" : "Property Created" });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      onClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.city || !form.address) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "amenities") {
        fd.append(key, JSON.stringify(val));
      } else {
        fd.append(key, val.toString());
      }
    });
    imageFiles.forEach(f => fd.append("images", f));
    mutation.mutate(fd);
  };

  const toggleAmenity = (amenity) => {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter(a => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} data-testid="input-prop-title" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Price *</label>
          <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} data-testid="input-prop-price" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Type</label>
          <Select value={form.propertyType} onValueChange={v => setForm(f => ({ ...f, propertyType: v }))}>
            <SelectTrigger data-testid="select-prop-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger data-testid="select-prop-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Bedrooms</label>
          <Input type="number" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} data-testid="input-prop-beds" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Bathrooms</label>
          <Input type="number" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} data-testid="input-prop-baths" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Area (sqft)</label>
          <Input type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} data-testid="input-prop-area" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">City *</label>
          <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} data-testid="input-prop-city" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Address *</label>
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} data-testid="input-prop-address" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">State</label>
          <Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} data-testid="input-prop-state" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Year Built</label>
          <Input type="number" value={form.yearBuilt} onChange={e => setForm(f => ({ ...f, yearBuilt: e.target.value }))} data-testid="input-prop-year" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Garage Spaces</label>
          <Input type="number" value={form.garage} onChange={e => setForm(f => ({ ...f, garage: e.target.value }))} data-testid="input-prop-garage" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Agent</label>
          <Select value={form.agentId} onValueChange={v => setForm(f => ({ ...f, agentId: v }))}>
            <SelectTrigger data-testid="select-prop-agent"><SelectValue placeholder="Select agent" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Agent</SelectItem>
              {agents.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Description</label>
        <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} data-testid="input-prop-desc" />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map(a => (
            <Badge
              key={a}
              variant={form.amenities.includes(a) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleAmenity(a)}
              data-testid={`badge-amenity-${a.toLowerCase()}`}
            >
              {a}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1 block">Images</label>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setImageFiles(Array.from(e.target.files || []))}
          data-testid="input-prop-images"
        />
        {imageFiles.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{imageFiles.length} file(s) selected</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={form.featured}
          onCheckedChange={v => setForm(f => ({ ...f, featured: v }))}
          data-testid="switch-featured"
        />
        <label className="text-sm font-medium">Featured Property</label>
      </div>

      <div className="flex items-center gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-property">
          {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function PropertiesManage() {
  const { toast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties", "admin"],
    queryFn: () => fetch("/api/properties?limit=100", { headers: getAuthHeaders() }).then(r => r.json()).then(d => d.properties || []),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Property deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete property", variant: "destructive" });
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }) => {
      const res = await fetch(`/api/properties/${id}/featured`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
  });

  const allProps = Array.isArray(properties) ? properties : properties?.properties || [];
  const filtered = allProps.filter(p =>
    p.title.toLowerCase().includes(searchText.toLowerCase()) ||
    p.city.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (prop) => {
    setEditingProperty(prop);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingProperty(null);
  };

  return (
    <div className="space-y-6" data-testid="admin-properties">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground">{filtered.length} properties</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) handleClose(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingProperty(null); setDialogOpen(true); }} data-testid="button-add-property">
              <Plus className="w-4 h-4 mr-2" /> Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProperty ? "Edit Property" : "Add New Property"}</DialogTitle>
            </DialogHeader>
            <PropertyForm property={editingProperty} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search properties..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="pl-9"
          data-testid="input-search-admin-props"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded-md animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No properties found</TableCell>
                </TableRow>
              ) : (
                filtered.map(p => (
                  <TableRow key={p.id} data-testid={`row-property-${p.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || "/images/property-1.png"}
                          alt={p.title}
                          className="w-12 h-9 object-cover rounded-md shrink-0"
                        />
                        <span className="font-medium text-foreground line-clamp-1">{p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{p.propertyType}</Badge></TableCell>
                    <TableCell className="font-medium">${p.price.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.city}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "rent" ? "secondary" : "default"}>
                        {p.status === "rent" ? "Rent" : "Sale"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={p.featured}
                        onCheckedChange={(v) => toggleFeatured.mutate({ id: p.id, featured: v })}
                        data-testid={`switch-featured-${p.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(p)} data-testid={`button-edit-${p.id}`}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => { if (confirm("Delete this property?")) deleteMutation.mutate(p.id); }}
                          data-testid={`button-delete-${p.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
