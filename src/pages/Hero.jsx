import React, { useState, useEffect, useRef } from 'react';
import '@google/model-viewer';

const Hero = () => {
  const [prompt, setPrompt] = useState('');
  const [generationStatus, setGenerationStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [previewTaskId, setPreviewTaskId] = useState(null);
  const [previewModelUrl, setPreviewModelUrl] = useState(null);
  const [texturedModelUrl, setTexturedModelUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [progress, setProgress] = useState(0);

  const pollingIntervalRef = useRef(null);
  const FLASK_API_BASE_URL = 'http://127.0.0.1:5000';

  const initiate3dGeneration = async () => {
    setLoading(true);
    setErrorMessage(null);
    setGenerationStatus('initiating');
    setTaskId(null);
    setPreviewModelUrl(null);
    setTexturedModelUrl(null);
    setProgress(0);

    if (!prompt.trim()) {
      setErrorMessage('Please enter a prompt.');
      setGenerationStatus('idle');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${FLASK_API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate generation.');

      setTaskId(data.task_id);
      setPreviewTaskId(data.task_id);
      setGenerationStatus('polling');
    } catch (err) {
      setErrorMessage(err.message);
      setGenerationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const initiateRefine = async () => {
    if (!previewTaskId) {
      setErrorMessage('Valid preview_task_id required for refine.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setGenerationStatus('refining');

    try {
      const res = await fetch(`${FLASK_API_BASE_URL}/api/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview_task_id: previewTaskId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refine model.');

      setTaskId(data.task_id);
      setGenerationStatus('polling');
    } catch (err) {
      setErrorMessage(err.message);
      setGenerationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const pollMeshyStatus = async () => {
    if (!taskId) return;

    try {
      const res = await fetch(`${FLASK_API_BASE_URL}/api/status/${taskId}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Status fetch failed.');
        setGenerationStatus('failed');
        clearPolling();
        return;
      }

      const { status, preview_model_url, model_urls, progress } = data;
      setProgress(progress || 0);

      if (status === 'PREVIEW_READY' && preview_model_url && !previewModelUrl) {
        const proxied = `${FLASK_API_BASE_URL}/api/proxy-glb?url=${encodeURIComponent(preview_model_url)}`;
        setPreviewModelUrl(proxied);
        setGenerationStatus('preview_ready');
      } else if (status === 'COMPLETED' && model_urls?.glb) {
        const proxied = `${FLASK_API_BASE_URL}/api/proxy-glb?url=${encodeURIComponent(model_urls.glb)}`;
        setTexturedModelUrl(proxied);
        setGenerationStatus('completed');
        clearPolling();
      } else if (status === 'FAILED') {
        setErrorMessage(data.error || 'Meshy failed.');
        setGenerationStatus('failed');
        clearPolling();
      }
    } catch (err) {
      setErrorMessage('Polling error: ' + err.message);
      setGenerationStatus('failed');
      clearPolling();
    }
  };

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (['polling', 'refining'].includes(generationStatus) && taskId) {
      clearPolling();
      pollMeshyStatus();
      pollingIntervalRef.current = setInterval(pollMeshyStatus, 5000);
    }

    return clearPolling;
  }, [generationStatus, taskId]);

  const modelToDisplay = texturedModelUrl || previewModelUrl;

  return (
    <section className="min-h-screen flex flex-col-reverse md:flex-row items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full md:w-1/2 lg:w-2/5 text-center md:text-left">
        <h1 className="font-playfair text-7xl font-bold text-white mb-4">Your Words, Now Objects!</h1>
        <p className="text-lg text-gray-300 mb-8 font-light z-10">
          Describe any object, and watch it come to life in breathtaking 3D!
        </p>
      </div>

      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col items-center">
        <form className="w-full max-w-md flex flex-col gap-4 mb-4" onSubmit={e => e.preventDefault()}>
          <input type="text" placeholder="e.g., futuristic helmet"
            className="w-full z-122 p-4 border border-gray-700 bg-gray-800 rounded-lg text-lg text-white"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={initiate3dGeneration}
            disabled={loading || !prompt.trim()}
            className={`py-3 rounded-lg font-bold text-xl transition ${
              loading ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
          >
            {loading ? 'Loading...' : 'Generate 3D Model'}
          </button>
        </form>

        {generationStatus === 'preview_ready' && (
          <button
            onClick={initiateRefine}
            disabled={loading}
            className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Refine Model
          </button>
        )}

        {errorMessage && <p className="text-red-400 mt-2">{errorMessage}</p>}

        <div className="h-80 w-full max-w-md mt-2  bg-gray-900 rounded-lg flex items-center justify-center">
          {modelToDisplay ? (
            <model-viewer src={modelToDisplay} ar camera-controls auto-rotate  style={{ width: '100%', height: '100%' }} />
          ) : (
            <p className="text-gray-400 italic">
              {generationStatus === 'completed'
                ? 'Model loaded!'
                : generationStatus === 'failed'
                ? 'Error generating model.'
                : loading
                ? `Generating... (${progress}%)`
                : 'Your 3D model will appear here!'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;