let closedWonTable;
let created;
let pulled;
let stageAnalysisTable;
let createdTable;
let pulledTable;
let stageConversionData;
let forecastData;

const headTitle = document.querySelector(".head-title");
const overallForecast = document.querySelector(".overall-forecast");
const forecastTable = document.getElementById("forecast-table-section");
const content = document.querySelector(".content");
const loader = document.querySelector("#loader");

document.addEventListener("DOMContentLoaded", (event) => {
  alert('hello');
  getForecastData();
});

function getForecastData() {
  // Get the parameter value from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get("orgid");

  // Make the API call with the parameter
  const apiUrl = "https://kr91cxm7k1.execute-api.us-east-2.amazonaws.com/Prod";
//   const requestUrl = `${apiUrl}?orgid=${encodeURIComponent('00D6g000002hN2pEAE')}`;
   const requestUrl = "https://kr91cxm7k1.execute-api.us-east-2.amazonaws.com/Prod?orgid=00D6g000002hN2pEAE";
  // Send the GET request
  fetch(requestUrl)
    .then((response) => response.json())
    .then((response) => {
      let data = response.body;
      closedWonTable = data.ClosedWonTable;
      created = data.Created;
      pulled = data.Pulled;
      stageAnalysisTable = data.StageAnalysis;
      createdTable = data.CreatedTable;
      pulledTable = data.PulledTable;
      stageConversionData = Object.assign({}, data.StageConversionData);
      forecastData = data.ForecastData;
      headTitle.textContent = data.FiscalQuarter + ":";

      loadForecastBreakdown();
      loadForecastInsights();
      updateOverallForecast();
      loadStageConversionData();
      content.classList.remove("none");
      content.classList.add("block");
      loader.classList.add("none");
    })
    .catch((error) => {
      // Handle any errors
      console.error("Error:", error);
      content.classList.remove("none");
      content.classList.add("block");
      loader.classList.add("none");
    });
}

function loadForecastBreakdown() {
  updateClosedForecast();
  updateCreatedForecast();
  updatePulledForecast();
  updateForecastForecast();
}

function loadForecastInsights() {
  updateCreatedInsightTable();
  updatePulledInsightTable();
}

function formatStageConversionData() {
  let additionalColumns = [
    {
      name: "conversion",
      type: "integer",
    },
    {
      name: "forecasted",
      type: "number",
    },
  ];
  stageConversionData.schema.fields.push(...additionalColumns);
  stageConversionData.data.forEach((item) => {
    item["conversion"] = item.mean || 0;
    item["forecasted"] = ((item.openpipeline || 0) * (item.mean || 0)) / 100;
  });
}

function loadStageConversionData() {
  // format stageConversionData to add new columns and data
  formatStageConversionData();
  // Construct the table and append it to the container
  const table = constructForecastTable(stageConversionData);
  forecastTable.appendChild(table);
}

function updateOverallForecast() {
  let total = 0;
  for (const key in forecastData) {
    if (Object.hasOwnProperty.call(forecastData, key)) {
      total += forecastData[key];
    }
  }
  overallForecast.textContent = total.toLocaleString("en-US");
}

const closedForecast = document.querySelector(".ClosedForecast");
const createdForecast = document.querySelector(".CreatedForecast");
const pulledForecast = document.querySelector(".PulledForecast");
const forecastForecast = document.querySelector(".ForecastForecast");

function updateClosedForecast() {
  closedForecast.textContent =
    forecastData.ClosedForecast.toLocaleString("en-US");
}

function updateCreatedForecast() {
  createdForecast.textContent =
    forecastData.CreatedForecast.toLocaleString("en-US");
}

function updatePulledForecast() {
  pulledForecast.textContent =
    forecastData.PulledForecast.toLocaleString("en-US");
}

function updateForecastForecast() {
  forecastForecast.textContent =
    forecastData.ForecastForecast.toLocaleString("en-US");
}

