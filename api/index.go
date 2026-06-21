package handler

// Build Trigger: Force embed refresh 2.1.0
import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/lib/pq"
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

var dbInitOnce sync.Once

func Handler(w http.ResponseWriter, r *http.Request) {
	dbInitOnce.Do(func() {
		InitDB()
	})
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

	default:
		// Serve index for any fallback routes (helps single page anchor routes)
		handleIndex(w, r)
		return
	}
}

// ==========================================================================
// DATABASE UTILITIES (CONSOLIDATED FROM DB.GO)
// ==========================================================================

var (
	dbConn    *sql.DB
	dbEnabled bool
)

// Dynamic Site Config struct
type SiteConfig struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

// Skill struct
type Skill struct {
	ID                 int    `json:"id"`
	Name               string `json:"name"`
	Category           string `json:"category"`
	ProficiencyPercent int    `json:"proficiency_percent"`
	OrderIndex         int    `json:"order_index"`
}

// TimelineItem struct
type TimelineItem struct {
	ID                   int    `json:"id"`
	Year                 string `json:"year"`
	Title                string `json:"title"`
	CompanyOrInstitution string `json:"company_or_institution"`
	Description          string `json:"description"`
	Type                 string `json:"type"` // "experience" or "education"
	OrderIndex           int    `json:"order_index"`
}



