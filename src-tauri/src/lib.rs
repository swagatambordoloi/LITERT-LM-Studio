use std::fs;
use std::path::Path;
use std::process::Command;

#[tauri::command]
fn generate_toml_preview(
    model_name: String, 
    tokenizer_path: String,
    embedding_path: String,
    prefill_path: String,
    decode_path: String
) -> String {
    let mut toml = String::new();
    
    // 1. Core Metadata aligned with structural requirements
    toml.push_str("[system_metadata]\n");
    toml.push_str(&format!(
        "entries = [\n  {{ key = \"model_name\", value_type = \"String\", value = \"{}\" }},\n  {{ key = \"author\", value_type = \"String\", value = \"LiteRT-LM Studio User\" }}\n]\n\n", 
        model_name
    ));
    
    // 2. Tokenizer Layer Mapping
    toml.push_str("[[section]]\n");
    if tokenizer_path.ends_with(".json") {
        toml.push_str("section_type = \"HF_Tokenizer\"\n");
    } else {
        toml.push_str("section_type = \"SP_Tokenizer\"\n");
    }
    let clean_tokenizer = tokenizer_path.replace("\\", "/");
    toml.push_str(&format!("data_path = './{}'\n\n", clean_tokenizer));
    
    // 3. Embedder Sub-Graph Layer Mapping
    toml.push_str("[[section]]\n");
    toml.push_str("model_type = \"embedder\"\n");
    toml.push_str("section_type = \"TFLiteModel\"\n");
    let clean_embed = embedding_path.replace("\\", "/");
    toml.push_str(&format!("data_path = './{}'\n\n", clean_embed));
    
    // 4. Execution Core Sequence Slices
    if prefill_path == decode_path {
        toml.push_str("[[section]]\n");
        toml.push_str("additional_metadata = [\n  { key = \"prefer_activation_type\", value_type = \"String\", value = \"fp16\" },\n]\n");
        toml.push_str("model_type = \"prefill_decode\"\n");
        toml.push_str("section_type = \"TFLiteModel\"\n");
        let clean_prefill = prefill_path.replace("\\", "/");
        toml.push_str(&format!("data_path = './{}'\n", clean_prefill));
    } else {
        toml.push_str("[[section]]\n");
        toml.push_str("additional_metadata = [\n  { key = \"prefer_activation_type\", value_type = \"String\", value = \"fp16\" },\n]\n");
        toml.push_str("model_type = \"prefill\"\n");
        toml.push_str("section_type = \"TFLiteModel\"\n");
        let clean_prefill = prefill_path.replace("\\", "/");
        toml.push_str(&format!("data_path = './{}'\n\n", clean_prefill));
        
        toml.push_str("[[section]]\n");
        toml.push_str("additional_metadata = [\n  { key = \"prefer_activation_type\", value_type = \"String\", value = \"fp16\" },\n]\n");
        toml.push_str("model_type = \"decode\"\n");
        toml.push_str("section_type = \"TFLiteModel\"\n");
        let clean_decode = decode_path.replace("\\", "/");
        toml.push_str(&format!("data_path = './{}'\n", clean_decode));
    }
    
    toml
}

