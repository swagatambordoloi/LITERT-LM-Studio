# ⚡ LiteRT-LM Studio

A premium, glassmorphic desktop orchestrator built with **Tauri v2**, **Rust**, and **React** designed to visually track, validate, and compile complex multi-modal machine learning containers into unified asset binaries without cross-platform syntax errors.

---

## 🧭 Why This Was Built (The Motivation)

When developing local or on-device AI pipelines, compiling heterogeneous assets (like high-performance tokenizers, core text execution slices, and multi-modal sub-graphs) into specialized production runtimes requires executing intricate lower-level compiler toolchains. 

Traditionally, engineers are forced to handle raw layout configurations manually, leading to prominent friction points:
* **System Path Syntax Violations:** When system tools execute string pathways on Windows, standard cross-platform libraries frequently inject relative path slashes or formatting errors, throwing downstream compiler crashes like `OSError [Errno 22]`.
* **Sub-Graph Layout Blindness:** Building multi-modal pipelines (incorporating text embeddings, vision encoders, or audio adapters) means mapping dozens of distinct model variants into rigid layout arrays. Doing this inside a command line lacks instant layout feedback, running the risk of misaligning tensor dimensions.

**LiteRT-LM Studio** solves this by establishing a **mechanically honest** layer between your file system and the binary builder. It couples a direct, localized backend system architecture with a real-time reactive workspace interface.

---

## 💎 Why It Is Useful (Core Value Proposition)

### 1. Directory-Scoped Compilation (Zero Path Mutations)
Instead of relying on unstable global system parameters or volatile environmental string parsing, the Rust backend (`src-tauri/src/lib.rs`) forces execution contexts to switch directory layers cleanly using `.current_dir()`. This permanently isolates execution logic inside your active folder workspace, safeguarding your asset builds against pathing errors.

### 2. Automated 12-Section Directory Packer
The app implements an automated directory scanner that immediately identifies file targets matching standard architecture signatures (e.g., standard text tokenizers, embedding weights, audio encoders, and vision adapter layers). It builds out the exact TOML infrastructure required by the compiler on the fly, eliminating human configuration mistakes.

### 3. Dynamic TOML Live-Preview Deck
As you interact with your models, the interface continuously updates a structured system array featuring strict configuration formatting—ensuring that parameters like performance-critical `prefer_activation_type = "fp16"` flags are properly configured before compilation begins.

---

## ✨ Features
* **Obsidian Dev Deck:** A low-latency, UI built for maximum scannability and structural monitoring.
* **Dual-Installer Packaging:** Configured to compile into both a native Windows setup installer (`.msi`) and a standalone, zero-installation setup executable (`.exe`).
* **Rust Native Layer Integration:** Implements low-latency backend bridges via direct Tauri IPC commands for robust file write and terminal execution routines.

---

## 🛠️ Architecture
* **Frontend:** React 18, Tailwind CSS (Obsidian high-contrast color palette)
* **Backend:** Tauri v2, Rust (`std::process::Command` current-dir execution wrappers)
* **Configuration Sync:** Real-time TOML metadata assembly matching down to specified target layers:
  ```toml
  [system_metadata]
  entries = [
    { key = "model_name", value_type = "String", value = "your-model-name" },
    { key = "author", value_type = "String", value = "LiteRT-LM Studio User" }
  ]
  ```
  ## 🚀 Quick Start
## Prerequisites
* Before compilation, ensure your local environment has the underlying compiler utilities accessible via your system paths:

* Python 3.11+

* litert-lm-builder utility accessible via global terminal configurations.

* Node.js & the standard Rust toolchain.

## Development Workflow
1. Clone the repository:
```bash
git clone [https://github.com/swagatambordoloi/LITERT-LM-Studio.git](https://github.com/swagatambordoloi/LITERT-LM-Studio.git)
cd LITERT-LM-Studio
```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Initialize the live development environment:
   ```bash
   npm run tauri dev
   ```
   ## Assembling Production Binary Installers
   To build your optimized, standalone production .exe and .msi installers, execute the compilation pipeline:
   ```PowerShell
   npm run tauri build
   ```
   Once complete, your production binaries will be ready inside:
   ```
   src-tauri/target/x86_64-pc-windows-msvc/release/bundle/
   ```
