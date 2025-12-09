# 🧪 Doc-Sage Complete End-to-End Testing Guide

## Prerequisites

### 1. Start the Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload
```

### 2. Verify Server is Running
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "service": "doc-sage"}
```

### 3. Required Environment Variables
- `MONGODB_URI` - MongoDB connection string
- Ollama running locally on http://localhost:11434 with llama3.2:3b model

---

## 📋 Test Scenario: Mission-Based Document Workflow

### **Scenario Overview:**
Admin creates a mission, assigns an agent, uploads documents, and both admin and agent interact with the documents through the AI chatbot.

---

## 🎬 Test Steps

### **STEP 1: Health Check**

**Test the DocSage service is running**

```bash
curl http://localhost:8000/api/docsage/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "DocSage",
  "version": "2.0"
}
```

✅ **Pass Criteria:** Status 200, service name is "DocSage"

---

### **STEP 2: Upload Document WITHOUT Mission**

**Test basic document upload functionality**

Create a test file first:
```bash
echo "This is a test document about mission briefing and operational procedures. It contains information about team deployment, resource allocation, and timeline." > test_doc.txt
```

**Upload Request:**
```bash
curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@test_doc.txt" \
  -F "uploaded_by=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "id": "67567890abcdef123456789a",
  "name": "test_doc.txt",
  "status": "processing",
  "uploaded_at": "2025-12-08T10:30:00",
  "uploaded_by": "admin@sentinelops.com",
  "mission_id": null
}
```

✅ **Pass Criteria:** 
- Status 200
- Returns document ID
- Status is "processing"
- mission_id is null

**Save the document ID for later tests:** `DOC_ID_1=<returned_id>`

---

### **STEP 3: Upload Document WITH Mission and Access Control**

**Test mission-based upload with specific user access**

Create a mission document:
```bash
echo "CLASSIFIED MISSION BRIEFING - Operation Phoenix
Mission Objectives:
1. Secure the northern perimeter
2. Retrieve intelligence package Alpha-7
3. Establish communication relay at checkpoint Bravo
4. Return to base by 1800 hours

Team Assignment:
- Team Leader: Commander Smith
- Field Agent: Agent Johnson
- Technical Support: Agent Williams

Resources Required:
- Communication equipment
- Tactical gear
- Transportation vehicle

Timeline:
- Departure: 0600 hours
- Checkpoint Alpha: 0800 hours
- Objective completion: 1400 hours
- Return: 1800 hours" > mission_briefing.txt
```

**Upload Request:**
```bash
curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@mission_briefing.txt" \
  -F "mission_id=mission_phoenix_001" \
  -F "uploaded_by=admin@sentinelops.com" \
  -F "allowed_users=agent.johnson@sentinelops.com,agent.williams@sentinelops.com"
```

**Expected Response:**
```json
{
  "id": "67567890abcdef123456789b",
  "name": "mission_briefing.txt",
  "status": "processing",
  "uploaded_at": "2025-12-08T10:35:00",
  "uploaded_by": "admin@sentinelops.com",
  "mission_id": "mission_phoenix_001"
}
```

✅ **Pass Criteria:**
- Status 200
- Returns document ID
- mission_id matches
- allowed_users includes admin and agents

**Save the document ID:** `DOC_ID_2=<returned_id>`

---

### **STEP 4: Wait for Document Processing**

**Documents are processed asynchronously by AI**

```bash
# Wait 15-20 seconds for AI processing
sleep 20
```

⏳ During this time:
- Text is extracted from the file
- Ollama AI (llama3.2:3b) generates summaries (short & long)
- Keywords are extracted
- Tags are suggested
- Document insights are generated

---

### **STEP 5: Get Document Details (Admin)**

**Test retrieving full document details with AI-generated content**

