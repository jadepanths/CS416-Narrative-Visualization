import pandas as pd

def calculate_temperature_range(file_path):
    # Load the CSV file
    df = pd.read_csv(file_path)
    
    # Remove rows with missing AverageTemperature
    df = df.dropna(subset=['AverageTemperature'])
    
    # Calculate the min and max temperatures
    min_temp = df['AverageTemperature'].min()
    max_temp = df['AverageTemperature'].max()
    
    return min_temp, max_temp

# Example usage
file_path = 'YearlyAverageTemperaturesByCountry.csv'
min_temp, max_temp = calculate_temperature_range(file_path)
print(f"Temperature Range: {min_temp}°C to {max_temp}°C")