import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Phone, Mail, Briefcase } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from "react-icons/si";
import { motion } from "framer-motion";

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-3 bg-white/20 text-white border-white/30">Our Team</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-3">
              Meet Our Expert Agents
            </h1>
            <p className="text-primary-foreground/80 max-w-lg mx-auto">
              Our experienced professionals are dedicated to helping you find the perfect property.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-24 h-24 bg-muted rounded-full mb-3" />
                  <div className="h-5 bg-muted rounded-md w-32 mb-1" />
                  <div className="h-4 bg-muted rounded-md w-24" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded-md w-full" />
                  <div className="h-3 bg-muted rounded-md w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">No agents found</h3>
            <p className="text-muted-foreground">Check back soon for our team.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="p-6 hover-elevate" data-testid={`card-agent-${agent.id}`}>
                  <div className="flex flex-col items-center text-center mb-4">
                    <Avatar className="w-24 h-24 mb-3">
                      <AvatarImage src={agent.photo || ""} alt={agent.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                        {agent.name?.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-semibold text-foreground" data-testid={`text-agent-name-${agent.id}`}>
                      {agent.name}
                    </h3>
                    <Badge variant="outline" className="mt-1">{agent.specialization}</Badge>
                  </div>

                  {agent.bio && (
                    <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-3">
                      {agent.bio}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Briefcase className="w-4 h-4" /> Experience
                      </span>
                      <span className="font-medium text-foreground">{agent.experience}+ years</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-4 h-4 text-amber-500" /> Properties Sold
                      </span>
                      <span className="font-medium text-foreground">{agent.propertiesSold || 0}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{agent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                  </div>

                  {(agent.facebook || agent.twitter || agent.linkedin || agent.instagram) && (
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
                      {agent.facebook && (
                        <a href={agent.facebook} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate">
                          <SiFacebook className="w-4 h-4" />
                        </a>
                      )}
                      {agent.twitter && (
                        <a href={agent.twitter} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate">
                          <SiX className="w-4 h-4" />
                        </a>
                      )}
                      {agent.linkedin && (
                        <a href={agent.linkedin} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate">
                          <SiLinkedin className="w-4 h-4" />
                        </a>
                      )}
                      {agent.instagram && (
                        <a href={agent.instagram} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate">
                          <SiInstagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