```bash
curl "http://localhost:8000/api/docsage/documents/DOC_ID_2?user_email=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "id": "67567890abcdef123456789b",
  "name": "mission_briefing.txt",
  "status": "processed",
  "uploaded_by": "admin@sentinelops.com",
  "uploaded_at": "2025-12-08T10:35:00",
  "mission_id": "mission_phoenix_001",
  "allowed_users": [
    "admin@sentinelops.com",
    "agent.johnson@sentinelops.com",
    "agent.williams@sentinelops.com"
  ],
  "extracted_text": "CLASSIFIED MISSION BRIEFING - Operation Phoenix...",
  "summary": {
    "short_summary": "Mission briefing for Operation Phoenix detailing objectives, team assignments, resources, and timeline for a classified operation.",
    "long_summary": "This document provides comprehensive briefing for Operation Phoenix, a classified mission requiring team coordination...",
    "keywords": [
      "mission",
      "operation phoenix",
      "objectives",
      "team",
      "resources",
      "timeline"
    ],
    "tag_suggestions": [
      "classified",
      "mission briefing",
      "operations",
      "tactical",
      "team deployment"
    ]
  },
  "insights": {
    "word_count": 142,
    "estimated_read_time": 1,
    "document_type": "briefing",
    "key_entities": [
      "Operation Phoenix",
      "Commander Smith",
      "Agent Johnson",
      "Agent Williams",
      "checkpoint Bravo"
    ],
    "important_sections": [
      "Mission Objectives",
      "Team Assignment",
      "Resources Required",
      "Timeline"
    ]
  },
  "file_size": 745,
  "mime_type": "text/plain"
}
```

✅ **Pass Criteria:**
- Status 200
- Status is "processed"
- Contains short_summary and long_summary
- Keywords array has 5-10 items
- Tag suggestions present
- Insights include word_count, read_time, document_type
- Key entities identified
- Important sections listed

---

### **STEP 6: Get Documents List (Filtered by User)**

**Test access control - Admin should see all their documents**

```bash
curl "http://localhost:8000/api/docsage/documents?user_email=admin@sentinelops.com"
```

**Expected Response:**
```json
[
  {
    "id": "67567890abcdef123456789a",
    "name": "test_doc.txt",
    "status": "processed",
    ...
  },
  {
    "id": "67567890abcdef123456789b",
    "name": "mission_briefing.txt",
    "status": "processed",
    ...
  }
]
```

✅ **Pass Criteria:**
- Status 200
- Returns array of documents
- Admin can see both documents

---

### **STEP 7: Get Documents by Mission**

**Test mission-based filtering**

```bash
curl "http://localhost:8000/api/docsage/documents?mission_id=mission_phoenix_001&user_email=admin@sentinelops.com"
```

**Expected Response:**
```json
[
  {
    "id": "67567890abcdef123456789b",
    "name": "mission_briefing.txt",
    "mission_id": "mission_phoenix_001",
    ...
  }
]
```

✅ **Pass Criteria:**
- Status 200
- Returns only documents with matching mission_id
- Does not include documents without mission_id

---

### **STEP 8: Check Access - Authorized User (Agent)**

**Test access control for assigned agent**

```bash
curl -X POST http://localhost:8000/api/docsage/documents/DOC_ID_2/check-access \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "user_email": "agent.johnson@sentinelops.com"
  }'
```

**Expected Response:**
```json
{
  "has_access": true,
  "reason": "User has access to this document"
}
```

✅ **Pass Criteria:**
- Status 200
- has_access is true
- Assigned agent has access

---

### **STEP 9: Check Access - Unauthorized User**

**Test access control denies unauthorized users**

```bash
curl -X POST http://localhost:8000/api/docsage/documents/DOC_ID_2/check-access \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "user_email": "unauthorized@example.com"
  }'
```

**Expected Response:**
```json
{
  "has_access": false,
  "reason": "User does not have permission to access this document"
}
```

✅ **Pass Criteria:**
- Status 200
- has_access is false
- Unauthorized user denied access

---

### **STEP 10: Get Document as Authorized Agent**

**Test agent can retrieve documents from assigned missions**

```bash
curl "http://localhost:8000/api/docsage/documents/DOC_ID_2?user_email=agent.johnson@sentinelops.com"
```

**Expected Response:**
```json
{
  "id": "67567890abcdef123456789b",
  "name": "mission_briefing.txt",
  "status": "processed",
  "summary": { ... },
  "insights": { ... },
  ...
}
```

✅ **Pass Criteria:**
- Status 200
- Agent can access the document
- Full details returned