func InitDB() {
	connStr := os.Getenv("POSTGRES_URL")
	if connStr == "" {
		log.Println("POSTGRES_URL is not set. Database integration disabled, falling back to seed/supabase.")
		dbEnabled = false
		return
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Failed to open postgres: %v. Database integration disabled.", err)
		dbEnabled = false
		return
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(15 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Printf("Failed to ping postgres: %v. Database integration disabled.", err)
		dbEnabled = false
		return
	}

	dbConn = db
	dbEnabled = true
	log.Println("Successfully connected to Vercel Postgres!")

	// Run migrations
	if err := runMigrations(); err != nil {
		log.Printf("Failed to run migrations: %v", err)
	}
}

func runMigrations() error {
	if !dbEnabled {
		return nil
	}

	// 1. Configs Table
	_, err := dbConn.Exec(`
		CREATE TABLE IF NOT EXISTS site_config (
			key VARCHAR(100) PRIMARY KEY,
			value TEXT NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Seed default site configs if not present
	defaultConfigs := map[string]string{
		"hero_title":        "Irham Najib Azimul Qowi",
		"hero_subtitle":     "AI Engineer & Full-Stack Developer",
		"hero_description":  "Building intelligent systems with Go, Python, and modern web frameworks.",
		"about_description": "Irham Najib Azimul Qowi is a Software Engineering student at Politeknik Negeri Madiun, Indonesia. Writing under the professional pseudonym Najin Kyou, he explores the convergence of data pipelines, pose estimation screening, and Retrieval-Augmented Generation (RAG). He believes in clean code craftsmanship and meticulous detail.",
	}

	for k, v := range defaultConfigs {
		var exists bool
		err := dbConn.QueryRow("SELECT EXISTS(SELECT 1 FROM site_config WHERE key = $1)", k).Scan(&exists)
		if err != nil {
			return err
		}
		if !exists {
			_, err = dbConn.Exec("INSERT INTO site_config (key, value) VALUES ($1, $2)", k, v)
			if err != nil {
				return err
			}
		}
	}

	// 2. Skills Table
	_, err = dbConn.Exec(`
		CREATE TABLE IF NOT EXISTS skills (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			category VARCHAR(50) NOT NULL,
			proficiency_percent INT DEFAULT 80,
			order_index INT DEFAULT 0
		)
	`)
	if err != nil {
		return err
	}

	// Seed default skills if empty
	var skillCount int
	err = dbConn.QueryRow("SELECT COUNT(*) FROM skills").Scan(&skillCount)
	if err != nil {
		return err
	}
	if skillCount == 0 {
		skills := []struct {
			name     string
			category string
			prof     int
			order    int
		}{
			// AI & Data Science
			{"Python", "AI & Data Science", 90, 1},
			{"LangChain", "AI & Data Science", 85, 2},
			{"Gemini", "AI & Data Science", 85, 3},
			{"Pinecone", "AI & Data Science", 80, 4},
			{"TFLite", "AI & Data Science", 75, 5},
			{"MediaPipe", "AI & Data Science", 75, 6},
			{"FastAPI", "AI & Data Science", 80, 7},
			// Web Fullstack
			{"Next.js", "Web Fullstack", 85, 8},
			{"React", "Web Fullstack", 85, 9},
			{"Laravel", "Web Fullstack", 80, 10},
			{"TypeScript", "Web Fullstack", 80, 11},
			{"MySQL", "Web Fullstack", 80, 12},
			{"Supabase", "Web Fullstack", 80, 13},
			{"TailwindCSS", "Web Fullstack", 85, 14},
			// Mobile Engineering
			{"Kotlin XML", "Mobile Engineering", 80, 15},
			{"Jetpack Compose", "Mobile Engineering", 80, 16},
			{"Room Database", "Mobile Engineering", 80, 17},
			{"WorkManager", "Mobile Engineering", 75, 18},
			{"Retrofit", "Mobile Engineering", 80, 19},
		}
		for _, s := range skills {
			_, err = dbConn.Exec("INSERT INTO skills (name, category, proficiency_percent, order_index) VALUES ($1, $2, $3, $4)", s.name, s.category, s.prof, s.order)
			if err != nil {
				return err
			}
		}
	}

	// 3. Timeline Table
	_, err = dbConn.Exec(`
		CREATE TABLE IF NOT EXISTS timeline (
			id SERIAL PRIMARY KEY,
			year VARCHAR(50) NOT NULL,
			title VARCHAR(150) NOT NULL,
			company_or_institution VARCHAR(150) NOT NULL,
			description TEXT NOT NULL,
			type VARCHAR(50) NOT NULL,
			order_index INT DEFAULT 0
		)
	`)
	if err != nil {
		return err
	}

	// Seed timeline if empty
	var timelineCount int
	err = dbConn.QueryRow("SELECT COUNT(*) FROM timeline").Scan(&timelineCount)
	if err != nil {
		return err
	}
	if timelineCount == 0 {
		timelineItems := []struct {
			year  string
			title string
			comp  string
			desc  string
			tType string
			order int
		}{
			{"Semester 1 (2023)", "Core Logic", "Academics", "Learned programming fundamentals, built static web projects, and mastered core algorithmic logic.", "education", 1},
			{"Year 2 (2024)", "Web & Mobile Developer", "Client Work", "Developed production-grade websites for real clients, ticketing systems, and began diving into mobile development with Kotlin.", "experience", 2},
			{"Present (2026)", "AI Engineer focus", "Labs & Research", "Deep focus on AI systems: designing RAG pipelines, building on-device ML computer vision models, and optimizing machine learning endpoints.", "experience", 3},
		}
		for _, item := range timelineItems {
			_, err = dbConn.Exec("INSERT INTO timeline (year, title, company_or_institution, description, type, order_index) VALUES ($1, $2, $3, $4, $5, $6)", item.year, item.title, item.comp, item.desc, item.tType, item.order)
			if err != nil {
				return err
			}
		}
	}

	// 4. Projects Table
	_, err = dbConn.Exec(`
		CREATE TABLE IF NOT EXISTS projects (
			id SERIAL PRIMARY KEY,
			name VARCHAR(100) NOT NULL,
			slug VARCHAR(100) UNIQUE NOT NULL,
			description TEXT NOT NULL,
			long_description TEXT NOT NULL,
			tech_stack TEXT NOT NULL,
			category VARCHAR(50) NOT NULL,
			thumbnail_url TEXT DEFAULT '',
			demo_url TEXT DEFAULT '',
			github_url TEXT DEFAULT '',
			is_featured BOOLEAN DEFAULT false,
			order_index INT DEFAULT 0
		)
	`)
	if err != nil {
		return err
	}

	// Seed default projects if empty
	var projectCount int
	err = dbConn.QueryRow("SELECT COUNT(*) FROM projects").Scan(&projectCount)
	if err != nil {
		return err
	}
	if projectCount == 0 {
		for i, p := range seedProjects {
			techStr := strings.Join(p.TechStack, ",")
			_, err = dbConn.Exec(`
				INSERT INTO projects (name, slug, description, long_description, tech_stack, category, thumbnail_url, demo_url, github_url, is_featured, order_index)
				VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
			`, p.Name, p.Slug, p.Description, p.LongDescription, techStr, p.Category, p.ThumbnailURL, p.DemoURL, p.GithubURL, p.IsFeatured, i)
			if err != nil {
				return err
			}
		}
	}

	// 5. Guestbook Messages Table
	_, err = dbConn.Exec(`
		CREATE TABLE IF NOT EXISTS guestbook_messages (
			id SERIAL PRIMARY KEY,
			sender_name VARCHAR(100) NOT NULL,
			message TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			ip_address VARCHAR(45) DEFAULT '',
			admin_reply TEXT DEFAULT '',
			replied_at TIMESTAMP DEFAULT NULL
		)
	`)
	if err != nil {
		return err
	}

	return nil
}

// Fetch Config
func dbGetConfig(key string, defaultValue string) string {
	if !dbEnabled {
		return defaultValue
	}
	var val string
	err := dbConn.QueryRow("SELECT value FROM site_config WHERE key = $1", key).Scan(&val)
	if err != nil {
		return defaultValue
	}
	return val
}

// Update Config
func dbUpdateConfig(key string, value string) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("INSERT INTO site_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", key, value)
	return err
}

// Fetch Skills
func dbGetSkills() ([]Skill, error) {
	if !dbEnabled {
		return nil, fmt.Errorf("database disabled")
	}
	rows, err := dbConn.Query("SELECT id, name, category, proficiency_percent, order_index FROM skills ORDER BY order_index ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var skills []Skill
	for rows.Next() {
		var s Skill
		if err := rows.Scan(&s.ID, &s.Name, &s.Category, &s.ProficiencyPercent, &s.OrderIndex); err != nil {
			return nil, err
		}
		skills = append(skills, s)
	}
	return skills, nil
}

// Add Skill
func dbAddSkill(s Skill) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("INSERT INTO skills (name, category, proficiency_percent, order_index) VALUES ($1, $2, $3, $4)", s.Name, s.Category, s.ProficiencyPercent, s.OrderIndex)
	return err
}

// Update Skill
func dbUpdateSkill(s Skill) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("UPDATE skills SET name = $1, category = $2, proficiency_percent = $3, order_index = $4 WHERE id = $5", s.Name, s.Category, s.ProficiencyPercent, s.OrderIndex, s.ID)
	return err
}

// Delete Skill
func dbDeleteSkill(id int) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("DELETE FROM skills WHERE id = $1", id)
	return err
}

// Fetch Timeline
func dbGetTimeline() ([]TimelineItem, error) {
	if !dbEnabled {
		return nil, fmt.Errorf("database disabled")
	}
	rows, err := dbConn.Query("SELECT id, year, title, company_or_institution, description, type, order_index FROM timeline ORDER BY order_index ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []TimelineItem
	for rows.Next() {
		var t TimelineItem
		if err := rows.Scan(&t.ID, &t.Year, &t.Title, &t.CompanyOrInstitution, &t.Description, &t.Type, &t.OrderIndex); err != nil {
			return nil, err
		}
		items = append(items, t)
	}
	return items, nil
}

// Add Timeline
func dbAddTimeline(t TimelineItem) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("INSERT INTO timeline (year, title, company_or_institution, description, type, order_index) VALUES ($1, $2, $3, $4, $5, $6)", t.Year, t.Title, t.CompanyOrInstitution, t.Description, t.Type, t.OrderIndex)
	return err
}

// Update Timeline
func dbUpdateTimeline(t TimelineItem) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("UPDATE timeline SET year = $1, title = $2, company_or_institution = $3, description = $4, type = $5, order_index = $6 WHERE id = $7", t.Year, t.Title, t.CompanyOrInstitution, t.Description, t.Type, t.OrderIndex, t.ID)
	return err
}

// Delete Timeline
func dbDeleteTimeline(id int) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("DELETE FROM timeline WHERE id = $1", id)
	return err
}

// Fetch Projects
func dbGetProjects() ([]Project, error) {
	if !dbEnabled {
		return nil, fmt.Errorf("database disabled")
	}
	rows, err := dbConn.Query("SELECT id, name, slug, description, long_description, tech_stack, category, thumbnail_url, demo_url, github_url, is_featured, order_index FROM projects ORDER BY order_index ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []Project
	for rows.Next() {
		var p Project
		var id int
		var techStr string
		err := rows.Scan(
			&id,
			&p.Name,
			&p.Slug,
			&p.Description,
			&p.LongDescription,
			&techStr,
			&p.Category,
			&p.ThumbnailURL,
			&p.DemoURL,
			&p.GithubURL,
			&p.IsFeatured,
			&p.OrderIndex,
		)
		if err != nil {
			return nil, err
		}
		p.ID = fmt.Sprintf("%d", id)
		if techStr != "" {
			p.TechStack = strings.Split(techStr, ",")
		} else {
			p.TechStack = []string{}
		}
		projects = append(projects, p)
	}
	return projects, nil
}

// Add Project
func dbAddProject(p Project) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	techStr := strings.Join(p.TechStack, ",")
	_, err := dbConn.Exec(`
		INSERT INTO projects (name, slug, description, long_description, tech_stack, category, thumbnail_url, demo_url, github_url, is_featured, order_index)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, p.Name, p.Slug, p.Description, p.LongDescription, techStr, p.Category, p.ThumbnailURL, p.DemoURL, p.GithubURL, p.IsFeatured, p.OrderIndex)
	return err
}

// Update Project
func dbUpdateProject(id int, p Project) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	techStr := strings.Join(p.TechStack, ",")
	_, err := dbConn.Exec(`
		UPDATE projects SET name = $1, slug = $2, description = $3, long_description = $4, tech_stack = $5, category = $6, thumbnail_url = $7, demo_url = $8, github_url = $9, is_featured = $10, order_index = $11
		WHERE id = $12
	`, p.Name, p.Slug, p.Description, p.LongDescription, techStr, p.Category, p.ThumbnailURL, p.DemoURL, p.GithubURL, p.IsFeatured, p.OrderIndex, id)
	return err
}

