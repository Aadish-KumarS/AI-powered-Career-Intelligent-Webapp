import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  MarkerType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/Roadmap genarator/Roadmap.css';
import { CustomEdge, CustomEdgeRounded, CustomEdgeSmartRouting, CustomNode } from './CustomReactFlowComponents';


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
  
  const reactFlowInstance = useRef(null);

  const nodeTypes = useMemo(() => ({ custom: CustomNode,smart: CustomEdgeSmartRouting,rounded: CustomEdgeRounded }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
  
  const fitViewOptions = useMemo(() => ({ padding: 0.3 }), []);

  useEffect(() => {
    const savedRoadmap = localStorage.getItem('savedRoadmap');
    if (savedRoadmap) {
      try {
        const parsedData = JSON.parse(savedRoadmap);
        setRoadmapData(parsedData);
        processRoadmapData(parsedData);
        
        const newNodeMap = {};
        parsedData.nodes.forEach(node => {
          newNodeMap[node.id] = node;
        });
        setNodeMap(newNodeMap);
      } catch (err) {
        console.error("Failed to load saved roadmap:", err);
      }
    }
  }, []);

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
      localStorage.setItem('savedRoadmap', JSON.stringify(roadmapData));
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to save roadmap:", err);
      setError("Failed to save roadmap. Please try again.");
    }
  };

  // Improved node positioning algorithm
  const processRoadmapData = useCallback((data) => {
    if (!data?.nodes || !data?.edges) return;
    
    const nodeTypeMap = assignNodeTypes(data.nodes, data.edges);
    const nodePositions = improvedNodePositions(data.nodes, data.edges);
    
    const flowNodes = data.nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      data: {
        ...node,
        nodeType: nodeTypeMap[node.id] || 'default'
      },
      position: nodePositions[node.id] || { x: Math.random() * 500, y: Math.random() * 500 },
      className: `node-${nodeTypeMap[node.id] || 'default'}`
    }));
    
    const flowEdges = data.edges.map((edge, index) => {
      const priorityNum = edge.priority || (index % 3) + 1;
      return {
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: false,
        type: 'custom',
        className: `roadmap-edge priority-${priorityNum}`,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeColor(priorityNum),
          width: 20,
          height: 20,
        },
        style: {
          stroke: getEdgeColor(priorityNum),
          strokeWidth: priorityNum === 1 ? 4 : 3,
        }
      };
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
    
    setTimeout(() => {
      if (reactFlowInstance.current) {
        reactFlowInstance.current.fitView({ padding: 0.3 });
      }
    }, 100);
  }, []);

  const assignNodeTypes = (nodes, edges) => {
    const nodeTypes = {};
    
    const rootNodeIds = nodes.map(n => n.id).filter(id => 
      !edges.some(e => e.target === id)
    );
    
    rootNodeIds.forEach(id => {
      nodeTypes[id] = 'root';
    });
    
    const leafNodeIds = nodes.map(n => n.id).filter(id => 
      !edges.some(e => e.source === id)
    );
    
    leafNodeIds.forEach(id => {
      nodeTypes[id] = 'leaf';
    });
    
    nodes.forEach(node => {
      if (!nodeTypes[node.id]) {
        nodeTypes[node.id] = 'intermediate';
      }
    });
    
    return nodeTypes;
  };

  const getEdgeColor = (priority) => {
    switch (priority) {
      case 1:
      case 'high':
        return '#ff7e5f';
      case 2:
      case 'medium':
        return '#feb47b';
      case 3:
      case 'low':
        return '#ffcf9f';
      default:
        return '#ff7e5f';
    }
  };

  const improvedNodePositions = (nodes, edges) => {
    const positions = {};
    const childrenMap = {};
    const parentMap = {};
    
    // Initialize maps
    nodes.forEach(node => {
      childrenMap[node.id] = [];
      parentMap[node.id] = [];
    });
    
    // Build relationship maps
    edges.forEach(edge => {
      childrenMap[edge.source].push(edge.target);
      parentMap[edge.target].push(edge.source);
    });
    
    // Find root nodes
    const rootNodeIds = nodes.map(n => n.id).filter(id => 
      !edges.some(e => e.target === id)
    );
    
    const rootIds = rootNodeIds.length > 0 ? rootNodeIds : [nodes[0]?.id];
    
    // Calculate depths (levels) for each node using BFS
    const nodeLevels = {};
    let maxLevel = 0;
    
    rootIds.forEach(rootId => {
      nodeLevels[rootId] = 0;
      
      const queue = [rootId];
      const visited = new Set([rootId]);
      
      while (queue.length > 0) {
        const currentId = queue.shift();
        const children = childrenMap[currentId] || [];
        
        for (const childId of children) {
          if (!visited.has(childId)) {
            visited.add(childId);
            nodeLevels[childId] = nodeLevels[currentId] + 1;
            maxLevel = Math.max(maxLevel, nodeLevels[childId]);
            queue.push(childId);
          }
        }
      }
    });
    
    // Group nodes by their level
    const nodesByLevel = {};
    for (let i = 0; i <= maxLevel; i++) {
      nodesByLevel[i] = [];
    }
    
    Object.entries(nodeLevels).forEach(([nodeId, level]) => {
      nodesByLevel[level].push(nodeId);
    });
    
    const maxNodesInLevel = Math.max(...Object.values(nodesByLevel).map(nodes => nodes.length));
    
    const baseHorizontalSpacing = 550; // Increased from 300
    const dynamicHorizontalMultiplier = 1 + (maxNodesInLevel / 10);
    const horizontalSpacing = baseHorizontalSpacing * dynamicHorizontalMultiplier;
    
    const baseVerticalSpacing = 170; // Increased from 180
    const dynamicVerticalMultiplier = 1 + (maxLevel / 10);
    const verticalSpacing = baseVerticalSpacing * dynamicVerticalMultiplier;
    
    Object.entries(nodesByLevel).forEach(([level, nodeIds]) => {
      nodeIds.sort((a, b) => {
        const aConnections = (parentMap[a] || []).length + (childrenMap[a] || []).length;
        const bConnections = (parentMap[b] || []).length + (childrenMap[b] || []).length;
        return bConnections - aConnections; // More connected nodes first
      });
      
      const levelWidth = (nodeIds.length - 1) * horizontalSpacing;
      const startX = -levelWidth / 2;
      
      nodeIds.forEach((nodeId, index) => {
        const jitterX = Math.random() * 40 - 20; // Small random offset for natural appearance
        
        positions[nodeId] = {
          x: startX + index * horizontalSpacing + jitterX,
          y: parseInt(level) * verticalSpacing
        };
      });
    });
    
    for (let level = maxLevel - 1; level >= 0; level--) {
      const levelNodes = nodesByLevel[level] || [];
      
      levelNodes.forEach(nodeId => {
        const children = childrenMap[nodeId] || [];
        
        if (children.length > 0) {
          let totalWeight = 0;
          let weightedSumX = 0;
          
          children.forEach(childId => {
            if (positions[childId]) {
              const weight = 1 + (childrenMap[childId] || []).length * 0.2;
              weightedSumX += positions[childId].x * weight;
              totalWeight += weight;
            }
          });
          
          if (totalWeight > 0) {
            const targetX = weightedSumX / totalWeight;
            const currentX = positions[nodeId].x;
            
            positions[nodeId].x = currentX * 0.3 + targetX * 0.7;
          }
        }
      });
    }
    
    const nodeWidth = 220; 
    
    Object.values(nodesByLevel).forEach(levelNodes => {
      if (levelNodes.length <= 1) return;
      levelNodes.sort((a, b) => positions[a].x - positions[b].x);
      
      for (let i = 1; i < levelNodes.length; i++) {
        const prevNodeId = levelNodes[i-1];
        const currNodeId = levelNodes[i];
        
        const prevRight = positions[prevNodeId].x + nodeWidth/2 + 40; // Add margin
        const currLeft = positions[currNodeId].x - nodeWidth/2;
        
        if (currLeft < prevRight) {
          const shift = prevRight - currLeft + 20;
          positions[currNodeId].x += shift;
          
          for (let j = i + 1; j < levelNodes.length; j++) {
            positions[levelNodes[j]].x += shift;
          }
        }
      }
    });
    
    Object.keys(positions).forEach(nodeId => {
      const isRoot = parentMap[nodeId].length === 0;
      const isLeaf = childrenMap[nodeId].length === 0;
      
      if (!isRoot && !isLeaf) {
        positions[nodeId].y += Math.random() * 30 - 15;
      }
    });
    
    return positions;
  };

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(nodeMap[node.id] || null);
  }, [nodeMap]);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      animated: false,
      type: 'custom',
      className: 'roadmap-edge priority-2',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: getEdgeColor(2),
        width: 20,
        height: 20,
      },
      style: {
        stroke: getEdgeColor(2),
        strokeWidth: 3,
      }
    }, eds));
  }, [setEdges]);

  const toggleViewMode = () => {
    const modes = ['default', 'compact', 'expanded'];
    const currentIndex = modes.indexOf(viewMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setViewMode(modes[nextIndex]);
  };

  const fitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.3 });
    }
  }, []);

  return (
    <div className="roadmap-generator-container">
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
      
      {roadmapData && !isGenerating && (
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

          <div className="roadmap-layout">
            <div className="roadmap-flow" style={{ width: '100%', height: '700px' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={fitViewOptions}
                className={`roadmap-flow-container theme-${viewMode}`}
                onInit={(instance) => { reactFlowInstance.current = instance; }}
                minZoom={0.5}
                maxZoom={1.5}
                nodesDraggable={true}
                nodesConnectable={true}
                elementsSelectable={true}
                connectionLineType="smoothstep"
              >
                <Controls showInteractive={false} position="bottom-right" />
                <MiniMap 
                  nodeClassName={(node) => `minimap-node ${node.data?.nodeType || ''}`}
                  maskClassName="minimap-mask"
                  className="roadmap-minimap"
                  zoomable
                  pannable
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
                  <p className="details-description">{selectedNode.description}</p>
                  
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
                      <h5>Resources</h5>
                      <ul>
                        {selectedNode.resources.map((resource, index) => (
                          <li key={index}>
                            {resource.link ? (
                              <a href={resource.link} target="_blank" rel="noopener noreferrer">
                                {resource.title || resource.link}
                              </a>
                            ) : (
                              resource.title || resource
                            )}
                          </li>
                        ))}
                      </ul>
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
                              className="next-step-btn"
                              onClick={() => setSelectedNode(targetNode)}
                            >
                              {targetNode.title}
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isGenerating && (
        <div className="roadmap-loading">
          <div className="loading-spinner"></div>
          <p>Generating your personalized roadmap...</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;