---

### **STEP 11: Get Document as Unauthorized User**

**Test access denial for unauthorized users**

```bash
curl "http://localhost:8000/api/docsage/documents/DOC_ID_2?user_email=unauthorized@example.com"
```

**Expected Response:**
```json
{
  "detail": "You do not have permission to access this document"
}
```

✅ **Pass Criteria:**
- Status 403 (Forbidden)
- Error message about permissions

---

### **STEP 12: Search Documents**

**Test search functionality across document content**

```bash
curl "http://localhost:8000/api/docsage/search?q=mission&user_email=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "query": "mission",
  "total_results": 2,
  "results": [
    {
      "id": "67567890abcdef123456789a",
      "name": "test_doc.txt",
      "summary": "This is a test document about mission briefing...",
      "keywords": ["mission", "briefing", "operational"],
      "uploaded_by": "admin@sentinelops.com",
      "uploaded_at": "2025-12-08T10:30:00",
      "match_context": "...test document about mission briefing and operational..."
    },
    {
      "id": "67567890abcdef123456789b",
      "name": "mission_briefing.txt",
      "summary": "Mission briefing for Operation Phoenix...",
      "keywords": ["mission", "operation phoenix", "objectives"],
      "uploaded_by": "admin@sentinelops.com",
      "uploaded_at": "2025-12-08T10:35:00",
      "match_context": "...CLASSIFIED MISSION BRIEFING - Operation Phoenix..."
    }
  ]
}
```

✅ **Pass Criteria:**
- Status 200
- Returns matching documents
- Results include match_context showing where query was found
- Results respect user access permissions

---

### **STEP 13: Search with Agent Access**

**Test search respects access control**

```bash
curl "http://localhost:8000/api/docsage/search?q=mission&user_email=agent.johnson@sentinelops.com"
```

**Expected Response:**
```json
{
  "query": "mission",
  "total_results": 1,
  "results": [
    {
      "id": "67567890abcdef123456789b",
      "name": "mission_briefing.txt",
      ...
    }
  ]
}
```

✅ **Pass Criteria:**
- Status 200
- Agent only sees documents they have access to
- Does not return documents they cannot access

---

### **STEP 14: Chat with Document - First Question (Admin)**

**Test AI chatbot functionality**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=admin@sentinelops.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "What are the main objectives of Operation Phoenix?",
    "include_history": true
  }'
```

**Expected Response:**
```json
{
  "answer": "The main objectives of Operation Phoenix are: 1) Secure the northern perimeter, 2) Retrieve intelligence package Alpha-7, 3) Establish communication relay at checkpoint Bravo, and 4) Return to base by 1800 hours.",
  "sources": ["mission_briefing.txt"],
  "timestamp": "2025-12-08T10:45:00"
}
```

✅ **Pass Criteria:**
- Status 200
- Answer is relevant to the question
- Answer is based on document content
- Sources array includes document name
- Timestamp is present

---

### **STEP 15: Chat with Document - Follow-up Question**

**Test chat history and context awareness**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=admin@sentinelops.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "Who are the team members assigned to this operation?",
    "include_history": true
  }'
```

**Expected Response:**
```json
{
  "answer": "The team members assigned to Operation Phoenix are: Commander Smith (Team Leader), Agent Johnson (Field Agent), and Agent Williams (Technical Support).",
  "sources": ["mission_briefing.txt"],
  "timestamp": "2025-12-08T10:46:00"
}
```

✅ **Pass Criteria:**
- Status 200
- Answer correctly identifies team members
- AI maintains context from previous conversation

---

### **STEP 16: Chat with Document - Complex Question**

**Test AI's ability to synthesize information**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=admin@sentinelops.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "What time should the team depart and when should they complete their objectives?",
    "include_history": true
  }'
```

**Expected Response:**
```json
{
  "answer": "According to the timeline, the team should depart at 0600 hours and complete their objectives by 1400 hours, with a planned return to base at 1800 hours.",
  "sources": ["mission_briefing.txt"],
  "timestamp": "2025-12-08T10:47:00"
}
```

✅ **Pass Criteria:**
- Status 200
- Answer synthesizes information from multiple parts of document
- Provides accurate timeline information

---

### **STEP 17: Chat with Document - Question Outside Document**

**Test AI handling of questions not answered in document**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=admin@sentinelops.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "What is the weather forecast for the mission?",
    "include_history": true
  }'
```