function updateCreatedInsightTable() {
  let createdTablemin = document.querySelector(".created-table .min");
  let createdTableavg = document.querySelector(".created-table .avg");
  let createdTablemax = document.querySelector(".created-table .max");
  let createdTableInput = document.querySelector(".created-table input");

  createdTablemin.textContent = createdTable.min.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  createdTableavg.textContent = createdTable.avg.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  createdTablemax.textContent = createdTable.max.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  createdTableInput.value = createdTable.avg;
  createdTableInput.addEventListener("change", handleCreatedTableInput);
}

function handleCreatedTableInput(event) {
  forecastData.CreatedForecast = +event.target.value;
  updateCreatedForecast();
  updateOverallForecast();
}

function updatePulledInsightTable() {
  let pulledTablemin = document.querySelector(".pulled-table .min");
  let pulledTableavg = document.querySelector(".pulled-table .avg");
  let pulledTablemax = document.querySelector(".pulled-table .max");
  let pulledTableInput = document.querySelector(".pulled-table input");
  pulledTablemin.textContent = pulledTable.min.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  pulledTableavg.textContent = pulledTable.avg.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  pulledTablemax.textContent = pulledTable.max.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
  pulledTableInput.value = pulledTable.avg;
  pulledTableInput.addEventListener("change", handlePulledTableInput);
}

function handlePulledTableInput(event) {
  forecastData.PulledForecast = +event.target.value;
  updatePulledForecast();
  updateOverallForecast();
}

function getForecastColumnNames(field) {
  switch (field.name) {
    case "mean":
      return "Avg";

    default:
      return field.name.slice(0, 1).toUpperCase() + field.name.slice(1);
  }
}

