import { useState } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Chip } from "@mui/material";
import { CloudUpload, Description, CheckCircle } from "@mui/icons-material";

export default function UploadSection({ setFile, uploadResume }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file) => {
    setSelectedFile(file);
    setFile(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Description sx={{ fontSize: 56, color: "#6C63FF", mb: 2 }} />
        </motion.div>
        <Typography variant="h4" fontWeight={800} gutterBottom>Upload Your Resume</Typography>
        <Typography variant="body1" color="text.secondary">
          Upload your PDF resume and AI will generate personalized interview questions
        </Typography>
      </Box>

      <motion.div whileHover={{ scale: 1.01 }}>
        <Box
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          sx={{
            p: 6, borderRadius: 4, textAlign: "center", cursor: "pointer",
            background: dragOver ? "rgba(108,99,255,0.1)" : "rgba(108,99,255,0.05)",
            border: dragOver ? "2px solid #6C63FF" : "2px dashed rgba(108,99,255,0.3)",
            transition: "all 0.3s ease", mb: 3,
            "&:hover": { background: "rgba(108,99,255,0.1)", borderColor: "#6C63FF" },
          }}
          onClick={() => document.getElementById("resume-upload-input").click()}
        >
          <input id="resume-upload-input" type="file" hidden accept=".pdf,.docx,.doc"
            onChange={(e) => handleFile(e.target.files[0])} />
          <CloudUpload sx={{ fontSize: 64, color: "#6C63FF", mb: 2, opacity: 0.6 }} />
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {selectedFile ? selectedFile.name : "Drop your resume here or click to browse"}
          </Typography>
          <Typography variant="body2" color="text.secondary">Supports PDF, DOCX (Max 10MB)</Typography>
        </Box>
      </motion.div>

      {selectedFile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "center", mb: 3 }}>
            <CheckCircle sx={{ color: "#22c55e", fontSize: 20 }} />
            <Chip icon={<Description sx={{ fontSize: 16 }} />} label={selectedFile.name}
              variant="outlined"
              onDelete={() => { setSelectedFile(null); setFile(null); }}
              sx={{ color: "text.secondary", borderColor: "rgba(255,255,255,0.1)" }} />
          </Box>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Button variant="contained" fullWidth size="large" disabled={!selectedFile}
          onClick={uploadResume}
          sx={{ py: 1.5, fontSize: "1rem",
            background: "linear-gradient(135deg, #6C63FF, #00D4FF)",
            "&:disabled": { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" },
          }}>
          <CloudUpload sx={{ mr: 1 }} />
          Analyze Resume & Start Interview
        </Button>
      </motion.div>
    </motion.div>
  );
}
