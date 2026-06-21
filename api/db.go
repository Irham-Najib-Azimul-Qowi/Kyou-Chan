package handler

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

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

func init() {
	InitDB()
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
