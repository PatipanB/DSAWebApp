export type TopicId =
  | 'arrays'
  | 'stack-queue'
  | 'linked-list'
  | 'binary-tree'
  | 'bst'
  | 'graph'
  | 'sorting'
  | 'hash-table'
  | 'dp';

export interface TopicMeta {
  id: TopicId;
  title: string;
  shortDescription: string;
  longDescription: string;
  path: `/${string}`;
  number: number;
  emoji: string;
  prereqs?: TopicId[];
  estimatedMinutes?: number;
}
