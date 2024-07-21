import pandas as pd

# Load the CSV file
df = pd.read_csv('GlobalLandTemperaturesByCountry.csv')

# Remove rows with missing AverageTemperature
df = df.dropna(subset=['AverageTemperature'])

# Convert 'dt' to datetime
df['dt'] = pd.to_datetime(df['dt'])

# Extract the year from the date
df['Year'] = df['dt'].dt.year

# Calculate the global yearly average temperature and uncertainty
global_yearly_temp = df.groupby('Year').agg({
    'AverageTemperature': 'mean',
    'AverageTemperatureUncertainty': 'mean'
}).reset_index()

# Calculate the upper and lower bounds for uncertainty
global_yearly_temp['UpperBound'] = global_yearly_temp['AverageTemperature'] + global_yearly_temp['AverageTemperatureUncertainty']
global_yearly_temp['LowerBound'] = global_yearly_temp['AverageTemperature'] - global_yearly_temp['AverageTemperatureUncertainty']

# Save the processed data to a new CSV file
global_yearly_temp.to_csv('GlobalYearlyAverageTemperatures.csv', index=False)

print(global_yearly_temp.head())