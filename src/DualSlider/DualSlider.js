import './DualSlider.css';
import { clamp } from '../utils';

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

export default DualSlider;