import React, { useEffect, useRef, useState } from 'react';
import { TreeRenderer } from './TreeRenderer';
import initialData from './data.json';

const LOCAL_STORAGE_KEY = 'treeData';

const D3Component = () => {
  const d3Container = useRef(null);

  // Load data from local storage, or use initial data if no data is available.
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : initialData;
  });

  // Use useEffect to save data to local storage whenever it changes.
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (d3Container.current) {
      new TreeRenderer(d3Container.current, data, setData);
    }
  }, [data]);

  return (
    <div>
      <h1>idea.io</h1>
      <h3>Click on Text to edit</h3>
      <h3>Click on circles to expand/contract</h3>
      <h3>Click on + sign to add more tasks</h3>
      <h3>Click on x sign to add more tasks</h3>
      <svg ref={d3Container}></svg>
    </div>
  );
};

export default D3Component;
