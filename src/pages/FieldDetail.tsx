import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFields } from "@/hooks/useFields";
import AppHeader from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function FieldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fields, isLoading } = useFields();
  const field = fields.find((f) => f.id === id);

  const [aiData, setAiData] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

  // 7 day chart data
  const chartData = plan.map((d: any) => ({
    day: `Day ${d.day}`,
    irrigation: d.projected_irrigation_minutes,
  }));

  // Water saving comparison
  const traditionalUsage = irrigation * 1.3;
  const savedWater = traditionalUsage - irrigation;

  const savingData = [
    {
      name: "Water Usage",
      Traditional: Math.round(traditionalUsage),
      AI: irrigation,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <AppHeader />

      <main className="container py-8 space-y-8">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold">{field.field_name}</h1>

        {/* Weather Section */}
        <Card className="hover:shadow-xl transition-all">
          <CardHeader>
            <CardTitle>🌦 Weather Insights</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-xl font-semibold">{weather.temperature} °C</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-xl font-semibold">{weather.humidity} %</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wind Speed</p>
              <p className="text-xl font-semibold">{weather.wind_speed} m/s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rainfall</p>
              <p className="text-xl font-semibold">{weather.rainfall} mm</p>
            </div>
          </CardContent>
        </Card>

{/* Irrigation Plan Section */}
<Card>
  <CardHeader>
    <CardTitle>💧 7-Day Irrigation Forecast</CardTitle>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Line Graph */}
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="irrigation"
            stroke="#22c55e"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Numeric Breakdown */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {chartData.map((d, index) => (
        <div
          key={index}
          className="p-4 rounded-lg bg-muted/40 hover:bg-primary/10 transition-all duration-300 text-center"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {d.day}
          </p>
          <p className="text-lg font-semibold text-primary">
            {d.irrigation} L/ha
          </p>
        </div>
      ))}
    </div>
  </CardContent>
</Card>

        {/* Water Saving Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Water Saving Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Traditional" fill="#ef4444" />
                  <Bar dataKey="AI" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center mt-4 text-sm text-muted-foreground">
              💦 AI saves approximately{" "}
              <span className="font-semibold text-primary">
                {Math.round(savedWater)}
              </span>{" "}
              litres per hectare compared to traditional irrigation.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}