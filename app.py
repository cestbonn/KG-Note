from flask import Flask, request, jsonify
import networkx as nx
from unties import Brain
from MyData import DATA

app = Flask(__name__)
app.config['CORS_ALLOW_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True

from flask_cors import CORS
CORS(app, resources={r'/*': {'origins': '*', 'allow_headers': 'Content-Type'}})

brain = Brain()
for data in DATA:
    brain.add_from_db(data)

@app.route('/add', methods=['POST', 'OPTIONS'])
def add_data():
    if request.method == 'OPTIONS':
        return ('', 200)
    data = request.json
    brain.add((data['src'], data['relation'], data['dest'], data['write_date']))
    print(brain.to_json())
    return jsonify(brain.to_json())

@app.route('/clear', methods=['POST'])
def clear_data():
    for data in DATA:
        brain.add_from_db(data)
    brain.clear()
    return jsonify({"status": "success", "message": "Graph cleared!"})

@app.route('/node-types', methods=['GET'])
def get_node_types():
    node_types = set(data['type'] for data in brain.kg.nodes.values())
    return jsonify(list(node_types))

@app.route('/get-graph', methods=['GET'])
def get_graph():
    return jsonify(brain.to_json())

@app.route('/')
def homepage():
    return 'hello word!!'


if __name__ == '__main__':
    app.run(debug=True)
