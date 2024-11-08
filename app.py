import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt

st.title("Line Plot Example")
data = pd.DataFrame({
    "x": [1, 2, 3, 4],
    "y": [10, 20, 30, 40]})

plt.plot(data["x"], data["y"])
st.pyplot()     