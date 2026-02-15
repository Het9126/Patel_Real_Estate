import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, Clock, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";

export default function InquiriesManage() {
  const { toast } = useToast();
  const [searchText, setSearchText] = useState("");

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["/api/inquiries"],
    queryFn: () => fetch("/api/inquiries", { headers: getAuthHeaders() }).then(r => r.json()),
  });

  const contactMutation = useMutation({
    mutationFn: async ({ id, contacted }) => {
      const res = await fetch(`/api/inquiries/${id}/contacted`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ contacted }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inquiries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: () => toast({ title: "Error", description: "Failed to update", variant: "destructive" }),
  });

  const filtered = inquiries.filter(i =>
    i.name.toLowerCase().includes(searchText.toLowerCase()) ||
    i.email.toLowerCase().includes(searchText.toLowerCase()) ||
    i.message.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6" data-testid="admin-inquiries">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
        <p className="text-muted-foreground">{filtered.length} inquiries</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search inquiries..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="pl-9"
          data-testid="input-search-inquiries"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-muted rounded-md animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No inquiries found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(inq => (
                  <TableRow key={inq.id} data-testid={`row-inquiry-${inq.id}`}>
                    <TableCell className="font-medium text-foreground">{inq.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inq.email}</div>
                        {inq.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {inq.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">{inq.message}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(inq.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={inq.contacted ? "default" : "outline"}>
                        {inq.contacted ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Contacted</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> New</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={inq.contacted ? "outline" : "default"}
                        size="sm"
                        onClick={() => contactMutation.mutate({ id: inq.id, contacted: !inq.contacted })}
                        data-testid={`button-toggle-contacted-${inq.id}`}
                      >
                        {inq.contacted ? "Mark New" : "Mark Contacted"}
                      </Button>
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
