const width = 960;
const height = 600;
let currentYear = 1750;

const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

// Use the calculated temperature range from your Python script
// -22.616°C to 30.74475°C
const minTemp = -22.616; 
const maxTemp = 30.74475; 

// Define a color scale with a diverging scheme from blue (cold) to red (hot)
const colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateRdYlBu)
    .domain([maxTemp, minTemp]);  // Inverted domain to ensure blue is cold and red is hot

// Country name mapping (add more mappings as needed)
const countryNameMapping = {
    "United States": "United States of America",
    "Czech Republic": "Czechia",
    "Bosnia And Herzegovina": "Bosnia and Herz.",
    "Burma": "Myanmar",
    "Congo (Democratic Republic Of The)": "Dem. Rep. Congo",
    "Central African Republic": "Central African Rep.",
    "Côte D'Ivoire": "Côte d'Ivoire",
    "Falkland Islands (Islas Malvinas)": "Falkland Is.",
    "Macedonia": "North Macedonia",
    "Dominican Republic": "Dominican Rep.",
    "Trinidad And Tobago": "Trinidad and Tobago",
    "Guinea Bissau": "Guinea-Bissau",
    "Equatorial Guinea": "Eq. Guinea",
    "Timor Leste": "Timor-Leste",
    "Solomon Islands": "Solomon Is."
};

Promise.all([
    d3.json("data/custom.geo.json"),
    d3.csv("data/YearlyAverageTemperaturesByCountry.csv")
]).then(([geojson, temperatureData]) => {
    temperatureData.forEach(d => {
        d.Year = +d.Year;
        d.AverageTemperature = +d.AverageTemperature;
    });

    svg.append("g")
        .selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "country");

    updateMap(currentYear);

    d3.select("#prevYear").on("click", () => {
        currentYear = Math.max(currentYear - 1, d3.min(temperatureData, d => d.Year));
        updateMap(currentYear);
    });

    d3.select("#nextYear").on("click", () => {
        currentYear = Math.min(currentYear + 1, d3.max(temperatureData, d => d.Year));
        updateMap(currentYear);
    });

    function updateMap(year) {
        d3.select("#yearDisplay").text(year);

        const yearData = temperatureData.filter(d => d.Year === year);

        const countryTemp = {};
        yearData.forEach(d => {
            // Use the mapping to get the correct country name
            const countryName = countryNameMapping[d.Country] || d.Country;
            countryTemp[countryName] = d.AverageTemperature;
        });

        svg.selectAll(".country")
            .attr("fill", d => {
                const temp = countryTemp[d.properties.name];
                return temp != null ? colorScale(temp) : "#ccc";
            });
    }
}).catch(error => {
    console.error('Error loading data:', error);
});
