package main

import (
	"bufio"
	"fmt"
	handler "najinkyou-portfolio/api"
	"net/http"
	"os"
	"strings"
)

func loadEnv() {
	file, err := os.Open(".env.local")
	if err != nil {
		file, err = os.Open(".env")
		if err != nil {
			return
		}
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		if strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"") {
			value = value[1 : len(value)-1]
		} else if strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'") {
			value = value[1 : len(value)-1]
		}
		os.Setenv(key, value)
	}
}

func main() {
	loadEnv()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Mount local public directory paths to match Vercel root paths
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/css/", fs)
	http.Handle("/js/", fs)
	http.HandleFunc("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "public/favicon.ico")
	})

	// Bind all other requests to our core Vercel Handler
	http.HandleFunc("/", handler.Handler)

	fmt.Printf("Najin Kyou Portfolio Dev Server starting on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
		os.Exit(1)
	}
}
