import { Link } from "wouter";
import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { SiFacebook, SiX, SiInstagram, SiLinkedin } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">HomeVista</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Your trusted partner in finding the perfect property. We bring you the best real estate options with transparent dealings.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-facebook">
                <SiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-twitter">
                <SiX className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-instagram">
                <SiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground hover-elevate" data-testid="link-linkedin">
                <SiLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/properties", label: "Properties" },
                { href: "/agents", label: "Our Agents" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Property Types</h4>
            <ul className="space-y-2">
              {["Apartments", "Villas", "Houses", "Commercial", "Plots"].map((type) => (
                <li key={type}>
                  <Link
                    href={`/properties?type=${type.toLowerCase()}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`link-footer-type-${type.toLowerCase()}`}
                  >
                    {type}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">123 Real Estate Blvd, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">info@homevista.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            2025 HomeVista. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
