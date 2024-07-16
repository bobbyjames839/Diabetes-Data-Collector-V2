import { useState, useEffect } from "react";
import '../styles/CarbCounter.css';

export const CarbCounter = ({ carbsEatenNumerical, setCarbsEatenNumerical }) => {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState('');
  const [weight, setWeight] = useState('');
  const [meal, setMeal] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch('/foods');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setFoods(data.foods);
      } catch (error) {
        console.error('Error fetching foods:', error);
      }
    };
    fetchFoods();
  }, []);

  const addToMeal = () => {
    if (selectedFood && weight) {
      setMeal([...meal, { food: selectedFood, weight }]);
      setSelectedFood('');
      setWeight('');
    }
  };

  const calculateCarbs = async () => {
    try {
      const carbsPromises = meal.map(async item => {
        const response = await fetch('/calculate_carbs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ food: item.food, weight: item.weight })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.carbs;
      });

      const carbsValues = await Promise.all(carbsPromises);
      const totalCarbs = carbsValues.reduce((total, carbs) => total + carbs, 0);
      const roundedTotalCarbs = Math.round(totalCarbs);
      setCarbsEatenNumerical(roundedTotalCarbs);
    } catch (error) {
      console.error('Error calculating carbs:', error);
    }
  };

  return (
    <div className='section food_eaten'>
      <h3>What did you eat in the meal?</h3>
      <div className='input_food_data'>
        <div className="input_food_data_inner">
          <label htmlFor="food">Food:</label>
          <select className="food_selector" id="food" value={selectedFood} onChange={e => setSelectedFood(e.target.value)}>
            <option value="" disabled>Select food</option>
            {foods.map(food => (<option key={food} value={food}>{food}</option>))}
          </select>
        </div>
        <div className="input_food_data_inner">
          <label className="weight_selector" htmlFor="weight">Weight (g):</label>
          <input className="weight" id="weight" value={weight} onChange={e => setWeight(e.target.value)} />
        </div>
      </div>

      <div className='food_eaten_buttons'>
        <button onClick={addToMeal}>Add to Meal</button>
        <button onClick={calculateCarbs}>Calculate Carbs</button>
      </div>

      <ul className="food_list">
        {meal.map((item, index) => (
          <li key={index}>{item.food}: {item.weight}g</li>
        ))}
      </ul>
      {carbsEatenNumerical !== null && <p>Total Carbs: {carbsEatenNumerical}g</p>}
    </div>
  );
};