#[tauri::command]
fn compile_from_directory(dir_path: String, model_name: String) -> Result<String, String> {
    let base_path = Path::new(&dir_path);
    if !base_path.exists() {
        return Err("The specified directory does not exist.".to_string());
    }

    let mut toml = String::new();
    
    toml.push_str("[system_metadata]\n");
    toml.push_str(&format!(
        "entries = [\n  {{ key = \"model_name\", value_type = \"String\", value = \"{}\" }},\n  {{ key = \"author\", value_type = \"String\", value = \"LiteRT-LM Studio User\" }}\n]\n\n", 
        model_name
    ));

    let sections = vec![
        ("LlmMetadata", "LlmMetadataProto.pbtext", ""),
        ("SP_Tokenizer", "Section1_SP_Tokenizer.spiece", ""),
        ("TFLiteModel", "Section2_TFLiteModel_tf_lite_embedder.tflite", "embedder"),
        ("TFLiteModel", "Section3_TFLiteModel_tf_lite_per_layer_embedder.tflite", "per_layer_embedder"),
        ("TFLiteModel", "Section4_TFLiteModel_tf_lite_audio_encoder_hw.tflite", "audio_encoder_hw"),
        ("TFLiteModel", "Section5_TFLiteModel_tf_lite_audio_adapter.tflite", "audio_adapter"),
        ("TFLiteModel", "Section6_TFLiteModel_tf_lite_end_of_audio.tflite", "end_of_audio"),
        ("TFLiteModel", "Section7_TFLiteModel_tf_lite_vision_encoder.tflite", "vision_encoder"),
        ("TFLiteModel", "Section8_TFLiteModel_tf_lite_vision_adapter.tflite", "vision_adapter"),
        ("TFLiteModel", "Section9_TFLiteModel_tf_lite_end_of_vision.tflite", "end_of_vision"),
        ("TFLiteModel", "Section10_TFLiteModel_tf_lite_prefill_decode.tflite", "prefill_decode"),
        ("TFLiteModel", "Section11_TFLiteModel_tf_lite_mtp_drafter.tflite", "mtp_drafter"),
    ];

    for (sec_type, file_name, model_type) in sections {
        let full_file_path = base_path.join(file_name);
        if full_file_path.exists() {
            toml.push_str("[[section]]\n");
            
            if model_type == "vision_encoder" || model_type == "prefill_decode" || model_type == "prefill" || model_type == "decode" {
                toml.push_str("additional_metadata = [\n  { key = \"prefer_activation_type\", value_type = \"String\", value = \"fp16\" },\n]\n");
            }
            
            if !model_type.is_empty() {
                toml.push_str(&format!("model_type = \"{}\"\n", model_type));
            }
            toml.push_str(&format!("section_type = \"{}\"\n", sec_type));
            toml.push_str(&format!("data_path = \"./{}\"\n\n", file_name));
        }
    }

    let config_path = base_path.join("temp_config.toml");
    fs::write(&config_path, toml).map_err(|e| e.to_string())?;

    let exe_path = "C:\\Users\\admin\\AppData\\Roaming\\Python\\Python311\\Scripts\\litert-lm-builder.exe";
    
    let output = Command::new(exe_path)
        .current_dir(base_path)
        .arg("toml")
        .arg("--path")
        .arg("./temp_config.toml")
        .arg("output")
        .arg("--path")
        .arg("./model.litertlm")
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(format!("Successfully built full multi-modal container inside workspace folder as model.litertlm"))
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        },
        Err(e) => Err(format!("Failed to execute builder tool: {}", e.to_string()))
    }
}

#[tauri::command]
fn run_pack_process(toml_content: String, output_dir: String, _tokenizer_path: String) -> Result<String, String> {
    let base_path = Path::new(&output_dir);
    if !base_path.exists() {
        return Err("The specified output directory does not exist.".to_string());
    }

    let config_path = base_path.join("temp_config.toml");
    fs::write(&config_path, toml_content).map_err(|e| e.to_string())?;

    let exe_path = "C:\\Users\\admin\\AppData\\Roaming\\Python\\Python311\\Scripts\\litert-lm-builder.exe";

    let output = Command::new(exe_path)
        .current_dir(base_path)
        .arg("toml")
        .arg("--path")
        .arg("./temp_config.toml")
        .arg("output")
        .arg("--path")
        .arg("./model.litertlm")
        .output();

    match output {
        Ok(out) => {
            if out.status.success() {
                Ok(format!("Successfully built binary container as model.litertlm"))
            } else {
                Err(String::from_utf8_lossy(&out.stderr).to_string())
            }
        },
        Err(e) => Err(format!("Failed to execute builder tool: {}", e.to_string()))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init()) 
        .invoke_handler(tauri::generate_handler![generate_toml_preview, run_pack_process, compile_from_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}