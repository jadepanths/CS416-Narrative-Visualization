import pandas as pd

# Load the CSV file
df = pd.read_csv('GlobalLandTemperaturesByCountry.csv')

# Remove rows with missing AverageTemperature
df = df.dropna(subset=['AverageTemperature'])

# Convert 'dt' to datetime
df['dt'] = pd.to_datetime(df['dt'])

# Extract the year from the date
df['Year'] = df['dt'].dt.year

# Group by Country and Year and calculate the mean AverageTemperature
yearly_avg_temp = df.groupby(['Country', 'Year'])['AverageTemperature'].mean().reset_index()

# Save the processed data to a new CSV file
yearly_avg_temp.to_csv('YearlyAverageTemperaturesByCountry.csv', index=False)

print(yearly_avg_temp.head())