// Function to construct HTML table
function constructForecastTable(data) {
  // Create table element
  const table = document.createElement("table");
  table.classList.add("forecast-table");

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  data.schema.fields.forEach((field) => {
    if (field.name === "index" || field.name === "sortorder") {
      return;
    }
    const th = document.createElement("th");
    th.textContent = getForecastColumnNames(field);
    if (field.type === "string") {
      th.style.textAlign = "left";
    }
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  data.data.forEach((item, itemIndex) => {
    const row = document.createElement("tr");

    data.schema.fields.forEach((field) => {
      if (field.name === "index" || field.name === "sortorder") {
        return;
      }
      const td = document.createElement("td");
      if (field.type === "string") {
        td.style.textAlign = "left";
      }
      if (field.name === "conversion") {
        const conversionInput = document.createElement("input");
        conversionInput.type = "number";
        conversionInput.min = 0;
        conversionInput.max = 100;
        conversionInput.dataset.itemIndex = itemIndex;
        conversionInput.addEventListener("change", onConversionInputChange);
        conversionInput.value = getFormattedData(field, item);
        td.appendChild(conversionInput);
      } else {
        td.textContent = getFormattedData(field, item);
      }
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  // Add a row for total conversion
  const totalConversionRow = document.createElement("tr");
  const totalConversionLabel = document.createElement("td");
  totalConversionLabel.textContent = "Total";
  totalConversionLabel.colSpan = data.schema.fields.length - 3;
  totalConversionRow.appendChild(totalConversionLabel);

  const totalConversionValue = document.createElement("td");
  totalConversionValue.id = "totalRowsForecast";
  totalConversionValue.textContent =
    "$" +
    calculateTotalConversion(data.data).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  totalConversionRow.appendChild(totalConversionValue);

  tbody.appendChild(totalConversionRow);

  table.appendChild(tbody);

  return table;
}

// Function to calculate total conversion
function calculateTotalConversion(data) {
  let total = 0;

  data.forEach((item) => {
    total += item.forecasted || 0;
  });

  return total;
}

function getFormattedData(field, item) {
  switch (field.type) {
    case "integer":
      return !!item[field.name] || item[field.name] === 0
        ? item[field.name]
        : null;
    case "datetime":
      return !!item[field.name]
        ? new Date(item[field.name]).toLocaleDateString()
        : null;
    case "number":
      if (["mean", "min", "max", "stageconversion"].includes(field.name)) {
        return !!item[field.name]
          ? item[field.name].toLocaleString("en-US", {
              maximumFractionDigits: 2,
            }) + "%"
          : 0 + "%";
      } else {
        return !!item[field.name]
          ? "$" +
              item[field.name].toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })
          : "$" + 0;
      }
    default:
      return !!item[field.name] ? item[field.name] : null;
  }
}

function onConversionInputChange(event) {
  let value = +event.target.value;
  if (value > 100 || value < 0) {
    event.target.value = 0;
    return;
  }
  let itemIndex = +event.target.dataset.itemIndex;
  let matchedItem = stageConversionData.data.find(
    (item, eleIndex) => eleIndex === itemIndex
  );
  if (!matchedItem) {
    return;
  }
  matchedItem.forecasted =
    ((matchedItem.openpipeline || 0) * (value || 0)) / 100;
  document.querySelectorAll(".forecast-table tbody tr")[
    itemIndex
  ].lastChild.textContent = matchedItem.forecasted.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
  forecastData.ForecastForecast = calculateTotalConversion(
    stageConversionData.data
  );
  document.querySelector(".forecast-table #totalRowsForecast").textContent =
    "$" +
    forecastData.ForecastForecast.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  updateForecastForecast();
  updateOverallForecast();
}

/* ---------------------------------------------------------------------------------- */
/* @ Handle Overlay tables */

// Get the icon element and overlay
const icon = document.getElementById("icon");

const breakdownCardInfoIconsList =
  document.querySelectorAll(".breakdown-card i");

const overlay = document.getElementById("overlay");

// Get the close icon
const closeIcon = document.getElementById("closeIcon");

// Function to open the overlay
function openOverlay(index) {
  overlay.style.display = "block";
  const overlayTitle = document.getElementById("overlay-title");
  document.body.classList.add("overlay-open");
  const breakdown = getBreakdownTables(index);
  overlayTitle.textContent = breakdown.title;
  constructOverlayTable(breakdown.data);
}

function getBreakdownTables(index) {
  switch (index) {
    case 0:
      return { title: "Closed Won Table", data: closedWonTable };
    case 1:
      return { title: "Created Table", data: created };
    case 2:
      return { title: "Pulled Table", data: pulled };
    case 3:
      return { title: "Forecasted Table", data: stageAnalysisTable };
    default:
      return [];
  }
}

// Function to close the overlay
function closeOverlay() {
  overlay.style.display = "none";
  const overlayTitle = document.getElementById("overlay-title");
  overlayTitle.textContent = "Table";
  const overlayTableContainer = document.querySelector(
    ".overlay-table-container"
  );
  overlayTableContainer.removeChild(document.querySelector(".overlay-table"));
  document.body.classList.remove("overlay-open");
}

// Attach click event listener to the icon
breakdownCardInfoIconsList.forEach((icon, index) => {
  icon.addEventListener("mouseenter", () => openOverlay(index));
});

// Attach click event listener to the close icon
closeIcon.addEventListener("click", closeOverlay);

function constructOverlayTable(data) {
  // Create table element
  const table = document.createElement("table");
  table.classList.add("overlay-table");

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  data.schema.fields.forEach((field) => {
    if (field.name === "index") {
      return;
    }
    const th = document.createElement("th");
    if (field.type === "string") {
      th.style.textAlign = "left";
    }
    th.textContent = field.name.slice(0, 1).toUpperCase() + field.name.slice(1);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  data.data.forEach((item) => {
    const row = document.createElement("tr");

    data.schema.fields.forEach((field) => {
      if (field.name === "index") {
        return;
      }
      const td = document.createElement("td");
      if (field.type === "string") {
        td.style.textAlign = "left";
      }
      td.textContent = getFormattedData(field, item);
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  const overlayTableContainer = document.querySelector(
    ".overlay-table-container"
  );
  overlayTableContainer.appendChild(table);
}
