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

const colorScale = d3.scaleSequential(d3.interpolateReds)
    .domain([-10, 30]); // Adjust domain based on your temperature data range

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
            countryTemp[d.Country] = d.AverageTemperature;
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
