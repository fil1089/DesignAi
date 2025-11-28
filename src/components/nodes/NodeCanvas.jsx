import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import PromptNode from './PromptNode';
import PreviewNode from './PreviewNode';
import ModelNode from './ModelNode';
import ImageInputNode from './ImageInputNode';
import Connection from './Connection';
import './NodeCanvas.css';

const initialNodes = [
  {
    id: 'prompt-1',
    type: 'prompt',
    position: { x: 100, y: 150 },
    data: { 
      text: 'Hipster Sisyphus, lime dots overall suit, pushing a huge round rock up a hill. The rock is sprayed with the text "default prompt", bright grey background extreme side long shot, cinematic, fashion style, side view'
    }
  },
  {
    id: 'image-1',
    type: 'imageInput',
    position: { x: 100, y: 450 },
    data: { image: null }
  },
  {
    id: 'preview-1',
    type: 'preview',
    position: { x: 800, y: 150 },
    data: { image: null }
  },
  {
    id: 'model-1',
    type: 'model',
    position: { x: 450, y: 150 },
    data: { 
      name: 'Gemini Pro',
      result: null,
      inputs: [{ id: 'image-1', label: 'Image 1' }]
    }
  }
];

const initialConnections = [
  { id: 'conn-1', from: 'prompt-1', fromPort: 'output', to: 'model-1', toPort: 'prompt' },
  { id: 'conn-2', from: 'image-1', fromPort: 'output', to: 'model-1', toPort: 'image-1' },
  { id: 'conn-3', from: 'model-1', fromPort: 'output', to: 'preview-1', toPort: 'input' }
];