**Expected Response:**
```json
{
  "answer": "The document does not contain information about the weather forecast for the mission. The briefing focuses on objectives, team assignments, resources, and timeline, but does not include weather information.",
  "sources": ["mission_briefing.txt"],
  "timestamp": "2025-12-08T10:48:00"
}
```

✅ **Pass Criteria:**
- Status 200
- AI acknowledges information is not in document
- Does not hallucinate or make up information

---

### **STEP 18: Get Chat History**

**Test retrieving conversation history**

```bash
curl "http://localhost:8000/api/docsage/chat/history/DOC_ID_2?user_email=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "document_id": "67567890abcdef123456789b",
  "mission_id": "mission_phoenix_001",
  "user_id": "admin@sentinelops.com",
  "messages": [
    {
      "role": "user",
      "content": "What are the main objectives of Operation Phoenix?",
      "timestamp": "2025-12-08T10:45:00"
    },
    {
      "role": "assistant",
      "content": "The main objectives of Operation Phoenix are...",
      "timestamp": "2025-12-08T10:45:01"
    },
    {
      "role": "user",
      "content": "Who are the team members assigned to this operation?",
      "timestamp": "2025-12-08T10:46:00"
    },
    {
      "role": "assistant",
      "content": "The team members assigned to Operation Phoenix are...",
      "timestamp": "2025-12-08T10:46:01"
    }
  ],
  "created_at": "2025-12-08T10:45:00",
  "updated_at": "2025-12-08T10:48:00"
}
```

✅ **Pass Criteria:**
- Status 200
- All messages are present in chronological order
- Messages alternate between user and assistant
- Timestamps are correct
- Document and mission IDs match

---

### **STEP 19: Agent Chat with Document**

**Test agent can chat with documents from assigned missions**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=agent.johnson@sentinelops.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "What resources are required for this mission?",
    "include_history": false
  }'
```

**Expected Response:**
```json
{
  "answer": "The resources required for Operation Phoenix include: communication equipment, tactical gear, and a transportation vehicle.",
  "sources": ["mission_briefing.txt"],
  "timestamp": "2025-12-08T10:50:00"
}
```

✅ **Pass Criteria:**
- Status 200
- Agent can chat with assigned mission documents
- Answer is accurate

---

### **STEP 20: Unauthorized Chat Attempt**

**Test chat access control**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=unauthorized@example.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "What are the objectives?",
    "include_history": true
  }'
```

**Expected Response:**
```json
{
  "detail": "You do not have permission to access this document"
}
```

✅ **Pass Criteria:**
- Status 403 (Forbidden)
- Unauthorized users cannot chat with documents

---

### **STEP 21: Upload PDF Document**

**Test PDF file upload and processing**

Create a test PDF (or use existing):
```bash
# Use any PDF file you have
curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@sample.pdf" \
  -F "mission_id=mission_phoenix_001" \
  -F "uploaded_by=admin@sentinelops.com" \
  -F "allowed_users=agent.johnson@sentinelops.com"
```

**Expected Response:**
```json
{
  "id": "67567890abcdef123456789c",
  "name": "sample.pdf",
  "status": "processing",
  "uploaded_at": "2025-12-08T10:55:00",
  "uploaded_by": "admin@sentinelops.com",
  "mission_id": "mission_phoenix_001"
}
```

✅ **Pass Criteria:**
- Status 200
- PDF accepted
- Status is "processing"

**Save document ID:** `DOC_ID_3=<returned_id>`

Wait 20-30 seconds for PDF processing, then verify:

```bash
curl "http://localhost:8000/api/docsage/documents/DOC_ID_3?user_email=admin@sentinelops.com"
```

✅ **Pass Criteria:**
- PDF text extracted successfully
- Summary and keywords generated
- Status is "processed"

---

### **STEP 22: Upload Image Document (OCR)**

**Test image upload with OCR processing**

