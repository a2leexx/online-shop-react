import './Search.css';

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
          placeholder="Искать"/>
      </label>
      <button className="search" onClick={onClick}>Поиск</button>
    </div>
  );
}

export default Search;