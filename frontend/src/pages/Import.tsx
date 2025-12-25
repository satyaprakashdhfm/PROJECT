import React, { useState } from 'react';
import { importAPI } from '../api';
import Navigation from '../components/Navigation';
import * as XLSX from 'xlsx';

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet);

      if (data.length === 0) {
        setError('No data found in file');
        setLoading(false);
        return;
      }

      // Parse transactions from Excel data
      const transactions = data.map((row: any) => {
        const date = row.date || row.Date || row.DATE || '';
        const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || 0);
        const description = row.description || row.Description || row.DESCRIPTION || 'Imported transaction';
        const merchant = row.merchant || row.Merchant || row.MERCHANT || '';
        
        return { date, amount, description, merchant };
      }).filter((t: any) => t.date && !isNaN(t.amount) && t.amount > 0);

      if (transactions.length === 0) {
        setError('No valid transactions found. Excel should have columns: date, amount, description, merchant');
        setLoading(false);
        return;
      }

      const response: any = await importAPI.importExpenses(transactions);
      // Backend returns {message, data: {imported, failed, expenses}}
      setResult(response.data || response);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Navigation />

      <main style={styles.main}>
        <h2 style={styles.pageTitle}>Import Expenses</h2>

        <div style={styles.card}>
          <p style={styles.info}>
            Upload an Excel (.xlsx) or CSV file with columns:<br/>
            <strong>date | amount | description | merchant</strong><br/>
            <small>Example: 2025-12-25 | 500 | Grocery Shopping | Walmart</small>
          </p>
          
          <input 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            onChange={handleFileChange}
            style={styles.fileInput}
          />

          {file && <p style={styles.fileName}>Selected: {file.name}</p>}

          <button 
            onClick={handleImport} 
            disabled={!file || loading}
            style={{...styles.button, opacity: (!file || loading) ? 0.5 : 1}}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>

          {error && <p style={styles.error}>{error}</p>}

          {result && (
            <div style={styles.result}>
              <p style={styles.success}>✅ Import completed!</p>
              <p>Imported: {result.imported || 0}</p>
              <p>Failed: {result.failed || 0}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  main: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  pageTitle: {
    marginBottom: '30px',
    color: '#333',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  info: {
    color: '#666',
    marginBottom: '20px',
  },
  fileInput: {
    display: 'block',
    marginBottom: '20px',
    padding: '10px',
    width: '100%',
  },
  fileName: {
    color: '#667eea',
    marginBottom: '20px',
  },
  button: {
    padding: '12px 30px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '16px',
  },
  error: {
    color: 'red',
    marginTop: '20px',
  },
  result: {
    marginTop: '20px',
    padding: '20px',
    background: '#f0f9ff',
    borderRadius: '5px',
  },
  success: {
    color: '#059669',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
};
