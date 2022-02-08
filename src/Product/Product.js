import './Product.css';
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Product({product : {product_name, brand, price}})
{
  return (
    <div className="product">
      <div className="photo-background">
        <FontAwesomeIcon icon={faCamera} style={{color: 'white'}} size="4x"/>
      </div>
      <p className="product-name">{product_name}</p>
      <p className="product-brand">{brand}</p>
      <p className="product-price">Цена:</p>
      <p className="product-price-value">{price}</p>
    </div>
  );
}

export default Product;