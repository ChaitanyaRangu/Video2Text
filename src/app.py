from flask import Flask, jsonify, send_file
import os

app = Flask(__name__)

@app.route('/load-data', methods=['GET'])
def load_sales_data():
    return 

if __name__ == '__main__':
    if not os.path.exists('static'):
        makedirs('static')
    app.run(debug=True)        