const width = 960;
const height = 600;
const lineGraphHeight = 300;
let currentYear = 1750;
let playing = false;
let playInterval;

const svg = d3.select("#map-container").append("svg")
    .attr("width", width)
    .attr("height", height);

const lineGraphSvg = d3.select("#line-graph")
    .attr("width", width)
    .attr("height", lineGraphHeight);

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
    .domain([maxTemp, minTemp]);  // Domain adjusted to ensure blue is cold and red is hot

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
    { year: 1859, text: "Oil Industry Begins" },
    { year: 1870, text: "Second Industrial Revolution" },
    { year: 1945, text: "End of World War II (Post-war industrialization and population boom )" },
];

const tooltip = d3.select("#tooltip");

Promise.all([
    d3.json("data/custom.geo.json"),
    d3.csv("data/YearlyAverageTemperaturesByCountry.csv"),
    d3.csv("data/GlobalYearlyAverageTemperatures.csv")
]).then(([geojson, temperatureData, globalTemperatureData]) => {
    temperatureData.forEach(d => {
        d.Year = +d.Year;
        d.AverageTemperature = +d.AverageTemperature;
    });

    globalTemperatureData.forEach(d => {
        d.Year = +d.Year;
        d.AverageTemperature = +d.AverageTemperature;
        d.AverageTemperatureUncertainty = +d.AverageTemperatureUncertainty;
        d.UpperBound = d.AverageTemperature + d.AverageTemperatureUncertainty;
        d.LowerBound = d.AverageTemperature - d.AverageTemperatureUncertainty;
    });

    const xScale = d3.scaleLinear()
        .domain([1750, 2013])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([
            d3.min(globalTemperatureData, d => d.LowerBound),
            d3.max(globalTemperatureData, d => d.UpperBound)
        ])
        .range([lineGraphHeight, 0]);

    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d.AverageTemperature));

    const area = d3.area()
        .x(d => xScale(d.Year))
        .y0(d => yScale(d.LowerBound))
        .y1(d => yScale(d.UpperBound));

    lineGraphSvg.append("path")
        .datum(globalTemperatureData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("class", "temperature-line");

    lineGraphSvg.append("path")
        .datum(globalTemperatureData)
        .attr("fill", "lightgray")
        .attr("class", "uncertainty-area");

    lineGraphSvg.append("path")
        .datum(globalTemperatureData)
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("class", "average-temperature-line");

    lineGraphSvg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", `translate(0,${lineGraphHeight})`)
        .call(d3.axisBottom(xScale).ticks(20).tickFormat(d3.format("d")));

    lineGraphSvg.append("g")
        .attr("class", "y-axis axis")
        .call(d3.axisLeft(yScale).ticks(10));

    // Add axis titles
    lineGraphSvg.append("text")
        .attr("transform", `translate(${width / 2}, ${lineGraphHeight + 40})`)
        .style("text-anchor", "middle")
        .text("Year");

    lineGraphSvg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -60)
        .attr("x", -(lineGraphHeight / 2))
        .style("text-anchor", "middle")
        .text("Temperature (°C)");

    // Add legend
    const legend = lineGraphSvg.append("g")
        .attr("transform", `translate(${width - 150}, 50)`);  // Move the legend out of the graph area

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", "lightgray");

    legend.append("text")
        .attr("x", 20)
        .attr("y", 10)
        .attr("class", "legend")
        .text("Uncertainty Range");

    legend.append("line")
        .attr("x1", 0)
        .attr("y1", 20)
        .attr("x2", 10)
        .attr("y2", 20)
        .attr("stroke", "red")
        .attr("stroke-width", 1.5);

    legend.append("text")
        .attr("x", 20)
        .attr("y", 25)
        .attr("class", "legend")
        .text("Average Temperature");

    updateMap(currentYear);
    updateLineGraph(currentYear);
    createColorBar();

    d3.select("#prevYear").on("click", () => {
        currentYear = Math.max(currentYear - 1, 1750);
        updateMap(currentYear);
        updateLineGraph(currentYear);
    });

    d3.select("#nextYear").on("click", () => {
        currentYear = Math.min(currentYear + 1, 2013);
        updateMap(currentYear);
        updateLineGraph(currentYear);
    });

    d3.select("#yearRange").on("input", function() {
        currentYear = +this.value;
        updateMap(currentYear);
        updateLineGraph(currentYear);
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
                    updateLineGraph(currentYear);
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

    function updateLineGraph(year) {
        const filteredData = globalTemperatureData.filter(d => d.Year <= year);

        lineGraphSvg.select(".temperature-line")
            .datum(filteredData)
            .attr("d", line);

        lineGraphSvg.select(".uncertainty-area")
            .datum(filteredData)
            .attr("d", area);

        lineGraphSvg.select(".average-temperature-line")
            .datum(filteredData)
            .attr("d", line);

        // Add annotations to the line graph using d3-annotation
        const makeAnnotations = d3.annotation()
            .type(d3.annotationCallout)
            .accessors({
                x: d => xScale(d.year),
                y: d => yScale(globalTemperatureData.find(g => g.Year === d.year).AverageTemperature)
            })
            .annotations(annotations.filter(a => a.year <= year).map(a => {
                let dx = 50;
                let dy = 50;
                if (a.text === "Second Industrial Revolution") {
                    dx = 100; // Shift this annotation further to the right
                    dy = 100; // Shift this annotation further down
                }
                return {
                    note: { label: a.text, title: `Year ${a.year}` },
                    x: xScale(a.year),
                    y: yScale(globalTemperatureData.find(g => g.Year === a.year).AverageTemperature),
                    dx: dx,
                    dy: dy
                };
            }));

        lineGraphSvg.selectAll(".annotation-group").remove();
        lineGraphSvg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);
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
