import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { LinkedListSnapshot, LinkedNode } from '@/types/snapshots';
import type { SinglyInsertDeleteInput } from '@/types/algorithm';

export function singlyInsertDelete(input: SinglyInsertDeleteInput): AlgorithmRun<LinkedListSnapshot> {
  const { values } = input;
  const r = createRunBuilder<LinkedListSnapshot>('singly-insert-delete', input);

  let idCounter = 0;
  const uid = () => `n${idCounter++}`;

  let nodeMap: Record<string, LinkedNode> = {};
  let headId: string | null = null;
  let tailId: string | null = null;

  let prevId: string | null = null;
  for (const val of values) {
    const id = uid();
    nodeMap[id] = { id, value: val, nextId: null };
    if (prevId !== null) nodeMap[prevId]!.nextId = id;
    else headId = id;
    tailId = id;
    prevId = id;
  }

  const snap = (pointers: LinkedListSnapshot['pointers'] = []): LinkedListSnapshot => ({
    nodes: Object.fromEntries(Object.entries(nodeMap).map(([k, v]) => [k, { ...v }])),
    headId,
    tailId,
    pointers,
    doubly: false,
  });

  // Step 0: init
  r.push({
    line: 1,
    narration: `Initial list: [${values.join(' → ')}].`,
    snapshot: snap(),
    variables: { head: headId ?? 'null', tail: tailId ?? 'null' },
  });

  // Operation 1: insertAtHead(0)
  r.push({
    line: 1,
    narration: 'insertAtHead(0): new node will become the head.',
    snapshot: snap(),
    variables: { op: 'insertAtHead(0)' },
  });
  const newHeadId = uid();
  nodeMap[newHeadId] = { id: newHeadId, value: 0, nextId: headId };
  headId = newHeadId;
  r.push({
    line: 2,
    narration: 'Node 0 inserted at head.',
    snapshot: snap([{ name: 'newNode', nodeId: newHeadId, color: 'cyan' }]),
    variables: { head: headId },
  });

  // Operation 2: insertAtTail(5)
  r.push({
    line: 3,
    narration: 'insertAtTail(5): new node will become the tail.',
    snapshot: snap(),
    variables: { op: 'insertAtTail(5)' },
  });
  const newTailId = uid();
  nodeMap[newTailId] = { id: newTailId, value: 5, nextId: null };
  if (tailId !== null) nodeMap[tailId]!.nextId = newTailId;
  tailId = newTailId;
  r.push({
    line: 4,
    narration: 'Node 5 inserted at tail.',
    snapshot: snap([{ name: 'newNode', nodeId: newTailId, color: 'cyan' }]),
    variables: { tail: tailId },
  });

  // Operation 3: deleteByValue(2)
  r.push({
    line: 5,
    narration: 'deleteByValue(2): find and unlink the node with value 2.',
    snapshot: snap(),
    variables: { op: 'deleteByValue(2)' },
  });
  {
    let delPrev: string | null = null;
    let delCurr: string | null = headId;
    while (delCurr !== null && nodeMap[delCurr]!.value !== 2) {
      delPrev = delCurr;
      delCurr = nodeMap[delCurr]!.nextId;
    }
    if (delCurr !== null) {
      const nextOfDeleted = nodeMap[delCurr]!.nextId;
      if (delPrev !== null) nodeMap[delPrev]!.nextId = nextOfDeleted;
      else headId = nextOfDeleted;
      if (tailId === delCurr) tailId = delPrev;
      delete nodeMap[delCurr];
    }
  }
  r.push({
    line: 6,
    narration: 'Node with value 2 removed.',
    snapshot: snap(),
    variables: { head: headId ?? 'null' },
  });

  // Operation 4: reverse()
  r.push({
    line: 7,
    narration: 'reverse(): flip all next pointers to reverse the list.',
    snapshot: snap(),
    variables: { op: 'reverse()' },
  });
  {
    const oldHead = headId;
    let revPrev: string | null = null;
    let revCurr: string | null = headId;
    while (revCurr !== null) {
      const revNext = nodeMap[revCurr]!.nextId;
      nodeMap[revCurr]!.nextId = revPrev;
      revPrev = revCurr;
      revCurr = revNext;
    }
    tailId = oldHead;
    headId = revPrev;
  }
  r.push({
    line: 9,
    narration: 'List reversed — all next pointers flipped.',
    snapshot: snap(),
    variables: { head: headId ?? 'null', tail: tailId ?? 'null' },
  });

  const finalResult: number[] = [];
  let walkId: string | null = headId;
  while (walkId !== null) {
    finalResult.push(nodeMap[walkId]!.value);
    walkId = nodeMap[walkId]!.nextId;
  }

  return r.build(finalResult);
}
