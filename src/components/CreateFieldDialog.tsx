import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFields, type Field } from "@/hooks/useFields";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CROPS = ["wheat", "rice", "maize", "tomato","onion", "cabbage", "chickpea",  "sugarcane", "potato", "soybean",];
const SOIL_TYPES = ["sandy", "loamy", "clay", "black", "red", ];
const IRRIGATION_TYPES = ["drip", "sprinkler","flood",];
const GROWTH_STAGE = ["seedling","vegitative","flowering",];

interface Props {
  editField?: Field | null;
  onClose?: () => void;
  open?: boolean;
}

export default function CreateFieldDialog({ editField, onClose, open: controlledOpen }: Props) {
  const [open, setOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = (v: boolean) => {
    if (controlledOpen !== undefined) {
      if (!v && onClose) onClose();
    } else {
      setOpen(v);
    }
  };

  const { createField, updateField } = useFields();
  const { toast } = useToast();

  const [fieldName, setFieldName] = useState(editField?.field_name ?? "");
  const [cropType, setCropType] = useState(editField?.crop_type ?? "");
  const [plantationDate, setPlantationDate] = useState(editField?.plantation_date ?? "");
  const [soilType, setSoilType] = useState(editField?.soil_type ?? "loamy");
  const [irrigationType, setIrrigationType] = useState(editField?.irrigation_type ?? "drip");
  const [soilMoisture, setSoilMoisture] = useState(editField?.soil_moisture ?? "medium");
  const [location, setLocation] = useState(editField?.location ?? "");
  const [notes, setNotes] = useState(editField?.notes ?? "");

  const isEdit = !!editField;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldData = {
      field_name: fieldName,
      crop_type: cropType,
      plantation_date: plantationDate,
      soil_type: soilType,
      irrigation_type: irrigationType,
      soil_moisture: soilMoisture,
      location,
      notes: notes || null,
    };

    try {
      if (isEdit) {
        await updateField.mutateAsync({ id: editField.id, ...fieldData });
        toast({ title: "Field updated!" });
      } else {
        await createField.mutateAsync(fieldData);
        toast({ title: "Field created!" });
      }
      setIsOpen(false);
      resetForm();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    if (!isEdit) {
      setFieldName(""); setCropType(""); setPlantationDate(""); setSoilType("loamy");
      setIrrigationType("drip"); setSoilMoisture("medium"); setLocation(""); setNotes("");
    }
  };

  const loading = createField.isPending || updateField.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" /> Create Field Analysis
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{isEdit ? "Edit Field" : "Create Field Analysis"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Name *</Label>
              <Input placeholder="North Paddock" value={fieldName} onChange={e => setFieldName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Crop Type *</Label>
              <Select value={cropType} onValueChange={setCropType} required>
                <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                <SelectContent>{CROPS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plantation Date *</Label>
              <Input type="date" value={plantationDate} onChange={e => setPlantationDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Soil Type</Label>
              <Select value={soilType} onValueChange={setSoilType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOIL_TYPES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Irrigation Type</Label>
              <Select value={irrigationType} onValueChange={setIrrigationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{IRRIGATION_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Growth Stage</Label>
              <Select value={soilMoisture} onValueChange={setSoilMoisture}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GROWTH_STAGE.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input placeholder="City or coordinates" value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea placeholder="Additional observations..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Update Field" : "Create Field"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
