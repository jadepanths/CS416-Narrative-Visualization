const width = 960;
const height = 600;
let currentYear = 1750;
let playing = false;
let playInterval;

const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

// Use the calculated temperature range from your Python script
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

// List of annotations
const annotations = [
    { year: 1760, text: "First Industrial Revolution (1760-1840)" },
    { year: 1824, text: "Fourier's Greenhouse Effect Theory"},
    { year: 1859, text: "Oil Industry Begins" },
    { year: 1864, text: "George Perkins Marsh's Man and Nature" },
    { year: 1870, text: "Second Industrial Revolution" },
    { year: 1945, text: "End of World War II (Post-war industrialization and population boom )" },
    { year: 1958, text: "Keeling Curve (systematic measurements of atmospheric CO2)"},
    { year: 1970, text: "First Earth Day" },
    { year: 1979, text: "First World Climate Conference" },
    { year: 1987, text: "Montreal Protocol" },
    { year: 1988, text: "Intergovernmental Panel on Climate Change (IPCC) Established" },
    { year: 1992, text: "United Nations Framework Convention on Climate Change (UNFCCC)" },
    { year: 1997, text: "Kyoto Protocol" },
    { year: 2013, text: "IPCC Fifth Assessment Report" },
];

const tooltip = d3.select("#tooltip");

Promise.all([
    d3.json("data/custom.geo.json"),
    d3.csv("data/YearlyAverageTemperaturesByCountry.csv")
]).then(([geojson, temperatureData]) => {
    temperatureData.forEach(d => {
        d.Year = +d.Year;
        d.AverageTemperature = +d.AverageTemperature;
    });

    updateMap(currentYear);
    createColorBar();

    d3.select("#prevYear").on("click", () => {
        currentYear = Math.max(currentYear - 1, 1750);
        updateMap(currentYear);
    });

    d3.select("#nextYear").on("click", () => {
        currentYear = Math.min(currentYear + 1, 2013);
        updateMap(currentYear);
    });

    d3.select("#yearRange").on("input", function() {
        currentYear = +this.value;
        updateMap(currentYear);
    });

    d3.select("#playPause").on("click", () => {
        if (playing) {
            // Pause the playback
            clearInterval(playInterval);
            d3.select("#playPause").text("Play");
        } else {
            // Start or reset the playback
            if (currentYear === 2013) {
                currentYear = 1750;
            }
            d3.select("#playPause").text("Pause");
            playInterval = setInterval(() => {
                if (currentYear < 2013) {
                    currentYear++;
                    updateMap(currentYear);
                } else {
                    clearInterval(playInterval);
                    playing = false;
                    d3.select("#playPause").text("Play");
                }
            }, 100);
        }
        playing = !playing;
    });

    function updateMap(year) {
        d3.select("#yearDisplay").text(year);
        d3.select("#yearRange").property("value", year);

        const yearData = temperatureData.filter(d => d.Year === year);

        const countryTemp = {};
        yearData.forEach(d => {
            const countryName = countryNameMapping[d.Country] || d.Country;
            countryTemp[countryName] = d.AverageTemperature;
        });

        svg.selectAll(".country")
            .data(geojson.features)
            .join("path")
            .attr("d", path)
            .attr("class", "country")
            .attr("fill", d => {
                const temp = countryTemp[d.properties.name];
                return temp != null ? colorScale(temp) : "#ccc";
            })
            .on("mouseover", (event, d) => {
                const countryName = d.properties.name;
                const temp = countryTemp[countryName];
                tooltip.classed("hidden", false)
                    .html(`<strong>${countryName}</strong><br/>Temperature: ${temp != null ? temp.toFixed(2) + "°C" : "No data"}`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
                tooltip.classed("hidden", true);
            });

        updateAnnotations(year);
    }

    function createColorBar() {
        const colorBar = d3.select("#color-bar").append("svg")
            .attr("width", 300)
            .attr("height", 50);

        const defs = colorBar.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        linearGradient.selectAll("stop")
            .data(colorScale.ticks().map((t, i, n) => ({
                offset: `${100 * i / n.length}%`,
                color: colorScale(t)
            })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        colorBar.append("rect")
            .attr("width", 300)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient)");

        colorBar.append("text")
            .attr("x", 0)
            .attr("y", 35)
            .attr("fill", "#000")
            .text(maxTemp + "°C");

        colorBar.append("text")
            .attr("x", 229)
            .attr("y", 35)
            .attr("fill", "#000")
            .text(minTemp + "°C");
    }

    function updateAnnotations(year) {
        d3.select("#annotations").html(""); // Clear existing annotations

        const currentAnnotations = annotations.filter(a => a.year <= year);

        currentAnnotations.forEach(a => {
            d3.select("#annotations").append("div").attr("id", "text").text(`${a.text} (${a.year})`);
        });
    }

}).catch(error => {
    console.error('Error loading data:', error);
});
