import { useState } from 'react';
import ConfirmModal from '../components/ui/ConfirmModal';
import ToastNotification from '../components/ui/ToastNotification';
import { useAgentInbox } from '../hooks/useAgentInbox';
import { useResearch } from '../hooks/useResearch';

const IconChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const IconDot = () => (
  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="12"></circle>
  </svg>
);

const AGENT_TYPE_COLORS = {
  aprobacion: { bg: 'rgba(255,180,0,0.12)', text: '#FFB400' },
  research: { bg: 'rgba(100,150,255,0.12)', text: '#6496FF' },
  legal: { bg: 'rgba(124,106,255,0.12)', text: '#7C6AFF' },
  tarea_generada: { bg: 'rgba(0,229,160,0.12)', text: '#00E5A0' },
  alerta: { bg: 'rgba(255,77,79,0.12)', text: '#FF4D4F' },
  contenido: { bg: 'rgba(155,155,155,0.12)', text: '#9B9B9B' },
};

const RESEARCH_TYPE_COLORS = {
  keyword: { bg: 'rgba(100,150,255,0.12)', text: '#6496FF' },
  competidor: { bg: 'rgba(124,106,255,0.12)', text: '#7C6AFF' },
  idea: { bg: 'rgba(0,229,160,0.12)', text: '#00E5A0' },
  mercado: { bg: 'rgba(255,180,0,0.12)', text: '#FFB400' },
  income_report: { bg: 'rgba(255,77,79,0.12)', text: '#FF4D4F' },
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
}

function truncateText(text, lines = 2) {
  const lineArray = text.split('\n').slice(0, lines);
  return lineArray.join('\n');
}

