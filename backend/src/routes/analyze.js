import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { CodeInterpreter } from '@e2b/code-interpreter';
import xlsx from 'xlsx';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for memory storage (for analysis)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Analyze uploaded file (protected)
router.post('/', protect, upload.single('file'), async (req, res) => {
  let sandbox = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📊 Starting analysis for:', req.file.originalname);

    // Parse Excel file using xlsx library
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Extract headers and data
    const headers = jsonData[0] || [];
    const rows = jsonData.slice(1);

    // Basic statistics
    const numericColumns = [];
    const columnStats = {};

    headers.forEach((header, index) => {
      const columnData = rows.map(row => row[index]).filter(val => val !== undefined && val !== '');
      const numericData = columnData.filter(val => !isNaN(parseFloat(val))).map(val => parseFloat(val));

      if (numericData.length > 0) {
        numericColumns.push({
          name: header,
          index: index
        });

        const sum = numericData.reduce((a, b) => a + b, 0);
        const mean = sum / numericData.length;
        const sorted = [...numericData].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

        columnStats[header] = {
          count: numericData.length,
          sum: sum,
          mean: mean,
          median: median,
          min: Math.min(...numericData),
          max: Math.max(...numericData),
          data: numericData.slice(0, 100) // Limit to first 100 points
        };
      }
    });

    // Use e2b for advanced analysis
    console.log('🔒 Starting e2b sandbox for advanced analysis...');

    if (!process.env.E2B_API_KEY) {
      console.warn('⚠️ E2B_API_KEY not set, skipping advanced analysis');
    } else {
      try {
        sandbox = await CodeInterpreter.create({
          apiKey: process.env.E2B_API_KEY
        });

        // Upload file to sandbox
        const filePath = `data.${path.extname(req.file.originalname)}`;
        await sandbox.files.write(filePath, req.file.buffer);

        // Python code for advanced analysis
        const analysisCode = `
import pandas as pd
import json
import numpy as np

# Read the file
df = pd.read_excel('${filePath}')

# Get basic info
info = {
    'shape': df.shape,
    'columns': df.columns.tolist(),
    'dtypes': df.dtypes.astype(str).to_dict(),
    'missing_values': df.isnull().sum().to_dict(),
    'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist()
}

# Statistical summary
numeric_df = df.select_dtypes(include=[np.number])
stats_summary = numeric_df.describe().to_dict()

# Correlation matrix
correlation = {}
if len(numeric_df.columns) > 1:
    corr_matrix = numeric_df.corr()
    correlation = corr_matrix.to_dict()

# Sample data for charts
chart_data = []
for col in numeric_df.columns[:5]:  # First 5 numeric columns
    chart_data.append({
        'column': col,
        'values': numeric_df[col].dropna().head(50).tolist()
    })

result = {
    'info': info,
    'stats': stats_summary,
    'correlation': correlation,
    'chart_data': chart_data
}

print(json.dumps(result))
`;

        const execution = await sandbox.runPython(analysisCode);

        let advancedAnalysis = null;
        if (execution.text) {
          try {
            advancedAnalysis = JSON.parse(execution.text);
          } catch (e) {
            console.error('Failed to parse e2b output:', e);
          }
        }

        await sandbox.close();

        res.json({
          success: true,
          filename: req.file.originalname,
          sheetName: sheetName,
          dimensions: {
            rows: rows.length,
            columns: headers.length
          },
          headers: headers,
          sampleData: rows.slice(0, 10),
          numericColumns: numericColumns,
          statistics: columnStats,
          advancedAnalysis: advancedAnalysis
        });
      } catch (e2bError) {
        console.error('E2B analysis error:', e2bError);
        // Fall back to basic analysis
        res.json({
          success: true,
          filename: req.file.originalname,
          sheetName: sheetName,
          dimensions: {
            rows: rows.length,
            columns: headers.length
          },
          headers: headers,
          sampleData: rows.slice(0, 10),
          numericColumns: numericColumns,
          statistics: columnStats,
          note: 'Advanced analysis unavailable, showing basic statistics'
        });
      }
    }

    if (!res.headersSent) {
      res.json({
        success: true,
        filename: req.file.originalname,
        sheetName: sheetName,
        dimensions: {
          rows: rows.length,
          columns: headers.length
        },
        headers: headers,
        sampleData: rows.slice(0, 10),
        numericColumns: numericColumns,
        statistics: columnStats
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    if (sandbox) {
      try {
        await sandbox.close();
      } catch (e) {
        console.error('Error closing sandbox:', e);
      }
    }
    res.status(500).json({
      error: 'Failed to analyze file',
      message: error.message
    });
  }
});

export default router;
