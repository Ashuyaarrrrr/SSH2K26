import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFields } from "@/hooks/useFields";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Droplets, Thermometer, Wind, CloudRain } from "lucide-react";

export default function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fields, isLoading } = useFields();

  const field = fields.find((f) => f.id === id);

  const [aiData, setAiData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!field) return;

    const fetchPrediction = async () => {
      try {
        setAiLoading(true);

        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location: field.location,
            crop_type: field.crop_type,
            growth_stage: "vegetative",
            soil_type: field.soil_type,
            irrigation_method: field.irrigation_type,
          }),
        });

        const data = await response.json();
        setAiData(data);
      } catch (err) {
        console.error("AI Error:", err);
      } finally {
        setAiLoading(false);
      }
    };

    fetchPrediction();
  }, [field]);

  // Smooth number animation
  useEffect(() => {
    if (!aiData) return;

    const target = aiData.prediction.today_irrigation_minutes;
    let start = 0;

    const duration = 1000;
    const increment = target / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(counter);
      }
      setAnimatedValue(Math.floor(start));
    }, 16);

    return () => clearInterval(counter);
  }, [aiData]);

  if (isLoading || aiLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!field || !aiData) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container py-20 text-center">
          <h2 className="text-xl font-semibold mb-4">
            Field not found or AI failed
          </h2>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  const weather = aiData.weather;
  const irrigation = aiData.prediction.today_irrigation_minutes;
  const plan = aiData.prediction["7_day_irrigation_plan"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 transition-all duration-500">
      <AppHeader />

      <main className="container py-8 space-y-8 animate-fade-in">
        <Button
          variant="ghost"
          className="hover:translate-x-1 transition-transform duration-200"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">
          {field.field_name}
        </h1>

        {/* Weather Card */}
        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              🌦 Weather Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6 text-sm">
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Thermometer className="text-orange-500" />
              {weather.temperature}°C
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Droplets className="text-blue-500" />
              {weather.humidity}%
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <Wind className="text-gray-500" />
              {weather.wind_speed} m/s
            </div>
            <div className="flex items-center gap-2 hover:scale-105 transition-transform">
              <CloudRain className="text-cyan-600" />
              {weather.rainfall} mm
            </div>
          </CardContent>
        </Card>

        {/* Irrigation Recommendation */}
        <Card className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              💧 AI Irrigation Recommendation
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 transition-all duration-500">
              <div className="text-6xl font-extrabold text-primary tracking-tight">
                {animatedValue}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Litres per hectare (L/ha)
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-muted-foreground uppercase text-xs tracking-wider">
                7-Day Projection
              </h3>
              <ul className="space-y-2">
                {plan.map((day: any, index: number) => (
                  <li
                    key={day.day}
                    className="p-3 rounded-lg bg-muted/40 hover:bg-primary/10 transition-all duration-300 hover:translate-x-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    Day {day.day}:{" "}
                    <span className="font-semibold text-primary">
                      {day.projected_irrigation_minutes}
                    </span>{" "}
                    L/ha
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}