// Delete Project
func dbDeleteProject(id int) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("DELETE FROM projects WHERE id = $1", id)
	return err
}

// Extended Guestbook Message with Admin Replies
type ExtendedGuestbookMessage struct {
	ID         string `json:"id"`
	SenderName string `json:"sender_name"`
	Message    string `json:"message"`
	CreatedAt  string `json:"created_at"`
	IPAddress  string `json:"ip_address,omitempty"`
	AdminReply string `json:"admin_reply,omitempty"`
	RepliedAt  string `json:"replied_at,omitempty"`
}

func dbGetGuestbookMessages(limit int) ([]ExtendedGuestbookMessage, error) {
	if !dbEnabled {
		return nil, fmt.Errorf("database disabled")
	}
	rows, err := dbConn.Query("SELECT id, sender_name, message, created_at, ip_address, COALESCE(admin_reply, ''), COALESCE(to_char(replied_at, 'YYYY-MM-DD HH24:MI:SS'), '') FROM guestbook_messages ORDER BY created_at DESC LIMIT $1", limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []ExtendedGuestbookMessage
	for rows.Next() {
		var m ExtendedGuestbookMessage
		var id int
		var t time.Time
		err := rows.Scan(&id, &m.SenderName, &m.Message, &t, &m.IPAddress, &m.AdminReply, &m.RepliedAt)
		if err != nil {
			return nil, err
		}
		m.ID = fmt.Sprintf("%d", id)
		m.CreatedAt = t.Format("2006-01-02 15:04:05")
		messages = append(messages, m)
	}
	return messages, nil
}

// Insert Guestbook Message
func dbAddGuestbookMessage(msg GuestbookMessage) (int, error) {
	if !dbEnabled {
		return 0, fmt.Errorf("database disabled")
	}
	var id int
	err := dbConn.QueryRow("INSERT INTO guestbook_messages (sender_name, message, ip_address) VALUES ($1, $2, $3) RETURNING id", msg.SenderName, msg.Message, msg.IPAddress).Scan(&id)
	return id, err
}

// Reply to Guestbook Message
func dbReplyGuestbookMessage(id int, reply string) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("UPDATE guestbook_messages SET admin_reply = $1, replied_at = NOW() WHERE id = $2", reply, id)
	return err
}

