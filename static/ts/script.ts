import Highcharts from "highcharts";

export function addItem(templateId: string, targetId: string): void {
  const templateElement = document.getElementById(
    templateId
  ) as HTMLTemplateElement | null;
  const targetElement = document.getElementById(targetId);

  if (!templateElement) {
    throw new Error(`Template element with ID "${templateId}" not found.`);
  }
  if (!targetElement) {
    throw new Error(`Target element with ID "${targetId}" not found.`);
  }

  const template = templateElement.content.cloneNode(true);
  targetElement.appendChild(template);
}

export function removeItem(button: HTMLButtonElement): void {
  if (!button) {
    throw new Error("Button element not found.");
  }

  const row = button.closest("tr");

  if (!row) {
    throw new Error("Row element not found.");
  }

  row.remove();
}

function updateUnitOptions(select: HTMLSelectElement) {
  const row = select.closest("tr");
  if (!row) {
    throw new Error("Row element not found.");
  }

  const nutrientSelect = row.querySelector(
    "[name='constraint-nutrient']"
  ) as HTMLSelectElement;
  const unitSelect = row.querySelector(
    "[name='constraint-unit']"
  ) as HTMLSelectElement;
  if (!nutrientSelect) {
    throw new Error("Nutrient select element not found in row.");
  }
  if (!unitSelect) {
    throw new Error("Unit select element not found in row.");
  }

  unitSelect.innerHTML = "";

  if (nutrientSelect.value === "energy") {
    const energyTemplate = document.getElementById(
      "unit-options-energy"
    ) as HTMLTemplateElement;

    if (!energyTemplate) {
      throw new Error(
        "energyTemplate with ID 'unit-options-energy' not found."
      );
    }

    unitSelect.appendChild(energyTemplate.content.cloneNode(true));
    unitSelect.disabled = true;
  } else {
    unitSelect.disabled = false;
    const amountRatioTemplate = document.getElementById(
      "unit-options-amount-ratio"
    ) as HTMLTemplateElement;

    if (!amountRatioTemplate) {
      throw new Error(
        "amountRatioTemplate with ID 'unit-options-amount-ratio' not found."
      );
    }

    unitSelect.appendChild(amountRatioTemplate.content.cloneNode(true));
  }
}

interface FoodInformation {
  name: string;
  gramsPerUnit: number;
  minimumIntake: number;
  maximumIntake: number;
  energy: number;
  protein: number;
  fat: number;
  carbohydrates: number;
}

function getFoodInformation(): FoodInformation[] {
  const rows = document.querySelectorAll("#food-inputs tr");

  return Array.from(rows).map((row) => {
    const nameInput = row.querySelector(
      "[name='food-name']"
    ) as HTMLInputElement;
    const gramsPerUnitInput = row.querySelector(
      "[name='food-grams-per-unit']"
    ) as HTMLInputElement;
    const minimumIntakeInput = row.querySelector(
      "[name='food-minimum-intake']"
    ) as HTMLInputElement;
    const maximumIntakeInput = row.querySelector(
      "[name='food-maximum-intake']"
    ) as HTMLInputElement;
    const energyInput = row.querySelector(
      "[name='food-energy']"
    ) as HTMLInputElement;
    const proteinInput = row.querySelector(
      "[name='food-protein']"
    ) as HTMLInputElement;
    const fatInput = row.querySelector("[name='food-fat']") as HTMLInputElement;
    const carbohydratesInput = row.querySelector(
      "[name='food-carbohydrates']"
    ) as HTMLInputElement;

    if (
      !nameInput ||
      !gramsPerUnitInput ||
      !minimumIntakeInput ||
      !maximumIntakeInput ||
      !energyInput ||
      !proteinInput ||
      !fatInput ||
      !carbohydratesInput
    ) {
      throw new Error(
        "One or more required input elements not found in the row."
      );
    }

    return {
      name: nameInput.value,
      gramsPerUnit: parseInt(gramsPerUnitInput.value),
      minimumIntake: parseInt(minimumIntakeInput.value),
      maximumIntake: parseInt(maximumIntakeInput.value),
      energy: parseFloat(energyInput.value),
      protein: parseFloat(proteinInput.value),
      fat: parseFloat(fatInput.value),
      carbohydrates: parseFloat(carbohydratesInput.value),
    };
  });
}

interface Objective {
  sense: string;
  nutrient: string;
}

function getObjective(): Objective {
  const row = document.querySelector("#objective-inputs tr");

  if (!row) {
    throw new Error("Row element not found.");
  }

  const objectiveSenseInput = row.querySelector(
    "[name='objective-sense']"
  ) as HTMLInputElement;
  const nutrientInput = row.querySelector(
    "[name='objective-nutrient']"
  ) as HTMLInputElement;

  if (!objectiveSenseInput || !nutrientInput) {
    throw new Error("Required input elements not found in the row.");
  }

  return {
    sense: objectiveSenseInput.value,
    nutrient: nutrientInput.value,
  };
}

