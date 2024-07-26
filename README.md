# CS416-Narrative-Visualization: Global Climate Change Visualization
This repository contains an interactive narrative visualization of global climate change, focusing on temperature changes from 1750 to 2013. The project utilizes D3.js and d3-annotation to create a dynamic and informative visual representation of temperature data sourced from the Berkeley Earth Surface Temperature Study.

## Overview
The goal of this project is to illustrate global temperature changes over time, highlighting significant events and trends that have impacted climate change. The visualization includes:

+ A world map showing temperature changes by country over time.
+ A line graph displaying global average temperatures with upper and lower uncertainty bounds.
+ Interactive controls for exploring the data, including a timeline slider and play/pause functionality.

## Features
+ Interactive World Map: Displays temperature changes for each country over time with color gradients indicating temperature 
  variations.
+ Line Graph: Shows global average temperature changes over time, with uncertainty bounds.
+ Annotations: Significant historical events related to climate change are annotated on the line graph.
+ Controls: Includes buttons for navigating through years, a slider for selecting a specific year, and a play/pause button 
  for automatic progression through the timeline.

## Data Source
The data used in this project is sourced from the [Berkeley Earth Surface Temperature Study](https://www.kaggle.com/datasets/berkeleyearth/climate-change-earth-surface-temperature-data/data). The dataset includes global land and ocean temperatures, allowing for detailed analysis and visualization.

## Data Processing and Justification
### Handling Missing Data
The dataset includes some missing values for AverageTemperature and AverageTemperatureUncertainty. To ensure the integrity of our analysis:

+ We calculated yearly average temperatures by country, ignoring records with missing temperature values to avoid skewing 
  the results.
+ For the global temperature line graph, we also calculated the yearly averages and uncertainty bounds by ignoring the 
  missing data points, ensuring a reliable representation of the overall trend.

### Temperature Range
Given the wide range of temperature data from -22.616°C to 30.74475°C, we used a diverging color scale from blue (cold) to red (hot) to visualize the data effectively. This choice helps users intuitively understand the temperature variations across different regions and over time.

### Annotations and Events
We added annotations for significant historical events (e.g., the Industrial Revolution) to provide context to the temperature trends. These annotations help users correlate temperature changes with major events that may have influenced global climate.

## Usage
### Viewing the Visualization
The project is hosted on GitHub Pages. You can view the live visualization here.

### Running Locally
To run the project locally, just clone and open index.html!

## Project Structure
+ index.html: The main HTML file containing the web page's structure.
+ css/styles.css: CSS file for styling the visualization.
+ scripts/map.js: JavaScript file that contains the D3.js code for creating the map and line graph visualizations.
+ data: Directory containing the data files used in the visualization.
