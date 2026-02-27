import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Sprout, Droplets, MapPin, Calendar, Trash2, Pencil } from "lucide-react";
import { differenceInDays } from "date-fns";
import { getGrowthStage, getMoistureStatus } from "@/lib/recommendations";
import type { Field } from "@/hooks/useFields";

interface Props {
  field: Field;
  onEdit: (field: Field) => void;
  onDelete: (id: string) => void;
}

const moistureColors: Record<string, string> = {
  dry: "bg-destructive text-destructive-foreground",
  healthy: "bg-success text-success-foreground",
  moist: "bg-info text-info-foreground",
};

export default function FieldCard({ field, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const age = differenceInDays(new Date(), new Date(field.plantation_date));
  const stage = getGrowthStage(age);
  const moisture = getMoistureStatus(field.soil_moisture);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in border-border/50">
      <CardHeader className="pb-3" onClick={() => navigate(`/field/${field.id}`)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">{field.field_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{field.crop_type}</p>
            </div>
          </div>
          <Badge className={moistureColors[moisture]}>{moisture}</Badge>
        </div>
      </CardHeader>
      <CardContent onClick={() => navigate(`/field/${field.id}`)}>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{age} days old</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sprout className="w-3.5 h-3.5" />
            <span>{stage}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="w-3.5 h-3.5" />
            <span className="capitalize">{field.irrigation_type}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{field.location || "No location"}</span>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(field); }}>
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
