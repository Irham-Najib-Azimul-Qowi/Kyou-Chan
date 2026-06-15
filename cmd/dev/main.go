package main

import (
	"fmt"
	handler "najinkyou-portfolio/api"
	"net/http"
	"os"
)

func main() {
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
