import streamlit as st
import requests

st.set_page_config(page_title="Mkulima Assistant", layout="centered")

st.markdown("""
<style>
button {
    background-color: #229e47 !important;
    border-radius: 12px !important;
    color: white !important;
}
</style>
""", unsafe_allow_html=True)

st.markdown("""
    <h1 style='text-align:center; color:#229e47;'>🌾 Mkulima Smart Farm Assistant</h1>
""", unsafe_allow_html=True)

county = st.text_input("🏙️ Farm Location (County)", placeholder="e.g. Makueni")
farm_size = st.number_input("🌿 Farm Size (acres)", min_value=0.0, step=0.1)

if st.button("🚀 Proceed to Analysis", use_container_width=True):
    with st.spinner("Analyzing..."):
        response = requests.post(
            "http://127.0.0.1:8000/api/crop/predict-yield",
            json={"county": county, "farm_size": farm_size},
        )
        data = response.json()
        st.success(f"✅ Best Crop: **{data['best_crop'].capitalize()}**")
        st.metric("Profit Margin", f"{data['profit_margin']:.2f}%")



