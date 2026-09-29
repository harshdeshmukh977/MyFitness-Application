import { useEffect, useRef, useState } from "react";
import "./CircularPicker.css";

function CircularPicker({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const wheelRef = useRef(null);

  const values = [];

  for (let i = min; i <= max; i++) {
    values.push(i);
  }

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const changeValue = (newValue) => {
    const safeValue = Math.max(
      min,
      Math.min(max, newValue)
    );

    setDisplayValue(safeValue);
    onChange(safeValue);
  };

  const handleWheel = (event) => {
    event.preventDefault();

    if (event.deltaY > 0) {
      changeValue(displayValue + 1);
    } else {
      changeValue(displayValue - 1);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      changeValue(displayValue + 1);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      changeValue(displayValue - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      changeValue(min);
    }

    if (event.key === "End") {
      event.preventDefault();
      changeValue(max);
    }
  };

  const getItemClass = (item) => {
    const difference = Math.abs(
      item - displayValue
    );

    if (difference === 0) {
      return "picker-item active";
    }

    if (difference === 1) {
      return "picker-item near";
    }

    if (difference === 2) {
      return "picker-item far";
    }

    return "picker-item hidden";
  };

  return (
    <div
      className="circular-picker"
      onWheel={handleWheel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={wheelRef}
    >

      <div className="picker-label">
        {label}
      </div>

      <div className="picker-window">

        <div className="picker-side-gradient top"></div>

        <div className="picker-side-gradient bottom"></div>

        <div className="picker-highlight">

          <div className="picker-highlight-left"></div>

          <div className="picker-highlight-value">

            {displayValue}

          </div>

          <div className="picker-highlight-unit">

            {unit}

          </div>

          <div className="picker-highlight-right"></div>

        </div>

        <div className="picker-values">

          {values.map((item) => {

            const difference =
              item - displayValue;

            if (Math.abs(difference) > 3) {
              return null;
            }

            return (
              <button
                type="button"
                key={item}
                className={getItemClass(item)}
                onClick={() =>
                  changeValue(item)
                }
              >

                <span>
                  {item}
                </span>

                {item === displayValue && (
                  <small>
                    {unit}
                  </small>
                )}

              </button>
            );
          })}

        </div>

        <div className="picker-center-line"></div>

      </div>

      <div className="picker-hint">

        <span>↑</span>

        SCROLL TO ADJUST

        <span>↓</span>

      </div>

    </div>
  );
}

export default CircularPicker;