import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import '../../styles/Global Styles/service-theme.css';
import '../../styles/Global Styles/roadmap-workspace.css';
import { CustomEdge, CustomNode } from './CustomReactFlowComponents';
import Navbar from '../../components/LandingPageComponents/Navbar'
import { FiArrowUpRight, FiBookmark, FiClock, FiCompass, FiMap, FiMaximize2, FiTrash2 } from 'react-icons/fi';
import { createRoadmapMockData } from '../../constants/mockData';
import { ROADMAP_API_BASE_URL } from '../../config/api';
import { fetchWithAiTimeout, USE_LIVE_AI } from '../../config/aiRuntime';
import { getSessionAiResult, setSessionAiResult } from '../../utils/profileSession';

const nodeLevelStyles = {
  beginner: { accent: '#21bd79', gradient: 'linear-gradient(135deg, #078859 0%, #25c981 100%)' },
  intermediate: { accent: '#f2a01f', gradient: 'linear-gradient(135deg, #ad5b04 0%, #ec9818 100%)' },
  advanced: { accent: '#ee694b', gradient: 'linear-gradient(135deg, #bd3d46 0%, #ef6d4c 100%)' },
  expert: { accent: '#8c6cf0', gradient: 'linear-gradient(135deg, #563bb7 0%, #8c69ec 100%)' },
  default: { accent: '#24b7c9', gradient: 'linear-gradient(135deg, #087d99 0%, #22b7c8 100%)' }
};

const getNodeLevelStyle = (difficulty) => (
  nodeLevelStyles[String(difficulty || '').toLowerCase()] || nodeLevelStyles.default
);

