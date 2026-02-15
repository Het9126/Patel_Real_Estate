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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

function AgentForm({ agent = null, onClose }) {
  const { toast } = useToast();
  const isEdit = !!agent;
  const [form, setForm] = useState({
    name: agent?.name || "",
    email: agent?.email || "",
    phone: agent?.phone || "",
    specialization: agent?.specialization || "Residential",
    experience: agent?.experience?.toString() || "0",
    bio: agent?.bio || "",
    facebook: agent?.facebook || "",
    twitter: agent?.twitter || "",
    linkedin: agent?.linkedin || "",
    instagram: agent?.instagram || "",
    propertiesSold: agent?.propertiesSold?.toString() || "0",
  });
  const [photoFile, setPhotoFile] = useState(null);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      const url = isEdit ? `/api/agents/${agent.id}` : "/api/agents";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: formData });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: isEdit ? "Agent Updated" : "Agent Created" });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      onClose();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append("photo", photoFile);
    mutation.mutate(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Name *</label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} data-testid="input-agent-name" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Email *</label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} data-testid="input-agent-email" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Phone *</label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} data-testid="input-agent-phone" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Specialization</label>
          <Select value={form.specialization} onValueChange={v => setForm(f => ({ ...f, specialization: v }))}>
            <SelectTrigger data-testid="select-agent-spec"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Residential", "Commercial", "Luxury", "Industrial", "Land"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Experience (years)</label>
          <Input type="number" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} data-testid="input-agent-exp" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Properties Sold</label>
          <Input type="number" value={form.propertiesSold} onChange={e => setForm(f => ({ ...f, propertiesSold: e.target.value }))} data-testid="input-agent-sold" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Bio</label>
        <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} data-testid="input-agent-bio" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium mb-1 block">Facebook</label><Input value={form.facebook} onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))} /></div>
        <div><label className="text-sm font-medium mb-1 block">Twitter</label><Input value={form.twitter} onChange={e => setForm(f => ({ ...f, twitter: e.target.value }))} /></div>
        <div><label className="text-sm font-medium mb-1 block">LinkedIn</label><Input value={form.linkedin} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} /></div>
        <div><label className="text-sm font-medium mb-1 block">Instagram</label><Input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} /></div>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Profile Photo</label>
        <Input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0])} data-testid="input-agent-photo" />
      </div>
      <div className="flex items-center gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={mutation.isPending} data-testid="button-save-agent">
          {mutation.isPending ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

export default function AgentsManage() {
  const { toast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/agents/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Agent deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(searchText.toLowerCase()) ||
    a.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (agent) => { setEditingAgent(agent); setDialogOpen(true); };
  const handleClose = () => { setDialogOpen(false); setEditingAgent(null); };

  return (
    <div className="space-y-6" data-testid="admin-agents">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground">{filtered.length} agents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={open => { if (!open) handleClose(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingAgent(null); setDialogOpen(true); }} data-testid="button-add-agent">
              <Plus className="w-4 h-4 mr-2" /> Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle></DialogHeader>
            <AgentForm agent={editingAgent} onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="search" placeholder="Search agents..." value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-9" data-testid="input-search-admin-agents" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => (<TableCell key={j}><div className="h-4 bg-muted rounded-md animate-pulse" /></TableCell>))}</TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No agents found</TableCell></TableRow>
              ) : (
                filtered.map(a => (
                  <TableRow key={a.id} data-testid={`row-agent-${a.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={a.photo || ""} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{a.name?.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{a.name}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{a.specialization}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{a.experience} years</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(a)} data-testid={`button-edit-agent-${a.id}`}><Pencil className="w-4 h-4" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Delete this agent?")) deleteMutation.mutate(a.id); }} data-testid={`button-delete-agent-${a.id}`}><Trash2 className="w-4 h-4" /></Button>
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
