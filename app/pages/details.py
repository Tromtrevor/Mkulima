import streamlit as st
import pandas as pd

df = pd.read_csv('./data/predictor/kenya_crop_suitability.csv')
crop = st.session_state['best crop']
data = df[df['crop_name'].str.lower() == crop.lower()].reset_index()

input_data = st.session_state['input'].reset_index()

temp = (input_data.at[0, 'mean Tmin'] + input_data.at[0, 'mean Tmax'])/2
altitude = input_data.at[0,'meanElev']
rainfall = input_data.at[0, 'Precipitation']
ph = input_data.at[0, 'pH']

st.write(f'''
	## {crop.capitalize()}\n

	''')

col1, col2, col3 = st.columns(3)

with col1:
	col_1a, col_1b = st.columns(2)

	#with col_1a:
	st.write(f'''
		***Temperature*** : {data.at[0, 'temperature_min']} - {data.at[0, 'temperature_max']} °C\n
		***Altitude*** : {data.at[0, 'altitude_min']} - {data.at[0, 'altitude_max']} m
		''')
with col2:
	col_1a, col_1b = st.columns(2)

	st.write(f'''
		***Rainfall*** : {data.at[0, 'rainfall_min']} - {data.at[0, 'rainfall_max']} mm\n
		***pH Range*** : {data.at[0, 'ph_min']} - {data.at[0, 'ph_max']}
		''')
with col3:
	if st.button("NEARBY AGRI-SERVICES"):
		st.switch_page("pages/agriservices_map.py")
st.write(f'''
	### Satisfied conditions by {input_data.at[0, 'County'].capitalize()}
	''')


if  altitude < data.at[0, 'altitude_max'] and altitude > data.at[0, 'altitude_min']:
	st.write(f'''
		\nAltitude\n
		{input_data.at[0,'meanElev']:.2f} m falls within {data.at[0, 'altitude_min']} - {data.at[0, 'altitude_max']} m
		''')

if temp < data.at[0, 'temperature_max'] and temp > data.at[0, 'temperature_min']:
	st.write(f'''
		\nTemperature\n 
		{temp:.2f} °C falls within {data.at[0, 'temperature_min']} - {data.at[0, 'temperature_max']} °C
		''')

if rainfall < data.at[0, 'rainfall_max'] and rainfall > data.at[0, 'rainfall_min']:
	st.write(f'''
		\nPrecipitation\n 
		{rainfall:.2f} mm falls within {data.at[0, 'rainfall_min']} - {data.at[0, 'rainfall_max']} mm
		''')

if ph < data.at[0, 'ph_max'] and ph > data.at[0, 'ph_min']:
	st.write(f'''
		\nsoil pH\n 
		{ph:.2f} falls within {data.at[0, 'ph_min']} - {data.at[0, 'ph_max']} 
		''')