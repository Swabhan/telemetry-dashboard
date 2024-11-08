import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import plotly.express as px

t = {
    "timestamp": list(range(1000)),
    "velocity": list(range(1000))
}
data = pd.DataFrame(t)

#General Information
st.title("Velocity Report")

st.markdown("""
Report provides a visual and statistical representation on data collected via telemetry
""")
st.markdown("---")

# Filter data
st.sidebar.header("Filter Options")
min_time, max_time = st.sidebar.slider(
    "Select Timestamp Range", min_value=int(data["timestamp"].min()), max_value=int(data["timestamp"].max()),
    value=(int(data["timestamp"].min()), int(data["timestamp"].max()))
)
filtered_data = data[(data["timestamp"] >= min_time) & (data["timestamp"] <= max_time)]

# Moving average calculation (5-point)
filtered_data["velocity_avg"] = filtered_data["velocity"].rolling(window=5).mean()

#Plot Graph
st.subheader("Interactive Graph")
st.markdown("Graph with Velocity over Time (filtered by selected range)")
fig = px.line(filtered_data, x="timestamp", y="velocity", title="Velocity Over Time")
fig.add_scatter(x=filtered_data["timestamp"], y=filtered_data["velocity_avg"], mode="lines", name="Moving Average", line=dict(color="orange"))

# Display the Plotly plot
st.plotly_chart(fig)

st.markdown("---")

#Summary Stats
st.subheader("Summary Statistics")
time_range = max_time - min_time
st.write(f"**Total Data Points in Range**: {len(filtered_data)}")
st.write(f"**Time Range**: {time_range} units")
st.write(f"**Average Velocity**: {filtered_data['velocity'].mean():.2f} units")
st.write(f"**Maximum Velocity**: {filtered_data['velocity'].max()} units")
st.write(f"**Minimum Velocity**: {filtered_data['velocity'].min()} units")
st.markdown("---")

#Velocity Distributions
st.subheader("Velocity Distribution")
fig_hist = px.histogram(filtered_data, x="velocity", nbins=20, title="Distribution of Velocity Values")
st.plotly_chart(fig_hist)

#Data Table
st.markdown("---")
st.subheader("Data Table (Filtered)")
st.dataframe(filtered_data)

#Download CSV
st.markdown("---")
st.subheader("Download Filtered Data")
csv = filtered_data.to_csv(index=False)
st.download_button("Download Filtered Data as CSV", csv, "filtered_velocity_data.csv", mime="text/csv")
