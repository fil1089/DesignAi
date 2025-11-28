import { useEffect, useRef } from 'react';
import './NodeCanvas.css';

export default function ModelNode({ 
  node, 
  onMouseDown, 
  onPortMouseDown, 
  onPortMouseUp,
  onDataChange,
  registerPortPosition,
  onRun,
  isRunning,
  apiKey,
  scale 
}) {
  const promptPortRef = useRef(null);
  const outputPortRef = useRef(null);
  const nodeRef = useRef(null);
  const imagePortRefs = useRef({});

  // Initialize inputs if not present
  useEffect(() => {
    if (!node.data.inputs) {
      onDataChange({ 
        inputs: [{ id: 'image-1', label: 'Image 1' }] 
      });
    }
  }, []);

  const inputs = node.data.inputs || [{ id: 'image-1', label: 'Image 1' }];

  useEffect(() => {
    const updatePortPositions = () => {
      if (nodeRef.current) {
        const nodeRect = nodeRef.current.getBoundingClientRect();
        
        // Register Prompt Port
        if (promptPortRef.current) {
          const portRect = promptPortRef.current.getBoundingClientRect();
          registerPortPosition(node.id, 'prompt', {
            x: node.position.x + (portRect.left - nodeRect.left) / scale + 8,
            y: node.position.y + (portRect.top - nodeRect.top) / scale + 8
          });
        }
        
        // Register Image Input Ports
        inputs.forEach(input => {
          const el = imagePortRefs.current[input.id];
          if (el) {
            const portRect = el.getBoundingClientRect();
            registerPortPosition(node.id, input.id, {
              x: node.position.x + (portRect.left - nodeRect.left) / scale + 8,
              y: node.position.y + (portRect.top - nodeRect.top) / scale + 8
            });
          }
        });
        
        // Register Output Port
        if (outputPortRef.current) {
          const portRect = outputPortRef.current.getBoundingClientRect();
          registerPortPosition(node.id, 'output', {
            x: node.position.x + (portRect.left - nodeRect.left) / scale + 8,
            y: node.position.y + (portRect.top - nodeRect.top) / scale + 8
          });
        }
      }
    };
    // Update immediately and on resize/scroll if needed (managed by parent mostly)
    updatePortPositions();
    
    // Safety timeout for initial render layout shifts
    const to = setTimeout(updatePortPositions, 50);
    return () => clearTimeout(to);
  }, [node.position, node.id, registerPortPosition, scale, inputs]);

  const addImageInput = (e) => {
    e.stopPropagation(); // Prevent drag
    const newId = `image-${inputs.length + 1}-${Date.now()}`;
    onDataChange({
      inputs: [...inputs, { id: newId, label: `Image ${inputs.length + 1}` }]
    });
  };

  return (
    <div 
      ref={nodeRef}
      className="node model-node"
      style={{ 
        left: node.position.x + 5000, 
        top: node.position.y + 5000,
        width: 260
      }}
      onMouseDown={onMouseDown}
    >
      <div className="node-header model-header">
        <span className="node-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {node.data.name || 'Gemini Pro'}
        </span>
        <span className="model-credits">⭐ 5</span>
      </div>
      
      <div className="node-body">
        {/* Prompt Input */}
        <div className="node-ports left" style={{ top: '60px' }}>
          <div className="port-group">
            <div 
              ref={promptPortRef}
              className="node-port input connected"
              onMouseDown={(e) => onPortMouseDown(e, node.id, 'prompt', 'input')}
              onMouseUp={(e) => onPortMouseUp(e, node.id, 'prompt', 'input')}
            />
            <span className="port-label">Prompt*</span>
          </div>
        </div>
        
        {/* Dynamic Image Inputs */}
        <div className="image-inputs-container">
          {inputs.map((input, index) => (
            <div key={input.id} className="node-ports left relative-port">
              <div className="port-group">
                <div 
                  ref={el => imagePortRefs.current[input.id] = el}
                  className="node-port image"
                  onMouseDown={(e) => onPortMouseDown(e, node.id, input.id, 'input')}
                  onMouseUp={(e) => onPortMouseUp(e, node.id, input.id, 'input')}
                />
                <span className="port-label">{input.label}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Output port */}
        <div className="node-ports right" style={{ top: '50%' }}>
          <div className="port-group">
            <span className="port-label">Result</span>
            <div 
              ref={outputPortRef}
              className={`node-port output ${node.data.result ? 'connected' : ''}`}
              onMouseDown={(e) => onPortMouseDown(e, node.id, 'output', 'output')}
              onMouseUp={(e) => onPortMouseUp(e, node.id, 'output', 'output')}
            />
          </div>
        </div>
        
        <div className="node-content model-content">
          <div className="model-preview">
            {node.data.result ? (
              <img 
                src={`data:${node.data.result.mimeType};base64,${node.data.result.data}`}
                alt="Result"
                className="result-image"
              />
            ) : (
              <div className="model-placeholder">
                <div className="checker-pattern"></div>
              </div>
            )}
          </div>
          
          <div className="model-actions">
            <button 
              className="add-input-btn node-content-interactive"
              onClick={addImageInput}
            >
              + Add another Image Input
            </button>
            <button 
              className="run-btn node-content-interactive"
              onClick={onRun}
              disabled={isRunning || !apiKey}
            >
              {isRunning ? (
                <>
                  <span className="spinner"></span>
                  Running...
                </>
              ) : (
                <>
                  → Run Model
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        .model-node {
          border-color: #444;
          min-height: 250px;
        }
        
        .model-header {
          background: linear-gradient(135deg, #2a2a35, #252530);
        }
        
        .model-credits {
          font-size: 0.75rem;
          color: #ffd700;
        }
        
        .model-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px; /* Space for ports */
        }

        .image-inputs-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 40px; /* Offset from prompt */
          margin-bottom: 20px;
        }

        .relative-port {
          position: relative !important;
          left: -22px !important;
          top: auto !important;
          transform: none !important;
        }
        
        .model-preview {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          background: #1e1e24;
          border: 1px solid #3a3a42;
        }
        
        .model-preview .result-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        
        .model-placeholder {
          width: 100%;
          height: 100%;
        }
        
        .model-placeholder .checker-pattern {
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(45deg, #252528 25%, transparent 25%),
            linear-gradient(-45deg, #252528 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #252528 75%),
            linear-gradient(-45deg, transparent 75%, #252528 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
          background-color: #1e1e24;
        }
        
        .model-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .add-input-btn {
          padding: 8px 12px;
          background: transparent;
          border: 1px dashed #444;
          border-radius: 6px;
          color: #666;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .add-input-btn:hover {
          border-color: #7b61ff;
          color: #7b61ff;
        }
        
        .run-btn {
          padding: 10px 16px;
          background: linear-gradient(135deg, #00f5d4, #00d4aa);
          border: none;
          border-radius: 6px;
          color: #0a0a0f;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        
        .run-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(0, 245, 212, 0.3);
        }
        
        .run-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .run-btn .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .port-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .node-ports.left .port-group {
          flex-direction: row;
        }
        
        .node-ports.right .port-group {
          flex-direction: row-reverse;
        }
        
        .node-ports.left .port-label,
        .node-ports.right .port-label {
          position: static;
          transform: none;
        }
      `}</style>
    </div>
  );
}
