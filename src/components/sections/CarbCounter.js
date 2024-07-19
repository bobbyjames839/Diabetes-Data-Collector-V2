import React, { useState } from 'react';
import axios from 'axios';
import { TailSpin } from 'react-loader-spinner';

export const CarbCounter = ({ setCarbsEatenNumerical }) => {
  const [productName, setProductName] = useState('');
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [consumedFoods, setConsumedFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCarbs, setTotalCarbs] = useState(0); 
  const [page, setPage] = useState(1);

  const searchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
        params: {
          search_terms: productName,
          search_simple: 1,
          json: 1,
          page_size: 5, // Fetch only 5 products per page
          page
        }
      });

      const productsData = response.data.products.map(product => {
        const name = product.product_name || 'N/A';
        const brands = product.brands || '';
        const fullProductName = `${name}${brands ? ` - ${brands}` : ''}`;
        const barcode = product.code || 'N/A';
        return { fullProductName, barcode };
      });

      setProducts(prevProducts => [...prevProducts, ...productsData]);
      setDisplayedProducts(prevDisplayedProducts => [...prevDisplayedProducts, ...productsData]);
      setPage(prevPage => prevPage + 1); // Increase page number for the next fetch
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
        params: {
          fields: 'product_name,carbohydrates_100g'
        }
      });

      const product = response.data.product;
      return {
        name: product.product_name,
        carbohydrates: product.carbohydrates_100g
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
      const weight = prompt(`Enter the weight (in grams) of ${product.name} eaten:`);
      if (weight && !isNaN(weight)) {
        const carbs = (product.carbohydrates * weight) / 100;
        setConsumedFoods([...consumedFoods, { name: product.name, weight, carbs }]);
      }
    }
  };

  const loadMoreProducts = () => {
    searchProducts();
  };

  const calculateTotalCarbs = () => {
    const total = consumedFoods.reduce((acc, food) => acc + food.carbs, 0);
    setCarbsEatenNumerical(total); 
    setTotalCarbs(total); 
  };

  return (
    <div>
      <header className="App-header">
        <h1>Open Food Facts Product Search</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
          />
          <button type="submit">Search</button>
        </form>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <TailSpin color="#00BFFF" height={80} width={80} />
          </div>
        )}
        {error && <p>{error}</p>}
        {!loading && (
          <div>
            {displayedProducts.length > 0 && (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <ul>
                  {displayedProducts.map((product, index) => (
                    <li key={index}>
                      <span>{product.fullProductName}</span>
                      <button onClick={() => handleProductClick(product.barcode)}>Select Product</button>
                      <button onClick={() => window.open(`https://world.openfoodfacts.org/product/${product.barcode}`, '_blank')}>
                        View Product
                      </button>
                    </li>
                  ))}
                </ul>
                {products.length < 50 && (
                  <button onClick={loadMoreProducts}>Load More</button>
                )}
              </div>
            )}
            {consumedFoods.length > 0 && (
              <div>
                <h2>Consumed Foods</h2>
                <ul>
                  {consumedFoods.map((food, index) => (
                    <li key={index}>
                      <span>{food.name} - Weight: {food.weight}g - Carbs: {food.carbs}g</span>
                    </li>
                  ))}
                </ul>
                <button onClick={calculateTotalCarbs}>Calculate Total Carbs</button>
                <p>Total Carbs: {totalCarbs}g</p>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
};