function InboxItem({ item, onApprove, onReject, isExpanded, onToggle }) {
  const typeColor = AGENT_TYPE_COLORS[item.tipo] || AGENT_TYPE_COLORS.contenido;

  return (
    <div style={{
      backgroundColor: '#1C1C26',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '12px',
      cursor: 'pointer',
    }} onClick={() => onToggle(item.id)}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ backgroundColor: '#13131A', color: '#999', fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
          {item.agente}
        </span>
        <span style={{ backgroundColor: typeColor.bg, color: typeColor.text, fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
          {item.tipo}
        </span>
        <span style={{ marginLeft: 'auto', color: '#999', fontSize: '12px' }}>
          {formatDate(item.created_at)}
        </span>
      </div>

      <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0', wordBreak: 'break-word' }}>
        {item.titulo}
      </h3>

      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 12px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {isExpanded ? item.contenido : truncateText(item.contenido)}
      </p>

      {item.contenido.split('\n').length > 2 && !isExpanded && (
        <div style={{ color: '#666', fontSize: '11px', marginBottom: '12px' }}>
          ... {item.contenido.split('\n').length - 2} líneas más
        </div>
      )}

      {item.estado === 'pendiente' && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApprove(item.id);
            }}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: '#00E5A0',
              border: 'none',
              color: '#0A0A0F',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            Aprobar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject(item.id);
            }}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,77,79,0.3)',
              color: '#FF4D4F',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            Rechazar
          </button>
        </div>
      )}

      {item.estado === 'aprobado' && (
        <span style={{ display: 'block', backgroundColor: 'rgba(0,229,160,0.12)', color: '#00E5A0', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', textAlign: 'center' }}>
          Aprobado
        </span>
      )}

      {item.estado === 'rechazado' && (
        <span style={{ display: 'block', backgroundColor: 'rgba(255,77,79,0.08)', color: '#FF4D4F', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', textAlign: 'center', opacity: 0.6 }}>
          Rechazado
        </span>
      )}
    </div>
  );
}

function ResearchItem({ item, onMarkRead, isUnread }) {
  const typeColor = RESEARCH_TYPE_COLORS[item.tipo] || RESEARCH_TYPE_COLORS.keyword;

  return (
    <div
      style={{
        backgroundColor: '#1C1C26',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        cursor: 'pointer',
        opacity: isUnread ? 1 : 0.7,
      }}
      onClick={() => onMarkRead(item.id)}
    >
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
        {isUnread && (
          <span style={{ color: '#00E5A0', flexShrink: 0 }}>
            <IconDot />
          </span>
        )}
        <span style={{ backgroundColor: typeColor.bg, color: typeColor.text, fontSize: '11px', padding: '2px 6px', borderRadius: '4px' }}>
          {item.tipo}
        </span>
        <span style={{ marginLeft: 'auto', color: '#999', fontSize: '12px' }}>
          {formatDate(item.created_at)}
        </span>
      </div>

      <h3 style={{ color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
        {item.titulo}
      </h3>

      {item.fuente && (
        <p style={{ color: '#666', fontSize: '11px', margin: '0 0 6px 0' }}>
          {item.fuente}
        </p>
      )}

      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {truncateText(item.contenido, 2)}
      </p>
    </div>
  );
}

export default function Agentes() {
  const { items: inboxItems, pendingCount, aprobar, rechazar } = useAgentInbox();
  const { items: researchItems, unreadCount, marcarLeido } = useResearch();

  const [expandedItem, setExpandedItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleApprove = async (id) => {
    try {
      const item = inboxItems.find(i => i.id === id);
      await aprobar(id, item.webhook_url);
      setToast({ message: 'Item aprobado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al aprobar', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await rechazar(id);
      setToast({ message: 'Item rechazado', type: 'success' });
    } catch (err) {
      setToast({ message: 'Error al rechazar', type: 'error' });
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await marcarLeido(id);
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleImportTasks = async () => {
    try {
      setIsImporting(true);
      const tasks = JSON.parse(importJson);
      if (!Array.isArray(tasks)) {
        setToast({ message: 'El JSON debe ser un array de tareas', type: 'error' });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/task-importer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
          },
          body: JSON.stringify(tasks),
        }
      );

      const data = await response.json();
      if (data.success) {
        setToast({ message: `${data.inserted} tareas importadas`, type: 'success' });
        setImportJson('');
        setIsImportModalOpen(false);
      } else {
        setToast({ message: 'Error al importar tareas', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'JSON inválido', type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const filteredResearch = selectedFilter === 'todos'
    ? researchItems
    : researchItems.filter(r => r.tipo === selectedFilter);

  const filters = [
    { label: 'Todos', value: 'todos' },
    { label: 'Keyword', value: 'keyword' },
    { label: 'Competidor', value: 'competidor' },
    { label: 'Idea', value: 'idea' },
    { label: 'Mercado', value: 'mercado' },
    { label: 'Income report', value: 'income_report' },
  ];

  return (
    <div style={{ backgroundColor: '#0A0A0F', minHeight: '100vh', padding: '24px' }}>
      {/* SECCIÓN 1: Inbox de agentes */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: 0 }}>
            Inbox de agentes
            {pendingCount > 0 && (
              <span style={{
                marginLeft: '10px',
                backgroundColor: '#FF4D4F',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {pendingCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#00E5A0',
              border: 'none',
              color: '#0A0A0F',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            Importar tareas
          </button>
        </div>

        {inboxItems.length === 0 ? (
          <div style={{ backgroundColor: '#13131A', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            No hay items de agentes todavía. Los agentes de n8n depositarán aquí sus outputs.
          </div>
        ) : (
          <div>
            {inboxItems.map(item => (
              <InboxItem
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onReject={handleReject}
                isExpanded={expandedItem === item.id}
                onToggle={(id) => setExpandedItem(expandedItem === id ? null : id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: '40px' }} />

      {/* SECCIÓN 2: Investigación */}
      <div>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>
          Investigación
          {unreadCount > 0 && (
            <span style={{
              marginLeft: '10px',
              backgroundColor: '#00E5A0',
              color: '#0A0A0F',
              fontSize: '12px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '10px',
            }}>
              {unreadCount}
            </span>
          )}
        </h2>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {filters.map(filter => (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedFilter === filter.value ? '#00E5A0' : 'transparent',
                border: '1px solid ' + (selectedFilter === filter.value ? '#00E5A0' : 'rgba(255,255,255,0.08)'),
                color: selectedFilter === filter.value ? '#0A0A0F' : '#999',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {filteredResearch.length === 0 ? (
          <div style={{ backgroundColor: '#13131A', padding: '40px', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
            No hay research todavía. El agente de investigación depositará aquí sus hallazgos semanales.
          </div>
        ) : (
          <div>
            {filteredResearch.map(item => (
              <ResearchItem
                key={item.id}
                item={item}
                onMarkRead={handleMarkRead}
                isUnread={!item.leido}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para importar tareas */}
      {isImportModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setIsImportModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#13131A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '500', margin: '0 0 16px 0' }}>
              Importar tareas JSON
            </h2>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Pega el JSON aquí..."
              style={{
                width: '100%',
                backgroundColor: '#0A0A0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '12px',
                color: 'white',
                fontSize: '12px',
                boxSizing: 'border-box',
                minHeight: '150px',
                fontFamily: 'monospace',
                marginBottom: '16px',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#999',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleImportTasks}
                disabled={isImporting || !importJson.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#00E5A0',
                  border: 'none',
                  color: '#0A0A0F',
                  borderRadius: '6px',
                  cursor: isImporting || !importJson.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  opacity: isImporting || !importJson.trim() ? 0.6 : 1,
                }}
              >
                {isImporting ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
