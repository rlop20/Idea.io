import React, { useEffect, useRef, useState } from 'react';
import { TreeRenderer } from './TreeRenderer';
import initialData from './data.json';
import './D3Component.css'; // Import CSS file for styling

const LOCAL_STORAGE_KEY = 'treeData';

const D3Component = () => {
  const d3Container = useRef(null);
  const treeRendererRef = useRef(null);

  // Load data from local storage, or use initial data if no data is available.
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : initialData;
  });

  // Use useEffect to save data to local storage whenever it changes.
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Initialize the tree renderer
  useEffect(() => {
    if (d3Container.current) {
      treeRendererRef.current = new TreeRenderer(
        d3Container.current,
        data,
        setData
      );
    }
  }, [data]);

  // Handlers for Add and Delete buttons
  const handleAddNode = () => {
    if (treeRendererRef.current) {
      treeRendererRef.current.addChildNode();
    }
  };

  const handleDeleteNode = () => {
    if (treeRendererRef.current) {
      treeRendererRef.current.deleteNode();
    }
  };

  return (
    <div className="d3-container">
      <h1>idea.io</h1>
      <h3>Click on Text to edit</h3>
      <h3>Click on circles to select</h3>
      <h3>Double Click on circles to expand/contract</h3>

      {/* Centered Buttons */}
      <div className="button-container">
        <button className="center-button" onClick={handleAddNode}>
          Add
        </button>
        <button className="center-button" onClick={handleDeleteNode}>
          Remove
        </button>
      </div>

      <svg ref={d3Container}></svg>
    </div>
  );
};

export default D3Component;
