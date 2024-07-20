import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/CarbCounter.css';

export const CarbCounter = ({ setCarbsEatenNumerical }) => {
  const [productName, setProductName] = useState('');
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [consumedFoods, setConsumedFoods] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCarbs, setTotalCarbs] = useState(null);
  const [page, setPage] = useState(1);

  const isMounted = useRef(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (!isMounted.current) {
      try {
        const savedFavorites = localStorage.getItem('favorites');
        console.log('Loaded favorites from localStorage:', savedFavorites);
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
      isMounted.current = true;
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      console.log('Saving favorites to localStorage:', favorites);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, [favorites]);

  const searchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
        params: { search_terms: productName, search_simple: 1, json: 1, page_size: 5, page }
      });

      const productsData = response.data.products.map(product => {
        const name = product.product_name || 'N/A';
        const brands = product.brands || '';
        const fullProductName = `${name}${brands ? ` - ${brands}` : ''}`;
        const barcode = product.code || 'N/A';
        return { fullProductName, barcode };
      });

      setProducts(productsData);
      setDisplayedProducts(productsData);
      setPage(prevPage => prevPage + 1);
    } catch (error) {
      setError('Error fetching products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (barcode) => {
    try {
      const response = await axios.get(`https://world.openfoodfacts.net/api/v2/product/${barcode}`, {
        params: { fields: 'product_name,brands,carbohydrates_100g,code' }
      });

      const product = response.data.product;
      const name = product.product_name || 'N/A';
      const brands = product.brands || '';
      const fullProductName = `${name}${brands ? ` - ${brands}` : ''}`;

      return {
        fullProductName,
        name: product.product_name,
        carbohydrates: product.carbohydrates_100g,
        barcode: product.code
      };
    } catch (error) {
      setError('Error fetching product details');
      console.error('Error fetching product details:', error);
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setProducts([]);
    setDisplayedProducts([]);
    setPage(1);
    searchProducts();
  };

  const handleProductClick = async (barcode) => {
    const product = await fetchProductDetails(barcode);
    if (product) {
      const weight = prompt(`Enter the weight of ${product.name} eaten:`);
      if (weight && !isNaN(weight)) {
        const carbs = (product.carbohydrates * weight) / 100;
        setConsumedFoods([...consumedFoods, { fullProductName: product.fullProductName, weight: Math.round(weight * 10) / 10, carbs: Math.round(carbs * 10) / 10 }]);
      }
    }
  };

  const handleDeleteFood = (index) => {
    setConsumedFoods(consumedFoods.filter((_, i) => i !== index));
  };

  const handleAddToFavorites = async (barcode) => {
    const product = await fetchProductDetails(barcode);
    if (product) {
      const customName = prompt(`Enter a custom name for ${product.fullProductName}:`);
      if (customName) {
        const newFavorites = [...favorites, { ...product, customName }];
        setFavorites(newFavorites);
        console.log('Added to favorites:', newFavorites);
      }
    }
  };

  const handleDeleteFavorite = (index) => {
    const newFavorites = favorites.filter((_, i) => i !== index);
    setFavorites(newFavorites);
    console.log('Deleted from favorites:', newFavorites);
  };

  const handleAddFavoriteToMeal = async (favorite) => {
    const weight = prompt(`Enter the weight of ${favorite.customName} eaten:`);
    if (weight && !isNaN(weight)) {
      const carbs = (favorite.carbohydrates * weight) / 100;
      setConsumedFoods([...consumedFoods, { fullProductName: favorite.customName, weight: Math.round(weight * 10) / 10, carbs: Math.round(carbs * 10) / 10 }]);
    }
  };

  const loadMoreProducts = () => {
    searchProducts();
  };

  const calculateTotalCarbs = () => {
    const total = consumedFoods.reduce((acc, food) => acc + food.carbs, 0);
    const roundedTotal = Math.round(total * 10) / 10;
    setCarbsEatenNumerical(roundedTotal);
    setTotalCarbs(roundedTotal);
  };

  return (
    <div className='carb_counter'>

      <div className='carb_counter_header'>
        <h4 className='carb_counter_title'>Calculate your carbs</h4>
        <button className='show_favourites_button' onClick={() => setShowFavorites(!showFavorites)}>
          {showFavorites ? 'Hide Favorites' : 'Show Favorites'}
        </button>
      </div>

      {showFavorites ? (
        <div className='food_list_and_consumed'>
          <h3 className='favorites_title'>Favorites</h3>
          <ul className='food_list'>
            {favorites.map((favorite, index) => (
              <li className='food_item' key={index}>
                <span className='food_list_name'>{favorite.customName}</span>
                <div className='food_buttons'>
                  <button className='food_item_button' onClick={() => handleAddFavoriteToMeal(favorite)}>Add</button>
                  <button className='food_item_button' onClick={() => window.open(`https://world.openfoodfacts.org/product/${favorite.barcode}`, '_blank')}>
                    View
                  </button>
                  <button className='delete_favourite' onClick={() => handleDeleteFavorite(index)}>X</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <form className='carb_counter_searcher' onSubmit={handleSubmit}>
            <input className='carb_counter_searcher_input' type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Enter product name" />
            <button className='search_carbs_button' type="submit">Search</button>
          </form>

          {loading && (
            <div className="loader">
              <div className="line"></div>
            </div>
          )}

          {error && <p className='carbs_error'>{error}</p>}

          <div className='food_list_and_consumed'>
            {displayedProducts.length > 0 && (
              <>
                <ul className='food_list'>
                  {displayedProducts.map((product, index) => (
                    <li className='food_item' key={index}>
                      <span className='food_list_name'>{product.fullProductName}</span>
                      <div className='food_buttons'>
                        <button className='food_item_button' onClick={() => handleAddToFavorites(product.barcode)}>+</button>
                        <button className='food_item_button' onClick={() => handleProductClick(product.barcode)}>Add</button>
                        <button className='food_item_button' onClick={() => window.open(`https://world.openfoodfacts.org/product/${product.barcode}`, '_blank')}>
                          View
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {products.length < 50 && (
                  <button className='load_more_foods' onClick={loadMoreProducts}>Load More</button>
                )}
              </>
            )}
          </div>
        </>
      )}

      <div className='food_list_and_consumed'>
        {consumedFoods.length > 0 && (
          <>
            <h3 className='my_meal_title'>My Meal</h3>
            <ul className='my_meal_list'>
              {consumedFoods.map((food, index) => (
                <li className='my_meal_item' key={index}>
                  <p className='food_meal_name'>{food.fullProductName}</p>
                  <div className='my_meal_item_right'>
                    <p className='my_meal_metric'>W: {food.weight.toFixed(1)}</p>
                    <p className='my_meal_metric'>C: {food.carbs.toFixed(1)}</p>
                    <button className='delete_food_item' onClick={() => handleDeleteFood(index)}>X</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className='calculate_total_carbs'>
              <button className='calculate_total_carbs_button' onClick={calculateTotalCarbs}>Calculate Total Carbs</button>
              {totalCarbs !== null && <p className='total_carbs'>Total Carbs: {totalCarbs.toFixed(1)}g</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
