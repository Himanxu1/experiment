import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { Sandbox } from '@e2b/code-interpreter';
import xlsx from 'xlsx';

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

// Analyze uploaded file
router.post('/', upload.single('file'), async (req, res) => {
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
      // Return basic analysis without e2b
      return res.json({
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
        note: 'E2B_API_KEY not set - showing basic statistics only'
      });
    }

    try {
      // Create e2b sandbox
      console.log('Creating e2b sandbox...');
      sandbox = await Sandbox.create();
      console.log('✅ Sandbox created successfully');

      // Upload file to sandbox
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `data${fileExtension}`;
      await sandbox.files.write(fileName, req.file.buffer);
      console.log(`✅ File uploaded to sandbox: ${fileName}`);

      // Determine file reading method based on extension
      let readCommand = '';
      if (fileExtension === '.csv') {
        readCommand = `df = pd.read_csv('${fileName}')`;
      } else {
        readCommand = `df = pd.read_excel('${fileName}')`;
      }

      // Python code for advanced analysis and visualization
      const analysisCode = `
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import json
import numpy as np

# Read the file
${readCommand}

# Get basic info
info = {
    'shape': list(df.shape),
    'columns': df.columns.tolist(),
    'dtypes': {str(k): str(v) for k, v in df.dtypes.to_dict().items()},
    'missing_values': {str(k): int(v) for k, v in df.isnull().sum().to_dict().items()},
    'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist()
}

# Statistical summary
numeric_df = df.select_dtypes(include=[np.number])
if not numeric_df.empty:
    stats_summary = {str(k): {str(k2): float(v2) if not pd.isna(v2) else None
                     for k2, v2 in v.items()}
                     for k, v in numeric_df.describe().to_dict().items()}
else:
    stats_summary = {}

# Correlation matrix
correlation = {}
if len(numeric_df.columns) > 1:
    corr_matrix = numeric_df.corr()
    correlation = {str(k): {str(k2): float(v2) if not pd.isna(v2) else None
                   for k2, v2 in v.items()}
                   for k, v in corr_matrix.to_dict().items()}

# Create visualizations
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle('Data Analysis Dashboard', fontsize=16)

# 1. Bar chart of first numeric column
if len(numeric_df.columns) > 0:
    col = numeric_df.columns[0]
    data_subset = numeric_df[col].dropna().head(20)
    axes[0, 0].bar(range(len(data_subset)), data_subset)
    axes[0, 0].set_title(f'{col} - Bar Chart')
    axes[0, 0].set_xlabel('Index')
    axes[0, 0].set_ylabel(col)

# 2. Line chart
if len(numeric_df.columns) > 0:
    for col in numeric_df.columns[:3]:
        data_subset = numeric_df[col].dropna().head(50)
        axes[0, 1].plot(data_subset, label=col)
    axes[0, 1].set_title('Line Chart - First 3 Numeric Columns')
    axes[0, 1].legend()
    axes[0, 1].set_xlabel('Index')

# 3. Correlation heatmap
if len(numeric_df.columns) > 1:
    sns.heatmap(numeric_df.corr(), annot=True, cmap='coolwarm', center=0,
                ax=axes[1, 0], square=True, linewidths=1)
    axes[1, 0].set_title('Correlation Heatmap')

# 4. Distribution of first column
if len(numeric_df.columns) > 0:
    col = numeric_df.columns[0]
    axes[1, 1].hist(numeric_df[col].dropna(), bins=20, edgecolor='black')
    axes[1, 1].set_title(f'{col} - Distribution')
    axes[1, 1].set_xlabel(col)
    axes[1, 1].set_ylabel('Frequency')

plt.tight_layout()
plt.savefig('analysis_dashboard.png', dpi=100, bbox_inches='tight')
plt.close()

# Print JSON result
result = {
    'info': info,
    'stats': stats_summary,
    'correlation': correlation
}
print(json.dumps(result))
`;

      console.log('Running Python analysis code...');
      const execution = await sandbox.runCode(analysisCode);

      // Check for errors
      if (execution.error) {
        console.error('❌ E2B execution error:', execution.error);
        throw new Error(`E2B execution error: ${execution.error.name} - ${execution.error.value}`);
      }

      console.log('✅ Code executed successfully');

      // Parse JSON output from stdout
      let advancedAnalysis = null;
      if (execution.text) {
        try {
          advancedAnalysis = JSON.parse(execution.text);
          console.log('✅ Parsed analysis results');
        } catch (e) {
          console.error('Failed to parse e2b output:', e);
          console.log('Raw output:', execution.text);
        }
      }

      // Extract charts from results
      const charts = [];
      if (execution.results && execution.results.length > 0) {
        for (let i = 0; i < execution.results.length; i++) {
          const result = execution.results[i];
          if (result.png) {
            charts.push({
              index: i,
              format: 'png',
              data: result.png // Base64 encoded
            });
            console.log(`✅ Chart ${i} extracted`);
          }
        }
      }

      // Kill sandbox
      await sandbox.kill();
      console.log('✅ Sandbox terminated');

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
        advancedAnalysis: advancedAnalysis,
        charts: charts
      });
    } catch (e2bError) {
      console.error('❌ E2B analysis error:', e2bError);
      if (sandbox) {
        try {
          await sandbox.kill();
        } catch (e) {
          console.error('Error killing sandbox:', e);
        }
      }
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
        note: `E2B error: ${e2bError.message} - showing basic statistics only`
      });
    }

  } catch (error) {
    console.error('Analysis error:', error);
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (e) {
        console.error('Error killing sandbox:', e);
      }
    }
    res.status(500).json({
      error: 'Failed to analyze file',
      message: error.message
    });
  }
});

export default router;
