

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Node, Position, NodeType, NodeData, Language, UploadedImage, Connection } from './types';
import { geminiService } from './services/geminiService';
import { t } from './translations';

import Background from './components/graph/Background';
import NodeWrapper from './components/graph/Node';
import ConnectionLine from './components/graph/Connection';
import ContextMenu from './components/graph/ContextMenu';

import ReferenceNode from './components/nodes/ReferenceNode';
import AssetNode from './components/nodes/AssetNode';
import PromptNode from './components/nodes/PromptNode';
import StyleNode from './components/nodes/StyleNode';
import GeneratorNode from './components/nodes/GeneratorNode';
import PreviewNode from './components/nodes/PreviewNode';

export default function App() {
  // App State
  const [hasKey, setHasKey] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [lang, setLang] = useState<Language>('ru');
  const [isGenerating, setIsGenerating] = useState(false);

  // Canvas State
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [lastMousePos, setLastMousePos] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Connection Drawing State
  const [drawingConnection, setDrawingConnection] = useState<{
    sourceNode: string;
    sourcePos: Position;
    currentPos: Position;
  } | null>(null);

  // Node Dimensions Cache (for accurate port positions)
  const [nodeDimensions, setNodeDimensions] = useState<Record<string, { w: number, h: number }>>({});

  // Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  // --- Initialization ---
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true); // Fallback
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  // --- Node Logic ---
  const addNode = (type: NodeType, x: number, y: number) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position: { x, y },
      data: { title: t(lang, `nodes.${type}`) },
      width: type === 'preview' ? 400 : type === 'reference' || type === 'asset' ? 250 : 300
    };
    setNodes(prev => [...prev, newNode]);
  };

  const updateNodeData = (id: string, newData: Partial<NodeData>) => {
    // FIX: Corrected the object spread to properly update the node's data. The previous implementation had an extra nested spread causing a type error.
    setNodes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...newData } } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
  };

  const handleNodeResize = useCallback((id: string, w: number, h: number) => {
    setNodeDimensions(prev => {
        // Prevent infinite loop by checking if dimensions actually changed
        if (prev[id]?.w === w && prev[id]?.h === h) {
            return prev;
        }
        return { ...prev, [id]: { w, h } };
    });
  }, []);

  // --- Connection Logic ---
  const handlePortMouseDown = (e: React.MouseEvent, nodeId: string, type: 'input' | 'output') => {
    e.stopPropagation();
    if (type === 'output') {
      const node = nodes.find(n => n.id === nodeId);
      const dims = nodeDimensions[nodeId] || { w: 250, h: 100 };
      if (node) {
        const startPos = {
          x: node.position.x + dims.w,
          y: node.position.y + dims.h / 2
        };
        setDrawingConnection({
          sourceNode: nodeId,
          sourcePos: startPos,
          currentPos: startPos
        });
      }
    }
  };

  const handlePortMouseUp = (e: React.MouseEvent, nodeId: string, type: 'input' | 'output') => {
    e.stopPropagation();
    if (drawingConnection && type === 'input' && drawingConnection.sourceNode !== nodeId) {
      // Create connection
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: drawingConnection.sourceNode,
        to: nodeId
      };
      
      // Prevent duplicates
      const exists = connections.some(c => c.from === newConnection.from && c.to === newConnection.to);
      if (!exists) {
        setConnections(prev => [...prev, newConnection]);
      }
      setDrawingConnection(null);
    } else {
      setDrawingConnection(null);
    }
  };

  // --- Generation ---
  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Find Generator Nodes
    const generatorNodes = nodes.filter(n => n.type === 'generator');
    if (generatorNodes.length === 0) {
      setIsGenerating(false);
      return;
    }

    // For each generator, find its inputs and outputs
    for (const genNode of generatorNodes) {
      // Inputs
      const inputConnections = connections.filter(c => c.to === genNode.id);
      const sourceNodes = inputConnections.map(c => nodes.find(n => n.id === c.from)).filter(Boolean) as Node[];
      
      const referenceImage = sourceNodes.find(n => n.type === 'reference')?.data.image || null;
      const assetImages = sourceNodes.filter(n => n.type === 'asset').map(n => n.data.image).filter(Boolean) as UploadedImage[];
      
      let combinedData: NodeData = { title: 'Combined' };
      sourceNodes.filter(n => n.type === 'prompt' || n.type === 'style').forEach(n => {
        combinedData = { ...combinedData, ...n.data };
      });

      // Outputs (Previews)
      const outputConnections = connections.filter(c => c.from === genNode.id);
      const targetNodes = outputConnections.map(c => nodes.find(n => n.id === c.to)).filter(Boolean) as Node[];
      
      // Update previews to loading
      targetNodes.forEach(n => updateNodeData(n.id, { result: null, error: null }));

      try {
        let analysis = null;
        if (referenceImage) {
          analysis = await geminiService.analyzeReferenceStyle(referenceImage.base64, referenceImage.mimeType);
        }

        const result = await geminiService.generateDesign(
          combinedData,
          referenceImage,
          assetImages,
          analysis
        );

        targetNodes.forEach(n => updateNodeData(n.id, { result }));
        
        // Auto-create preview if none exists but generator was run
        if (targetNodes.length === 0) {
           const prevId = `preview-${Date.now()}`;
           const newPreview: Node = {
               id: prevId, type: 'preview', position: { x: genNode.position.x + 400, y: genNode.position.y }, 
               data: { title: t(lang, 'nodes.preview'), result } 
           };
           setNodes(prev => [...prev, newPreview]);
           setConnections(prev => [...prev, { id: `conn-auto-${Date.now()}`, from: genNode.id, to: prevId }]);
        }

      } catch (e: any) {
        console.error(e);
        const msg = e.message || "Failed";
        targetNodes.forEach(n => updateNodeData(n.id, { error: msg }));
      }
    }
    
    setIsGenerating(false);
  };

  // --- Canvas Interaction ---
  const screenToWorld = (x: number, y: number) => ({
    x: (x - offset.x) / zoom,
    y: (y - offset.y) / zoom
  });

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      if (contextMenu) setContextMenu(null);
      setIsDraggingCanvas(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsDraggingNode(id);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Calculate world delta
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    setLastMousePos({ x: e.clientX, y: e.clientY });

    // Dragging Connection Line
    if (drawingConnection) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setDrawingConnection(prev => prev ? { ...prev, currentPos: worldPos } : null);
    }

    // Dragging Node
    if (isDraggingNode) {
      setNodes(prev => prev.map(n => {
        if (n.id === isDraggingNode) {
          return {
            ...n,
            position: {
              x: n.position.x + deltaX / zoom,
              y: n.position.y + deltaY / zoom
            }
          };
        }
        return n;
      }));
    } 
    // Dragging Canvas
    else if (isDraggingCanvas) {
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
  }, [isDraggingNode, isDraggingCanvas, lastMousePos, zoom, drawingConnection, offset]);

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setIsDraggingNode(null);
    setDrawingConnection(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const scaleFactor = 0.001;
    const newZoom = Math.max(0.1, Math.min(3, zoom - e.deltaY * scaleFactor));
    setZoom(newZoom);
  };

  return (
    <div 
      className="w-screen h-screen overflow-hidden bg-background relative cursor-grab active:cursor-grabbing select-none"
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      ref={containerRef}
    >
      <Background offset={offset} zoom={zoom} />

      <div 
        className="absolute top-0 left-0 w-full h-full origin-top-left"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
      >
        {/* Render Saved Connections */}
        {connections.map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          const fromDims = nodeDimensions[fromNode.id] || { w: 250, h: 100 };
          const toDims = nodeDimensions[toNode.id] || { w: 250, h: 100 };

          const start = {
            x: fromNode.position.x + fromDims.w,
            y: fromNode.position.y + fromDims.h / 2
          };
          const end = {
            x: toNode.position.x,
            y: toNode.position.y + toDims.h / 2
          };

          return (
            <div key={conn.id} onDoubleClick={() => setConnections(prev => prev.filter(c => c.id !== conn.id))}>
              <ConnectionLine start={start} end={end} color="#7b61ff" />
            </div>
          );
        })}

        {/* Render Active Drawing Connection */}
        {drawingConnection && (
          <ConnectionLine 
            start={drawingConnection.sourcePos} 
            end={drawingConnection.currentPos} 
            color="#00f5d4" 
          />
        )}

        {/* Render Nodes */}
        {nodes.map(node => (
          <NodeWrapper 
            key={node.id} 
            node={node} 
            isSelected={false}
            onMouseDown={handleNodeMouseDown}
            onClose={() => deleteNode(node.id)}
            title={t(lang, `nodes.${node.type}`)}
            onPortMouseDown={handlePortMouseDown}
            onPortMouseUp={handlePortMouseUp}
            onResize={handleNodeResize}
          >
            {node.type === 'reference' && (
              <ReferenceNode 
                node={node} 
                onChange={(d) => updateNodeData(node.id, d)}
                lang={lang} 
              />
            )}
            {node.type === 'asset' && (
              <AssetNode 
                node={node}
                onChange={(d) => updateNodeData(node.id, d)}
                lang={lang}
              />
            )}
            {node.type === 'prompt' && (
              <PromptNode 
                node={node}
                onChange={(d) => updateNodeData(node.id, d)}
                lang={lang}
              />
            )}
            {node.type === 'style' && (
              <StyleNode 
                node={node}
                onChange={(d) => updateNodeData(node.id, d)}
                lang={lang}
              />
            )}
            {node.type === 'generator' && (
              <GeneratorNode 
                onRun={handleGenerate}
                isGenerating={isGenerating}
                hasKey={hasKey}
                onSelectKey={handleSelectKey}
                isValid={true}
                lang={lang}
              />
            )}
            {node.type === 'preview' && (
              <PreviewNode 
                node={node}
                lang={lang}
              />
            )}
          </NodeWrapper>
        ))}
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none">
        <h1 className="font-display font-bold text-2xl text-white/50">DesignGen Flow</h1>
        <p className="text-xs text-white/30">Right click to add nodes. Drag ports to connect.</p>
      </div>
      
      <div className="absolute top-4 right-4 z-50 flex gap-2 pointer-events-auto">
        <button 
          onClick={() => setLang(l => l === 'en' ? 'ru' : 'en')}
          className="bg-card border border-gray-700 px-3 py-1 rounded text-xs text-white uppercase font-bold hover:bg-white/10"
        >
          {lang}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 z-50 flex gap-2 pointer-events-auto">
         <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="bg-card border border-gray-700 p-2 rounded hover:bg-white/10 text-white">+</button>
         <button onClick={() => setZoom(1)} className="bg-card border border-gray-700 p-2 rounded hover:bg-white/10 text-white text-xs">100%</button>
         <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="bg-card border border-gray-700 p-2 rounded hover:bg-white/10 text-white">-</button>
      </div>

      {contextMenu && (
        <ContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          onSelect={(type) => {
            const pos = screenToWorld(contextMenu.x, contextMenu.y);
            addNode(type, pos.x, pos.y);
          }}
          onClose={() => setContextMenu(null)}
          lang={lang}
        />
      )}
    </div>
  );
}
