import { differenceInDays } from "date-fns";

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall_prediction: boolean;
  rain_amount_mm: number;
  wind_speed: number;
  description: string;
}

export interface FieldRecommendation {
  crop_age_days: number;
  growth_stage: string;
  irrigation_minutes: number;
  irrigation_reason: string;
  fertilizer: string;
  fertilizer_detail: string;
  moisture_status: "dry" | "healthy" | "moist";
  suggestions: string[];
}

const GROWTH_STAGES = [
  { name: "Seedling", maxDays: 14 },
  { name: "Vegetative", maxDays: 45 },
  { name: "Flowering", maxDays: 75 },
  { name: "Fruiting", maxDays: 110 },
  { name: "Harvesting", maxDays: Infinity },
];

const SOIL_WATER_RETENTION: Record<string, number> = {
  sandy: 0.6,
  loamy: 1.0,
  clay: 1.4,
  silt: 1.1,
  peat: 1.3,
  chalky: 0.7,
};

const IRRIGATION_EFFICIENCY: Record<string, number> = {
  drip: 0.9,
  sprinkler: 0.75,
  manual: 0.6,
  flood: 0.5,
  "center pivot": 0.8,
};

export function getGrowthStage(days: number): string {
  for (const stage of GROWTH_STAGES) {
    if (days <= stage.maxDays) return stage.name;
  }
  return "Harvesting";
}

export function getMoistureStatus(moisture: string): "dry" | "healthy" | "moist" {
  switch (moisture.toLowerCase()) {
    case "low":
    case "very low":
      return "dry";
    case "high":
    case "very high":
      return "moist";
    default:
      return "healthy";
  }
}

export function generateSimulatedWeather(location: string): WeatherData {
  const seed = location.length + new Date().getDate();
  const temp = 20 + (seed % 20);
  const humidity = 40 + (seed % 40);
  const hasRain = seed % 3 === 0;

  return {
    temperature: temp,
    humidity,
    rainfall_prediction: hasRain,
    rain_amount_mm: hasRain ? 5 + (seed % 20) : 0,
    wind_speed: 5 + (seed % 15),
    description: hasRain ? "Partly cloudy with rain expected" : temp > 32 ? "Hot and sunny" : "Clear skies",
  };
}

export function calculateRecommendations(
  cropType: string,
  plantationDate: string,
  soilType: string,
  irrigationType: string,
  soilMoisture: string,
  weather: WeatherData
): FieldRecommendation {
  const cropAgeDays = differenceInDays(new Date(), new Date(plantationDate));
  const growthStage = getGrowthStage(cropAgeDays);
  const moistureStatus = getMoistureStatus(soilMoisture);

  // Base irrigation (minutes)
  let baseIrrigation = 30;

  // Adjust by growth stage
  const stageMultiplier: Record<string, number> = {
    Seedling: 0.6,
    Vegetative: 1.0,
    Flowering: 1.3,
    Fruiting: 1.2,
    Harvesting: 0.7,
  };
  baseIrrigation *= stageMultiplier[growthStage] || 1;

  // Adjust by soil
  const soilFactor = SOIL_WATER_RETENTION[soilType.toLowerCase()] || 1;
  baseIrrigation /= soilFactor;

  // Adjust by irrigation type
  const efficiency = IRRIGATION_EFFICIENCY[irrigationType.toLowerCase()] || 0.75;
  baseIrrigation /= efficiency;

  // Adjust by moisture
  if (moistureStatus === "moist") baseIrrigation *= 0.5;
  if (moistureStatus === "dry") baseIrrigation *= 1.5;

  // Weather adjustments
  let irrigationReason = "Standard recommendation based on crop stage and soil type.";
  if (weather.rainfall_prediction) {
    baseIrrigation *= 0.3;
    irrigationReason = `Rain expected (${weather.rain_amount_mm}mm) — irrigation significantly reduced.`;
  } else if (weather.temperature > 35) {
    baseIrrigation *= 1.4;
    irrigationReason = `High temperature (${weather.temperature}°C) — irrigation increased to prevent heat stress.`;
  } else if (weather.temperature > 30) {
    baseIrrigation *= 1.15;
    irrigationReason = `Warm conditions (${weather.temperature}°C) — slight irrigation increase.`;
  }

  const irrigationMinutes = Math.round(Math.max(5, Math.min(90, baseIrrigation)));

  // Fertilizer recommendation
  let fertilizer = "None needed at this stage";
  let fertilizerDetail = "";
  if (growthStage === "Seedling") {
    fertilizer = "Starter Fertilizer (10-26-26)";
    fertilizerDetail = "Apply light phosphorus-rich fertilizer to promote root establishment.";
  } else if (growthStage === "Vegetative") {
    fertilizer = "Nitrogen-Rich (46-0-0 Urea)";
    fertilizerDetail = "Focus on nitrogen for leaf and stem growth. Apply every 2 weeks.";
  } else if (growthStage === "Flowering") {
    fertilizer = "Balanced NPK (20-20-20)";
    fertilizerDetail = "Balanced nutrition to support flower development and fruit set.";
  } else if (growthStage === "Fruiting") {
    fertilizer = "Potassium-Rich (0-0-60 MOP)";
    fertilizerDetail = "Increase potassium for fruit quality and size.";
  }

  // Smart suggestions
  const suggestions: string[] = [];
  if (weather.rainfall_prediction) {
    suggestions.push("🌧️ Rain forecasted — delay irrigation and check drainage.");
  }
  if (weather.temperature > 35) {
    suggestions.push("🌡️ Extreme heat — consider mulching to reduce evaporation.");
  }
  if (moistureStatus === "dry") {
    suggestions.push("⚠️ Soil is dry — prioritize watering in early morning.");
  }
  if (moistureStatus === "moist") {
    suggestions.push("💧 Soil is adequately moist — avoid overwatering to prevent root rot.");
  }
  if (growthStage === "Flowering") {
    suggestions.push("🌸 Flowering stage — ensure consistent watering for pollination.");
  }
  if (growthStage === "Harvesting") {
    suggestions.push("🌾 Crop is ready for harvest — reduce irrigation gradually.");
  }
  if (weather.wind_speed > 15) {
    suggestions.push("💨 High winds — avoid sprinkler irrigation, prefer drip.");
  }
  if (suggestions.length === 0) {
    suggestions.push("✅ Conditions look optimal — maintain current practices.");
  }

  return {
    crop_age_days: Math.max(0, cropAgeDays),
    growth_stage: growthStage,
    irrigation_minutes: irrigationMinutes,
    irrigation_reason: irrigationReason,
    fertilizer,
    fertilizer_detail: fertilizerDetail,
    moisture_status: moistureStatus,
    suggestions,
  };
}

// Generate mock historical data for charts
export function generateMockChartData(days: number = 7) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      moisture: Math.round(40 + Math.random() * 35),
      temperature: Math.round(22 + Math.random() * 15),
      irrigation: Math.round(15 + Math.random() * 40),
    });
  }
  return data;
}