// Delete Guestbook Message
func dbDeleteGuestbookMessage(id int) error {
	if !dbEnabled {
		return fmt.Errorf("database disabled")
	}
	_, err := dbConn.Exec("DELETE FROM guestbook_messages WHERE id = $1", id)
	return err
}

// ==========================================================================
// ADMIN MODULES (CONSOLIDATED FROM ADMIN.GO)
// ==========================================================================

// Session token utilities using HMAC SHA-256 for secure session verification
func generateSessionToken() string {
	secret := os.Getenv("ADMIN_JWT_SECRET")
	if secret == "" {
		secret = "najinkyou-secure-and-robust-jwt-key-2026-very-long-secret-key-32-chars-minimum"
	}
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte("admin:" + timestamp))
	signature := hex.EncodeToString(h.Sum(nil))
	return fmt.Sprintf("admin.%s.%s", timestamp, signature)
}

func validateSessionToken(token string) bool {
	parts := strings.Split(token, ".")
	if len(parts) != 3 || parts[0] != "admin" {
		return false
	}
	timestampStr := parts[1]
	signature := parts[2]

	timestamp, err := strconv.ParseInt(timestampStr, 10, 64)
	if err != nil {
		return false
	}

	// Session valid for 7 days
	if time.Now().Unix()-timestamp > 7*24*3600 {
		return false
	}

	secret := os.Getenv("ADMIN_JWT_SECRET")
	if secret == "" {
		secret = "najinkyou-secure-and-robust-jwt-key-2026-very-long-secret-key-32-chars-minimum"
	}

	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte("admin:" + timestampStr))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

