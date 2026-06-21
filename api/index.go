package handler

// Build Trigger: Force embed refresh 2.0.9
import (
	"bytes"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed templates/*
var templateFS embed.FS

// ==========================================================================
// MODELS
// ==========================================================================

type Project struct {
	ID              string   `json:"id"`
	Name            string   `json:"name"`
	Slug            string   `json:"slug"`
	Description     string   `json:"description"`
	LongDescription string   `json:"long_description"`
	TechStack       []string `json:"tech_stack"`
	Category        string   `json:"category"`
	ThumbnailURL    string   `json:"thumbnail_url"`
	DemoURL         string   `json:"demo_url"`
	GithubURL       string   `json:"github_url"`
	IsFeatured      bool     `json:"is_featured"`
	OrderIndex      int      `json:"order_index"`
}

// TechStackJSON formats the slice as a JSON string for HTML data attribute
func (p Project) TechStackJSON() string {
	bytes, _ := json.Marshal(p.TechStack)
	return string(bytes)
}

type GuestbookMessage struct {
	ID         string `json:"id"`
	SenderName string `json:"sender_name"`
	Message    string `json:"message"`
	CreatedAt  string `json:"created_at"`
	IPAddress  string `json:"ip_address,omitempty"`
}

type TemplateData struct {
	Configs           map[string]string
	SkillsByCategory  map[string][]Skill
	Timeline          []TimelineItem
	Projects          []Project
	GuestbookMessages []ExtendedGuestbookMessage
	TotalSignals      int
	Year              int
}

// ==========================================================================
// SEED & FALLBACK DATA
// ==========================================================================

var seedProjects = []Project{
	{
		ID:              "seed-1",
		Name:            "StuntSense",
		Slug:            "stuntsense",
		Description:     "AI-powered Android app for toddler stunting screening using computer vision.",
		LongDescription: "StuntSense explores easy toddler stunting screening on Android using pose estimation and on-device ML models like TensorFlow Lite and MediaPipe.",
		TechStack:       []string{"Kotlin", "Jetpack Compose", "MobileNetV3", "MediaPipe", "TFLite", "Firebase"},
		Category:        "ai",
		IsFeatured:      true,
		GithubURL:       "https://github.com/irhamqowi/stuntsense",
		OrderIndex:      1,
	},
	{
		ID:              "seed-2",
		Name:            "RAG System",
		Slug:            "rag-system",
		Description:     "Retrieval-Augmented Generation pipeline for smart document Q&A.",
		LongDescription: "A retrieval pipeline that stores semantic document chunks in Pinecone and grounds Gemini model responses with relevant context for accurate Q&A.",
		TechStack:       []string{"Python", "LangChain", "Gemini", "Pinecone", "FastAPI"},
		Category:        "data",
		IsFeatured:      true,
		GithubURL:       "https://github.com/irhamqowi/Kyou-Chan",
		OrderIndex:      2,
	},
	{
		ID:              "seed-3",
		Name:            "Ticket Booking System",
		Slug:            "ticket-system",
		Description:     "Web-based ticket ordering system built for a client with payment gateway integration.",
		LongDescription: "A production-grade ticket booking platform with an admin dashboard, customer checkout flow, and Midtrans payment gateway integration.",
		TechStack:       []string{"Laravel", "Next.js", "MySQL", "Midtrans"},
		Category:        "web",
		IsFeatured:      false,
		GithubURL:       "",
		OrderIndex:      3,
	},
	{
		ID:              "seed-4",
		Name:            "Stricter",
		Slug:            "stricter",
		Description:     "Productivity RPG Android app with app-blocking, focus sessions, and gamification.",
		LongDescription: "Stricter turns focus hours into game quests on Android, featuring app blocking, scheduled focus sessions, and Room local database.",
		TechStack:       []string{"Kotlin", "Jetpack Compose", "Room", "WorkManager"},
		Category:        "mobile",
		IsFeatured:      false,
		GithubURL:       "",
		OrderIndex:      4,
	},
}

var fallbackMessages = []GuestbookMessage{
	{
		ID:         "fallback-1",
		SenderName: "Visitor",
		Message:    "Website portfolio-nya tenang, rapi, dan vibes Jepangnya berasa.",
		CreatedAt:  time.Now().Add(-24 * time.Hour).Format(time.RFC3339),
	},
	{
		ID:         "fallback-2",
		SenderName: "Client",
		Message:    "Najin cepat memahami kebutuhan dan membangun solusi yang praktis.",
		CreatedAt:  time.Now().Add(-12 * time.Hour).Format(time.RFC3339),
	},
}

var fallbackSkills = []Skill{
	{Name: "Python", Category: "AI & Data Science", ProficiencyPercent: 90, OrderIndex: 1},
	{Name: "LangChain", Category: "AI & Data Science", ProficiencyPercent: 85, OrderIndex: 2},
	{Name: "Gemini", Category: "AI & Data Science", ProficiencyPercent: 85, OrderIndex: 3},
	{Name: "Pinecone", Category: "AI & Data Science", ProficiencyPercent: 80, OrderIndex: 4},
	{Name: "TFLite", Category: "AI & Data Science", ProficiencyPercent: 75, OrderIndex: 5},
	{Name: "MediaPipe", Category: "AI & Data Science", ProficiencyPercent: 75, OrderIndex: 6},
	{Name: "FastAPI", Category: "AI & Data Science", ProficiencyPercent: 80, OrderIndex: 7},
	{Name: "Next.js", Category: "Web Fullstack", ProficiencyPercent: 85, OrderIndex: 8},
	{Name: "React", Category: "Web Fullstack", ProficiencyPercent: 85, OrderIndex: 9},
	{Name: "Laravel", Category: "Web Fullstack", ProficiencyPercent: 80, OrderIndex: 10},
	{Name: "TypeScript", Category: "Web Fullstack", ProficiencyPercent: 80, OrderIndex: 11},
	{Name: "MySQL", Category: "Web Fullstack", ProficiencyPercent: 80, OrderIndex: 12},
	{Name: "Supabase", Category: "Web Fullstack", ProficiencyPercent: 80, OrderIndex: 13},
	{Name: "TailwindCSS", Category: "Web Fullstack", ProficiencyPercent: 85, OrderIndex: 14},
	{Name: "Kotlin XML", Category: "Mobile Engineering", ProficiencyPercent: 80, OrderIndex: 15},
	{Name: "Jetpack Compose", Category: "Mobile Engineering", ProficiencyPercent: 80, OrderIndex: 16},
	{Name: "Room Database", Category: "Mobile Engineering", ProficiencyPercent: 80, OrderIndex: 17},
	{Name: "WorkManager", Category: "Mobile Engineering", ProficiencyPercent: 75, OrderIndex: 18},
	{Name: "Retrofit", Category: "Mobile Engineering", ProficiencyPercent: 80, OrderIndex: 19},
}

var fallbackTimeline = []TimelineItem{
	{Year: "Semester 1 (2023)", Title: "Core Logic", CompanyOrInstitution: "Academics", Description: "Learned programming fundamentals, built static web projects, and mastered core algorithmic logic.", Type: "education", OrderIndex: 1},
	{Year: "Year 2 (2024)", Title: "Web & Mobile Developer", CompanyOrInstitution: "Client Work", Description: "Developed production-grade websites for real clients, ticketing systems, and began diving into mobile development with Kotlin.", Type: "experience", OrderIndex: 2},
	{Year: "Present (2026)", Title: "AI Engineer focus", CompanyOrInstitution: "Labs & Research", Description: "Deep focus on AI systems: designing RAG pipelines, building on-device ML computer vision models, and optimizing machine learning endpoints.", Type: "experience", OrderIndex: 3},
}

// ==========================================================================
// RATE LIMITER (In-Memory)
// ==========================================================================

type RateLimiter struct {
	mu      sync.Mutex
	history map[string][]time.Time
}

var limiter = RateLimiter{
	history: make(map[string][]time.Time),
}

func (rl *RateLimiter) Allow(ip string, limit int, window time.Duration) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-window)

	var active []time.Time
	for _, t := range rl.history[ip] {
		if t.After(cutoff) {
			active = append(active, t)
		}
	}

	if len(active) >= limit {
		rl.history[ip] = active
		return false
	}

	active = append(active, now)
	rl.history[ip] = active
	return true
}

// ==========================================================================
// SUPABASE CLIENT (Direct PostgREST REST Calls)
// ==========================================================================

func fetchProjects() ([]Project, error) {
	subURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	anonKey := os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	if subURL == "" || anonKey == "" {
		return nil, fmt.Errorf("credentials missing")
	}

	url := fmt.Sprintf("%s/rest/v1/projects?select=*&order=order_index.asc", subURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", "Bearer "+anonKey)

	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code %d", resp.StatusCode)
	}

	var projects []Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return nil, err
	}
	return projects, nil
}

func fetchGuestbook() ([]GuestbookMessage, error) {
	subURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	anonKey := os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	if subURL == "" || anonKey == "" {
		return nil, fmt.Errorf("credentials missing")
	}

	url := fmt.Sprintf("%s/rest/v1/guestbook?select=id,sender_name,message,created_at&is_approved=eq.true&order=created_at.desc&limit=50", subURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", "Bearer "+anonKey)

	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status code %d", resp.StatusCode)
	}

	var messages []GuestbookMessage
	if err := json.NewDecoder(resp.Body).Decode(&messages); err != nil {
		return nil, err
	}
	return messages, nil
}

func insertGuestbook(msg GuestbookMessage) (string, error) {
	subURL := os.Getenv("NEXT_PUBLIC_SUPABASE_URL")
	anonKey := os.Getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
	if subURL == "" || anonKey == "" {
		return "", fmt.Errorf("credentials missing")
	}

	url := fmt.Sprintf("%s/rest/v1/guestbook", subURL)
	payload := map[string]interface{}{
		"sender_name": msg.SenderName,
		"message":     msg.Message,
		"is_approved": true,
		"ip_address":  msg.IPAddress,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("apikey", anonKey)
	req.Header.Set("Authorization", "Bearer "+anonKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		errBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("supabase err: %s", string(errBytes))
	}

	var respMsg []GuestbookMessage
	if err := json.NewDecoder(resp.Body).Decode(&respMsg); err != nil {
		return "", err
	}

	if len(respMsg) > 0 {
		return respMsg[0].ID, nil
	}

	return "", nil
}

// ==========================================================================
// RESEND EMAIL CLIENT
// ==========================================================================

func triggerResendEmail(senderName, message string) {
	apiKey := os.Getenv("RESEND_API_KEY")
	toEmail := os.Getenv("NOTIFICATION_EMAIL")
	if apiKey == "" || toEmail == "" || strings.Contains(apiKey, "YOUR_RESEND") {
		return
	}

	cleanName := template.HTMLEscapeString(senderName)
	cleanMsg := template.HTMLEscapeString(message)

	htmlBody := fmt.Sprintf(`
		<div style="font-family: monospace; padding: 20px; background: #0D0D0B; color: #EEEEF0;">
			<h2 style="color: #3DD68C;">New Guestbook Message (Auto-Approved)</h2>
			<p><strong>From:</strong> %s</p>
			<p><strong>Message:</strong></p>
			<blockquote style="border-left: 3px solid #3DD68C; padding-left: 12px; color: #9696A0;">
				%s
			</blockquote>
			<p><strong>Time:</strong> %s</p>
		</div>
	`, cleanName, cleanMsg, time.Now().Format("2006-01-02 15:04:05"))

	payload := map[string]interface{}{
		"from":    "noreply@najinkyou.dev",
		"to":      toEmail,
		"subject": fmt.Sprintf("📨 New guestbook message from %s", senderName),
		"html":    htmlBody,
	}

	bodyBytes, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return
	}

	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err == nil {
		resp.Body.Close()
	}
}

// ==========================================================================
// RAG ENGINE (Gemini API & Pinecone HTTP API)
// ==========================================================================

var (
	pineconeHost = ""
	pineconeMu   sync.RWMutex
)

func getPineconeHost() (string, error) {
	pineconeMu.RLock()
	if pineconeHost != "" {
		host := pineconeHost
		pineconeMu.RUnlock()
		return host, nil
	}
	pineconeMu.RUnlock()

	apiKey := os.Getenv("PINECONE_API_KEY")
	idxName := os.Getenv("PINECONE_INDEX_NAME")
	if apiKey == "" || idxName == "" {
		return "", fmt.Errorf("pinecone credentials missing")
	}

	req, err := http.NewRequest("GET", "https://api.pinecone.io/indexes/"+idxName, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Api-Key", apiKey)

	client := &http.Client{Timeout: 4 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to describe index: %d", resp.StatusCode)
	}

	var indexInfo struct {
		Host string `json:"host"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&indexInfo); err != nil {
		return "", err
	}

	pineconeMu.Lock()
	pineconeHost = "https://" + indexInfo.Host
	pineconeMu.Unlock()

	return pineconeHost, nil
}

func embedQuery(query string) ([]float32, error) {
	apiKey := dbGetConfig("google_generative_ai_api_key", "")
	if apiKey == "" {
		apiKey = os.Getenv("GOOGLE_GENERATIVE_AI_API_KEY")
	}
	if apiKey == "" {
		return nil, fmt.Errorf("gemini key missing")
	}

	url := "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + apiKey
	payload := map[string]interface{}{
		"model": "models/text-embedding-004",
		"content": map[string]interface{}{
			"parts": []map[string]interface{}{
				{"text": query},
			},
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("embed status: %d", resp.StatusCode)
	}

	var result struct {
		Embedding struct {
			Values []float32 `json:"values"`
		} `json:"embedding"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return result.Embedding.Values, nil
}

func queryPinecone(vector []float32) (string, error) {
	host, err := getPineconeHost()
	if err != nil {
		return "", err
	}

	apiKey := os.Getenv("PINECONE_API_KEY")
	url := host + "/query"

	payload := map[string]interface{}{
		"vector":          vector,
		"topK":            4,
		"includeMetadata": true,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Api-Key", apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 4 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("pinecone query status: %d", resp.StatusCode)
	}

	var results struct {
		Matches []struct {
			Metadata map[string]interface{} `json:"metadata"`
		} `json:"matches"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&results); err != nil {
		return "", err
	}

	var chunks []string
	for _, match := range results.Matches {
		if text, ok := match.Metadata["text"].(string); ok && text != "" {
			chunks = append(chunks, text)
		}
	}

	return strings.Join(chunks, "\n\n---\n\n"), nil
}

func generateAnswer(query, context string) (string, error) {
	apiKey := dbGetConfig("google_generative_ai_api_key", "")
	if apiKey == "" {
		apiKey = os.Getenv("GOOGLE_GENERATIVE_AI_API_KEY")
	}
	if apiKey == "" {
		return "", fmt.Errorf("gemini API key missing")
	}

	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey

	prompt := fmt.Sprintf("You are Najin Kyou's portfolio assistant. Answer concisely from the context. If unknown, say it is not in the knowledge base.\n\nContext:\n%s\n\nQuestion: %s", context, query)

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
				},
			},
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("gemini status: %d", resp.StatusCode)
	}

	var result struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Candidates) > 0 && len(result.Candidates[0].Content.Parts) > 0 {
		return result.Candidates[0].Content.Parts[0].Text, nil
	}

	return "No answer generated.", nil
}

// ==========================================================================
// SANITIZERS & VALIDATORS
// ==========================================================================

func sanitizeName(s string) string {
	// Strip HTML and weird chars
	re := regexp.MustCompile(`[^\p{L}\p{N}\s\-\_\.\,\!\?]`)
	s = re.ReplaceAllString(s, "")
	return strings.TrimSpace(s)
}

func sanitizeMessage(s string) string {
	re := regexp.MustCompile(`[<>]`)
	s = re.ReplaceAllString(s, "")
	return strings.TrimSpace(s)
}

func resolvePath(r *http.Request) string {
	// Vercel serverless function rewrites pass original path in x-invoke-path or x-matched-path
	for _, h := range []string{"X-Invoke-Path", "X-Matched-Path", "X-Original-Url"} {
		if p := r.Header.Get(h); p != "" {
			// Strip query parameters
			if idx := strings.Index(p, "?"); idx != -1 {
				p = p[:idx]
			}
			// If it's just the rewritten function name, skip it
			if p != "" && p != "/api/index" && p != "/api/index.go" {
				// Normalize trailing slash for admin
				if p == "/admin/" {
					return "/admin"
				}
				return p
			}
		}
	}
	p := r.URL.Path
	if p == "/admin/" {
		return "/admin"
	}
	return p
}

// ==========================================================================
// MAIN VERCEL HANDLER
// ==========================================================================

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	reqPath := resolvePath(r)

	// Get IP Address
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	ip = strings.Split(ip, ",")[0]

	// Intercept administrative routes
	if strings.HasPrefix(reqPath, "/admin") {
		if reqPath == "/admin" {
			if r.Method == http.MethodPost {
				handleAdminLogin(w, r)
				return
			}
			if isAdminAuthenticated(r) {
				handleAdminDashboard(w, r)
				return
			}
			renderAdminLogin(w, "")
			return
		}

		if reqPath == "/admin/logout" && r.Method == http.MethodPost {
			handleAdminLogout(w, r)
			return
		}

		// Require auth for any other admin REST APIs
		if !isAdminAuthenticated(r) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Unauthorized session"})
			return
		}

		switch reqPath {
		case "/admin/config/update":
			handleAdminConfigUpdate(w, r)
		case "/admin/skill/list":
			handleAdminSkillList(w, r)
		case "/admin/skill/add":
			handleAdminSkillAdd(w, r)
		case "/admin/skill/update":
			handleAdminSkillUpdate(w, r)
		case "/admin/skill/delete":
			handleAdminSkillDelete(w, r)
		case "/admin/timeline/list":
			handleAdminTimelineList(w, r)
		case "/admin/timeline/add":
			handleAdminTimelineAdd(w, r)
		case "/admin/timeline/update":
			handleAdminTimelineUpdate(w, r)
		case "/admin/timeline/delete":
			handleAdminTimelineDelete(w, r)
		case "/admin/project/list":
			handleAdminProjectList(w, r)
		case "/admin/project/add":
			handleAdminProjectAdd(w, r)
		case "/admin/project/update":
			handleAdminProjectUpdate(w, r)
		case "/admin/project/delete":
			handleAdminProjectDelete(w, r)
		case "/admin/message/list":
			handleAdminMessageList(w, r)
		case "/admin/message/reply":
			handleAdminMessageReply(w, r)
		case "/admin/message/delete":
			handleAdminMessageDelete(w, r)
		case "/admin/upload-blob":
			handleAdminUploadBlob(w, r)
		default:
			http.NotFound(w, r)
		}
		return
	}

	// Handle API endpoints
	switch reqPath {
	case "/api/guestbook":
		if r.Method == http.MethodGet {
			handleGetGuestbook(w, r)
			return
		}
		if r.Method == http.MethodPost {
			handlePostGuestbook(w, r, ip)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return

	case "/api/chat":
		if r.Method == http.MethodPost {
			handleChat(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return

	case "/api/ml-infer":
		if r.Method == http.MethodPost {
			handleMlInfer(w, r)
			return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return

	case "/":
		handleIndex(w, r)
		return

	default:
		// Serve index for any fallback routes (helps single page anchor routes)
		handleIndex(w, r)
		return
	}
}

// GET /api/guestbook
func handleGetGuestbook(w http.ResponseWriter, r *http.Request) {
	var messages []ExtendedGuestbookMessage
	var err error
	if dbEnabled {
		messages, err = dbGetGuestbookMessages(50)
	} else {
		var list []GuestbookMessage
		list, err = fetchGuestbook()
		if err == nil {
			messages = make([]ExtendedGuestbookMessage, len(list))
			for i, sm := range list {
				messages[i] = ExtendedGuestbookMessage{
					ID:         sm.ID,
					SenderName: sm.SenderName,
					Message:    sm.Message,
					CreatedAt:  sm.CreatedAt,
					IPAddress:  sm.IPAddress,
				}
			}
		}
	}

	if err != nil {
		messages = getExtendedFallbackMessages()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"messages": messages,
		"total":    len(messages),
	})
}

// POST /api/guestbook
func handlePostGuestbook(w http.ResponseWriter, r *http.Request, ip string) {
	// Rate limit check: max 3 requests per 10 minutes per IP
	if !limiter.Allow(ip, 3, 10*time.Minute) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Too many requests. Please wait a few minutes before trying again.",
		})
		return
	}

	var reqData struct {
		SenderName string `json:"sender_name"`
		Message    string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	cleanName := sanitizeName(reqData.SenderName)
	cleanMsg := sanitizeMessage(reqData.Message)

	if len(cleanName) < 2 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Name must be at least 2 characters."})
		return
	}

	if len(cleanMsg) < 5 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Message must be at least 5 characters."})
		return
	}

	if len(cleanMsg) > 500 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Message must be under 500 characters."})
		return
	}

	msg := GuestbookMessage{
		SenderName: cleanName,
		Message:    cleanMsg,
		IPAddress:  ip,
	}

	var idStr string
	var err error
	if dbEnabled {
		var idInt int
		idInt, err = dbAddGuestbookMessage(msg)
		if err == nil {
			idStr = strconv.Itoa(idInt)
		}
	} else {
		idStr, err = insertGuestbook(msg)
	}

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to store message in database."})
		return
	}

	// Trigger email in background
	go triggerResendEmail(cleanName, cleanMsg)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"id":      idStr,
	})
}

// POST /api/chat
func handleChat(w http.ResponseWriter, r *http.Request) {
	var reqData struct {
		Message string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if reqData.Message == "" {
		http.Error(w, "Message is required", http.StatusBadRequest)
		return
	}

	// 1. Embed query
	vector, err := embedQuery(reqData.Message)
	if err != nil {
		http.Error(w, "Failed embedding: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 2. Query Pinecone
	context, err := queryPinecone(vector)
	if err != nil {
		http.Error(w, "Failed vector query: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Generate Answer
	answer, err := generateAnswer(reqData.Message, context)
	if err != nil {
		http.Error(w, "Failed generation: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write([]byte(answer))
}

// POST /api/ml-infer
func handleMlInfer(w http.ResponseWriter, r *http.Request) {
	mlURL := os.Getenv("ML_SERVICE_URL")
	if mlURL == "" {
		http.Error(w, "ML service not configured", http.StatusServiceUnavailable)
		return
	}

	// Read body
	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Read error", http.StatusBadRequest)
		return
	}

	// Proxy POST request
	req, err := http.NewRequest("POST", mlURL+"/infer", bytes.NewBuffer(bodyBytes))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	if secret := os.Getenv("ML_SERVICE_SECRET"); secret != "" {
		req.Header.Set("Authorization", "Bearer "+secret)
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy headers
	for k, vv := range resp.Header {
		for _, v := range vv {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// GET /
func handleIndex(w http.ResponseWriter, r *http.Request) {
	// 1. Fetch Configs
	configs := map[string]string{
		"hero_title":        dbGetConfig("hero_title", "Irham Najib Azimul Qowi"),
		"hero_subtitle":     dbGetConfig("hero_subtitle", "AI Engineer & Full-Stack Developer"),
		"hero_description":  dbGetConfig("hero_description", "Building intelligent systems with Go, Python, and modern web frameworks."),
		"about_description": dbGetConfig("about_description", "Irham Najib Azimul Qowi is a Software Engineering student at Politeknik Negeri Madiun, Indonesia. Writing under the professional pseudonym Najin Kyou, he explores the convergence of data pipelines, pose estimation screening, and Retrieval-Augmented Generation (RAG). He believes in clean code craftsmanship and meticulous detail."),
	}

	// 2. Fetch Skills
	var skillsList []Skill
	if dbEnabled {
		var err error
		skillsList, err = dbGetSkills()
		if err != nil {
			skillsList = fallbackSkills
		}
	} else {
		skillsList = fallbackSkills
	}
	skillsByCategory := make(map[string][]Skill)
	for _, s := range skillsList {
		skillsByCategory[s.Category] = append(skillsByCategory[s.Category], s)
	}

	// 3. Fetch Timeline
	var timeline []TimelineItem
	if dbEnabled {
		var err error
		timeline, err = dbGetTimeline()
		if err != nil {
			timeline = fallbackTimeline
		}
	} else {
		timeline = fallbackTimeline
	}

	// 4. Fetch projects (or use seed fallbacks)
	var projects []Project
	if dbEnabled {
		var err error
		projects, err = dbGetProjects()
		if err != nil || len(projects) == 0 {
			projects, _ = fetchProjects()
			if len(projects) == 0 {
				projects = seedProjects
			}
		}
	} else {
		var err error
		projects, err = fetchProjects()
		if err != nil || len(projects) == 0 {
			projects = seedProjects
		}
	}

	// 5. Fetch guestbook messages (or use fallbacks)
	var messages []ExtendedGuestbookMessage
	if dbEnabled {
		var err error
		messages, err = dbGetGuestbookMessages(50)
		if err != nil {
			messages = getExtendedFallbackMessages()
		}
	} else {
		supabaseMsgs, err := fetchGuestbook()
		if err != nil {
			messages = getExtendedFallbackMessages()
		} else {
			messages = make([]ExtendedGuestbookMessage, len(supabaseMsgs))
			for i, sm := range supabaseMsgs {
				messages[i] = ExtendedGuestbookMessage{
					ID:         sm.ID,
					SenderName: sm.SenderName,
					Message:    sm.Message,
					CreatedAt:  sm.CreatedAt,
					IPAddress:  sm.IPAddress,
				}
			}
		}
	}

	// 6. Renders HTML
	tmpl, err := template.New("index.html").Funcs(template.FuncMap{
		"mod": func(a, b int) int { return a % b },
	}).ParseFS(templateFS, "templates/index.html")
	if err != nil {
		http.Error(w, "Error loading template: "+err.Error(), http.StatusInternalServerError)
		return
	}

	data := TemplateData{
		Configs:           configs,
		SkillsByCategory:  skillsByCategory,
		Timeline:          timeline,
		Projects:          projects,
		GuestbookMessages: messages,
		TotalSignals:      len(messages),
		Year:              time.Now().Year(),
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, "Error rendering: "+err.Error(), http.StatusInternalServerError)
	}
}

func getExtendedFallbackMessages() []ExtendedGuestbookMessage {
	return []ExtendedGuestbookMessage{
		{
			ID:         "fallback-1",
			SenderName: "Visitor",
			Message:    "Website portfolio-nya tenang, rapi, dan vibes Jepangnya berasa.",
			CreatedAt:  time.Now().Add(-24 * time.Hour).Format("2006-01-02 15:04:05"),
		},
		{
			ID:         "fallback-2",
			SenderName: "Client",
			Message:    "Najin cepat memahami kebutuhan dan membangun solusi yang praktis.",
			CreatedAt:  time.Now().Add(-12 * time.Hour).Format("2006-01-02 15:04:05"),
		},
	}
}
