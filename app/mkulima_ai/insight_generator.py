from .groq_client import client

def generate_crop_insight(data):
    prompt = f"""
    County: {data.get('latest')['county']}
    Farm Size: {data.get('latest')['farm_size']} acres
    Crop: {data.get('profit_analysis')['crop']}

    Soil pH: {data.get('latest')['input_data']['pH']}
    Average Rainfall: {data.get('latest')['input_data']['Precipitation']} mm/year
    Average Temperature: {data.get('latest')['input_data']['mean Tmin']} °C
    Average Temperature: {data.get('latest')['input_data']['mean Tmax']} °C    
    
    

    Predicted Yield: {data.get('profit_analysis')['predicted_yield']} t/acre
    Market Price: KES {data.get('profit_analysis')['market_price']} per acre
    Estimated Profit: KES {data.get('profit_analysis')['profit']['total_profit']}
    Profit Margin: {data.get('profit_analysis')['profit_margin']}

	Using the above data, provide a detailed analysis including:
	1. Expected Yield and Profitability
	2. Soil and Fertilizer Recommendations
	3. Climate and Water Management Advice
	4. Market and Pricing Outlook
	5. Final Recommendation for the Farmer

	Reccomdend intercropping on a farm size thet can handle it. ALos take into consideration the nitrogen, phosphorous and potassium levels, giving only two crops that help boost the insufficient one.

	Use clear and short sentences suitable for an agricultural app interface. Keep it short and straight to the point. You acn ignore the format but give relevant information. 250 words
	"""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
        {
            "role": "system",
            "content": (
            "You are an expert agronomist and data analyst. "
            "Your job is to analyze agricultural data for Kenyan counties "
            "and give structured, practical insights for smallholder farmers."
        )},
            {"role": "user", "content": prompt},
        ],
    )

    return response.choices[0].message.content