import streamlit as st
import joblib
import pandas as pd
from datetime import datetime, date
from current_data.current_data import fetch_realtime_data
from profit_calculation.profit_calc import calculate_profit
from pathlib import Path

current_dir = Path(__file__).resolve().parent


county_data = pd.read_csv(current_dir.parent / "data" / "predictor" / "backup_means.csv")
counties = list(county_data['County'])
    
 
#-----------------------
#Load Model
# -----------------------
maize_model = joblib.load(current_dir.parent / "data" / "models" / "models" / "maize_model.pkl")
beans_model = joblib.load(current_dir.parent / "data" / "models" / "models" / "beans_model.pkl")
potato_model = joblib.load(current_dir.parent / "data" / "models" / "models" / "potato_model.pkl")
   
models = {'maize': maize_model,
        'beans': beans_model,
        #'potato': potato_model
        }


st.title('🌾 Crop Yield Prediction')
    
st.markdown('''
Enter your location and farm size to get best crop recommendation:
'''
)
# -----------------------
# Input Section
# -----------------------
st.header('Input Parameters')
    
    
col1, col2 = st.columns(2)
    
year = datetime.now().year
    
with col1:
    location = st.selectbox('Farm Location (County)', counties)
    farm_size = st.number_input('Farm Size (Acres)', 0.0)
    st.session_state['location'] = location


# -----------------------
# Prediction Section
# -----------------------
predictions = {}
if st.button('🔮 Predict Yield'):
    with st.spinner('Predicting...'):
        try:
            input_data = fetch_realtime_data(location).set_index('County')

            for name,model in models.items():
                prediction = model.predict(input_data)[0]
                #Convert t/ha to t/acre
                prediction_in_acres = prediction * 0.404686
                profit = calculate_profit(name, farm_size, prediction_in_acres)

                predictions[name] = {
                    'predicted_yield': float(f'{prediction:.2f}'),
                    'Total Yield': profit['total_yield'],
                    'Total Revenue': profit['total_revenue'],
                    'Total Cost': profit['total_cost'],
                    'Profit': profit['total_profit'],
                    
                }


            max_profit = float('-inf')
            for crop,val in predictions.items():
                if val['Profit']>max_profit:
                    max_profit = val['Profit']
                    best_crop =  crop
                    total_yield = val['Total Yield']
                    total_revenue = val['Total Revenue']
                    total_cost = val['Total Cost']
                    
            profit_margin = (max_profit/total_revenue)*100
            
            st.session_state['best crop'] = best_crop
            st.session_state['total yield'] = total_yield
            st.session_state['total revenue'] = total_revenue
            st.session_state['total cost'] = total_cost
            st.session_state['Profit'] = max_profit
            st.session_state['profit margin'] = profit_margin
            st.session_state ['input'] = input_data
            
        except Exception as e:
            st.error(f'Prediction failed: {e}')  
        st.dataframe(input_data)
        st.switch_page('pages/results.py')