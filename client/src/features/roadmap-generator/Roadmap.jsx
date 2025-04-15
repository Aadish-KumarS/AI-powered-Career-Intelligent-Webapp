import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/Roadmap genarator/Roadmap.css';
import { CustomEdge, CustomNode } from './CustomReactFlowComponents';
import gsap from 'gsap';
import Navbar from '../../components/LandingPageComponents/Navbar'

const RoadmapGenerator = () => {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeMap, setNodeMap] = useState({});
  const [viewMode, setViewMode] = useState('default');
  const [selectedPath, setSelectedPath] = useState(null);
  const [activeTab, setActiveTab] = useState('saved'); // Default tab is 'saved'
  
  // References for GSAP animations
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const tabsRef = useRef(null);
  
  const reactFlowInstance = useRef(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
  
  // Increase padding for better view of all nodes
  const fitViewOptions = useMemo(() => ({ padding: 0.5 }), []);

  // Initialize GSAP animations
  useEffect(() => {
    if (headerRef.current && contentRef.current && tabsRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      
      gsap.fromTo(
        tabsRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );
      
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: "power3.out" }
      );
    }
  }, []);

  // Animate tab changes
  useEffect(() => {
    if (contentRef.current) {
      // Fade out and in when tab changes
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeTab]);

  const handleInputChange = (e) => {
    setGoal(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!goal.trim()) {
      setError("Please enter a learning goal");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);
    
    try {
      const response = await fetch(`http://localhost:8000/generate-roadmap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ goal })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
      const data = await response.json();
      
      setRoadmapData(data);
      
      const newNodeMap = {};
      data.nodes.forEach(node => {
        newNodeMap[node.id] = node;
      });
      setNodeMap(newNodeMap);
      
      processRoadmapData(data);
      
      // Switch to generated tab automatically
      setActiveTab('generated');
      
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      setError("Failed to generate roadmap. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRoadmap = () => {
    if (!roadmapData) return;
    
    try {
      const recentRoadmaps = JSON.parse(localStorage.getItem('recents')) || [];
      recentRoadmaps.unshift(roadmapData);

      const limitedRecents = recentRoadmaps.slice(0, 6);
      localStorage.setItem('recents', JSON.stringify(limitedRecents));

      const maxRoadmaps = 6;
      const existingRoadmaps = JSON.parse(localStorage.getItem('savedRoadmaps')) || [];

      if (existingRoadmaps.length >= maxRoadmaps) {
        setError("You can only save up to 6 roadmaps. Please delete one to save a new one.");
        return;
      }

      // Proceed with saving
      const newRoadmap = {
        title: roadmapData.title,
        description: roadmapData.description,
        nodes: roadmapData.nodes,
        edges: roadmapData.edges,
        timestamp: new Date().toISOString()
      };

      existingRoadmaps.unshift(newRoadmap);
      localStorage.setItem('savedRoadmaps', JSON.stringify(existingRoadmaps));

      setSaveSuccess(true);
      
      // Animate save success notification
      const saveNotification = document.querySelector('.save-roadmap-btn');
      if (saveNotification) {
        gsap.fromTo(
          saveNotification,
          { backgroundColor: '#4CAF50', color: '#ffffff' },
          { 
            backgroundColor: '#2E7D32', 
            color: '#ffffff',
            duration: 0.5,
            yoyo: true,
            repeat: 1
          }
        );
      }
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to save roadmap:", err);
      setError("Failed to save roadmap. Please try again.");
    }
  };

  const categoryColors = {
    core: 'linear-gradient(135deg, #00f260, #0575e6)',           // Green to blue
    optional: 'linear-gradient(135deg, #f7971e, #ffd200)',       // Orange to gold
    advanced: 'linear-gradient(135deg, #8e2de2, #4a00e0)',       // Purple shades
    beginner: 'linear-gradient(135deg, #56ccf2, #2f80ed)',       // Light to dark blue
    intermediate: 'linear-gradient(135deg, #fddb92, #d1fdff)',   // Warm beige to soft blue
    expert: 'linear-gradient(135deg, #f85032, #e73827)',         // Orange-red to deep red
    default: '#2c3e50  '       // Light to dark gray
  };  
  

  const processRoadmapData = useCallback((data) => {
    if (!data?.nodes || !data?.edges) return;
    
    // Create a directed graph structure
    const graph = {
      children: {}, // child nodes for each node
      parents: {},  // parent nodes for each node
      nodesById: {}, // nodes by their id
      orphanNodes: [] // nodes without parents or children
    };
    
    // Initialize the graph
    data.nodes.forEach(node => {
      graph.children[node.id] = [];
      graph.parents[node.id] = [];
      graph.nodesById[node.id] = node;
    });
    
    // Fill the graph with edges
    data.edges.forEach(edge => {
      if (graph.children[edge.source]) {
        graph.children[edge.source].push(edge.target);
      }
      if (graph.parents[edge.target]) {
        graph.parents[edge.target].push(edge.source);
      }
    });
    
    // Find orphan nodes (nodes without connections)
    data.nodes.forEach(node => {
      if (graph.children[node.id].length === 0 && graph.parents[node.id].length === 0) {
        graph.orphanNodes.push(node.id);
      }
    });
    
    // Find root nodes (nodes with no parents but with children)
    const rootNodes = data.nodes
      .filter(node => graph.parents[node.id].length === 0 && graph.children[node.id].length > 0)
      .map(node => node.id);
    
    // If there are no root nodes but there are orphan nodes, treat the first orphan as a root
    if (rootNodes.length === 0 && graph.orphanNodes.length > 0) {
      rootNodes.push(graph.orphanNodes[0]);
      graph.orphanNodes.shift();
    }
    
    // If still no root nodes, take the first node as root
    if (rootNodes.length === 0 && data.nodes.length > 0) {
      rootNodes.push(data.nodes[0].id);
    }
    
    // Determine the maximum depth of each node using BFS
    const depths = {};
    const visited = new Set();
    
    // For each root node, perform BFS to assign depths
    rootNodes.forEach(rootId => {
      const queue = [{ id: rootId, depth: 0 }];
      visited.add(rootId);
      depths[rootId] = 0;
      
      while (queue.length > 0) {
        const { id, depth } = queue.shift();
        
        // Process children
        for (const childId of graph.children[id]) {
          const currentDepth = depths[childId] || 0;
          const newDepth = depth + 1;
          
          // Update depth to maximum of current or new
          depths[childId] = Math.max(currentDepth, newDepth);
          
          if (!visited.has(childId)) {
            visited.add(childId);
            queue.push({ id: childId, depth: newDepth });
          }
        }
      }
    });
    
    // Connect orphan nodes to the nearest root or to the first node
    if (graph.orphanNodes.length > 0) {
      const mainRootId = rootNodes[0];
      
      graph.orphanNodes.forEach((orphanId) => {
        // Add depth for the orphan nodes (place them to the right side)
        depths[orphanId] = 1; // Place all orphans at depth 1
        
        // Create a connection from the main root to this orphan
        data.edges.push({
          source: mainRootId,
          target: orphanId,
          type: 'optional'
        });
        
        // Update the graph structure
        graph.children[mainRootId].push(orphanId);
        graph.parents[orphanId].push(mainRootId);
      });
    }
    
    // Handle nodes that don't have a depth assigned (they're unreachable from roots)
    data.nodes.forEach(node => {
      if (depths[node.id] === undefined) {
        depths[node.id] = 1; // Place at depth 1 by default
      }
    });
    
    // Group nodes by depth level
    const nodesByLevel = {};
    Object.entries(depths).forEach(([nodeId, level]) => {
      if (!nodesByLevel[level]) nodesByLevel[level] = [];
      nodesByLevel[level].push(nodeId);
    });
    
    // Calculate horizontal positions for each node at each level
    const positions = {};
    const horizontalSpacing = 400; // Increased spacing between horizontal nodes
    const verticalSpacing = 250;   // Increased spacing between vertical levels
    
    // For each level, position nodes horizontally with even spacing
    Object.entries(nodesByLevel).forEach(([level, nodeIds]) => {
      const nodesAtLevel = nodeIds.length;
      const levelWidth = nodesAtLevel * horizontalSpacing;
      const startX = -levelWidth / 2 + horizontalSpacing / 2;
      
      nodeIds.forEach((nodeId, index) => {
        positions[nodeId] = {
          x: startX + index * horizontalSpacing,
          y: parseInt(level) * verticalSpacing
        };
      });
    });
    
    // IMPORTANT: Only adjust child node positions when absolutely necessary
    // and use a smarter algorithm to prevent cascade effects
    const processedParents = new Set();
    
    // Process from top to bottom (by depth) to avoid cascade effects
    Object.keys(nodesByLevel).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      nodesByLevel[level].forEach(parentId => {
        const childIds = graph.children[parentId];
        
        // Only adjust child nodes if there are multiple children at the same depth level
        if (childIds.length > 1 && !processedParents.has(parentId)) {
          const parentPos = positions[parentId];
          if (!parentPos) return;
          
          // Get all children at the same depth level
          const sameDepthChildren = childIds.filter(childId => 
            depths[childId] === parseInt(level) + 1
          );
          
          if (sameDepthChildren.length > 1) {
            const totalWidth = (sameDepthChildren.length - 1) * horizontalSpacing;
            const startX = parentPos.x - totalWidth / 2;
            
            sameDepthChildren.forEach((childId, index) => {
              if (positions[childId]) {
                // Update only the x position, keep the y position based on depth
                positions[childId].x = startX + index * horizontalSpacing;
              }
            });
            
            processedParents.add(parentId);
          }
        }
      });
    });
    
    const flowNodes = data.nodes.map((node) => {
      
      const category = (node.category || 'default').toLowerCase();
      const backgroundColor = categoryColors[node.difficulty] || categoryColors.default;
      
      return {
        id: node.id,
        type: 'custom',
        data: {
          ...node,
          nodeType: category,
          backgroundColor, 
          borderColor: backgroundColor,
          textColor: node.difficulty == "intermediate" ? "#000" :  '#ffffff',
          category: category,
        },
        position: positions[node.id] || { x: 0, y: 0 },
        className: `roadmap-node node-${category}`,
        style: {
          background: backgroundColor,
          color:node.difficulty == "intermediate" ? "#000" :  '#ffffff'
        }
      };
    });
    
    const flowEdges = data.edges.map((edge) => {
      const edgeType = edge.type || 'recommended';
      
      return {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: 'custom',
        animated: false,
        className: `roadmap-edge ${edgeType}`,
        data: {
          type: edgeType
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeType === 'required' ? '#ff7e5f' : '#feb47b',
          width: 15,
          height: 15,
        }
      };
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Ensure the view fits all nodes initially
    setTimeout(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ padding: 0.5 });
      }
    }, 300);
    
  }, []);

  const showCareerPath = (pathName) => {
    if (!roadmapData || !roadmapData.career_paths) return;
    
    const path = roadmapData.career_paths.find(p => p.path_name === pathName);
    if (!path) return;
    
    setSelectedPath(path);
    
    // Highlight nodes in this path
    const updatedNodes = nodes.map(node => {
      if (path.node_sequence.includes(node.id)) {
        return {
          ...node,
          className: `${node.className || ''} highlighted-node`
        };
      } else {
        return {
          ...node,
          className: `${node.className || ''} faded-node`
        };
      }
    });
    
    // Highlight edges in this path
    const pathEdges = [];
    for (let i = 0; i < path.node_sequence.length - 1; i++) {
      pathEdges.push(`${path.node_sequence[i]}-${path.node_sequence[i+1]}`);
    }
    
    const updatedEdges = edges.map(edge => {
      if (pathEdges.includes(edge.id)) {
        return {
          ...edge,
          className: `${edge.className || ''} highlighted-edge`
        };
      } else {
        return {
          ...edge,
          className: `${edge.className || ''} faded-edge`
        };
      }
    });
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  const resetPathHighlight = () => {
    setSelectedPath(null);
    
    // Reset node styling by completely removing the highlighted/faded classes
    const updatedNodes = nodes.map(node => {
      // Get the base class without highlighted/faded classes
      const baseClass = (node.className || '')
        .split(' ')
        .filter(cls => !cls.includes('highlighted-node') && !cls.includes('faded-node'))
        .join(' ');
      
      return {
        ...node,
        className: baseClass
      };
    });
    
    // Reset edge styling by completely removing the highlighted/faded classes
    const updatedEdges = edges.map(edge => {
      // Get the base class without highlighted/faded classes
      const baseClass = (edge.className || '')
        .split(' ')
        .filter(cls => !cls.includes('highlighted-edge') && !cls.includes('faded-edge'))
        .join(' ');
      
      return {
        ...edge,
        className: baseClass
      };
    });
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  };

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(nodeMap[node.id] || null);
  }, [nodeMap]);

  const toggleViewMode = () => {
    const modes = ['default', 'compact', 'expanded'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const fitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.5 });
    }
  }, []);

  // Function to load saved roadmaps from localStorage
  const getSavedRoadmaps = () => {
    try {
      return JSON.parse(localStorage.getItem('savedRoadmaps')) || [];
    } catch (err) {
      console.error("Failed to load saved roadmaps:", err);
      return [];
    }
  };

  // Function to load recent roadmaps from localStorage
  const getRecentRoadmaps = () => {
    try {
      return JSON.parse(localStorage.getItem('recents')) || [];
    } catch (err) {
      console.error("Failed to load recent roadmaps:", err);
      return [];
    }
  };

  const handleTabChange = (tab) => {
    // Animate the tab change
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.3,
        onComplete: () => {
          setActiveTab(tab);
          gsap.to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3
          });
        }
      });
    } else {
      setActiveTab(tab);
    }
  };

  // Function to load a roadmap when selected
  const loadRoadmap = (roadmap) => {
    setRoadmapData(roadmap);
    processRoadmapData(roadmap);
    
    const newNodeMap = {};
    roadmap.nodes.forEach(node => {
      newNodeMap[node.id] = node;
    });
    setNodeMap(newNodeMap);
    
    // Switch to generated tab
    handleTabChange('generated');

    // Animate the roadmap appearance
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  };

  // Function to delete a saved roadmap
  const deleteSavedRoadmap = (index) => {
    try {
      const savedRoadmaps = getSavedRoadmaps();
      savedRoadmaps.splice(index, 1);
      localStorage.setItem('savedRoadmaps', JSON.stringify(savedRoadmaps));
      
      // Force a re-render by changing tab and then changing back
      const currentTab = activeTab;
      handleTabChange('temp');
      setTimeout(() => handleTabChange(currentTab), 10);
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
      setError("Failed to delete roadmap. Please try again.");
    }
  };

  return (
    <div className="roadmap-generator-container">
      <Navbar/>
      <div className="roadmap-header-section" ref={headerRef}>
        <div className="roadmap-input-section">
          <h3 className="input-title">Learning Roadmap Generator</h3>
          <p className="input-description">Enter a learning goal to generate a customized roadmap</p>
          
          <form onSubmit={handleSubmit} className="roadmap-form">
            <div className="input-group">
              <input
                type="text"
                value={goal}
                onChange={handleInputChange}
                placeholder="e.g., Frontend Development, Data Science, Machine Learning"
                className="roadmap-input"
                disabled={isGenerating}
              />
              <button 
                type="submit" 
                className="generate-btn"
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Roadmap'}
              </button>
            </div>
            
            {error && <div className="input-error">{error}</div>}
          </form>
        </div>

        {/* Tab Navigation */}
        <div className="roadmap-tabs" ref={tabsRef}>
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleTabChange('saved')}
          >
            Saved Roadmaps
          </button>
          <button 
            className={`tab-btn ${activeTab === 'generated' ? 'active' : ''}`}
            onClick={() => handleTabChange('generated')}
            disabled={!roadmapData}
          >
            Generated Roadmap
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => handleTabChange('recent')}
          >
            Recent Roadmaps
          </button>
        </div>
      </div>

      {/* Second part - Dynamic Content based on active tab */}
      <div className="roadmap-dynamic-content" ref={contentRef}>
        {isGenerating && (
          <div className="roadmap-loading">
            <div className="loading-spinner"></div>
            <p>Generating your personalized roadmap...</p>
          </div>
        )}

        {!isGenerating && activeTab === 'saved' && (
          <div className="saved-roadmaps-container">
            <h4 className="section-title">Your Saved Roadmaps</h4>
            <div className="roadmaps-grid">
              {getSavedRoadmaps().length > 0 ? (
                getSavedRoadmaps().map((roadmap, index) => (
                  <div key={index} className="roadmap-card">
                    <div className="roadmap-card-header">
                      <h5>{roadmap.title}</h5>
                      <div className="card-actions">
                        <button 
                          className="load-btn"
                          onClick={() => loadRoadmap(roadmap)}
                        >
                          Load
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteSavedRoadmap(index)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="roadmap-card-desc">{roadmap.description}</p>
                    <div className="roadmap-card-meta">
                      <span className="roadmap-nodes-count">{roadmap.nodes.length} nodes</span>
                      <span className="roadmap-saved-date">
                        {new Date(roadmap.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-roadmaps-message">
                  <p>You haven't saved any roadmaps yet. Generate a roadmap and save it to see it here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isGenerating && activeTab === 'recent' && (
          <div className="recent-roadmaps-container">
            <h4 className="section-title">Recently Generated Roadmaps</h4>
            <div className="roadmaps-grid">
              {getRecentRoadmaps().length > 0 ? (
                getRecentRoadmaps().map((roadmap, index) => (
                  <div key={index} className="roadmap-card">
                    <div className="roadmap-card-header">
                      <h5>{roadmap.title}</h5>
                      <button 
                        className="load-btn"
                        onClick={() => loadRoadmap(roadmap)}
                      >
                        Load
                      </button>
                    </div>
                    <p className="roadmap-card-desc">{roadmap.description}</p>
                    <div className="roadmap-card-meta">
                      <span className="roadmap-nodes-count">{roadmap.nodes.length} nodes</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-roadmaps-message">
                  <p>No recent roadmaps found. Generate a roadmap to see it here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isGenerating && activeTab === 'generated' && roadmapData && (
          <div className={`roadmap-container view-${viewMode}`}>
            <div className="roadmap-header">
              <h4 className="roadmap-title">{roadmapData.title}</h4>
              <p className="roadmap-description">{roadmapData.description}</p>
              
              <div className="roadmap-actions">
                <button 
                  className="fit-view-btn" 
                  onClick={fitView}
                >
                  Fit View
                </button>
                <button 
                  className="save-roadmap-btn" 
                  onClick={saveRoadmap}
                  disabled={saveSuccess}
                >
                  {saveSuccess ? '✓ Saved!' : 'Save Roadmap'}
                </button>
              </div>
            </div>

            {/* Display career paths if available */}
            {roadmapData.career_paths && roadmapData.career_paths.length > 0 && (
              <div className="career-paths-selector">
                <h5>Career Paths:</h5>
                <div className="path-buttons">
                  {selectedPath && (
                    <button 
                      className="path-reset-btn"
                      onClick={resetPathHighlight}
                    >
                      Reset View
                    </button>
                  )}
                  {roadmapData.career_paths.map((path, index) => (
                    <button 
                      key={index}
                      className={`path-btn ${selectedPath?.path_name === path.path_name ? 'active' : ''}`}
                      onClick={() => showCareerPath(path.path_name)}
                    >
                      {path.path_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="roadmap-layout">
              <div className="roadmap-flow" style={{ width: '100%', height: '700px' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  fitViewOptions={fitViewOptions}
                  className={`roadmap-flow-container theme-${viewMode}`}
                  onInit={(instance) => { reactFlowInstance.current = instance; }}
                  minZoom={0.2} // Lower min zoom to see more nodes at once
                  maxZoom={2.5}   // Higher max zoom for detailed view
                  nodesDraggable={false} // Disable dragging to maintain fixed layout
                  nodesConnectable={false}
                  elementsSelectable={true}
                  connectionLineType="step" // Use step-like connection lines
                  preventScrolling={false} // Fix for dragging glitch - allow scrolling
                  onlyRenderVisibleElements={false} // Render all elements to prevent flickering
                  zoomOnScroll={true} // Enable zoom on scroll
                  zoomOnPinch={true} // Enable zoom on pinch
                  panOnDrag={true} // Enable pan on drag
                  panOnScroll={false} // Disable pan on scroll to prevent conflicts
                  selectionOnDrag={false} // Disable selection on drag
                  selectionMode={1} // Selection mode
                >
                  <Controls showInteractive={false} position="bottom-right" />
                  <MiniMap 
                    nodeClassName={(node) => `minimap-node ${node.data?.nodeType || ''}`}
                    maskClassName="minimap-mask"
                    className="roadmap-minimap"
                    zoomable
                    pannable
                    nodeColor={(node) => {
                      const category = node.data?.nodeType?.toLowerCase() || 'default';
                      return categoryColors[category] || categoryColors.default;
                    }}
                  />
                  <Background 
                    variant="dots" 
                    gap={20} 
                    size={1} 
                    color="#e0e0e0"
                    className="roadmap-background"
                  />
                  <Panel position="top-right" className="roadmap-panel">
                    <button 
                      className="view-toggle-btn" 
                      onClick={toggleViewMode}
                    >
                      {viewMode === 'default' ? 'Default View' : 
                        viewMode === 'compact' ? 'Compact View' : 'Expanded View'}
                    </button>
                  </Panel>
                </ReactFlow>
              </div>

              <div className="roadmap-details">
                {selectedNode ? (
                  <div className="node-details">
                    <h4 className="details-title">{selectedNode.title}</h4>
                    <div className="node-metadata">
                    <span className="difficulty-badge" style={{background: categoryColors[selectedNode.difficulty ]}}>{selectedNode.difficulty || 'N/A'}</span>
                    <span className="category-badge" style={{ 
                      backgroundColor: categoryColors[selectedNode.category?.toLowerCase()] || categoryColors.default
                    }}>{selectedNode.category || 'N/A'}</span>
                    <span className="time-badge">{selectedNode.estimated_time || 'N/A'}</span>
                  </div>
                  
                  <p className="details-description">{selectedNode.description}</p>
                  
                  {selectedNode.key_skills && selectedNode.key_skills.length > 0 && (
                    <div className="details-skills">
                      <h5>Key Skills</h5>
                      <div className="skill-tags">
                        {selectedNode.key_skills.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.specific_technologies && selectedNode.specific_technologies.length > 0 && (
                    <div className="details-technologies">
                      <h5>Technologies</h5>
                      <div className="tech-tags">
                        {selectedNode.specific_technologies.map((tech, index) => (
                          <span key={index} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                    <div className="details-prerequisites">
                      <h5>Prerequisites</h5>
                      <ul>
                        {selectedNode.prerequisites.map((prereqId, index) => (
                          <li key={index} onClick={() => {
                            const node = nodes.find(n => n.id === prereqId);
                            if (node) {
                              setSelectedNode(nodeMap[prereqId] || null);
                              
                              // Animate the selection change
                              gsap.fromTo(
                                ".node-details",
                                { opacity: 0.7, x: 10 },
                                { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
                              );
                            }
                          }} className="prerequisite-item">
                            {nodeMap[prereqId]?.title || prereqId}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedNode.resources && selectedNode.resources.length > 0 && (
                    <div className="details-resources">
                      <h5>Learning Resources</h5>
                      <ul className="resource-list">
                        {selectedNode.resources.map((resource, index) => (
                          <li key={index} className="resource-item">
                            {resource.link ? (
                              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="resource-link">
                                <span className="resource-type">{resource.type || 'Resource'}</span>
                                <span className="resource-title">{resource.title || 'Resource'}</span>
                              </a>
                            ) : (
                              <span>{typeof resource === 'string' ? resource : resource.title || 'Resource'}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedNode.practical_tasks && selectedNode.practical_tasks.length > 0 && (
                    <div className="details-tasks">
                      <h5>Practical Tasks</h5>
                      <ul className="task-list">
                        {selectedNode.practical_tasks.map((task, index) => (
                          <li key={index} className="task-item">
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedNode.industry_relevance && (
                    <div className="details-relevance">
                      <h5>Industry Relevance</h5>
                      <p>{selectedNode.industry_relevance}</p>
                    </div>
                  )}
                  
                  <div className="node-navigation">
                    <h5>Next Steps</h5>
                    <div className="next-steps">
                      {edges.filter(edge => edge.source === selectedNode.id)
                        .map(edge => {
                          const targetNode = nodeMap[edge.target];
                          return targetNode ? (
                            <button 
                              key={edge.id} 
                              className={`next-step-btn ${edge.data?.type === 'required' ? 'required' : 'recommended'}`}
                              onClick={() => {
                                setSelectedNode(targetNode);
                                
                                // Animate the selection change
                                gsap.fromTo(
                                  ".node-details",
                                  { opacity: 0.7, x: 10 },
                                  { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
                                );
                              }}
                            >
                              {targetNode.title}
                              <span className="edge-type-label">
                                {edge.data?.type === 'required' ? '(Required)' : '(Recommended)'}
                              </span>
                            </button>
                          ) : null;
                        })}
                      {edges.filter(edge => edge.source === selectedNode.id).length === 0 && (
                        <p>No next steps found</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-details">
                  <p>Click on a node to see detailed information</p>
                  
                  {roadmapData.industry_insights && (
                    <div className="industry-insights">
                      <h5>Industry Insights</h5>
                      
                      {roadmapData.industry_insights.trending_skills && (
                        <div className="trending-skills">
                          <h6>Trending Skills</h6>
                          <div className="skill-tags">
                            {roadmapData.industry_insights.trending_skills.map((skill, index) => (
                              <span key={index} className="skill-tag trending">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {roadmapData.industry_insights.future_outlook && (
                        <div className="future-outlook">
                          <h6>Future Outlook</h6>
                          <p>{roadmapData.industry_insights.future_outlook}</p>
                        </div>
                      )}
                      
                      {roadmapData.industry_insights.salary_range && (
                        <div className="salary-range">
                          <h6>Salary Range</h6>
                          <p>{roadmapData.industry_insights.salary_range}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isGenerating && activeTab === 'generated' && !roadmapData && (
        <div className="no-roadmap-message">
          <p>No roadmap has been generated yet. Enter a learning goal above and click "Generate Roadmap".</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default RoadmapGenerator;