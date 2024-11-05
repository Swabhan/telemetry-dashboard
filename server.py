'''
To run locally, creates an API Endpoint on localhost 2000 which allows
us to recieve latest telemetry data while interacting with PyBinds
'''

#Import
import json
from flask import Flask, jsonify
from flask_cors import CORS

#Import from python package created from telemetry_stream repo
from pdts import DTStream

#Setup Flask
app = Flask(__name__)
CORS(app)

#Telemetry_stream setup, allows us to begin recieving data
stream = DTStream()
stream.start()

#Recieve latest data
def get_data():
    data = stream.get_data()
    data = json.loads(data)

    #Proper Formatting
    combined_data = {}
    for item in data:
        combined_data.update(item)

    return combined_data if combined_data else {}

#Endpoint to recieve latest data from frontend
@app.route('/telemetry', methods=['GET'])
def telemetry():
    data = get_data()
    return jsonify(data)

#Run local API on port 2000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2000)