const readStoredRoadmaps = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const RoadmapGenerator = () => {
  const [goal, setGoal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapData, setRoadmapData] = useState(null);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeMap, setNodeMap] = useState({});
  const [viewMode, setViewMode] = useState('default');
  const [activeTab, setActiveTab] = useState('saved'); // Default tab is 'saved'
  const [savedRoadmaps, setSavedRoadmaps] = useState(() => readStoredRoadmaps('savedRoadmaps'));
  const [recentRoadmaps, setRecentRoadmaps] = useState(() => readStoredRoadmaps('recents'));
  
  const reactFlowInstance = useRef(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
  
  const handleInputChange = (e) => {
    setGoal(e.target.value);
  };

  const displayRoadmap = (data, shouldRecordAsRecent = false) => {
    setRoadmapData(data);
    setNodeMap(Object.fromEntries(data.nodes.map((node) => [node.id, node])));
    setSelectedNode(null);
    if (shouldRecordAsRecent) {
      const nextRecents = [data, ...recentRoadmaps.filter((item) => item?.title !== data.title)].slice(0, 6);
      setRecentRoadmaps(nextRecents);
      localStorage.setItem('recents', JSON.stringify(nextRecents));
    }
    setActiveTab('generated');
  };

  const persistRoadmap = async (data) => {
    setSessionAiResult('roadmap', data);
    const token = sessionStorage.getItem('authToken');
    if (!token) return;

    const response = await fetchWithAiTimeout(`${ROADMAP_API_BASE_URL}/save-roadmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roadmap: data }),
    });

    if (!response.ok) {
      throw new Error(`Unable to save roadmap: ${response.status}`);
    }
  };

  // Opening the service restores the newest roadmap for this signed-in user.
  // It deliberately does not call the generator; the form is the only way to
  // request a new roadmap.
  useEffect(() => {
    let cancelled = false;

    const loadLatestRoadmap = async () => {
      const token = sessionStorage.getItem('authToken');
      if (!token) return;

      const cachedRoadmap = getSessionAiResult('roadmap');
      if (cachedRoadmap && Array.isArray(cachedRoadmap.nodes) && cachedRoadmap.nodes.length && Array.isArray(cachedRoadmap.edges)) {
        if (!cancelled) {
          setRoadmapData(cachedRoadmap);
          setNodeMap(Object.fromEntries(cachedRoadmap.nodes.map((node) => [node.id, node])));
          setGoal(String(cachedRoadmap.title || '').replace(/^Professional Roadmap:\s*/i, ''));
          setSelectedNode(null);
          setActiveTab('generated');
        }
        return;
      }

      try {
        const response = await fetchWithAiTimeout(`${ROADMAP_API_BASE_URL}/roadmaps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;

        const payload = await response.json();
        const latest = Array.isArray(payload?.roadmaps) ? payload.roadmaps[0] : null;
        if (
          cancelled ||
          !latest ||
          !Array.isArray(latest.nodes) ||
          !latest.nodes.length ||
          !Array.isArray(latest.edges)
        ) return;

        setRoadmapData(latest);
        setNodeMap(Object.fromEntries(latest.nodes.map((node) => [node.id, node])));
        setGoal(String(latest.title || '').replace(/^Professional Roadmap:\s*/i, ''));
        setSelectedNode(null);
        setActiveTab('generated');
        setSessionAiResult('roadmap', latest);
      } catch (loadError) {
        // A saved roadmap is an enhancement. The composer remains usable when
        // the persistence service is unreachable.
        console.warn('Unable to load the saved roadmap.', loadError);
      }
    };

    loadLatestRoadmap();
    return () => { cancelled = true; };
  }, []);

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
      if (!USE_LIVE_AI) {
        const mockRoadmap = createRoadmapMockData(goal);
        displayRoadmap(mockRoadmap, true);
        try {
          await persistRoadmap(mockRoadmap);
        } catch (saveError) {
          console.warn('Unable to save mock roadmap.', saveError);
        }
        return;
      }

      const token = sessionStorage.getItem('authToken');
      const response = await fetchWithAiTimeout(`${ROADMAP_API_BASE_URL}/generate-roadmap`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ goal })
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
      const data = await response.json();
      if (!Array.isArray(data?.nodes) || !data.nodes.length || !Array.isArray(data?.edges)) {
        throw new Error('Roadmap response did not include a usable graph');
      }
      
      displayRoadmap(data, true);
      try {
        await persistRoadmap(data);
      } catch (saveError) {
        console.warn('Unable to save generated roadmap.', saveError);
      }
      
    } catch (err) {
      console.error("Failed to generate roadmap:", err);
      setError('Live generation is temporarily unavailable. Showing a detailed sample roadmap.');
      const mockRoadmap = createRoadmapMockData(goal);
      displayRoadmap(mockRoadmap, true);
      try {
        await persistRoadmap(mockRoadmap);
      } catch (saveError) {
        console.warn('Unable to save fallback roadmap.', saveError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRoadmap = () => {
    if (!roadmapData) return;
    
    try {
      const maxRoadmaps = 6;

      if (savedRoadmaps.length >= maxRoadmaps) {
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

      const nextSavedRoadmaps = [newRoadmap, ...savedRoadmaps];
      localStorage.setItem('savedRoadmaps', JSON.stringify(nextSavedRoadmaps));
      setSavedRoadmaps(nextSavedRoadmaps);

      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to save roadmap:", err);
      setError("Failed to save roadmap. Please try again.");
    }
  };

  const processRoadmapData = useCallback((data) => {
    if (!data?.nodes || !data?.edges) return;
    const workingEdges = [...data.edges];
    
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
    workingEdges.forEach(edge => {
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
      
      for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
        const { id, depth } = queue[queueIndex];
        
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
        workingEdges.push({
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
    const layoutDensity = {
      compact: { horizontal: 260, vertical: 185, padding: 0.42 },
      default: { horizontal: 340, vertical: 235, padding: 0.5 },
      expanded: { horizontal: 420, vertical: 300, padding: 0.34 }
    }[viewMode];
    const horizontalSpacing = layoutDensity.horizontal;
    const verticalSpacing = layoutDensity.vertical;
    
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
      const levelStyle = getNodeLevelStyle(node.difficulty);
      
      return {
        id: node.id,
        type: 'custom',
        data: {
          ...node,
          nodeType: category,
          backgroundColor: levelStyle.accent,
          backgroundGradient: levelStyle.gradient,
          category: category,
        },
        position: positions[node.id] || { x: 0, y: 0 },
        className: `roadmap-flow-node node-${category}`,
        style: {
          '--node-accent': levelStyle.accent,
          '--node-gradient': levelStyle.gradient,
          background: 'transparent'
        }
      };
    });
    
    const flowEdges = workingEdges.map((edge) => {
      const edgeType = edge.type || 'recommended';
      const edgeColor = edgeType === 'required' ? '#d55c40' : '#348568';
      
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
        style: { stroke: edgeColor },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 18,
          height: 18,
        }
      };
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Ensure the view fits all nodes initially
    window.requestAnimationFrame(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ padding: layoutDensity.padding });
      }
    });
    
  }, [setEdges, setNodes, viewMode]);

  useEffect(() => {
    if (roadmapData) processRoadmapData(roadmapData);
  }, [roadmapData, processRoadmapData]);

  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNode(nodeMap[node.id] || null);
  }, [nodeMap]);

  const fitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.5 });
    }
  }, []);

  const setCanvasViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const selectedNodeStyle = selectedNode
    ? getNodeLevelStyle(selectedNode.difficulty)
    : nodeLevelStyles.default;

  const handleTabChange = (tab) => setActiveTab(tab);

  // Function to load a roadmap when selected
  const loadRoadmap = (roadmap) => {
    setRoadmapData(roadmap);
    setSelectedNode(null);
    
    const newNodeMap = {};
    roadmap.nodes.forEach(node => {
      newNodeMap[node.id] = node;
    });
    setNodeMap(newNodeMap);
    
    // Switch to generated tab
    handleTabChange('generated');

  };

  // Function to delete a saved roadmap
  const deleteSavedRoadmap = (index) => {
    try {
      const nextSavedRoadmaps = savedRoadmaps.filter((_, roadmapIndex) => roadmapIndex !== index);
      localStorage.setItem('savedRoadmaps', JSON.stringify(nextSavedRoadmaps));
      setSavedRoadmaps(nextSavedRoadmaps);
    } catch (err) {
      console.error("Failed to delete roadmap:", err);
      setError("Failed to delete roadmap. Please try again.");
    }
  };

  return (
    <div className="roadmap-generator-container">
      <Navbar variant="app" />
      <main className="roadmap-workspace">
      <section className="roadmap-header-section">
        <div className="roadmap-composer-copy">
          <p className="workspace-eyebrow">AI roadmap generator</p>
          <h1 className="input-title">Make the next chapter tangible.</h1>
          <p className="input-description">Name the role or skill you are working toward. We will translate it into a visual, practical sequence of learning moves.</p>
        </div>

        <div className="roadmap-input-section">
          
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
                {isGenerating ? 'Shaping your roadmap…' : <>{roadmapData ? 'Regenerate roadmap' : 'Generate roadmap'} <FiArrowUpRight aria-hidden="true" /></>}
              </button>
            </div>
            
            {error && <div className="input-error">{error}</div>}
          </form>

          <aside className="roadmap-composer-note" aria-label="Roadmap generator features">
            <span className="roadmap-note-mark">↗</span>
            <div>
              <strong>A plan you can navigate.</strong>
              <ul>
                <li><FiMap aria-hidden="true" /> Linked learning milestones</li>
                <li><FiCompass aria-hidden="true" /> Useful skills and resources</li>
                <li><FiClock aria-hidden="true" /> Time-aware next steps</li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Tab Navigation */}
        <div className="roadmap-tabs">
          <button 
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => handleTabChange('saved')}
          >
            <FiBookmark aria-hidden="true" /> Saved
          </button>
          <button 
            className={`tab-btn ${activeTab === 'generated' ? 'active' : ''}`}
            onClick={() => handleTabChange('generated')}
            disabled={!roadmapData}
          >
            <FiMap aria-hidden="true" /> Current plan
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => handleTabChange('recent')}
          >
            <FiClock aria-hidden="true" /> Recent
          </button>
        </div>
      </section>

      {/* Second part - Dynamic Content based on active tab */}
      <div className="roadmap-dynamic-content">
        {isGenerating && (
          <div className="roadmap-loading">
            <div className="loading-spinner"></div>
            <p>Generating your personalized roadmap...</p>
          </div>
        )}

        {!isGenerating && activeTab === 'saved' && (
          <div className="saved-roadmaps-container">
            <div className="roadmap-list-heading">
              <p className="workspace-eyebrow">Your library</p>
              <h2 className="section-title">Saved roadmaps</h2>
            </div>
            <div className="roadmaps-grid">
              {savedRoadmaps.length > 0 ? (
                savedRoadmaps.map((roadmap, index) => (
                  <div key={index} className="roadmap-card">
                    <div className="roadmap-card-header">
                      <h5>{roadmap.title}</h5>
                      <div className="card-actions">
                        <button 
                          className="load-btn"
                          onClick={() => loadRoadmap(roadmap)}
                        >
                          Open
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteSavedRoadmap(index)}
                        >
                          <FiTrash2 aria-hidden="true" /> Delete
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
                  <p>Your saved plans will live here. Generate a roadmap, then save the directions you want to keep.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isGenerating && activeTab === 'recent' && (
          <div className="recent-roadmaps-container">
            <div className="roadmap-list-heading">
              <p className="workspace-eyebrow">Your momentum</p>
              <h2 className="section-title">Recent roadmaps</h2>
            </div>
            <div className="roadmaps-grid">
              {recentRoadmaps.length > 0 ? (
                recentRoadmaps.map((roadmap, index) => (
                  <div key={index} className="roadmap-card">
                    <div className="roadmap-card-header">
                      <h5>{roadmap.title}</h5>
                      <button 
                        className="load-btn"
                        onClick={() => loadRoadmap(roadmap)}
                      >
                        Open
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
                  <p>Your most recent generated plans will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!isGenerating && activeTab === 'generated' && roadmapData && (
            <div className={`roadmap-container view-${viewMode}`}>
            <div className="roadmap-header">
              <p className="workspace-eyebrow">Your learning route</p>
              <h2 className="roadmap-title">{roadmapData.title}</h2>
              <p className="roadmap-description">{roadmapData.description}</p>
              
              <div className="roadmap-actions">
                <button 
                  className="fit-view-btn" 
                  onClick={fitView}
                >
                  <FiMaximize2 aria-hidden="true" /> Fit canvas
                </button>
                <button 
                  className={`save-roadmap-btn ${saveSuccess ? 'is-saved' : ''}`}
                  onClick={saveRoadmap}
                  disabled={saveSuccess}
                >
                  {saveSuccess ? 'Saved' : <><FiBookmark aria-hidden="true" /> Save roadmap</>}
                </button>
              </div>
            </div>

            <div className="roadmap-layout">
              <div className="roadmap-flow">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={onNodeClick}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  className={`roadmap-flow-container theme-${viewMode}`}
                  onInit={(instance) => { reactFlowInstance.current = instance; }}
                  minZoom={0.2} // Lower min zoom to see more nodes at once
                  maxZoom={2.5}   // Higher max zoom for detailed view
                  nodesDraggable={false} // Disable dragging to maintain fixed layout
                  nodesConnectable={false}
                  elementsSelectable={false}
                  nodesFocusable={false}
                  connectionLineType="smoothstep"
                  preventScrolling={false} // Fix for dragging glitch - allow scrolling
                  onlyRenderVisibleElements // Avoid rendering off-screen graph content
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
                      return getNodeLevelStyle(node.data?.difficulty).accent;
                    }}
                  />
                  <Background 
                    variant="lines" 
                    gap={24} 
                    size={1} 
                    color="#d9e5d8"
                    className="roadmap-background"
                  />
                  <Panel position="top-right" className="roadmap-panel">
                    <div className="view-mode-controls" aria-label="Roadmap layout density">
                      {['default', 'compact', 'expanded'].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          className={`view-toggle-btn ${viewMode === mode ? 'active' : ''}`}
                          onClick={() => setCanvasViewMode(mode)}
                          aria-pressed={viewMode === mode}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </Panel>
                </ReactFlow>
              </div>

              <div className="roadmap-details">
                {selectedNode ? (
                  <div className="node-details">
                    <div className="details-title-container" style={{ '--selected-node-gradient': selectedNodeStyle.gradient }}>
                      <h4 className="details-title">{selectedNode.title}</h4>
                    </div>
                    <div className="node-metadata">
                    <span className="difficulty-badge">{selectedNode.difficulty || 'N/A'}</span>
                    <span className="category-badge">{selectedNode.category || 'N/A'}</span>
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
                            {resource.link || resource.url ? (
                              <a href={resource.link || resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">
                                <span className="resource-type">{resource.type || 'Resource'}</span>
                                <span className="resource-title">{resource.title || resource.name || 'Resource'}</span>
                              </a>
                            ) : (
                              <span>{typeof resource === 'string' ? resource : resource.title || resource.name || 'Resource'}</span>
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
          <p>No roadmap has been generated yet. Enter a learning goal above to create your first visual plan.</p>
        </div>
      )}
    </div>
    </main>
  </div>
  );
};

export default RoadmapGenerator;
