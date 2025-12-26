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
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      <Navigation />

      <main className="py-4" style={{ marginLeft: '250px', padding: '2rem' }}>
        <h2 className="mb-4 fw-bold">Import Expenses</h2>

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <p className="text-muted mb-4">
              Upload an Excel (.xlsx) or CSV file with columns:<br/>
              <strong>date | amount | description | merchant</strong><br/>
              <small>Example: 2025-12-25 | 500 | Grocery Shopping | Walmart</small>
            </p>
            
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleFileChange}
              className="form-control mb-3"
            />

            {file && <p className="text-primary mb-3">Selected: {file.name}</p>}

            {!previewData && (
              <button 
                onClick={handlePreview} 
                disabled={!file || loading}
                className="btn btn-primary"
                style={{ backgroundColor: '#667eea', borderColor: '#667eea' }}
              >
                {loading ? 'Analyzing...' : 'Preview Import'}
              </button>
            )}

            {error && <p className="text-danger mt-3">{error}</p>}

            {previewData && (
              <div className="mt-4 p-3 bg-light rounded border">
                <h3 className="mb-3">📋 Import Preview</h3>
              
              <div className="d-flex gap-3 mb-4 flex-wrap">
                <div className="flex-fill text-center p-3 rounded" style={{ backgroundColor: '#d4edda', color: '#155724', minWidth: '120px' }}>
                  <strong>{previewData.valid.length}</strong> Valid
                </div>
                <div className="flex-fill text-center p-3 rounded" style={{ backgroundColor: '#f8d7da', color: '#721c24', minWidth: '120px' }}>
                  <strong>{previewData.invalid.length}</strong> Invalid
                </div>
                <div className="flex-fill text-center p-3 rounded" style={{ backgroundColor: '#d1ecf1', color: '#0c5460', minWidth: '120px' }}>
                  <strong>{previewData.totalRows}</strong> Total
                </div>
              </div>

              {previewData.valid.length > 0 && (
                <details open className="mb-3 border rounded p-2 bg-white">
                  <summary className="cursor-pointer fw-semibold text-success p-1" style={{ cursor: 'pointer' }}>
                    ✅ Valid Transactions ({previewData.valid.length}) - Will be imported
                  </summary>
                  <div className="mt-3" style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead className="table-light position-sticky" style={{ top: 0 }}>
                        <tr>
                          <th>Row</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Merchant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.valid.slice(0, 10).map((t: any, idx: number) => (
                          <tr key={idx}>
                            <td>{t.rowIndex}</td>
                            <td>{t.date}</td>
                            <td>₹{t.amount}</td>
                            <td>{t.description}</td>
                            <td>{t.merchant || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.valid.length > 10 && (
                      <p className="text-center mt-2 text-muted small">
                        ... and {previewData.valid.length - 10} more
                      </p>
                    )}
                  </div>
                </details>
              )}

              {previewData.invalid.length > 0 && (
                <details className="mb-3 border rounded p-2 bg-white">
                  <summary className="cursor-pointer fw-semibold text-danger p-1" style={{ cursor: 'pointer' }}>
                    ❌ Invalid Transactions ({previewData.invalid.length}) - Will be skipped
                  </summary>
                  <div className="mt-3" style={{ maxHeight: '300px', overflowY: 'auto', overflowX: 'auto' }}>
                    <table className="table table-sm table-hover">
                      <thead className="table-light position-sticky" style={{ top: 0 }}>
                        <tr>
                          <th>Row</th>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.invalid.map((t: any, idx: number) => (
                          <tr key={idx}>
                            <td>{t.rowIndex}</td>
                            <td>{t.date || '-'}</td>
                            <td>{t.amount || '-'}</td>
                            <td>{t.description || '-'}</td>
                            <td className="text-danger">{t.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}

              <div className="d-flex gap-3 mt-4 justify-content-center">
                <button 
                  onClick={handleConfirmImport} 
                  disabled={confirming || previewData.valid.length === 0}
                  className="btn btn-success fw-semibold"
                >
                  {confirming ? 'Importing...' : `✓ Confirm & Import ${previewData.valid.length} Transactions`}
                </button>
                <button 
                  onClick={handleCancel} 
                  disabled={confirming}
                  className="btn btn-secondary fw-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-light rounded border">
              <p className="text-success fw-bold mb-2">✅ Import completed!</p>
              <p className="mb-1">Imported: {result.imported || 0}</p>
              <p className="mb-3">Failed: {result.failed || 0}</p>
              {result.errors && result.errors.length > 0 && (
                <details className="mt-3 small">
                  <summary className="cursor-pointer text-danger" style={{ cursor: 'pointer' }}>
                    View failed transactions ({result.errors.length})
                  </summary>
                  <ul className="mt-2 ps-4" style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {result.errors.map((err: any, idx: number) => (
                      <li key={idx} className="mb-1">
                        Row {err.index + 2}: {err.error}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          </div>
        </div>
      </main>
    </div>
  );
}