interface Constraint {
  minMax: string;
  nutrient: string;
  unit: string;
  value: number;
}

function getConstraints(): Constraint[] {
  const rows = document.querySelectorAll("#constraint-inputs tr");
  return Array.from(rows).map((row) => {
    const minMaxInput = row.querySelector(
      "[name='constraint-min-max']"
    ) as HTMLInputElement;
    const nutrientInput = row.querySelector(
      "[name='constraint-nutrient']"
    ) as HTMLInputElement;
    const unitInput = row.querySelector(
      "[name='constraint-unit']"
    ) as HTMLInputElement;
    const valueInput = row.querySelector(
      "[name='constraint-value']"
    ) as HTMLInputElement;

    if (!minMaxInput || !nutrientInput || !unitInput || !valueInput) {
      throw new Error("Required input elements not found in the row.");
    }

    return {
      minMax: minMaxInput.value,
      nutrient: nutrientInput.value,
      unit: unitInput.value,
      value: parseFloat(valueInput.value),
    };
  });
}

interface PFCRatio {
  [key: string]: number;
}

interface TotalNutrientValues {
  [key: string]: number;
}

interface PFCData {
  name: string;
  y: number;
  color: string;
}

function drawPFCRatioWithTotalEnergy(
  pfcRatio: PFCRatio,
  totalNutrientValues: TotalNutrientValues
): void {
  const nutrients: string[] = ["protein", "fat", "carbohydrates"];
  const colors: string[] = [
    "rgb(255, 128, 128)",
    "rgb(128, 255, 128)",
    "rgb(128, 128, 255)",
  ];

  const pfcData: PFCData[] = nutrients.map((nutrient, index) => {
    const capitalizedNutrient =
      nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
    const grams = totalNutrientValues[nutrient];
    const ratio = pfcRatio[nutrient];

    return {
      name: `${capitalizedNutrient} (${grams}g)`,
      y: ratio,
      color: colors[index],
    };
  });

  Highcharts.chart("pfc-ratio-chart", {
    chart: {
      type: "pie",
    },
    title: {
      text: "PFC Ratio",
    },
    tooltip: {
      valueSuffix: "%",
    },
    subtitle: {
      text: `Total Energy: ${totalNutrientValues.energy} kcal`,
    },
    series: [
      {
        name: "Percentage",
        colorByPoint: true,
        data: pfcData,
      },
    ] as unknown as Highcharts.SeriesOptions[],
  } as Highcharts.Options);
}

interface FoodIntakes {
  [key: string]: number;
}

function drawFoodintakes(foodintakes: FoodIntakes): void {
  const foodIntakesData = Object.keys(foodintakes).map((food) => ({
    name: food,
    y: foodintakes[food],
  }));

  Highcharts.chart("food-intakes-chart", {
    chart: {
      type: "bar",
    },
    title: {
      text: "Food Intakes",
    },
    xAxis: {
      categories: foodIntakesData.map((item) => item.name),
      title: {
        text: "Food Item",
      },
    },
    yAxis: {
      title: {
        text: "Units",
      },
    },
    series: [
      {
        name: "Food Intakes",
        data: foodIntakesData.map((item) => item.y),
        color: "rgb(128, 128, 255)",
      },
    ],
  });
}

interface Result {
  status: string;
  pfcRatio: PFCRatio;
  totalNutrientValues: TotalNutrientValues;
  foodIntakes: FoodIntakes;
  message: string;
}

function clearCharts(): void {
  const foodIntakesChart = document.getElementById(
    "food-intakes-chart"
  ) as HTMLElement | null;
  const pfcRatioChart = document.getElementById(
    "pfc-ratio-chart"
  ) as HTMLElement | null;

  if (!foodIntakesChart) {
    throw new Error("Food intake chart not found.");
  }
  if (!pfcRatioChart) {
    throw new Error("PFC ratio chart not found.");
  }

  foodIntakesChart.textContent = "";
  pfcRatioChart.textContent = "";
}

function handleOptimizationResult(result: Result): void {
  if (result.status === "Optimal") {
    drawPFCRatioWithTotalEnergy(result.pfcRatio, result.totalNutrientValues);
    drawFoodintakes(result.foodIntakes);
  } else {
    clearCharts();
    alert("status: " + result.status + "\n" + "message: " + result.message);
  }
}

async function submitForm(): Promise<void> {
  const foodInformation = getFoodInformation();
  const objective = getObjective();
  const constraints = getConstraints();

  const response = await fetch("/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      foodInformation,
      objective,
      constraints,
    }),
  });

  const result = await response.json();

  handleOptimizationResult(result);
}
