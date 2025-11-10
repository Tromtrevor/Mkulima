import streamlit as st
import pandas as pd
import plotly.express as px

# Load data
data = pd.read_csv("./data/predictor/clean data.csv")
county_name = st.session_state['location']
st.title(f" AgroServices in {county_name.capitalize()}")

counties = data["Keyword"].unique()



county_data = data[data["Keyword"].str.contains(county_name, case=False, na=False)]

if county_data.empty:
    st.warning("No agrovets found for this county.")
else:
    fig = px.scatter_map(
        county_data,
        lat="Latitude",
        lon="Longitude",
        hover_name="Title",
        hover_data=["Category"],
        color="Category",
        zoom=9,
        height=500, width=500,
        size_max=20, 
    )

    fig.update_layout(
        mapbox_style="open-street-map",
        margin={"r":0,"t":0,"l":0,"b":0}
    )

    st.plotly_chart(fig, use_container_width=True)