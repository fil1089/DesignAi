import { useState, useEffect } from 'react';
import Sidebar from './components/nodes/Sidebar';
import NodeCanvas from './components/nodes/NodeCanvas';
import SettingsPanel from './components/nodes/SettingsPanel';
import ApiKeyModal from './components/ApiKeyModal';
import geminiService from './services/geminiService';
import './AppNodes.css';

function AppNodes() {
  const [projectName, setProjectName] = useState('untitled');
  const [apiKey, setApiKey] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [runs, setRuns] = useState(1);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      geminiService.initialize(savedKey);
    }
  }, []);

  // Save API key
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      geminiService.initialize(key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Generate design from Node Graph data
  const handleGenerate = async (data) => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    if (!data?.images || data.images.length === 0) {
      alert('Please connect at least one image input to the model.');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      // Use the new method for graph-based generation
      const generationResult = await geminiService.generateFromGraph(
        data.images,
        data.prompt || 'Create a professional design'
      );

      setResult(generationResult);
    } catch (err) {
      console.error('Generation error:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-nodes">
      <Sidebar 
        projectName={projectName}
        onProjectNameChange={setProjectName}
      />
      
      <main className="main-area">
        <NodeCanvas 
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          result={result}
          apiKey={apiKey}
        />
      </main>
      
      <SettingsPanel 
        onApiKeyClick={() => setShowApiModal(true)}
        apiKey={apiKey}
        onGenerate={() => {
          // Trigger generation via NodeCanvas logic is complex from here without ref
          // For now, the Run button is inside the Model Node
        }}
        isGenerating={isGenerating}
        runs={runs}
        onRunsChange={setRuns}
      />

      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </div>
  );
}

export default AppNodes;
