import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

function App() {
  const [modelName, setModelName] = useState("my-awesome-model");
  const [tokenizerPath, setTokenizerPath] = useState("");
  
  // Model sub-graph file tracking states
  const [embeddingPath, setEmbeddingPath] = useState("");
  const [prefillPath, setPrefillPath] = useState("");
  const [decodePath, setDecodePath] = useState("");
  
  // Auto-Packer Specific States
  const [dirPath, setDirPath] = useState("");
  const [autoPackStatus, setAutoPackStatus] = useState("");
  
  const [tomlPreview, setTomlPreview] = useState("");

  // Hook into Rust backend invocation layer to automatically recalculate TOML layout updates
  useEffect(() => {
    const fetchToml = async () => {
      try {
        const generated: string = await invoke("generate_toml_preview", {
          modelName,
          tokenizerPath,
          embeddingPath,
          prefillPath,
          decodePath,
        });
        setTomlPreview(generated);
      } catch (error) {
        console.error("Failed to compile layout string:", error);
      }
    };

    fetchToml();
  }, [modelName, tokenizerPath, embeddingPath, prefillPath, decodePath]);

  // Generic system file selection dialog wrapper
  const handleBrowseFile = async (setPath: (path: string) => void, isModel: boolean = true) => {
    try {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: isModel ? "LiteRT Model Segment" : "Tokenizer Model",
            extensions: isModel ? ["tflite"] : ["json", "model", "spiece"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        setPath(selected);
      }
    } catch (error) {
      console.error("Failed to fetch file handle:", error);
    }
  };

  // Triggers manual target location prompts and initiates backend packing processes
  const handlePackModel = async () => {
    if (!tokenizerPath || !embeddingPath || !prefillPath || !decodePath) {
      alert("⚠️ Missing Assets: Please select a path for the Tokenizer and ALL 3 model component layers before packaging.");
      return;
    }

    try {
      const targetFolder = await open({
        multiple: false,
        directory: true, 
      });

      if (!targetFolder || typeof targetFolder !== "string") return;

      alert("Packaging process initiated. Executing compilation engine...");

      const statusResult: string = await invoke("run_pack_process", {
        tomlContent: tomlPreview,
        outputDir: targetFolder,
        tokenizerPath: tokenizerPath, 
      });

      alert(statusResult);
    } catch (error) {
      alert(`Compilation Failure: ${error}`);
    }
  };

  // Triggers auto-discovery compilation for all 12 sensory slices inside a directory
  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: "D:\\litert-test-assets",
      });
      if (selected && typeof selected === "string") {
        setDirPath(selected);
      }
    } catch (err) {
      console.error("Failed to open directory dialog:", err);
    }
  };

  const handleAutoCompile = async () => {
    setAutoPackStatus("Scanning directory and compiling full multi-modal asset container...");
    try {
      const res: string = await invoke("compile_from_directory", { 
        dirPath: dirPath, 
        modelName: modelName,
      });
      setAutoPackStatus(`✨ Success: ${res}`);
    } catch (err) {
      setAutoPackStatus(`❌ Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#e0e0e0] font-sans flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-[#222222] bg-[#161616] px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#0e639c] tracking-wide">LiteRT-LM Studio</h1>
        <span className="text-xs text-zinc-500 font-mono">v1.0.0 (Tauri Ecosystem)</span>
      </header>

      {/* Main Studio Interface Wrapper */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Interactive Input Controls Block */}
        <section className="w-1/2 p-6 border-r border-[#222222] flex flex-col gap-5 overflow-y-auto">
          
          {/* Metadata Block */}
          <div className="bg-[#161616] border border-[#222222] rounded-lg p-4">
            <h2 className="text-xs font-semibold text-[#0e639c] uppercase tracking-wider mb-3">Model Properties</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">Model Identifier String</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-[#202020] border border-[#333333] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#0e639c] text-white"
              />
            </div>
          </div>

          {/* NEW MODULE: Smart Auto-Packer Framework Component Block */}
          <div className="bg-[#161616] border border-[#0e639c]/30 rounded-lg p-4 shadow-md shadow-[#0e639c]/5">
            <h2 className="text-xs font-bold text-[#646cff] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              ⚡ Smart Auto-Packer (Multi-Modal Unified Build)
            </h2>
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
              Select an unpacked segment source directory to seamlessly ingest, track, and map all 12 system slices (including Vision and Audio sub-graphs) to safeguard against execution engine initialization exceptions.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Select unpacked repository path..."
                  value={dirPath}
                  readOnly
                  className="flex-1 bg-[#202020] border border-[#333333] rounded px-3 py-1.5 text-xs text-white font-mono truncate"
                />
                <button
                  onClick={handleSelectDirectory}
                  className="bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#444444] text-xs px-3 rounded transition-colors cursor-pointer text-white"
                >
                  Browse
                </button>
              </div>
              
              <button
                onClick={handleAutoCompile}
                disabled={!dirPath}
                className={`w-full text-xs font-bold py-2 rounded transition-all active:scale-[0.995] ${
                  dirPath 
                    ? "bg-[#646cff] hover:bg-[#535bf2] text-white cursor-pointer" 
                    : "bg-[#252525] text-zinc-600 border border-[#333333] cursor-not-allowed"
                }`}
              >
                Assemble & Compile Full Multi-Modal Asset
              </button>

              {autoPackStatus && (
                <div className="bg-[#0f0f0f] border border-[#222222] rounded p-2 text-[11px] font-mono whitespace-pre-wrap break-all text-zinc-300">
                  <span className="text-[#646cff] font-bold">Status:</span> {autoPackStatus}
                </div>
              )}
            </div>
          </div>

          {/* Tokenizer Picker Block */}
          <div className="bg-[#161616] border border-[#222222] rounded-lg p-4">
            <h2 className="text-xs font-semibold text-[#0e639c] uppercase tracking-wider mb-3">Base Tokenizer (Manual Selection Target)</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">Tokenizer Path (.json / .model / .spiece)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Select path..."
                  value={tokenizerPath}
                  readOnly
                  className="flex-1 bg-[#202020] border border-[#333333] rounded px-3 py-1.5 text-xs text-white font-mono truncate"
                />
                <button
                  onClick={() => handleBrowseFile(setTokenizerPath, false)}
                  className="bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#444444] text-xs px-3 rounded transition-colors cursor-pointer"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>

          {/* Core Architectural Subgraph Component Tracks */}
          <div className="bg-[#161616] border border-[#222222] rounded-lg p-4 flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-[#0e639c] uppercase tracking-wider">Model Components (.tflite layers)</h2>
            
            {/* Embedding Segment Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">1. Embedding Layer</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Select embedding.tflite..."
                  value={embeddingPath}
                  readOnly
                  className="flex-1 bg-[#202020] border border-[#333333] rounded px-3 py-1.5 text-xs text-white font-mono truncate"
                />
                <button 
                  onClick={() => handleBrowseFile(setEmbeddingPath, true)} 
                  className="bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#444444] text-xs px-3 rounded transition-colors cursor-pointer"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Prefill Segment Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">2. Prefill Layer (Context Processing)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Select prefill.tflite..."
                  value={prefillPath}
                  readOnly
                  className="flex-1 bg-[#202020] border border-[#333333] rounded px-3 py-1.5 text-xs text-white font-mono truncate"
                />
                <button 
                  onClick={() => handleBrowseFile(setPrefillPath, true)} 
                  className="bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#444444] text-xs px-3 rounded transition-colors cursor-pointer"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Decode Segment Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400 font-medium">3. Decode Layer (Token Generation)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Select decode.tflite..."
                  value={decodePath}
                  readOnly
                  className="flex-1 bg-[#202020] border border-[#333333] rounded px-3 py-1.5 text-xs text-white font-mono truncate"
                />
                <button 
                  onClick={() => handleBrowseFile(setDecodePath, true)} 
                  className="bg-[#2d2d2d] hover:bg-[#3d3d3d] border border-[#444444] text-xs px-3 rounded transition-colors cursor-pointer"
                >
                  Browse
                </button>
              </div>
            </div>

          </div>

          {/* Action Trigger Button */}
          <button 
            onClick={handlePackModel}
            className="w-full bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm font-bold py-2.5 rounded transition-all shadow-lg active:scale-[0.99] cursor-pointer"
          >
            Compile Partial Pack (.litertlm)
          </button>
        </section>

        {/* Right Live Engine Render Tracking Box */}
        <section className="w-1/2 bg-[#090909] p-6 flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Live manifest configuration view</h2>
          <div className="flex-1 bg-[#121212] border border-[#222222] rounded-lg p-4 font-mono text-xs text-[#85c46c] overflow-auto whitespace-pre-wrap leading-relaxed shadow-inner">
            {tomlPreview || "# Awaiting property initialization configurations..."}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;