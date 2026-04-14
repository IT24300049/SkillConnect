import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { messageAPI } from '../api';
import NewThreadModal from '../components/messages/NewThreadModal';
import ThreadList from '../components/messages/ThreadList';
import ChatHeader from '../components/messages/ChatHeader';
import MessageList from '../components/messages/MessageList';
import MessageComposer from '../components/messages/MessageComposer';

export default function MessagesPage() {
  const navigate = useNavigate();
  const { threadId: routeThreadId } = useParams();
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThread, setNewThread] = useState({ participantId: '', bookingId: '' });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const messagesEndRef = useRef(null);
  const currentUserId = user?.userId || user?.id;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.threadId === selectedThreadId) || null,
    [threads, selectedThreadId]
  );

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => getOtherParticipant(thread).toLowerCase().includes(q));
  }, [threads, search, currentUserId]);

  useEffect(() => {
    loadSidebar();
  }, []);

  useEffect(() => {
    if (!routeThreadId) return;
    const parsed = Number(routeThreadId);
    if (!Number.isNaN(parsed)) {
      setSelectedThreadId(parsed);
    }
  }, [routeThreadId]);

  useEffect(() => {
    if (!showNewThread || recipients.length > 0) return;
    loadRecipients();
  }, [showNewThread]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }
    loadMessages(selectedThreadId, true);
  }, [selectedThreadId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return;
      loadSidebar(false);
      if (selectedThreadId) {
        loadMessages(selectedThreadId, false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSidebar = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [threadRes, unreadRes] = await Promise.all([
        messageAPI.getMyThreads(),
        messageAPI.getUnreadCount(),
      ]);
      const nextThreads = (threadRes.data.data || []).slice().sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });
      setThreads(nextThreads);
      setUnreadCount(unreadRes.data.data?.count || 0);

      if (!routeThreadId && !selectedThreadId && nextThreads.length > 0 && window.innerWidth >= 768) {
        const firstId = nextThreads[0].threadId;
        setSelectedThreadId(firstId);
        navigate(`/messages/${firstId}`);
      }
    } catch {
      setError('Failed to load conversations.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const loadRecipients = async () => {
    setRecipientLoading(true);
    try {
      const res = await messageAPI.getRecipients();
      setRecipients(res.data.data || []);
    } catch {
      setError('Failed to load recipients.');
    } finally {
      setRecipientLoading(false);
    }
  };

  const loadMessages = async (threadId, markRead) => {
    setMsgLoading(true);
    try {
      const res = await messageAPI.getMessages(threadId);
      setMessages(res.data.data || []);
      if (markRead) {
        await messageAPI.markThreadAsRead(threadId);
        const unreadRes = await messageAPI.getUnreadCount();
        setUnreadCount(unreadRes.data.data?.count || 0);
      }
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  };

  const handleSelectThread = (thread) => {
    setSelectedThreadId(thread.threadId);
    navigate(`/messages/${thread.threadId}`);
  };

  const handleBackToList = () => {
    setSelectedThreadId(null);
    navigate('/messages');
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedThreadId) return;
    try {
      setSending(true);
      await messageAPI.sendMessage({
        threadId: selectedThreadId,
        messageText: newMsg,
      });
      setNewMsg('');
      await loadMessages(selectedThreadId, false);
      await loadSidebar(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setCreatingThread(true);
      const res = await messageAPI.createThread({
        participant2Id: newThread.participantId,
        bookingId: newThread.bookingId || null,
      });
      setShowNewThread(false);
      setNewThread({ participantId: '', bookingId: '' });
      await loadSidebar(false);
      const createdThreadId = res.data.data?.threadId;
      if (createdThreadId) {
        setSelectedThreadId(createdThreadId);
        navigate(`/messages/${createdThreadId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create thread.');
    } finally {
      setCreatingThread(false);
    }
  };

  const getOtherParticipant = (thread) => {
    const participant1 = thread?.participant1;
    const participant2 = thread?.participant2;
    if (!participant1 && !participant2) return 'Unknown user';
    if (participant1?.userId === currentUserId) return participant2?.email || `User #${participant2?.userId}`;
    return participant1?.email || `User #${participant1?.userId}`;
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 38, lineHeight: 1.1, fontWeight: 900, color: '#0f172a' }}>Messages</h1>
          <p style={{ fontSize: 22, color: '#64748b', marginTop: 6 }}>Chat with workers, customers, and suppliers</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 12px', borderRadius: 999, background: '#e0f2fe', color: '#0c4a6e', fontSize: 12, fontWeight: 800 }}>
            Unread: {unreadCount}
          </span>
          <button
            onClick={() => setShowNewThread(true)}
            className="btn-primary"
            style={{ height: 42, paddingInline: 16 }}
          >
          <span className="material-symbols-outlined text-lg">edit</span> New Chat
          </button>
        </div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 14 }}>❌ {error}</div>}

      <NewThreadModal
        open={showNewThread}
        onClose={() => setShowNewThread(false)}
        recipients={recipients}
        loading={recipientLoading}
        form={newThread}
        onFormChange={setNewThread}
        onSubmit={handleCreateThread}
        submitting={creatingThread}
      />

      <div className="hm-card" style={{ minHeight: 540, overflow: 'hidden', padding: 0 }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ display: isMobile && selectedThread ? 'none' : 'block' }}>
            <ThreadList
              loading={loading}
              threads={filteredThreads}
              search={search}
              onSearch={setSearch}
              activeThreadId={selectedThreadId}
              getDisplayName={getOtherParticipant}
              onSelect={handleSelectThread}
            />
          </div>

          <div style={{ display: isMobile ? (selectedThread ? 'flex' : 'none') : 'flex', flex: 1, flexDirection: 'column', minHeight: 540 }}>
            {!selectedThread ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 62, color: '#cbd5e1', marginBottom: 8 }}>chat</span>
                  <p style={{ color: '#64748b', fontSize: 14 }}>Select a conversation to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                <ChatHeader
                  thread={selectedThread}
                  title={getOtherParticipant(selectedThread)}
                  onBack={handleBackToList}
                />
                <MessageList
                  loading={msgLoading}
                  messages={messages}
                  currentUserId={currentUserId}
                  bottomRef={messagesEndRef}
                />
                <MessageComposer
                  value={newMsg}
                  onChange={setNewMsg}
                  onSubmit={handleSend}
                  sending={sending}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
