import streamlit as st

st.set_page_config(page_title='Prediction Result')
st.write('''## Top recommendation''')


col1, col2 = st.columns(2)

with col1:
	if 'best crop' in st.session_state:
		crop = st.session_state['best crop']
		yield_estimate = st.session_state['total yield']
		profit_margin = st.session_state['profit margin']
		st.write(f'''
			## {crop.capitalize()}
			Estimated Yield: {yield_estimate:.2f} tonnes/acre\n
			Criteria: Highest Profit Potential
			''')

		if st.button('View Details'):
			st.switch_page('pages/details.py')

	else:
		st.warning("No prediction found. Please run a crop recommendation first.")
		if st.button("🔙 Go Back"):
			st.switch_page("pages/crop_recommendation.py")

with col2:
	st.write(f'''
		\n### Profitability Analysis
		''')
	st.metric(
		label= 'Estimated Revenue:',
		 value= f'Ksh. {st.session_state['total revenue']:.2f}')

	st.metric(
		label= 'Estimated Cultivation Cost:',
		value= f'Ksh. {st.session_state['total cost']:.2f}')

	st.metric(
		label= 'Net Profit:',
		value= f'Ksh. {st.session_state['Profit']:.2f}',
		delta= f'{profit_margin:.2f}%')
	


st.write('''## Other recommendations''')
