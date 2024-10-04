import React, { useEffect, useRef, useState } from 'react';
import { TreeRenderer } from './TreeRenderer';
import initialData from './data.json';
import './D3Component.css'; // Import CSS file for styling

const LOCAL_STORAGE_KEY = 'treeData';

const D3Component = () => {
  const d3Container = useRef(null);
  const treeRendererRef = useRef(null);

  // State to manage multiple projects with their corresponding data
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedProjects ? JSON.parse(savedProjects) : { project1: initialData, project2: initialData };
  });

  // State to manage selected project and its data
  const [selectedProject, setSelectedProject] = useState(Object.keys(projects)[0]);
  const [projectData, setProjectData] = useState(projects[selectedProject]);

  // Save all projects to localStorage whenever any project data changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  // Initialize or update the tree whenever the selected project's data changes
  useEffect(() => {
    if (d3Container.current) {
      treeRendererRef.current = new TreeRenderer(
        d3Container.current,
        projectData,
        setProjectData
      );
    }
  }, [projectData]);

  // Handle project selection change
  const handleProjectChange = (event) => {
    const newProject = event.target.value;
    setSelectedProject(newProject);
    setProjectData(projects[newProject]);
  };

  // Handle adding a new project
  const handleAddProject = () => {
    // Find the next available project number
    const projectNumbers = Object.keys(projects)
      .filter((key) => key.startsWith('project'))
      .map((key) => parseInt(key.replace('project', ''), 10))
      .sort((a, b) => a - b);

    let newProjectNumber = 1;
    for (let i = 0; i < projectNumbers.length; i++) {
      if (projectNumbers[i] !== newProjectNumber) {
        break;
      }
      newProjectNumber++;
    }

    const newProjectName = `project${newProjectNumber}`;
    const newProjects = {
      ...projects,
      [newProjectName]: initialData, // Start with initialData for a new project
    };
    setProjects(newProjects);
    setSelectedProject(newProjectName);
    setProjectData(initialData);
  };

  // Handle deleting the current project
  const handleDeleteProject = () => {
    if (Object.keys(projects).length <= 1) {
      alert("You cannot delete the last remaining project.");
      return;
    }

    const { [selectedProject]: _, ...remainingProjects } = projects; // Remove the selected project
    const newSelectedProject = Object.keys(remainingProjects)[0]; // Select a new project

    setProjects(remainingProjects);
    setSelectedProject(newSelectedProject);
    setProjectData(remainingProjects[newSelectedProject]);
  };

  // Handle renaming the current project
  const handleRenameProject = () => {
    const newName = prompt("Enter the new name for the project:", selectedProject);
    if (newName && newName.trim() !== '' && !projects[newName]) {
      const updatedProjects = { ...projects };
      updatedProjects[newName] = updatedProjects[selectedProject];
      delete updatedProjects[selectedProject];
      
      setProjects(updatedProjects);
      setSelectedProject(newName);
      setProjectData(updatedProjects[newName]);
    } else if (projects[newName]) {
      alert("A project with this name already exists. Please choose a different name.");
    }
  };

  // Update the selected project's data whenever projectData changes
  useEffect(() => {
    setProjects((prevProjects) => ({
      ...prevProjects,
      [selectedProject]: projectData,
    }));
  }, [projectData, selectedProject]);

  return (
    <div className="d3-container">
      <h1>idea.io</h1>
      
      {/* Dropdown for selecting a project */}
      <div className="dropdown-container">
        <label htmlFor="project-select">Select Project: </label>
        <select 
          id="project-select" 
          value={selectedProject} 
          onChange={handleProjectChange}
          className="select-dropdown"
        >
          {Object.keys(projects)
            .filter(
              (projectKey) =>
                projectKey !== 'children' && // Explicitly exclude 'children'
                typeof projects[projectKey] === 'object' && 
                projects[projectKey] !== null
            )
            .map((projectKey) => (
              <option key={projectKey} value={projectKey}>
                {projectKey}
              </option>
            ))}
        </select>
        <button onClick={handleAddProject} className="add-project-button">
          Add Project
        </button>
        <button onClick={handleDeleteProject} className="delete-project-button">
          Delete Project
        </button>
        <button onClick={handleRenameProject} className="rename-project-button">
          Rename Project
        </button>
      </div>

      <h3>Click on Text to edit</h3>
      <h3>Click on circles to expand/contract</h3>

      {/* Centered Buttons */}
      <div className="button-container">
        <button className="center-button" onClick={() => treeRendererRef.current && treeRendererRef.current.addChildNode()}>
          Add Node
        </button>
        <button className="center-button" onClick={() => treeRendererRef.current && treeRendererRef.current.deleteNode()}>
          Remove Node
        </button>
      </div>

      <svg ref={d3Container}></svg>
    </div>
  );
};

export default D3Component;
