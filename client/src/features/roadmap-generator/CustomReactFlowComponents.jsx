import { Handle, } from 'reactflow';

const CustomNode = ({ data, selected }) => {
  const nodeStyle = {
    backgroundColor: data.backgroundColor || '#607D8B',
    borderColor: data.borderColor || '#607D8B',
    color: data.textColor || '#ffffff'
  };
  
  return (
    <div className={`roadmap-node node-${data.nodeType || 'default'} ${selected ? 'selected' : ''} ${data.nodeType || 'default'}`}  style={nodeStyle}>
      <Handle 
        type="target" 
        position="top" 
        className="node-handle target-handle" 
      />
      <div className="node-content">
        <div className="node-title">{data.title}</div>
        {data.description && (
          <div className="node-description">
            {data.description.length > 70 
              ? data.description.substring(0, 70) + '...' 
              : data.description}
          </div>
        )}
        {data.icon && <div className="node-icon">{data.icon}</div>}
      </div>
      <Handle 
        type="source" 
        position="bottom" 
        className="node-handle source-handle" 
      />
    </div>
  );
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style = {},
}) => {
  const sourceHandleOffset = 0;
  const targetHandleOffset = 0;
  const startX = sourceX;
  const startY = sourceY + sourceHandleOffset;
  const endX = targetX;
  const endY = targetY - targetHandleOffset;
  const midY = startY + (endY - startY) / 2;
  const edgePath = `
    M ${startX},${startY}
    L ${startX},${midY}
    L ${endX},${midY}
    L ${endX},${endY}
  `;

  return (
    <g className="react-flow__connection">
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path-bg"
        d={edgePath}
        strokeWidth={7}
        stroke="#e0e0e0"
        fill="none"
      />
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={1.5}
        stroke={style.stroke || "#ff7e5f"}
        fill="none"
        markerEnd={markerEnd}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id={`${id}-interaction`}
        className="react-flow__edge-interaction"
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        strokeLinecap="round"
        style={{ pointerEvents: 'stroke' }}
      />
    </g>
  );
};

const CustomEdgeSmartRouting = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style = {},
}) => {
  const isTargetBelow = targetY > sourceY;
  const verticalDistance = Math.abs(targetY - sourceY);
  const horizontalDistance = Math.abs(targetX - sourceX);
  
  let edgePath;
  
  if (horizontalDistance > verticalDistance * 1.5 || !isTargetBelow) {
    const midX = sourceX + (targetX - sourceX) / 2;
    edgePath = `
      M ${sourceX},${sourceY}
      L ${midX},${sourceY}
      L ${midX},${targetY}
      L ${targetX},${targetY}
    `;
  } else {
    const midY = sourceY + (targetY - sourceY) / 2;
    edgePath = `
      M ${sourceX},${sourceY}
      L ${sourceX},${midY}
      L ${targetX},${midY}
      L ${targetX},${targetY}
    `;
  }

  return (
    <g className="react-flow__connection">
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path-bg"
        d={edgePath}
        strokeWidth={7}
        stroke="#e0e0e0"
        fill="none"
      />
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={1.5}
        stroke={style.stroke || "#ff7e5f"}
        fill="none"
        markerEnd={markerEnd}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id={`${id}-interaction`}
        className="react-flow__edge-interaction"
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        strokeLinecap="round"
        style={{ pointerEvents: 'stroke' }}
      />
    </g>
  );
};

const CustomEdgeRounded = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  style = {},
}) => {
  const midY = sourceY + (targetY - sourceY) / 2;
  const radius = 20;
  const edgePath = `
    M ${sourceX},${sourceY}
    L ${sourceX},${midY - radius}
    Q ${sourceX},${midY} ${sourceX + Math.sign(targetX - sourceX) * radius},${midY}
    L ${targetX - Math.sign(targetX - sourceX) * radius},${midY}
    Q ${targetX},${midY} ${targetX},${midY + radius}
    L ${targetX},${targetY}
  `;

  return (
    <g className="react-flow__connection">
      <path
        id={`${id}-bg`}
        className="react-flow__edge-path-bg"
        d={edgePath}
        strokeWidth={7}
        stroke="#e0e0e0"
        fill="none"
      />
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        strokeWidth={1.5}
        stroke={style.stroke || "#ff7e5f"}
        fill="none"
        markerEnd={markerEnd}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        id={`${id}-interaction`}
        className="react-flow__edge-interaction"
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        strokeLinecap="round"
        style={{ pointerEvents: 'stroke' }}
      />
    </g>
  );
};


export {
  CustomNode,
  CustomEdge,
  CustomEdgeSmartRouting,
  CustomEdgeRounded,
};
