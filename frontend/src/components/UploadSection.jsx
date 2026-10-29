import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Alert, useTheme } from "@mui/material";
import { CloudUpload, Description, InsertDriveFile, Close } from "@mui/icons-material";

export default function UploadSection({ setFile, uploadResume }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    setError("");
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported. Please select a .pdf document.");
      setSelectedFile(null);
      setFile(null);
      return;
    }
    setSelectedFile(file);
    setFile(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUseSampleResume = () => {
    const sampleBlob = new Blob(["%PDF-1.4 Demonstration Resume for CareerPilot AI"], { type: "application/pdf" });
    const dummyFile = new File([sampleBlob], "Sample_Candidate_Resume.pdf", { type: "application/pdf" });
    setSelectedFile(dummyFile);
    setFile(dummyFile);
    setError("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
        <Box sx={{
          display: "inline-flex", p: 1.5, borderRadius: 3,
          bgcolor: isDark ? "rgba(217, 149, 115, 0.15)" : "rgba(185, 111, 80, 0.12)",
          color: "primary.main", mb: 1.5,
        }}>
          <Description sx={{ fontSize: 36 }} />
        </Box>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: "text.primary", fontSize: { xs: "1.6rem", md: "2.1rem" } }}>
          Upload Your Resume
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 460, mx: "auto" }}>
          Upload your PDF resume to analyze your experience and generate tailored technical interview questions.
        </Typography>
      </Box>

      {/* Drop Zone */}
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
          bgcolor: dragOver
            ? (isDark ? "#2B2824" : "#F0EBE4")
            : "background.paper",
          border: dragOver ? "2px solid" : "2px dashed",
          borderColor: dragOver
            ? "primary.main"
            : (isDark ? "#3A352F" : "rgba(185, 111, 80, 0.25)"),
          boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.35)" : "0 2px 12px rgba(51, 44, 40, 0.04)",
          transition: "all 0.22s ease",
          "&:hover": {
            bgcolor: isDark ? "#282522" : "#FDFBF7",
            borderColor: "primary.main",
          },
        }}
        onClick={() => document.getElementById("resume-upload-input").click()}
      >
        <input
          id="resume-upload-input"
          type="file"
          hidden
          accept=".pdf"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {!selectedFile ? (
          <>
            <CloudUpload sx={{
              fontSize: 64,
              color: dragOver ? "primary.main" : (isDark ? "rgba(217, 149, 115, 0.5)" : "rgba(185, 111, 80, 0.4)"),
              mb: 2,
              transition: "color 0.2s ease",
            }} />
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: "text.primary", fontSize: { xs: "1rem", md: "1.15rem" } }}>
              {dragOver ? "Drop your PDF resume here" : "Drag and drop your resume or click to browse"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Supports PDF documents only (Maximum 10 MB)
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                size="medium"
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Choose PDF File
              </Button>
              <Button
                variant="outlined"
                size="medium"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUseSampleResume();
                }}
                sx={{ borderRadius: 2.5, fontWeight: 700 }}
              >
                Use Sample Resume
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2.5,
            borderRadius: 3,
            bgcolor: isDark ? "#2B2824" : "#FAF7F2",
            border: `1px solid ${isDark ? "#3A352F" : "rgba(113, 134, 107, 0.3)"}`,
            maxWidth: 440,
            mx: "auto",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, textAlign: "left" }}>
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(155, 175, 145, 0.2)" : "rgba(113, 134, 107, 0.15)", color: "secondary.main" }}>
                <InsertDriveFile sx={{ fontSize: 24 }} />
              </Box>
              <Box sx={{ overflow: "hidden" }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "text.primary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedFile.name}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {formatFileSize(selectedFile.size)} • PDF Ready
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setFile(null);
              }}
              sx={{ color: "text.secondary", minWidth: 32, p: 0.5, "&:hover": { color: "error.main" } }}
            >
              <Close sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2.5, borderRadius: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Start Button */}
      {selectedFile && (
        <Box sx={{ mt: 3.5, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            disabled={uploading}
            onClick={async () => {
              setUploading(true);
              try {
                await uploadResume();
              } finally {
                setUploading(false);
              }
            }}
            sx={{
              px: 5,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: 2.5,
            }}
          >
            {uploading ? "Analyzing your resume..." : "Start Interview Practice"}
          </Button>
        </Box>
      )}
    </motion.div>
  );
}
