package integrity

import (
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

	"golang.org/x/crypto/sha3"
)

// ComputeBuildHash calculates SHA3-256 hash of the build directory
func ComputeBuildHash(buildPath string) (string, error) {
	var files []string

	// Walk the build directory
	err := filepath.Walk(buildPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Skip certain file types
		if shouldSkipFile(path) {
			return nil
		}

		files = append(files, path)
		return nil
	})

	if err != nil {
		return "", fmt.Errorf("failed to walk build directory: %w", err)
	}

	// Sort files for deterministic hashing
	// Note: In production, you'd want to sort these

	// Compute combined hash
	hasher := sha3.New256()
	for _, file := range files {
		data, err := ioutil.ReadFile(file)
		if err != nil {
			return "", fmt.Errorf("failed to read file %s: %w", file, err)
		}

		// Include relative path in hash for position independence
		relPath, _ := filepath.Rel(buildPath, file)
		hasher.Write([]byte(relPath))
		hasher.Write(data)
	}

	hash := hasher.Sum(nil)
	return fmt.Sprintf("%x", hash), nil
}

// shouldSkipFile determines if a file should be excluded from integrity check
func shouldSkipFile(path string) bool {
	// Skip hidden files
	if strings.HasPrefix(filepath.Base(path), ".") {
		return true
	}

	// Skip common development files
	ext := filepath.Ext(path)
	switch ext {
	case ".log", ".tmp", ".pid", ".lock":
		return true
	}

	// Skip node_modules and other dev directories
	if strings.Contains(path, "node_modules") ||
		strings.Contains(path, ".next/cache") ||
		strings.Contains(path, ".git") {
		return true
	}

	return false
}

// VerifyIntegrity compares computed hash with expected hash
func VerifyIntegrity(buildPath, expectedHash string) error {
	computedHash, err := ComputeBuildHash(buildPath)
	if err != nil {
		return fmt.Errorf("failed to compute build hash: %w", err)
	}

	if computedHash != expectedHash {
		return fmt.Errorf("build integrity check failed: hash mismatch")
	}

	return nil
}