export default function NodeCanvas({ onGenerate, isGenerating, result, apiKey }) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [connections, setConnections] = useState(initialConnections);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.85);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [portPositions, setPortPositions] = useState({});

  // Update result in model node AND propagate to preview nodes
  useEffect(() => {
    if (result?.image) {
      // 1. Update Model Node
      const newNodes = nodes.map(node => 
        node.id === 'model-1' 
          ? { ...node, data: { ...node.data, result: result.image } }
          : node
      );
      
      // 2. Propagate to connected Preview nodes
      const modelConnections = connections.filter(c => c.from === 'model-1');
      modelConnections.forEach(conn => {
        const previewNodeIndex = newNodes.findIndex(n => n.id === conn.to);
        if (previewNodeIndex !== -1 && newNodes[previewNodeIndex].type === 'preview') {
          newNodes[previewNodeIndex] = {
            ...newNodes[previewNodeIndex],
            data: { ...newNodes[previewNodeIndex].data, image: result.image }
          };
        }
      });
      
      setNodes(newNodes);
    }
  }, [result]);

  // Get canvas-relative mouse position
  const getCanvasPos = useCallback((clientX, clientY) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale
    };
  }, [offset, scale]);

  // Node dragging
  const handleNodeMouseDown = (e, nodeId) => {
    if (e.target.closest('.node-port') || e.target.closest('.node-content-interactive')) return;
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    const pos = getCanvasPos(e.clientX, e.clientY);
    setDraggingNode(nodeId);
    setDragOffset({
      x: pos.x - node.position.x,
      y: pos.y - node.position.y
    });
  };

  // Port connection start
  const handlePortMouseDown = (e, nodeId, portId, portType) => {
    e.stopPropagation();
    if (portType === 'output') {
      const pos = getCanvasPos(e.clientX, e.clientY);
      setConnectingFrom({ nodeId, portId });
      setMousePos(pos);
    }
  };

  // Port connection end
  const handlePortMouseUp = (e, nodeId, portId, portType) => {
    if (connectingFrom && portType === 'input' && connectingFrom.nodeId !== nodeId) {
      // Check if connection already exists
      const exists = connections.some(
        c => c.from === connectingFrom.nodeId && c.to === nodeId && c.toPort === portId
      );
      if (!exists) {
        setConnections(prev => [...prev, {
          id: `conn-${Date.now()}`,
          from: connectingFrom.nodeId,
          fromPort: connectingFrom.portId,
          to: nodeId,
          toPort: portId
        }]);
      }
    }
    setConnectingFrom(null);
  };

  // Canvas mouse move
  const handleMouseMove = (e) => {
    const pos = getCanvasPos(e.clientX, e.clientY);
    
    if (draggingNode) {
      setNodes(prev => prev.map(node => 
        node.id === draggingNode 
          ? { ...node, position: { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y } }
          : node
      ));
    }
    
    if (isPanning) {
      setOffset({
        x: offset.x + (e.clientX - panStart.x),
        y: offset.y + (e.clientY - panStart.y)
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
    
    if (connectingFrom) {
      setMousePos(pos);
    }
  };

  // Canvas mouse up
  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
    setConnectingFrom(null);
  };

  // Canvas panning
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-grid')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.3), 2));
  };

  // Update node data
  const updateNodeData = (nodeId, newData) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  };

  // Register port position
  const registerPortPosition = useCallback((nodeId, portId, position) => {
    setPortPositions(prev => ({
      ...prev,
      [`${nodeId}-${portId}`]: position
    }));
  }, []);

  // Get connection path
  const getConnectionPath = (conn) => {
    const fromPos = portPositions[`${conn.from}-${conn.fromPort}`];
    const toPos = portPositions[`${conn.to}-${conn.toPort}`];
    if (!fromPos || !toPos) return null;
    return { from: fromPos, to: toPos };
  };

  // Delete connection
  const deleteConnection = (connId) => {
    setConnections(prev => prev.filter(c => c.id !== connId));
  };

  // Render node by type
  const renderNode = (node) => {
    const commonProps = {
      key: node.id,
      node,
      onMouseDown: (e) => handleNodeMouseDown(e, node.id),
      onPortMouseDown: handlePortMouseDown,
      onPortMouseUp: handlePortMouseUp,
      onDataChange: (data) => updateNodeData(node.id, data),
      registerPortPosition,
      scale
    };

    switch (node.type) {
      case 'prompt':
        return <PromptNode {...commonProps} />;
      case 'preview':
        return <PreviewNode {...commonProps} />;
      case 'model':
        return <ModelNode {...commonProps} onRun={handleRun} isRunning={isGenerating} apiKey={apiKey} />;
      case 'imageInput':
        return <ImageInputNode {...commonProps} />;
      default:
        return null;
    }
  };

  // Get data for generation by traversing the graph
  const getGenerationData = () => {
    const modelNode = nodes.find(n => n.type === 'model');
    if (!modelNode) return null;

    // Find inputs connected to the model
    const connectedInputs = connections.filter(c => c.to === modelNode.id);
    
    let promptText = '';
    const images = [];

    connectedInputs.forEach(conn => {
      const sourceNode = nodes.find(n => n.id === conn.from);
      if (!sourceNode) return;

      if (conn.toPort === 'prompt' && sourceNode.type === 'prompt') {
        promptText = sourceNode.data.text || '';
      } 
      // Collect all images connected to inputs starting with 'image'
      // This supports connection from 'ImageInput' nodes to 'image-1', 'image-2' ports etc.
      else if (sourceNode.type === 'imageInput' && sourceNode.data.image) {
        images.push(sourceNode.data.image);
      }
    });

    return {
      prompt: promptText,
      images: images // Array of images
    };
  };

  // Handle run
  const handleRun = () => {
    const data = getGenerationData();
    if (onGenerate && data) {
      onGenerate(data);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="node-canvas"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
    >
      <div 
        className="canvas-grid"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* Connections */}
        <svg className="connections-layer">
          {connections.map(conn => {
            const path = getConnectionPath(conn);
            if (!path) return null;
            return (
              <Connection 
                key={conn.id}
                from={path.from}
                to={path.to}
                onDelete={() => deleteConnection(conn.id)}
              />
            );
          })}
          
          {/* Drawing connection */}
          {connectingFrom && (
            <Connection
              from={portPositions[`${connectingFrom.nodeId}-${connectingFrom.portId}`] || mousePos}
              to={mousePos}
              isDrawing
            />
          )}
        </svg>

        {/* Nodes */}
        {nodes.map(renderNode)}
      </div>

      {/* Zoom indicator */}
      <div className="zoom-indicator">
        {Math.round(scale * 100)}%
      </div>

      {/* Controls */}
      <div className="canvas-controls">
        <button onClick={() => setScale(s => Math.min(s * 1.2, 2))} title="Zoom In">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button onClick={() => setScale(s => Math.max(s * 0.8, 0.3))} title="Zoom Out">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35M8 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }} title="Reset View">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
