from pdts import DTStream
import json
from flask import Flask, jsonify
from flask_cors import CORS

import streamlitTest as st
import pandas as pd
import matplotlib.pyplot as plt

st.title("Line Plot Example")
data = pd.DataFrame({
    "x": [1, 2, 3, 4],                # Load sample data
    "y": [10, 20, 30, 40]})
plt.plot(data["x"], data["y"])         # Plot the data
st.pyplot()     

app = Flask(__name__)
CORS(app)

stream = DTStream()
stream.start()

def get_data():
    data = stream.get_data()
    data = json.loads(data)

    combined_data = {}
    for item in data:
        combined_data.update(item)

    return combined_data if combined_data else {}

@app.route('/telemetry', methods=['GET'])
def telemetry():
    data = get_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2000)
