import React, { useState } from 'react';
import { importAPI } from '../api';
import Navigation from '../components/Navigation';
import * as XLSX from 'xlsx';

export default function Import() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const [confirming, setConfirming] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
      setPreviewData(null);
    }
  };

  const handlePreview = async () => {
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

      // Parse and categorize transactions
      const valid: any[] = [];
      const invalid: any[] = [];

      data.forEach((row: any, index: number) => {
        const date = row.date || row.Date || row.DATE || '';
        const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || 0);
        const description = row.description || row.Description || row.DESCRIPTION || '';
        const merchant = row.merchant || row.Merchant || row.MERCHANT || '';
        
        const transaction = { date, amount, description, merchant, rowIndex: index + 2 };

        if (!date || isNaN(amount) || amount <= 0 || !description) {
          invalid.push({ ...transaction, reason: !date ? 'Missing date' : isNaN(amount) ? 'Invalid amount' : amount <= 0 ? 'Amount must be positive' : 'Missing description' });
        } else {
          valid.push(transaction);
        }
      });

      setPreviewData({ valid, invalid, totalRows: data.length });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || previewData.valid.length === 0) {
      setError('No valid transactions to import');
      return;
    }

    setConfirming(true);
    setError('');

    try {
      const transactions = previewData.valid.map((t: any) => ({
        date: t.date,
        amount: t.amount,
        description: t.description,
        merchant: t.merchant
      }));

      const response: any = await importAPI.importExpenses(transactions);
      setResult(response.data || response);
      setPreviewData(null);
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = () => {
    setPreviewData(null);
    setFile(null);
    setError('');
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

          {!previewData && (
            <button 
              onClick={handlePreview} 
              disabled={!file || loading}
              style={{...styles.button, opacity: (!file || loading) ? 0.5 : 1}}
            >
              {loading ? 'Analyzing...' : 'Preview Import'}
            </button>
          )}

          {error && <p style={styles.error}>{error}</p>}

          {previewData && (
            <div style={styles.previewContainer}>
              <h3 style={styles.previewTitle}>📋 Import Preview</h3>
              
              <div style={styles.summary}>
                <div style={{...styles.summaryItem, backgroundColor: '#d4edda', color: '#155724'}}>
                  <strong>{previewData.valid.length}</strong> Valid
                </div>
                <div style={{...styles.summaryItem, backgroundColor: '#f8d7da', color: '#721c24'}}>
                  <strong>{previewData.invalid.length}</strong> Invalid
                </div>
                <div style={{...styles.summaryItem, backgroundColor: '#d1ecf1', color: '#0c5460'}}>
                  <strong>{previewData.totalRows}</strong> Total
                </div>
              </div>

              {previewData.valid.length > 0 && (
                <details open style={styles.detailsSection}>
                  <summary style={{...styles.detailsSummary, color: '#28a745'}}>
                    ✅ Valid Transactions ({previewData.valid.length}) - Will be imported
                  </summary>
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Row</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}>Description</th>
                          <th style={styles.th}>Merchant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.valid.slice(0, 10).map((t: any, idx: number) => (
                          <tr key={idx}>
                            <td style={styles.td}>{t.rowIndex}</td>
                            <td style={styles.td}>{t.date}</td>
                            <td style={styles.td}>₹{t.amount}</td>
                            <td style={styles.td}>{t.description}</td>
                            <td style={styles.td}>{t.merchant || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.valid.length > 10 && (
                      <p style={{textAlign: 'center', marginTop: '10px', fontSize: '14px', color: '#6c757d'}}>
                        ... and {previewData.valid.length - 10} more
                      </p>
                    )}
                  </div>
                </details>
              )}

              {previewData.invalid.length > 0 && (
                <details style={styles.detailsSection}>
                  <summary style={{...styles.detailsSummary, color: '#dc3545'}}>
                    ❌ Invalid Transactions ({previewData.invalid.length}) - Will be skipped
                  </summary>
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Row</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Amount</th>
                          <th style={styles.th}>Description</th>
                          <th style={styles.th}>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.invalid.map((t: any, idx: number) => (
                          <tr key={idx}>
                            <td style={styles.td}>{t.rowIndex}</td>
                            <td style={styles.td}>{t.date || '-'}</td>
                            <td style={styles.td}>{t.amount || '-'}</td>
                            <td style={styles.td}>{t.description || '-'}</td>
                            <td style={{...styles.td, color: '#dc3545'}}>{t.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              <div style={styles.actionButtons}>
                <button 
                  onClick={handleConfirmImport} 
                  disabled={confirming || previewData.valid.length === 0}
                  style={{...styles.confirmButton, opacity: (confirming || previewData.valid.length === 0) ? 0.5 : 1}}
                >
                  {confirming ? 'Importing...' : `✓ Confirm & Import ${previewData.valid.length} Transactions`}
                </button>
                <button 
                  onClick={handleCancel} 
                  disabled={confirming}
                  style={{...styles.cancelButton, opacity: confirming ? 0.5 : 1}}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {result && (
            <div style={styles.result}>
              <p style={styles.success}>✅ Import completed!</p>
              <p>Imported: {result.imported || 0}</p>
              <p>Failed: {result.failed || 0}</p>
              {result.errors && result.errors.length > 0 && (
                <details style={{ marginTop: '10px', fontSize: '14px' }}>
                  <summary style={{ cursor: 'pointer', color: '#dc3545' }}>
                    View failed transactions ({result.errors.length})
                  </summary>
                  <ul style={{ marginTop: '10px', paddingLeft: '20px', maxHeight: '200px', overflow: 'auto' }}>
                    {result.errors.map((err: any, idx: number) => (
                      <li key={idx} style={{ marginBottom: '5px' }}>
                        Row {err.index + 2}: {err.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
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
    background: '#f8f9fa',
  },
  main: {
    marginLeft: '250px',
    padding: '2rem',
  },
  pageTitle: {
    marginBottom: '30px',
    color: '#333',
    fontWeight: 'bold',
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
  previewContainer: {
    marginTop: '30px',
    padding: '20px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
  },
  previewTitle: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '20px',
  },
  summary: {
    display: 'flex',
    gap: '15px',
    marginBottom: '25px',
    flexWrap: 'wrap' as 'wrap',
  },
  summaryItem: {
    flex: '1',
    minWidth: '120px',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center' as 'center',
    fontSize: '14px',
  },
  detailsSection: {
    marginBottom: '20px',
    border: '1px solid #dee2e6',
    borderRadius: '5px',
    padding: '10px',
    background: 'white',
  },
  detailsSummary: {
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    padding: '5px',
  },
  tableContainer: {
    marginTop: '15px',
    overflowX: 'auto' as 'auto',
    maxHeight: '300px',
    overflowY: 'auto' as 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
    fontSize: '14px',
  },
  th: {
    padding: '10px',
    background: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    textAlign: 'left' as 'left',
    fontWeight: '600',
    position: 'sticky' as 'sticky',
    top: 0,
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #dee2e6',
  },
  actionButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '25px',
    justifyContent: 'center',
  },
  confirmButton: {
    padding: '12px 30px',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  },
  cancelButton: {
    padding: '12px 30px',
    background: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  },
};
