import { Link } from "react-router-dom";
import logo from "@/assets/criteria-logo.png";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="CriterIA" className="h-14 w-auto" />
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/generar"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Generar criterios
            </Link>
            <Link
              to="/historial"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Historial
            </Link>
            <a
              href="#ayuda"
              className="text-sm font-medium text-foreground hover:text-secondary transition-colors"
            >
              Ayuda
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
