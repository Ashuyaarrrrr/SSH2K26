import { useMutation } from "@tanstack/react-query";

export function usePrediction() {
  return useMutation({
    mutationFn: async (field: any) => {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: field.location,
          crop_type: field.crop_type,
          growth_stage: field.growth_stage,
          soil_type: field.soil_type,
          irrigation_method: field.irrigation_method,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      return response.json();
    },
  });
}