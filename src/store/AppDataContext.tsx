import * as SplashScreen from 'expo-splash-screen';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { parseAppData } from '@/src/lib/backup';
import { readStoredJson, writeStoredJson } from '@/src/lib/storage';
import { EMPTY_DATA } from '@/src/lib/types';
import type { AppData, Transaction, TransactionInput } from '@/src/lib/types';

const STORAGE_KEY = 'money-tracker:data:v1';

type AppDataContextValue = {
  ready: boolean;
  transactions: Transaction[];
  budgetCents: number | null;
  addTransaction: (input: TransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setBudget: (amountCents: number | null) => Promise<void>;
  replaceData: (data: AppData) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

function makeId(): string {
  return `tx_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [ready, setReady] = useState(false);
  const dataRef = useRef<AppData>(EMPTY_DATA);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const raw = await readStoredJson(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = parseAppData(JSON.parse(raw));
          if (parsed) {
            dataRef.current = parsed;
            setData(parsed);
          }
        }
      } catch (error) {
        console.warn('读取本地数据失败', error);
      } finally {
        if (!cancelled) {
          setReady(true);
          SplashScreen.hideAsync().catch(() => undefined);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const commit = useCallback(async (next: AppData) => {
    await writeStoredJson(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        transactions: next.transactions,
        budgetCents: next.budgetCents,
      })
    );
    dataRef.current = next;
    setData(next);
  }, []);

  const addTransaction = useCallback(
    async (input: TransactionInput) => {
      const transaction: Transaction = {
        ...input,
        id: makeId(),
        createdAt: new Date().toISOString(),
      };
      const current = dataRef.current;
      await commit({
        ...current,
        transactions: [...current.transactions, transaction],
      });
      return transaction;
    },
    [commit]
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionInput) => {
      const current = dataRef.current;
      await commit({
        ...current,
        transactions: current.transactions.map((transaction) =>
          transaction.id === id ? { ...transaction, ...input } : transaction
        ),
      });
    },
    [commit]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const current = dataRef.current;
      await commit({
        ...current,
        transactions: current.transactions.filter(
          (transaction) => transaction.id !== id
        ),
      });
    },
    [commit]
  );

  const setBudget = useCallback(
    async (amountCents: number | null) => {
      await commit({ ...dataRef.current, budgetCents: amountCents });
    },
    [commit]
  );

  const replaceData = useCallback(
    async (next: AppData) => {
      await commit(next);
    },
    [commit]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      ready,
      transactions: data.transactions,
      budgetCents: data.budgetCents,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      replaceData,
    }),
    [
      ready,
      data,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setBudget,
      replaceData,
    ]
  );

  if (!ready) {
    return null;
  }

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData 必须在 AppDataProvider 内使用');
  }
  return value;
}
