package handler

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

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
