function addItem(templateId, targetId) {
  const template = document.getElementById(templateId).content.cloneNode(true);
  document.getElementById(targetId).appendChild(template);
}

function removeItem(button) {
  button.closest("tr").remove();
}

function updateUnitOptions(select) {
  const nutritionalComponent = select
    .closest("tr")
    .querySelector("[name='constraint-nutritional-component']");
  const unitSelect = select
    .closest("tr")
    .querySelector("[name='constraint-unit']");

  if (nutritionalComponent.value === "energy") {
    unitSelect.innerHTML = `<option value="energy">Energy (kcal)</option>`;
    unitSelect.disabled = true;
  } else {
    unitSelect.disabled = false;

    if (!unitSelect.querySelector("option[value='amount']")) {
      unitSelect.innerHTML = `
        <option value="amount">Amount (g)</option>
        <option value="ratio">Ratio (%)</option>
      `;
    }
  }
}

function getFoodInformation() {
  return Array.from(document.querySelectorAll("#food-inputs tr")).map(
    (item) => ({
      name: item.querySelector("[name='food-name']").value,
      gramsPerUnit: parseInt(
        item.querySelector("[name='food-grams-per-unit']").value
      ),
      minimumIntake: parseInt(
        item.querySelector("[name='food-minimum-intake']").value
      ),
      maximumIntake: parseInt(
        item.querySelector("[name='food-maximum-intake']").value
      ),
      energy: parseFloat(item.querySelector("[name='food-energy']").value),
      protein: parseFloat(item.querySelector("[name='food-protein']").value),
      fat: parseFloat(item.querySelector("[name='food-fat']").value),
      carbohydrates: parseFloat(
        item.querySelector("[name='food-carbohydrates']").value
      ),
    })
  );
}

function getObjective() {
  return Array.from(document.querySelectorAll("#objective-inputs tr")).map(
    (row) => ({
      problem: row.querySelector("[name='objective-problem']").value,
      nutritionalComponent: row.querySelector(
        "[name='objective-nutritional-component']"
      ).value,
    })
  );
}

function getConstraints() {
  return Array.from(document.querySelectorAll("#constraint-inputs tr")).map(
    (row) => ({
      minMax: row.querySelector("[name='constraint-min-max']").value,
      nutritionalComponent: row.querySelector(
        "[name='constraint-nutritional-component']"
      ).value,
      unit: row.querySelector("[name='constraint-unit']").value,
      value: parseFloat(row.querySelector("[name='constraint-value']").value),
    })
  );
}

function drawPFCRatio(pfcRatio) {
  const nutrientComponents = ["protein", "fat", "carbohydrates"];
  const colors = [
    "rgb(255, 128, 128)",
    "rgb(128, 255, 128)",
    "rgb(128, 128, 255)",
  ];

  const data = nutrientComponents.map((nutrient, index) => {
    const capitalizedNutrient =
      nutrient.charAt(0).toUpperCase() + nutrient.slice(1);
    return {
      name: capitalizedNutrient,
      y: parseFloat(pfcRatio[nutrient]),
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
    series: [
      {
        name: "PFC Ratio",
        colorByPoint: true,
        data: data,
      },
    ],
  });
}

function drawFoodIntake(foodIntake) {
  const data = Object.keys(foodIntake).map((food) => ({
    name: food,
    y: foodIntake[food],
  }));

  Highcharts.chart("food-intake-chart", {
    chart: {
      type: "bar",
    },
    title: {
      text: "Food Intake",
    },
    xAxis: {
      categories: data.map((item) => item.name),
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
        name: "Food Intake",
        data: data.map((item) => item.y),
        color: "rgb(128, 128, 255)",
      },
    ],
  });
}

async function submitForm() {
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
  document.getElementById("result").textContent = JSON.stringify(
    result,
    null,
    4
  );

  // TODO: submitForm のメソッド以上の処理を行っている。
  drawPFCRatio(result.pfc_ratio);
  drawFoodIntake(result.food_intake);
}
