import { useState, useEffect } from 'react';
import { Upload, Search, MessageSquare, FileText, X, Send, Plus, Filter } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import AdminNavigation from '../components/AdminNavigation';
import AgentNavigation from '../components/AgentNavigation';
import TechnicianNavigation from '../components/TechnicianNavigation';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/api';

export default function KnowledgeCrystal() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const isTechnician = user?.role === 'technician';
  
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: isAgent ? 'agent' : isTechnician ? 'technician' : '',
    file: null,
    country: '',
    tags: '',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const category = isAgent ? 'agent' : isTechnician ? 'technician' : null;
      const response = await apiClient.get('/api/kb/pages', {
        params: category ? { category, limit: 50 } : { limit: 50 }
      });
      setDocuments(response.pages || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const category = isAgent ? 'agent' : isTechnician ? 'technician' : null;
      const response = await apiClient.get('/api/kb/search', {
        params: {
          q: searchQuery,
          limit: 10,
          ...(category && { category })
        }
      });
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Error searching documents:', error);
      alert('Error searching documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadForm({ ...uploadForm, file });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.title || !uploadForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      // Read file content
      const fileContent = await readFileContent(uploadForm.file);
      
      const payload = {
        title: uploadForm.title,
        content: fileContent,
        category: uploadForm.category,
        description: uploadForm.description,
        tags: uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        country: uploadForm.country || null,
        author: user?.email || 'admin',
        visibility: 'public'
      };

      await apiClient.post('/api/kb/create', payload);
      
      alert('Document uploaded successfully!');
      setShowUploadForm(false);
      setUploadForm({
        title: '',
        description: '',
        category: isAgent ? 'agent' : isTechnician ? 'technician' : '',
        file: null,
        country: '',
        tags: '',
      });
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      setSendingMessage(true);
      const userRole = isAgent ? 'agent' : isTechnician ? 'technician' : 'admin';
      
      const response = await apiClient.post('/api/kb/chat', {
        query: chatInput,
        user_role: userRole,
        limit: 5
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.answer,
        documents: response.data.matched_documents,
        confidence: response.data.confidence
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your query. Please try again.',
        error: true
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const NavigationComponent = isAdmin 
    ? AdminNavigation 
    : isAgent 
    ? AgentNavigation 
    : TechnicianNavigation;

  return (
    <DashboardLayout navigation={<NavigationComponent />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Knowledge Crystal</h1>
            <p className="text-gray-400 mt-1">
              {isAgent && 'Access mission-related documents and previous operations'}
              {isTechnician && 'Access technical documentation and equipment guides'}
              {isAdmin && 'Manage knowledge base for agents and technicians'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {isAdmin && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Upload Document
              </button>
            )}
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Chat with AI
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by keywords, topics, or questions..."
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-400">Search Results ({searchResults.length})</h2>
            {searchResults.map((result, index) => (
              <Card key={index} className="p-6 hover:border-cyan-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-lg font-semibold text-white">{result.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.category === 'agent' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {result.category}
                      </span>
                    </div>
                    
                    {result.mission_id && (
                      <p className="text-sm text-gray-400 mb-2">
                        Mission: {result.mission_id} {result.country && `| Country: ${result.country}`}
                      </p>
                    )}
                    
                    <p className="text-gray-300 mb-3">{result.long_summary}</p>
                    
                    {result.matched_points && result.matched_points.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-cyan-500">
                        <p className="text-sm font-semibold text-cyan-400 mb-1">Matched Points:</p>
                        <ul className="space-y-1">
                          {result.matched_points.map((point, idx) => (
                            <li key={idx} className="text-sm text-gray-300">• {point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {result.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>Similarity: {(result.similarity_score * 100).toFixed(1)}%</span>
                      <span>By: {result.author}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* All Documents */}
        {searchResults.length === 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-400">
              Available Documents ({documents.length})
            </h2>
            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-gray-400">Loading documents...</p>
              </Card>
            ) : documents.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No documents available yet</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc._id} className="p-6 hover:border-cyan-500 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-cyan-400" />
                          <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            doc.category === 'agent' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {doc.category}
                          </span>
                        </div>
                        
                        {doc.mission_id && (
                          <p className="text-sm text-gray-400 mb-2">
                            Mission: {doc.mission_id} {doc.country && `| Country: ${doc.country}`}
                          </p>
                        )}
                        
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {doc.tags.map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>By: {doc.author}</span>
                          <span>Chunks: {doc.chunk_count || 0}</span>
                          <span>Status: {doc.status}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">Upload Document</h2>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Short Description
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white h-24"
                    placeholder="Brief description of the document..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="agent">Agent (Mission Documents)</option>
                    <option value="technician">Technician (Technical Documentation)</option>
                  </select>
                </div>

                {uploadForm.category === 'agent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country (Optional)
                    </label>
                    <input
                      type="text"
                      value={uploadForm.country}
                      onChange={(e) => setUploadForm({ ...uploadForm, country: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="e.g., USA, India, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    placeholder="e.g., surveillance, setup, CCTV"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload File (txt, pdf, jpg, etc.) *
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Chat Interface Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-4xl mx-4 h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-cyan-400">Chat with Knowledge Crystal AI</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Ask questions about any document in the knowledge base
                  </p>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p>Start a conversation by asking a question</p>
                    <p className="text-sm mt-2">
                      {isAgent && 'Ask about previous missions, operations, or country-specific information'}
                      {isTechnician && 'Ask about equipment setup, documentation, or troubleshooting'}
                      {isAdmin && 'Ask about any document in the knowledge base'}
                    </p>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-cyan-500 text-white'
                            : message.error
                            ? 'bg-red-500/20 text-red-400 border border-red-500'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.documents && message.documents.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <p className="text-sm font-semibold mb-2 text-cyan-400">
                              Related Documents ({message.documents.length}):
                            </p>
                            <div className="space-y-2">
                              {message.documents.map((doc, idx) => (
                                <div key={idx} className="text-sm bg-gray-800 p-3 rounded">
                                  <p className="font-medium text-white">{doc.title}</p>
                                  {doc.mission_id && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Mission: {doc.mission_id}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    Match: {(doc.similarity_score * 100).toFixed(1)}%
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {message.confidence !== undefined && (
                          <p className="text-xs mt-2 opacity-70">
                            Confidence: {(message.confidence * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                
                {sendingMessage && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about documents..."
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !chatInput.trim()}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
