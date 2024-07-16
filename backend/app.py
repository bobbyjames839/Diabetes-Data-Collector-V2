from flask import Flask, request, jsonify
import pandas as pd
import logging

app = Flask(__name__)

# Load food database
food_df = pd.read_csv("food_database.csv")



@app.route('/foods', methods=['GET'])
def get_foods():
    foods = food_df["Food"].tolist()
    return jsonify({'foods': foods})

@app.route('/calculate_carbs', methods=['POST'])
def calculate_carbs():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")
        
        food = data.get('food')
        weight = data.get('weight')
        if not food or not weight:
            logging.error("Invalid input: Missing food or weight")
            return jsonify({'error': 'Invalid input'}), 400

        try:
            weight = float(weight)
        except ValueError:
            logging.error("Invalid input: Weight must be a number")
            return jsonify({'error': 'Weight must be a number'}), 400

        if food not in food_df["Food"].values:
            logging.error("Food not found")
            return jsonify({'error': 'Food not found'}), 404

        carbs_per_100g = food_df.loc[food_df["Food"] == food, "Carbs_per_100g"].values[0]
        carbs = (carbs_per_100g / 100) * weight
        logging.debug(f"Calculated carbs: {carbs}")
        
        return jsonify({'carbs': carbs})
    except Exception as e:
        logging.error(f"Error calculating carbs: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
