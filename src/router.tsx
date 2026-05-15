import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/routes/HomePage';
import { ArraysPage } from '@/routes/ArraysPage';
import { StackQueuePage } from '@/routes/StackQueuePage';
import { LinkedListPage } from '@/routes/LinkedListPage';
import { BinaryTreePage } from '@/routes/BinaryTreePage';
import { BSTPage } from '@/routes/BSTPage';
import { GraphPage } from '@/routes/GraphPage';
import { SortingPage } from '@/routes/SortingPage';
import { HashTablePage } from '@/routes/HashTablePage';
import { DPPage } from '@/routes/DPPage';

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'arrays', element: <ArraysPage /> },
      { path: 'stack-queue', element: <StackQueuePage /> },
      { path: 'linked-list', element: <LinkedListPage /> },
      { path: 'binary-tree', element: <BinaryTreePage /> },
      { path: 'bst', element: <BSTPage /> },
      { path: 'graph', element: <GraphPage /> },
      { path: 'sorting', element: <SortingPage /> },
      { path: 'hash-table', element: <HashTablePage /> },
      { path: 'dp', element: <DPPage /> },
    ],
  },
]);