```bash
# Use an image with text (screenshot, photo of document, etc.)
curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@document_scan.jpg" \
  -F "uploaded_by=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "id": "67567890abcdef123456789d",
  "name": "document_scan.jpg",
  "status": "processing",
  "uploaded_at": "2025-12-08T11:00:00",
  "uploaded_by": "admin@sentinelops.com",
  "mission_id": null
}
```

✅ **Pass Criteria:**
- Status 200
- Image accepted
- OCR will extract text

---

### **STEP 23: Test File Type Restrictions**

**Test upload rejection for unsupported file types**

```bash
echo "test" > test.exe
curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@test.exe" \
  -F "uploaded_by=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "detail": "File type .exe not allowed. Allowed: ['.pdf', '.txt', '.jpg', '.jpeg', '.png']"
}
```

✅ **Pass Criteria:**
- Status 400 (Bad Request)
- Clear error message about file type

---

### **STEP 24: Test File Size Limit**

**Test upload rejection for files exceeding size limit**

```bash
# Create a large file (>10MB if that's your limit)
dd if=/dev/zero of=large_file.txt bs=1M count=15

curl -X POST http://localhost:8000/api/docsage/upload \
  -F "file=@large_file.txt" \
  -F "uploaded_by=admin@sentinelops.com"
```

**Expected Response:**
```json
{
  "detail": "File size exceeds 10.0MB limit"
}
```

✅ **Pass Criteria:**
- Status 413 (Payload Too Large)
- Clear error message about size limit

---

### **STEP 25: Delete Document**

**Test document deletion**

```bash
curl -X DELETE "http://localhost:8000/api/docsage/documents/DOC_ID_1"
```

**Expected Response:**
```json
{
  "message": "Document deleted successfully",
  "id": "67567890abcdef123456789a"
}
```

✅ **Pass Criteria:**
- Status 200
- Document removed from database
- File removed from storage

Verify deletion:
```bash
curl "http://localhost:8000/api/docsage/documents/DOC_ID_1?user_email=admin@sentinelops.com"
```

Expected: Status 404 (Not Found)

---

### **STEP 26: Chat Without History**

**Test chat with history disabled**

```bash
curl -X POST "http://localhost:8000/api/docsage/chat?user_email=admin@sentinelops.com" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "DOC_ID_2",
    "question": "What checkpoint is mentioned?",
    "include_history": false
  }'
```

**Expected Response:**
```json
{
  "answer": "Checkpoint Bravo is mentioned as the location where a communication relay needs to be established.",
  "sources": ["mission_briefing.txt"],
  "timestamp": "2025-12-08T11:10:00"
}
```

✅ **Pass Criteria:**
- Status 200
- Answer provided without context from previous messages
- Demonstrates stateless query capability

---

### **STEP 27: Multiple Users - Separate Chat Histories**

**Test chat history isolation per user**

Get Agent's chat history:
```bash
curl "http://localhost:8000/api/docsage/chat/history/DOC_ID_2?user_email=agent.johnson@sentinelops.com"
```

**Expected Response:**
```json
{
  "document_id": "67567890abcdef123456789b",
  "mission_id": "mission_phoenix_001",
  "user_id": "agent.johnson@sentinelops.com",
  "messages": [
    {
      "role": "user",
      "content": "What resources are required for this mission?",
      "timestamp": "2025-12-08T10:50:00"
    },
    {
      "role": "assistant",
      "content": "The resources required for Operation Phoenix include...",
      "timestamp": "2025-12-08T10:50:01"
    }
  ],
  "created_at": "2025-12-08T10:50:00",
  "updated_at": "2025-12-08T10:50:01"
}
```

✅ **Pass Criteria:**
- Agent's chat history is separate from admin's
- Only contains agent's messages
- Does not include admin's conversation

---

## 📊 Test Results Summary

### Feature Coverage Checklist

- [ ] **Document Upload**
  - [ ] Basic upload (no mission)
  - [ ] Upload with mission_id
  - [ ] Upload with allowed_users
  - [ ] PDF upload
  - [ ] Image upload (OCR)
  - [ ] File type validation
  - [ ] File size validation

