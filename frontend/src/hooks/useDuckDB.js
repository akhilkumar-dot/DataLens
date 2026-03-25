import { useState, useRef, useCallback } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';

export default function useDuckDB() {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dbRef = useRef(null);
  const connRef = useRef(null);

  const initDB = useCallback(async (csvData) => {
    if (dbRef.current) {
      // If already initialized, we might want to drop the old table and recreate it
      try {
        await connRef.current.query('DROP TABLE IF EXISTS data');
        await dbRef.current.registerFileText('data.csv', csvData);
        await connRef.current.query(`CREATE TABLE data AS SELECT * FROM read_csv_auto('data.csv')`);
        return true;
      } catch (e) {
        console.error("Error reloading DuckDB table:", e);
        setError("Failed to load new data into SQL engine.");
        return false;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
      
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker}");`], {
          type: 'text/javascript'
        })
      );
      
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      
      if (csvData) {
        await db.registerFileText('data.csv', csvData);
      }
      
      const conn = await db.connect();
      
      if (csvData) {
        await conn.query(`CREATE TABLE data AS SELECT * FROM read_csv_auto('data.csv')`);
      }

      dbRef.current = db;
      connRef.current = conn;
      setIsReady(true);
      return true;
    } catch (err) {
      console.error('Failed to initialize DuckDB:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runQuery = useCallback(async (queryStr) => {
    if (!connRef.current) {
      throw new Error("DuckDB is not initialized");
    }
    
    try {
      const result = await connRef.current.query(queryStr);
      // Convert Arrow Table to standard array of objects
      return result.toArray().map(row => row.toJSON());
    } catch (err) {
      console.error("SQL Error:", err);
      throw err;
    }
  }, []);

  return { isReady, isLoading, error, initDB, runQuery };
}
