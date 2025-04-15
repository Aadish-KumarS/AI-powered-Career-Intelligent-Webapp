import { useEffect, useState } from 'react';
import ReactFlow, { Background } from 'reactflow';
import 'reactflow/dist/style.css';
import '../../styles/Roadmap genarator/Roadmap.css';

const getNodeLevel = (nodeId, nodes) => {
  const node = nodes.find(n => n.id === nodeId);
  if (!node || !node.prerequisites || node.prerequisites.length === 0) return 0;
  const prereqLevels = node.prerequisites.map(prereqId => getNodeLevel(prereqId, nodes) + 1);
  return Math.max(...prereqLevels);
};

const generateNodePositions = (nodes) => {
  const positions = {};
  const levels = {};

  const levelHeight = 200;
  const nodeWidth = 180;
  const horizontalSpacing = 220;
  const canvasCenterX = 500;

  nodes.forEach(node => {
    const level = getNodeLevel(node.id, nodes);
    if (!levels[level]) levels[level] = [];
    levels[level].push(node.id);
  });

  Object.entries(levels).forEach(([level, nodeIds]) => {
    const totalWidth = nodeIds.length * (nodeWidth + horizontalSpacing);
    const startX = canvasCenterX - totalWidth / 2 + horizontalSpacing / 2;

    nodeIds.forEach((nodeId, index) => {
      positions[nodeId] = {
        x: startX + index * (nodeWidth + horizontalSpacing),
        y: parseInt(level) * levelHeight 
      };
    });
  });

  return positions;
};

const formatToReactFlow = (roadmap) => {
  const positions = generateNodePositions(roadmap.nodes);

  const nodes = roadmap.nodes.map((n) => ({
    id: n.id,
    data: {
      label: (
        <div className="node-content">
          <div className="node-title">{n.title}</div>
          <div className="node-description">{n.description}</div>
        </div>
      )
    },
    position: positions[n.id],
    style: {
      width: 180,
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ccc'
    }
  }));

  const edges = roadmap.edges.map((e) => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#555' }
  }));

  return { nodes, edges };
};

const RoadmapPreview = ({ roadmap }) => {
  const { nodes, edges } = formatToReactFlow(roadmap);

  return (
    <div className="roadmap-preview">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={true}
        zoomOnScroll={false}
        panOnScroll={true}
        zoomOnPinch={false}
        panOnDrag={false}
        preventScrolling={true}
        minZoom={.5}
        maxZoom={.5}
        attributionPosition="hidden"
        nodesConnectable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
      >
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

const SavedRoadmaps = ({ onRoadmapSelect }) => {
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('savedRoadmaps');
    if (stored) {
      setSavedRoadmaps(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="saved-roadmaps-container">
      <h1>Saved Roadmaps</h1>
      <div className="roadmap-card-list">
        {savedRoadmaps.length === 0 ? (
          <p>No saved roadmaps found.</p>
        ) : (
          savedRoadmaps.map((roadmap, index) => (
            <div
              key={index}
              className="roadmap-card"
              onClick={() => {
                localStorage.setItem('savedRoadmap', JSON.stringify(roadmap));
                if (onRoadmapSelect) onRoadmapSelect(roadmap);
              }}
            >
              <h3>{roadmap.title}</h3>
              <p>{roadmap.description}</p>
              <div className="roadmap-card-preview">
                <RoadmapPreview roadmap={roadmap} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedRoadmaps;
