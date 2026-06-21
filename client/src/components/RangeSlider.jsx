import { useEffect, useState, useRef } from "react";

const RangeSlider = ({
  min = 1900,
  max = new Date().getFullYear(),
  value = [min, max],
  onChange,
}) => {
  const [minVal, setMinVal] = useState(value[0] ?? min);
  const [maxVal, setMaxVal] = useState(value[1] ?? max);
  const minRef = useRef(null);
  const maxRef = useRef(null);

  useEffect(() => {
    if (Array.isArray(value)) {
      setMinVal(value[0]);
      setMaxVal(value[1]);
    }
  }, [value]);

  useEffect(() => {
    if (onChange) onChange([minVal, maxVal]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minVal, maxVal]);

  const handleMin = (e) => {
    const val = Math.min(Number(e.target.value), maxVal - 1);
    setMinVal(val);
  };

  const handleMax = (e) => {
    const val = Math.max(Number(e.target.value), minVal + 1);
    setMaxVal(val);
  };

  const percent = (v) => Math.round(((v - min) / (max - min)) * 100);

  return (
    <div className="w-full">
      <div className="relative h-10">
        <div className="absolute left-0 right-0 top-4 h-1 bg-gray-200 rounded-full dark:bg-gray-700" />
        <div
          className="absolute top-4 h-1 bg-linear-to-r from-purple-500 to-indigo-500 rounded-full"
          style={{
            left: `${percent(minVal)}%`,
            right: `${100 - percent(maxVal)}%`,
          }}
        />

        <input
          ref={minRef}
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMin}
          className="w-full appearance-none pointer-events-auto absolute top-0 left-0 right-0 h-10 bg-transparent"
        />

        <input
          ref={maxRef}
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMax}
          className="w-full appearance-none pointer-events-auto absolute top-0 left-0 right-0 h-10 bg-transparent"
        />

        {/* Thumbs */}
        <div
          className="absolute top-0 transform -translate-y-1/2"
          style={{ left: `calc(${percent(minVal)}% - 12px)`, top: "1.25rem" }}
        >
          <div className="w-6 h-6 rounded-full bg-white border shadow-sm" />
        </div>

        <div
          className="absolute top-0 transform -translate-y-1/2"
          style={{ left: `calc(${percent(maxVal)}% - 12px)`, top: "1.25rem" }}
        >
          <div className="w-6 h-6 rounded-full bg-white border shadow-sm" />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mt-2 text-gray-600 dark:text-gray-300">
        <div>От {minVal}</div>
        <div>До {maxVal}</div>
      </div>
    </div>
  );
};

export default RangeSlider;
