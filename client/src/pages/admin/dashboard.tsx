import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { getAuthHeaders } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetch("/api/admin/stats", { headers: getAuthHeaders() }).then(r => r.json()),
  });

  const statCards = [
    { icon: Building2, label: "Total Properties", value: stats?.totalProperties || 0, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: Users, label: "Active Agents", value: stats?.totalAgents || 0, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: MessageSquare, label: "New Inquiries", value: stats?.newInquiries || 0, color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: TrendingUp, label: "Featured", value: stats?.featuredProperties || 0, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const chartColors = ["hsl(211, 90%, 50%)", "hsl(173, 58%, 39%)", "hsl(43, 96%, 56%)", "hsl(27, 87%, 60%)", "hsl(340, 75%, 55%)"];

  return (
    <div className="space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your real estate business</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="p-4" data-testid={`card-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-md ${stat.bg} flex items-center justify-center shrink-0`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4">Properties by Type</h3>
          <div className="h-64">
            {stats?.propertyTypes ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.propertyTypes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(211, 90%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <h3 className="font-semibold text-foreground mb-4">Properties by Status</h3>
          <div className="h-64">
            {stats?.statusBreakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    nameKey="status"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.statusBreakdown.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 sm:p-6">
        <h3 className="font-semibold text-foreground mb-4">Recent Inquiries</h3>
        {stats?.recentInquiries?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentInquiries.map((inq) => (
              <div key={inq.id} className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50" data-testid={`inquiry-recent-${inq.id}`}>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm">{inq.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{inq.message}</p>
                </div>
                <Badge variant={inq.contacted ? "default" : "outline"} className="shrink-0">
                  {inq.contacted ? "Contacted" : "New"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No recent inquiries</p>
        )}
      </Card>
    </div>
  );
}
