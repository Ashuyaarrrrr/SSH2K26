import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFields } from "@/hooks/useFields";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Droplets, Thermometer, Wind, CloudRain, Sprout, Clock,
  Beaker, Lightbulb, TrendingUp, Loader2,
} from "lucide-react";
import {
  calculateRecommendations,
  generateSimulatedWeather,
  generateMockChartData,
} from "@/lib/recommendations";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";

const moistureBadge: Record<string, string> = {
  dry: "bg-destructive text-destructive-foreground",
  healthy: "bg-success text-success-foreground",
  moist: "bg-info text-info-foreground",
};

export default function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fields, isLoading } = useFields();

  const field = fields.find((f) => f.id === id);

  const weather = useMemo(
    () => (field ? generateSimulatedWeather(field.location || "default") : null),
    [field]
  );

  const recs = useMemo(
    () =>
      field && weather
        ? calculateRecommendations(
            field.crop_type,
            field.plantation_date,
            field.soil_type,
            field.irrigation_type,
            field.soil_moisture,
            weather
          )
        : null,
    [field, weather]
  );

  const chartData = useMemo(() => generateMockChartData(7), []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!field || !recs || !weather) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container py-20 text-center">
          <h2 className="text-xl font-display font-semibold mb-2">Field not found</h2>
          <Button variant="outline" onClick={() => navigate("/")}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-6 space-y-6">
        {/* Top Bar */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">{field.field_name}</h1>
            <p className="text-sm text-muted-foreground">
              {field.crop_type} · {field.soil_type} soil · {field.irrigation_type} irrigation
            </p>
          </div>
        </div>

        {/* Status Cards Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Crop Age</p>
                  <p className="text-2xl font-bold">{recs.crop_age_days} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth Stage</p>
                  <p className="text-2xl font-bold">{recs.growth_stage}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Irrigation</p>
                  <p className="text-2xl font-bold">{recs.irrigation_minutes} <span className="text-sm font-normal text-muted-foreground">min</span></p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--moisture-" + recs.moisture_status + ") / 0.1)" }}>
                  <TrendingUp className="w-5 h-5" style={{ color: `hsl(var(--moisture-${recs.moisture_status}))` }} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moisture</p>
                  <Badge className={moistureBadge[recs.moisture_status]}>{recs.moisture_status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weather + Irrigation Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Weather */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-info" /> Weather Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Thermometer className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="font-semibold">{weather.temperature}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Droplets className="w-5 h-5 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Humidity</p>
                    <p className="font-semibold">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Wind className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wind</p>
                    <p className="font-semibold">{weather.wind_speed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CloudRain className="w-5 h-5 text-info" />
                  <div>
                    <p className="text-xs text-muted-foreground">Rain</p>
                    <p className="font-semibold">
                      {weather.rainfall_prediction ? `${weather.rain_amount_mm}mm expected` : "None"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3">{weather.description}</p>
            </CardContent>
          </Card>

          {/* Irrigation Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Droplets className="w-5 h-5 text-primary" /> Irrigation Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 rounded-xl bg-primary/5">
                <p className="text-5xl font-bold text-primary">{recs.irrigation_minutes}</p>
                <p className="text-sm text-muted-foreground mt-1">minutes recommended</p>
              </div>
              <p className="text-sm text-muted-foreground">{recs.irrigation_reason}</p>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Efficiency ({field.irrigation_type})</p>
                <Progress value={field.irrigation_type === "drip" ? 90 : field.irrigation_type === "sprinkler" ? 75 : 60} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fertilizer + Suggestions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Beaker className="w-5 h-5 text-accent" /> Fertilizer Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-secondary/50">
                <p className="font-semibold text-secondary-foreground">{recs.fertilizer}</p>
                <p className="text-sm text-muted-foreground mt-1">{recs.fertilizer_detail}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" /> Smart Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recs.suggestions.map((s, i) => (
                  <li key={i} className="text-sm p-3 rounded-lg bg-muted/50">{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Moisture & Temperature Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="moisture" stroke="hsl(var(--info))" strokeWidth={2} name="Moisture %" dot={false} />
                    <Line type="monotone" dataKey="temperature" stroke="hsl(var(--warning))" strokeWidth={2} name="Temp °C" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-lg">Irrigation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Area type="monotone" dataKey="irrigation" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name="Irrigation (min)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
