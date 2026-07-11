import { useState, useEffect, useCallback } from "react";
import { Mail, Search, CheckCircle, Clock, Send, Loader2 } from "lucide-react";
import { getContactMessages, replyToContactMessage, type ContactMessage } from "../api/contact";
import { toast } from "react-toastify";

export default function AdminContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }

    try {
      setSendingReply(true);
      await replyToContactMessage(selectedMessage._id, replyText);
      toast.success("Reply sent successfully!");
      setReplyText("");
      
      // Update local state to mark as resolved
      setMessages(messages.map(m => 
        m._id === selectedMessage._id ? { ...m, status: "resolved" } : m
      ));
      setSelectedMessage({ ...selectedMessage, status: "resolved" });

    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-120px)] flex bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* Sidebar - Message List */}
      <div className="w-full md:w-80 border-r border-border flex flex-col bg-bg/50">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            Inquiries
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-10 text-text-muted text-sm">
              No inquiries found.
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-white/60 ${
                  selectedMessage?._id === msg._id ? "bg-white border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-navy text-sm truncate pr-2">{msg.name}</h3>
                  <span className="text-[10px] text-text-muted whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-text-muted font-medium mb-2 truncate">{msg.subject}</p>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-xs text-text-muted truncate flex-1">{msg.message}</p>
                  {msg.status === "resolved" ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-400" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Area - Message Detail & Reply */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedMessage ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-bg/30">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-navy mb-1">{selectedMessage.subject}</h2>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span className="font-bold text-navy">{selectedMessage.name}</span>
                    <span>&lt;{selectedMessage.email}&gt;</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-text-muted block mb-1">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                    selectedMessage.status === "resolved" 
                      ? "bg-green-50 text-green-700" 
                      : "bg-orange-50 text-orange-700"
                  }`}>
                    {selectedMessage.status === "resolved" ? (
                      <><CheckCircle className="w-3 h-3" /> Resolved</>
                    ) : (
                      <><Clock className="w-3 h-3" /> Pending</>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="bg-bg/50 border border-border rounded-xl p-6 shadow-sm mb-6">
                <p className="text-navy whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Reply Section */}
              {selectedMessage.status !== "resolved" ? (
                <div className="mt-8">
                  <h3 className="font-bold text-navy mb-3 flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    Send a Reply
                  </h3>
                  <div className="bg-white border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here... (This will send an email)"
                      className="w-full p-4 min-h-[150px] text-sm focus:outline-none resize-y"
                    />
                    <div className="bg-bg/50 p-3 border-t border-border flex justify-end">
                      <button
                        onClick={handleSendReply}
                        disabled={sendingReply || !replyText.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {sendingReply ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Reply
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-green-800">Resolved Inquiry</h4>
                    <p className="text-sm text-green-700 mt-1">This message has already been replied to and marked as resolved.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
            <Mail className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-navy mb-2">Contact Inquiries</h3>
            <p>Select an inquiry from the list to read and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}
