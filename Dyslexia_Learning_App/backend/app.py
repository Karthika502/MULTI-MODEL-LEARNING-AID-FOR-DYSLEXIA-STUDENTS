from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import random

app = Flask(__name__)
CORS(app)

# Load CSV
df = pd.read_csv('phoneticDictionary.csv')
df.columns = [col.strip() for col in df.columns]  # remove spaces


@app.route("/api/word")
def get_word():
    word_data = df.sample(1).iloc[0]
    return jsonify({
        "word": word_data['word'],          # lowercase 'word'
        "phonemes": word_data['phon']       # lowercase 'phon'
    })


if __name__ == "__main__":
    app.run(debug=True)
