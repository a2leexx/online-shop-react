import './App.css';
import React from 'react';

function Checkbox({selected, label, onClick})
{
  return (
    <label>
      <input type="checkbox" defaultChecked={selected} onChange={onClick}/>
      <span>{label}</span>
    </label>
  );
}

function Product({product : {product_name, brand, price}})
{
  return (
    <div>
      <p>{product_name}</p>
      <p>{brand}</p>
      <p>Цена: {price}</p>
    </div>
  );
}

function clamp(value, min_v, max_v)
{
  return Math.max(min_v, Math.min(value, max_v));
}

function DualSlider({min_value, max_value, start, end, onChange})
{
  const start_handler = (e) => {
    let value = Number(e.target.value);
    let new_start = Math.min(value, end);
    let new_end = Math.max(value, end);

    onChange({start : new_start, end : new_end});
  };

  const end_handler = (e) => {
    let value = Number(e.target.value);
    let new_start = Math.min(value, start);
    let new_end = Math.max(value, start);

    onChange({start : new_start, end : new_end});
  };

  start = clamp(start, min_value, max_value);
  end = clamp(end, min_value, max_value);

  return (
    <div>
      <label>
        <input type="range" min={min_value} max={max_value} value={start} 
          onChange={start_handler}/>
        {start}
      </label>
      <label>
        <input type="range" min={min_value} max={max_value} value={end}
          onChange={end_handler}/>
        {end}
      </label>
    </div>
  );
}

class App extends React.Component
{
  constructor(props) {
    super(props);
    this.state = {products : null, search_text : '', 
      min_price : 0, max_price : 0, 
      start : -Infinity, end : Infinity};
  }

  fetchData() {
    let all_products = [
      { product_name : 'Кроссовки 1', available_size : [39, 40, 41, 42, 43], price : 4000,
        brand : 'Adidas', category: 'Кроссовки' },
      { product_name : 'Кроссовки 2', available_size : [40, 41, 43, 45, 46], price : 4500,
        brand : 'Reebok', category: 'Кроссовки' }
    ];
    let products = [];
    let available_sizes = new Set();
    let selected_sizes = new Set();
    let categories = new Set();
    let selected_categories = new Set();
    let product_id = 0;
    let search_text = this.state.search_text.toLocaleLowerCase().trim();

    for (let product of all_products)
      product.product_id = product_id++;

    products = all_products.filter((product) => {
      let product_name = product.product_name.toLocaleLowerCase();
      let category = product.category.toLocaleLowerCase();
      let brand = product.brand.toLocaleLowerCase();

      return product_name.indexOf(search_text) !== -1 || 
          category.indexOf(search_text) !== -1 || 
          brand.indexOf(search_text) !== -1;
    });

    for (let product of products) {
      for (let s of product.available_size)
        available_sizes.add(s);
      categories.add(product.category);
    }

    let min_price = Math.min(...products.map(x => x.price));
    let max_price = Math.max(...products.map(x => x.price));
    let start = clamp(this.state.start, min_price, max_price);
    let end = clamp(this.state.end, min_price, max_price);

    this.timeout_id = setTimeout(() => this.setState({products, selected_sizes, 
      available_sizes, categories, selected_categories, min_price, max_price, 
      start, end}), 1000);
    this.setState({products : null});
  }

  onPriceRangeChange({start, end}) {
    this.setState({start, end});
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout_id);
  }

  onToogleButtonClick(x, property)
  {
    if (this.state.products === null)
      return;

    let selected_sizes = new Set(this.state[property]);

    if (selected_sizes.has(x))
      selected_sizes.delete(x);
    else {
      console.log(x);
      selected_sizes.add(x);
    }

    this.setState({[property] : selected_sizes});
  }

  onSearchTextChange(x)
  {
    this.setState({search_text : x});
  }

  render() {
    if (this.state.products !== null) {
      let selected = this.state.selected_sizes;
      let sel_cat = this.state.selected_categories;
      let av_sizes = [...this.state.available_sizes].map((x) => 
        <li key={x}>
          <Checkbox label={x} selected={selected.has(x)}
            onClick={()=>{this.onToogleButtonClick(x, 'selected_sizes')}}/>
        </li>
      );
      let categories = [...this.state.categories].map((x) => 
        <li key={x}>
          <Checkbox label={x} selected={sel_cat.has(x)}
            onClick={()=>{this.onToogleButtonClick(x, 'selected_categories')}}/>
        </li>
      );

      // фильтруем список продуктов по размерам
      let products = this.state.products.filter((x) => {
        for (let s of x.available_size) 
          if (selected.has(s) || selected.size === 0)
            return true;

        return false;
      });

      // по категориям
      products = products.filter((x) => {
        return sel_cat.has(x.category) || sel_cat.size === 0;
      });

      // по цене
      let min_price = this.state.min_price;
      let max_price = this.state.max_price;
      let start = this.state.start;
      let end = this.state.end;

      products = products.filter((x) => {
        return start <= x.price && x.price <= end;
      })

      products = products.map((x) => 
        <li key={x.product_id}><Product product={x}/></li>
      );

      if (products.length === 0) {
        products.push(<li key="-1">Увы, ничего не найдено!</li>)
      }

      return (<div>
        <div>
          <label>
            Введите наименование товара:
            <input type="search" value={this.state.search_text}
              onChange={(e)=>{this.onSearchTextChange(e.target.value)}}/>
          </label>
          <button onClick={()=>{this.fetchData()}}>Поиск</button>
        </div>
          <p>
            Диапазон цен:
          </p>
          <DualSlider min_value={min_price} max_value={max_price} start={start} end={end} 
            onChange={e => this.onPriceRangeChange(e)}/>
        <div>
          <ul className="category-list">
            {categories}
          </ul>
          <p>Доступные размеры:</p>
          <ul className="size-list">
            {av_sizes}
          </ul>
        </div>
        <div>
          <p>Найденные товары:</p>
          <ul>
            {products}
          </ul>
        </div>
      </div>);
    } 
    else 
      return <div>Идет загрузка! Подождите пожалуйста</div>
  }
}

export default App;
