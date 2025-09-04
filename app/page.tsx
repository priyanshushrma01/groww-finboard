'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RootState } from './store/store';
import { reorderWidgets } from './store/slices/widgetsSlice';
import Header from './components/Header';
import WidgetContainer from './components/WidgetContainer';
import AddWidgetModal from './components/widgets/AddWidgetModal';
import StockTableWidget from './components/widgets/StockTableWidget';
import FinanceCardsWidget from './components/widgets/FinanceCardsWidget';
import ChartWidget from './components/widgets/ChartWidget';
import { Widget } from './types';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { widgets } = useSelector((state: RootState) => state.widgets);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    dispatch(reorderWidgets(items));
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'stock-table':
        return <StockTableWidget widget={widget} />;
      case 'finance-cards':
        return <FinanceCardsWidget widget={widget} />;
      case 'chart':
        return <ChartWidget widget={widget} />;
      default:
        return <div className="p-4 text-center text-gray-400">Unknown widget type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header onAddWidget={() => setIsAddModalOpen(true)} />
      
      <main className="container mx-auto px-4 py-6">
        {widgets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to FinBoard
            </h2>
            <p className="text-gray-400 mb-6">
              Start building your customizable finance dashboard by adding widgets
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Add Your First Widget
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dashboard">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`${
                            widget.size?.width === 'full' ? 'col-span-full' :
                            widget.size?.width === 'half' ? 'col-span-2' : 'col-span-1'
                          } ${snapshot.isDragging ? 'opacity-50 rotate-1 scale-105' : ''}`}
                        >
                          <WidgetContainer
                            widget={widget}
                            dragHandleProps={provided.dragHandleProps}
                          >
                            {renderWidget(widget)}
                          </WidgetContainer>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>

      {isAddModalOpen && (
        <AddWidgetModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
}