func isAdminAuthenticated(r *http.Request) bool {
	cookie, err := r.Cookie("admin_token")
	if err != nil {
		return false
	}
	return validateSessionToken(cookie.Value)
}

// Template render helpers
func renderAdminLogin(w http.ResponseWriter, errorStr string) {
	tmpl, err := template.ParseFS(templateFS, "templates/admin_login.html")
	if err != nil {
		http.Error(w, "Template error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	data := map[string]interface{}{
		"Error": errorStr,
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	tmpl.Execute(w, data)
}

func handleAdminDashboard(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFS(templateFS, "templates/admin_dashboard.html")
	if err != nil {
		http.Error(w, "Template error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	configs := map[string]string{
		"hero_title":                  dbGetConfig("hero_title", "Irham Najib Azimul Qowi"),
		"hero_subtitle":               dbGetConfig("hero_subtitle", "AI Engineer & Full-Stack Developer"),
		"hero_description":            dbGetConfig("hero_description", "Building intelligent systems with Go, Python, and modern web frameworks."),
		"about_description":           dbGetConfig("about_description", "Irham Najib Azimul Qowi is a Software Engineering student at Politeknik Negeri Madiun, Indonesia. Writing under the professional pseudonym Najin Kyou, he explores the convergence of data pipelines, pose estimation screening, and Retrieval-Augmented Generation (RAG). He believes in clean code craftsmanship and meticulous detail."),
		"google_generative_ai_api_key": dbGetConfig("google_generative_ai_api_key", ""),
	}

	data := map[string]interface{}{
		"Configs": configs,
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	tmpl.Execute(w, data)
}

// Router actions for Admin login/logout
func handleAdminLogin(w http.ResponseWriter, r *http.Request) {
	email := r.FormValue("email")
	password := r.FormValue("password")

	expectedEmail := os.Getenv("ADMIN_EMAIL")
	if expectedEmail == "" {
		expectedEmail = "admin@najinkyou.com"
	}

	expectedPassword := os.Getenv("ADMIN_PASSWORD")
	if expectedPassword == "" {
		expectedPassword = "najinkyou_admin_2026"
	}

	if email == expectedEmail && password == expectedPassword {
		token := generateSessionToken()
		cookie := &http.Cookie{
			Name:     "admin_token",
			Value:    token,
			Path:     "/",
			Expires:  time.Now().Add(7 * 24 * time.Hour),
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteStrictMode,
		}
		http.SetCookie(w, cookie)
		http.Redirect(w, r, "/admin", http.StatusSeeOther)
		return
	}

	renderAdminLogin(w, "Invalid email or password. Please try again.")
}

func handleAdminLogout(w http.ResponseWriter, r *http.Request) {
	cookie := &http.Cookie{
		Name:     "admin_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	}
	http.SetCookie(w, cookie)
	http.Redirect(w, r, "/admin", http.StatusSeeOther)
}

// REST CRUD HANDLERS

// Config update
func handleAdminConfigUpdate(w http.ResponseWriter, r *http.Request) {
	var reqData map[string]string
	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	for k, v := range reqData {
		if err := dbUpdateConfig(k, v); err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// Skills
func handleAdminSkillList(w http.ResponseWriter, r *http.Request) {
	skills, err := dbGetSkills()
	if err != nil {
		skills = []Skill{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"skills": skills})
}

func handleAdminSkillAdd(w http.ResponseWriter, r *http.Request) {
	var s Skill
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbAddSkill(s); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminSkillUpdate(w http.ResponseWriter, r *http.Request) {
	var s Skill
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbUpdateSkill(s); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminSkillDelete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbDeleteSkill(req.ID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// Timeline
func handleAdminTimelineList(w http.ResponseWriter, r *http.Request) {
	timeline, err := dbGetTimeline()
	if err != nil {
		timeline = []TimelineItem{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"timeline": timeline})
}

func handleAdminTimelineAdd(w http.ResponseWriter, r *http.Request) {
	var t TimelineItem
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbAddTimeline(t); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminTimelineUpdate(w http.ResponseWriter, r *http.Request) {
	var t TimelineItem
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbUpdateTimeline(t); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminTimelineDelete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbDeleteTimeline(req.ID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// Projects
func handleAdminProjectList(w http.ResponseWriter, r *http.Request) {
	projects, err := dbGetProjects()
	if err != nil {
		projects = []Project{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"projects": projects})
}

func handleAdminProjectAdd(w http.ResponseWriter, r *http.Request) {
	var p Project
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbAddProject(p); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminProjectUpdate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Project
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbUpdateProject(req.ID, req.Project); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminProjectDelete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbDeleteProject(req.ID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// Messages/Guestbook
func handleAdminMessageList(w http.ResponseWriter, r *http.Request) {
	messages, err := dbGetGuestbookMessages(100)
	if err != nil {
		messages = []ExtendedGuestbookMessage{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"messages": messages})
}

func handleAdminMessageReply(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID    int    `json:"id"`
		Reply string `json:"reply"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbReplyGuestbookMessage(req.ID, req.Reply); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

func handleAdminMessageDelete(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	if err := dbDeleteGuestbookMessage(req.ID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true})
}

// Vercel Blob REST API Upload Proxy
func handleAdminUploadBlob(w http.ResponseWriter, r *http.Request) {
	// Parse multi-part form
	err := r.ParseMultipartForm(5 * 1024 * 1024) // 5MB limit
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "File exceeds 5MB limit"})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "File field missing"})
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to read file bytes"})
		return
	}

	// Generate a clean unique filename
	cleanName := strings.ReplaceAll(header.Filename, " ", "_")
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), cleanName)

	// Proxy upload to Vercel Blob
	url, err := uploadToVercelBlob(filename, fileBytes, header.Header.Get("Content-Type"))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"url": url})
}

// PUT request to upload bytes to Vercel Blob Store over HTTP REST API
func uploadToVercelBlob(filename string, fileBytes []byte, contentType string) (string, error) {
	token := os.Getenv("BLOB_READ_WRITE_TOKEN")
	if token == "" {
		return "", fmt.Errorf("BLOB_READ_WRITE_TOKEN is not configured in environment")
	}

	url := fmt.Sprintf("https://blob.vercel-storage.com/%s", filename)
	req, err := http.NewRequest("PUT", url, bytes.NewReader(fileBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("x-api-version", "2") // Use current Vercel Blob REST API version
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		respBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("vercel blob upload returned error status %d: %s", resp.StatusCode, string(respBytes))
	}

	var result struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	return result.URL, nil
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
