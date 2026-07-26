import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
import { CloudUpload, Description, CheckCircle, InsertDriveFile, Close } from "@mui/icons-material";

export default function UploadSection({ setFile, uploadResume }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setFile(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Box sx={{
            display: "inline-flex", p: 2, borderRadius: 3,
            background: "rgba(108,99,255,0.1)", mb: 2,
          }}>
            <Description sx={{ fontSize: 48, color: "#6C63FF" }} />
          </Box>
        </motion.div>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>
          Upload Your Resume
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: "auto" }}>
          Upload your resume and AI will generate personalized interview questions based on your experience
        </Typography>
      </Box>

      {/* Drop Zone */}
      <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: "center",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
            background: dragOver
              ? "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,255,0.06))"
              : "linear-gradient(135deg, rgba(108,99,255,0.04), rgba(0,212,255,0.02))",
            border: dragOver
              ? "2px solid #6C63FF"
              : "2px dashed rgba(108,99,255,0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,212,255,0.04))",
              borderColor: "rgba(108,99,255,0.4)",
            },
          }}
          onClick={() => document.getElementById("resume-upload-input").click()}
        >
          <input
            id="resume-upload-input"
            type="file"
            hidden
            accept=".pdf,.docx,.doc"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {!selectedFile ? (
            <>
              <motion.div animate={{ y: dragOver ? -4 : 0 }}>
                <CloudUpload sx={{
                  fontSize: 72,
                  color: dragOver ? "#6C63FF" : "rgba(108,99,255,0.4)",
                  mb: 2,
                  transition: "color 0.3s ease",
                }} />
              </motion.div>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}>
                {dragOver ? "Drop your file here" : "Drop your resume here or click to browse"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports PDF, DOCX, DOC &mdash; Max 10MB
              </Typography>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle sx={{ fontSize: 64, color: "#22c55e", mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {formatFileSize(selectedFile.size)} &middot; Resume ready for analysis
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Close />}
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFile(null); }}
                sx={{ borderRadius: 2, borderColor: "rgba(255,255,255,0.1)" }}
              >
                Remove
              </Button>
            </motion.div>
          )}
        </Box>
      </motion.div>

      {/* File Info */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1.5, justifyContent: "center", mb: 3, mt: 2,
          }}>
            <InsertDriveFile sx={{ color: "#6C63FF", fontSize: 20 }} />
            <Typography variant="body2" fontWeight={600}>{selectedFile.name}</Typography>
            <Typography variant="caption" color="text.secondary">({formatFileSize(selectedFile.size)})</Typography>
          </Box>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!selectedFile || uploading}
          onClick={async () => {
            setUploading(true);
            await uploadResume();
            setUploading(false);
          }}
          sx={{
            py: 1.5, fontSize: "1rem", borderRadius: 2,
            background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
            "&:disabled": {
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.2)",
            },
            "&:hover:not(:disabled)": {
              boxShadow: "0 8px 30px rgba(108,99,255,0.4)",
            },
          }}
        >
          <CloudUpload sx={{ mr: 1.5, fontSize: 20 }} />
          {uploading ? "Processing..." : "Analyze Resume & Start Interview"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
