import './App.css';
import React from 'react';
import Search from './Search/Search';
import DualSlider from './DualSlider/DualSlider';
import Product from './Product/Product';
import { clamp } from './utils'
import all_products from './data';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Checkbox({selected, label, onClick})
{
  return (
    <label>
      <input type="checkbox" defaultChecked={selected} onChange={onClick}/>
      <span>{label}</span>
    </label>
  );
}

class App extends React.Component
{
  constructor(props) {
    super(props);
    this.state = {products : null, search_text : '', 
      last_search_request : '',
      min_price : 0, max_price : 0, 
      start : -Infinity, end : Infinity};
  }

  fetchData() {
    let products = [];
    let available_sizes = new Set();
    let selected_sizes = new Set();
    let categories = new Set();
    let selected_categories = new Set();
    let product_id = 0;
    let search_text = this.state.search_text.toLocaleLowerCase().trim();

    for (let product of all_products) {
      product.product_id = product_id++;
      categories.add(product.category);
    }

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
    }

    available_sizes = [...available_sizes].sort((a, b) => a - b);

    let min_price = Math.min(...all_products.map(x => x.price));
    let max_price = Math.max(...all_products.map(x => x.price));
    let start = clamp(this.state.start, min_price, max_price);
    let end = clamp(this.state.end, min_price, max_price);

    this.timeout_id = setTimeout(() => this.setState({products, selected_sizes, 
      available_sizes, categories, selected_categories, min_price, max_price, 
      start, end, last_search_request : this.state.search_text}), 1500);
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

      // ?????????????????? ???????????? ?????????????????? ???? ????????????????
      let products = this.state.products.filter((x) => {
        for (let s of x.available_size) 
          if (selected.has(s) || selected.size === 0)
            return true;

        return false;
      });

      // ???? ????????????????????
      products = products.filter((x) => {
        return sel_cat.has(x.category) || sel_cat.size === 0;
      });

      // ???? ????????
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

      let product_list_title; 

      if (products.length === 0) {
        product_list_title = '??????, ???????????? ???? ??????????????!';
      }
      else {
        product_list_title = this.state.last_search_request !== '' ? 
        `?????????????????? ???????????? ???? ?????????????? "${this.state.last_search_request}"`
        : '?????????????????? ????????????';

        product_list_title += ` (${products.length} ????.):`
      }

      return (
        <div className='app'>
          <div className='main-part'>
            <div className="wrapper border-bottom">
              <div className="left-part website-logo">
                <h1>Online Shop (Demo)</h1>
              </div>
              <div className="right-part">
                <Search search_text={this.state.search_text} 
                  onSearchTextChange={text=>this.onSearchTextChange(text)}
                  onClick={()=>this.fetchData()}/>
              </div>
            </div>
            <div className="wrapper">
              <div className="left-part">
                <p>
                  ???????????????? ??????:
                </p>
                <DualSlider min_value={min_price} max_value={max_price} start={start} end={end} 
                  onChange={e => this.onPriceRangeChange(e)}/>
                <p>
                  ??????????????????:
                </p>
                <ul className="category-list">
                  {categories}
                </ul>
                <p>
                  ?????????????????? ??????????????:
                </p>
                <ul className="size-list">
                  {av_sizes}
                </ul>
              </div>
              <div className="right-part">
                <p>{product_list_title}</p>
                <ul className="product-list">
                  {products}
                </ul>
              </div>
            </div>
          </div>
          <footer className='footer'>
            <p>
              <a href="https://github.com/a2leexx/online-shop-react">???????????????? ?????? ???? GitHub</a> 
            </p>
            <p>
              ?????? ???????????? ?????????????????????????? React ?????? ???????????????? ?????????????? ???????????????? ????????????-????????????????. ???????????? ???????????????? ???????? ?????????????? ?????????????????????????? ?????? ???????????????????????????????? ??????????. 
            </p>
            <p>
              This is an example of using React to create the main page of an online store. This page was created for demonstration purposes only.
            </p>
          </footer>
        </div>
      );
    } 
    else 
      return <div className='app loading flexbox-centering' >
        <div className="flexbox-centering">
          <p>
            ???????? ????????????????! ?????????????????? ????????????????????
          </p>
          <div>
            <FontAwesomeIcon icon={faSpinner} size="4x" 
              style={{color: '#a8a8a8'}}
              className="fa-pulse"/>
          </div>
        </div>
      </div>
  }
}

export default App;