- [ ] **Document Processing**
  - [ ] Text extraction
  - [ ] AI summary generation (short & long)
  - [ ] Keyword extraction
  - [ ] Tag suggestions
  - [ ] Document insights generation
  - [ ] Status updates (processing → processed)

- [ ] **Access Control**
  - [ ] Admin can access their documents
  - [ ] Agents can access assigned mission documents
  - [ ] Unauthorized users denied access
  - [ ] Access check endpoint works
  - [ ] User-based document filtering

- [ ] **Document Retrieval**
  - [ ] Get single document by ID
  - [ ] Get all documents
  - [ ] Filter by user
  - [ ] Filter by mission
  - [ ] Document details include all fields

- [ ] **Search**
  - [ ] Search across document content
  - [ ] Search by keywords
  - [ ] Search respects access control
  - [ ] Match context provided

- [ ] **AI Chatbot**
  - [ ] Answer questions about document
  - [ ] Context awareness (history)
  - [ ] Stateless queries (no history)
  - [ ] Handles questions outside document scope
  - [ ] Multiple users have separate histories
  - [ ] Chat history retrieval
  - [ ] Access control in chat

- [ ] **CRUD Operations**
  - [ ] Create (upload)
  - [ ] Read (get document)
  - [ ] Update (processed status)
  - [ ] Delete (remove document)

---

## 🐛 Common Issues & Solutions

### Issue 1: Document Stuck in "Processing"
**Symptoms:** Document status never changes from "processing"

**Check:**
```bash
# Check backend logs for errors
# Verify Ollama is running
# Check MongoDB connection
```

**Solution:**
- Verify environment variables
- Check Ollama service status (ollama serve)
- Restart backend server

---

### Issue 2: Chat Returns Generic Answers
**Symptoms:** AI gives generic responses not based on document

**Check:**
```bash
# Verify document has extracted_text
curl "http://localhost:8000/api/docsage/documents/DOC_ID?user_email=admin@sentinelops.com" | grep extracted_text
```

**Solution:**
- Ensure document is fully processed
- Check text extraction worked
- Verify document content is relevant

---

### Issue 3: 403 Forbidden on Document Access
**Symptoms:** User cannot access document

**Check:**
```bash
# Verify user is in allowed_users
curl -X POST http://localhost:8000/api/docsage/documents/DOC_ID/check-access \
  -H "Content-Type: application/json" \
  -d '{"document_id": "DOC_ID", "user_email": "user@example.com"}'
```

**Solution:**
- Verify user email is correct
- Check mission assignment
- Verify allowed_users list

---

### Issue 4: Search Returns No Results
**Symptoms:** Search query returns empty results

**Check:**
```bash
# Verify documents are processed
curl "http://localhost:8000/api/docsage/documents?user_email=admin@sentinelops.com"
```

**Solution:**
- Ensure documents are in "processed" state
- Try broader search terms
- Check access permissions

---

## 🎯 Success Criteria

All tests pass if:

1. ✅ All document formats upload successfully
2. ✅ AI processing completes within 30 seconds
3. ✅ Summaries are relevant and accurate
4. ✅ Access control enforced correctly
5. ✅ Chat provides accurate answers based on content
6. ✅ Chat history maintained per user
7. ✅ Search returns relevant results
8. ✅ All CRUD operations work
9. ✅ Error handling is appropriate
10. ✅ Mission-based filtering works correctly

---

## 📝 Test Report Template

```markdown
## Doc-Sage Test Report
**Date:** December 8, 2025
**Tester:** [Your Name]
**Environment:** Development

### Test Results
- Total Tests: 27
- Passed: __
- Failed: __
- Skipped: __

### Failed Tests
1. [Test Name] - [Reason]
2. ...

### Notes
[Any additional observations]

### Recommendations
[Suggestions for improvements]
```

---

## 🚀 Automation Script

For automated testing, use the Python test script:

```bash
cd backend
python test_docsage.py
```

This will run through all major test scenarios automatically.

---

## 📞 Support

If tests fail or you encounter issues:
1. Check backend logs
2. Verify environment variables
3. Ensure MongoDB is running
4. Check Ollama service status (ollama list)
5. Review error messages carefully

---

**End of Test Guide** 🎉
