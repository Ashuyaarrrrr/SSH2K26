import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sprout, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">AquaCrop</span>
        </button>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.user_metadata?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
