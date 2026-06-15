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

	// Mount local public directory under /public/ URL path
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	// Bind all other requests to our core Vercel Handler
	http.HandleFunc("/", handler.Handler)

	fmt.Printf("Najin Kyou Portfolio Dev Server starting on http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
		os.Exit(1)
	}
}
