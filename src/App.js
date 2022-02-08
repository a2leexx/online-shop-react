import './App.css';
import './DualSlider.css';
import './Search.css';
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

function Search({search_text, onSearchTextChange, onClick})
{
  const handle_key_down = (e) => {
    if (e.key === 'Enter')
      onClick();
  };

  return (
    <div>
      <label className="search">
        <input type="search" value={search_text}
          onChange={(e)=>{onSearchTextChange(e.target.value)}}
          onKeyDown={handle_key_down}
          placeholder="Наименование товара"/>
      </label>
      <button className="search" onClick={onClick}>Поиск</button>
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

  let range = max_value - min_value;

  let start_label_offset = (start - min_value) / range * 180 - 5;
  let end_label_offset = (end - start) / range * 180 - 50;
  let range_width = (end - start) / range * 180;

  start_label_offset = Math.max(start_label_offset, 0);
  end_label_offset = Math.max(end_label_offset, 0);

  let start_style = {margin: `0 0 0 ${start_label_offset}px`};
  let end_style = {margin: `0 0 0 ${end_label_offset}px`};
  let range_style = {margin: `0 0 0 0${start_label_offset}px`,
    width: `${range_width}px`}

  return (
    <div className='price-slider'>
      <input type="range" min={min_value} max={max_value} value={start}
        onChange={start_handler} className='price-slider-start'/>
      <input type="range" min={min_value} max={max_value} value={end}
        onChange={end_handler} className='price-slider-end'/>
      <span className='price-range' style={range_style}></span>
      <span className='price-slider-background'></span>
      <div>
        <span className='price-slider-start' style={start_style}>{start}</span>
        <span className='price-slider-end' style={end_style}>{end}</span>
      </div>
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

      return (
      <div className='app'>
        <div className="wrapper border-bottom">
          <div className="left-part website-logo">
            <h1>Online Shop (Demo)</h1>
          </div>
          <div className="right-part">
            <Search onSearchTextChange={text=>this.onSearchTextChange(text)}
              onClick={()=>this.fetchData()}/>
          </div>
        </div>
        <div className="wrapper">
          <div className="left-part">
            <p>
              Диапазон цен:
            </p>
            <DualSlider min_value={min_price} max_value={max_price} start={start} end={end} 
              onChange={e => this.onPriceRangeChange(e)}/>
            <p>
              Категории:
            </p>
            <ul className="category-list">
              {categories}
            </ul>
            <p>
              Доступные размеры:
            </p>
            <ul className="size-list">
              {av_sizes}
            </ul>
          </div>
          <div className="right-part">
            <p>Найденные товары:</p>
            <ul>
              {products}
            </ul>
          </div>
        </div>
        <footer>
          <p>
            Это пример использования React для создания главной страницы онлайн-магазина. Данная страница была создана исключительно для демонстрационных целей. 
          </p>
          <p>
            This is an example of using React to create the main page of an online store. This page was created for demonstration purposes only.
          </p>
        </footer>
      </div>);
    } 
    else 
      return <div className='app' >Идет загрузка! Подождите пожалуйста</div>
  }
}

export default App;
