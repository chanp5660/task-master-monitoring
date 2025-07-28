import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from 'reactflow';
import dagre from 'dagre';
import TaskNode from './TaskNode';

import 'reactflow/dist/style.css';

const nodeTypes = {
  taskNode: TaskNode,
};

const DiagramView = ({ 
  tasks, 
  onTaskClick, 
  hasUncompletedDependencies, 
  isReadyToStart 
}) => {
  // 다이어그램 데이터 생성
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { nodes: [], edges: [] };
    }

    // 노드 생성
    const nodes = tasks.map((task) => ({
      id: task.id.toString(),
      type: 'taskNode',
      data: {
        task: task,
        hasUncompletedDependencies: hasUncompletedDependencies ? hasUncompletedDependencies(task) : false,
        isReadyToStart: isReadyToStart ? isReadyToStart(task) : false,
      },
      position: { x: 0, y: 0 }, // 초기 위치, 레이아웃에서 재계산
    }));

    // 엣지 생성
    const edges = tasks.flatMap((task) =>
      task.dependencies?.map((depId) => ({
        id: `${depId}-${task.id}`,
        source: depId.toString(),
        target: task.id.toString(),
        type: 'smoothstep',
        animated: task.status === 'in-progress',
        style: {
          strokeWidth: 3,
          stroke: task.status === 'in-progress' ? '#3b82f6' : '#1f2937',
        },
        markerEnd: {
          type: 'arrowclosed',
          color: task.status === 'in-progress' ? '#3b82f6' : '#1f2937',
        },
      })) || []
    );

    return getLayoutedElements(nodes, edges);
  }, [tasks, hasUncompletedDependencies, isReadyToStart]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 레이아웃 계산 함수 (Dagre 사용)
  function getLayoutedElements(nodes, edges, direction = 'TB') {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ 
      rankdir: direction,
      nodesep: 50,
      edgesep: 10,
      ranksep: 80,
    });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 220, height: 120 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return {
      nodes: nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - 110,
            y: nodeWithPosition.y - 60,
          },
        };
      }),
      edges,
    };
  }

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event, node) => {
    if (onTaskClick && node.data.task) {
      onTaskClick(node.data.task);
    }
  }, [onTaskClick]);

  // 연결 생성 핸들러 (비활성화)
  const onConnect = useCallback((params) => {
    // 다이어그램 뷰에서는 연결 생성을 비활성화
    console.log('Connection attempt blocked in diagram view');
  }, []);

  // 미니맵 노드 색상
  const getMiniMapNodeColor = (node) => {
    const task = node.data.task;
    if (!task) return '#e5e7eb';
    
    switch (task.status) {
      case 'done':
      case 'completed':
        return '#22c55e';
      case 'in-progress':
        return '#3b82f6';
      case 'pending':
        return '#6b7280';
      case 'review':
        return '#8b5cf6';
      case 'deferred':
        return '#eab308';
      case 'blocked':
      case 'cancelled':
        return '#ef4444';
      default:
        return '#e5e7eb';
    }
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <p className="text-gray-500">No tasks to display in diagram view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gray-50 rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 50,
          includeHiddenNodes: false,
        }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
      >
        <Controls 
          position="top-right"
          showFitView={true}
          showZoom={true}
          showInteractive={false}
        />
        <MiniMap 
          position="bottom-right"
          nodeColor={getMiniMapNodeColor}
          nodeStrokeWidth={2}
          zoomable
          pannable
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="#e5e7eb"
        />
      </ReactFlow>
    </div>
  );
};

export default DiagramView;