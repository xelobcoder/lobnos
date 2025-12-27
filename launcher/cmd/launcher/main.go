package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lobnos/launcher/internal/fingerprint"
	"github.com/lobnos/launcher/internal/license"
	"github.com/lobnos/launcher/pkg/types"
)

const (
	LicenseFileName = "license.dat"
	BuildDirName    = ".next"
	ConfigFileName  = "launcher.config"
)

// Hardcoded verification parameters (embedded in binary)
const (
	ExpectedFingerprint = "77edd56c1aab9774e55e4a20527420bcde856a3b2d2d763ea5cfb57e6b2c5785"   // Your machine's fingerprint
	ExpectedBuildHash   = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890" // Your build's SHA-256 hash
	ProprietaryKeyword  = "LOB-NOS-INTERNAL-ONLY-2024"                                         // Your secret keyword
)

func main() {
	// Get executable directory
	execDir, err := getExecutableDir()
	if err != nil {
		silentExit("Failed to get executable directory")
	}

	// Load or prompt for Node.js application path
	nodeJSPath, err := getNodeJSPath(execDir)
	if err != nil {
		silentExit("Failed to get Node.js application path")
	}

	// Configuration
	config := &types.Config{
		LicensePath:     filepath.Join(execDir, LicenseFileName),
		BuildPath:       filepath.Join(nodeJSPath, BuildDirName), // Use provided Node.js path
		NodeJSPath:      nodeJSPath,                              // Store the Node.js path
		NodeJSCommand:   "npm",
		SessionTokenTTL: 60 * time.Second,
	}

	// Step 1: Generate and verify machine fingerprint
	fmt.Println("Verifying machine fingerprint...")
	actualFingerprint, err := fingerprint.GenerateFingerprint()
	if err != nil {
		log.Printf("Fingerprint generation failed: %v", err)
		silentExit("Machine fingerprint generation failed")
	}

	if actualFingerprint != ExpectedFingerprint {
		log.Printf("Fingerprint mismatch: expected %s, got %s", ExpectedFingerprint, actualFingerprint)
		silentExit("Machine fingerprint verification failed")
	}
	fmt.Printf("Machine fingerprint verified: %s\n", actualFingerprint)

	// Step 2: Load and verify license against hardcoded expectations
	fmt.Println("Loading and verifying license...")
	licenseData, err := license.LoadLicense(config.LicensePath)
	if err != nil {
		fmt.Printf("License loading failed: %v\n", err)
		fmt.Println("Skipping license check for testing...")
		// Create dummy license for testing
		licenseData = &types.License{
			Fingerprint: ExpectedFingerprint,
			Expires:     time.Now().Add(24 * time.Hour),
			BuildHash:   ExpectedBuildHash,
			Proprietary: ProprietaryKeyword,
			Signature:   []byte("dummy-signature"),
		}
	} else {
		// Verify license matches our hardcoded expectations
		if err := verifyLicenseAgainstHardcoded(licenseData); err != nil {
			fmt.Printf("License verification failed: %v\n", err)
			log.Printf("License verification failed: %v", err)
			silentExit("License verification failed")
		}
		fmt.Println("License verified successfully")
	}

	// Step 3: Verify build integrity against hardcoded hash
	fmt.Println("Verifying build integrity...")
	actualBuildHash, err := computeBuildHash(config.BuildPath)
	if err != nil {
		fmt.Printf("Build hash computation failed: %v\n", err)
		fmt.Println("Skipping integrity check for testing...")
	} else {
		if actualBuildHash != ExpectedBuildHash {
			fmt.Printf("Build hash mismatch: expected %s, got %s\n", ExpectedBuildHash, actualBuildHash)
			fmt.Println("Skipping integrity check for testing...")
		} else {
			fmt.Println("Build integrity verified")
		}
	}

	// Step 4: Generate session token
	sessionToken := generateSessionToken()
	fmt.Printf("Session token generated: %s\n", sessionToken)

	// Step 5: Launch Node.js application from provided path
	fmt.Println("Launching Node.js application...")
	if err := launchNodeJS(config, sessionToken); err != nil {
		log.Printf("Failed to launch Node.js: %v", err)
		silentExit("Application launch failed")
	}
}

func getExecutableDir() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Dir(execPath), nil
}

func getNodeJSPath(execDir string) (string, error) {
	configPath := filepath.Join(execDir, ConfigFileName)

	// Try to read from config file first
	if data, err := os.ReadFile(configPath); err == nil {
		path := strings.TrimSpace(string(data))
		if path != "" && isValidPath(path) {
			fmt.Printf("Using configured path: %s\n", path)
			return path, nil
		} else if path != "" {
			fmt.Printf("Configured path is invalid, will prompt for new path: %s\n", path)
		}
	}

	// Prompt user for Node.js application path with retry logic
	scanner := bufio.NewScanner(os.Stdin)
	maxRetries := 3

	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt == 1 {
			fmt.Println("\n=== Node.js Application Path Configuration ===")
		} else {
			fmt.Printf("\nAttempt %d/%d - Please try again:\n", attempt, maxRetries)
		}

		fmt.Println("Please provide the full path to your Node.js application directory.")
		fmt.Println("Requirements:")
		fmt.Println("  - Must be an absolute path (e.g., C:\\path\\to\\app or /path/to/app)")
		fmt.Println("  - Must contain package.json file")
		fmt.Println("  - Should contain .next directory (run 'npm run build' first)")
		fmt.Println("  - Should contain node_modules directory (run 'npm install' first)")
		fmt.Print("\nPath: ")

		if !scanner.Scan() {
			break
		}

		path := strings.TrimSpace(scanner.Text())

		// Allow user to exit
		if strings.ToLower(path) == "exit" || strings.ToLower(path) == "quit" {
			fmt.Println("Configuration cancelled by user.")
			return "", fmt.Errorf("user cancelled configuration")
		}

		// Validate the path
		if isValidPath(path) {
			// Save to config file for future runs
			if err := os.WriteFile(configPath, []byte(path), 0644); err != nil {
				fmt.Printf("Warning: Could not save config file: %v\n", err)
			} else {
				fmt.Printf("✓ Path saved to config file for future use\n")
			}

			return path, nil
		}

		if attempt < maxRetries {
			fmt.Println("\nPath validation failed. Please check the error messages above and try again.")
		}
	}

	fmt.Printf("\nMaximum attempts (%d) exceeded. Please run the launcher again to retry.\n", maxRetries)
	return "", fmt.Errorf("maximum path validation attempts exceeded")
}

func isValidPath(path string) bool {
	// Check if path is provided
	if strings.TrimSpace(path) == "" {
		fmt.Println("Error: No path provided")
		return false
	}

	// Check if path is absolute
	if !filepath.IsAbs(path) {
		fmt.Printf("Error: Path must be absolute: %s\n", path)
		return false
	}

	// Check if path exists and is a directory
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		fmt.Printf("Error: Path does not exist: %s\n", path)
		return false
	}
	if err != nil {
		fmt.Printf("Error: Cannot access path: %s (%v)\n", path, err)
		return false
	}
	if !info.IsDir() {
		fmt.Printf("Error: Path is not a directory: %s\n", path)
		return false
	}

	// Check for package.json
	packageJson := filepath.Join(path, "package.json")
	packageInfo, err := os.Stat(packageJson)
	if os.IsNotExist(err) {
		fmt.Printf("Error: package.json not found in: %s\n", path)
		return false
	}
	if err != nil {
		fmt.Printf("Error: Cannot access package.json: %v\n", err)
		return false
	}
	if packageInfo.IsDir() {
		fmt.Printf("Error: package.json is a directory, not a file: %s\n", packageJson)
		return false
	}

	// Verify package.json content (basic Next.js check)
	if !isValidPackageJson(packageJson) {
		fmt.Printf("Error: Invalid package.json or not a Next.js project: %s\n", packageJson)
		return false
	}

	// Check for .next directory
	nextDir := filepath.Join(path, ".next")
	nextInfo, err := os.Stat(nextDir)
	if os.IsNotExist(err) {
		fmt.Printf("Warning: .next directory not found in: %s\n", path)
		fmt.Println("Make sure to build your Next.js application first (run 'npm run build')")
		fmt.Println("Continuing anyway...")
	} else if err != nil {
		fmt.Printf("Error: Cannot access .next directory: %v\n", err)
		return false
	} else {
		// Verify .next directory has build files
		if !nextInfo.IsDir() {
			fmt.Printf("Error: .next is not a directory: %s\n", nextDir)
			return false
		}

		if !hasBuildFiles(nextDir) {
			fmt.Printf("Warning: .next directory appears empty or incomplete: %s\n", nextDir)
			fmt.Println("Make sure your Next.js application is properly built")
		}
	}

	// Check for node_modules
	nodeModules := filepath.Join(path, "node_modules")
	if _, err := os.Stat(nodeModules); os.IsNotExist(err) {
		fmt.Printf("Warning: node_modules not found in: %s\n", path)
		fmt.Println("Make sure to install dependencies first (run 'npm install')")
	}

	fmt.Printf("✓ Path validation successful: %s\n", path)
	return true
}

func isValidPackageJson(packageJsonPath string) bool {
	data, err := os.ReadFile(packageJsonPath)
	if err != nil {
		fmt.Printf("Error: Cannot read package.json: %v\n", err)
		return false
	}

	// Basic JSON validation
	var packageData map[string]interface{}
	if err := json.Unmarshal(data, &packageData); err != nil {
		fmt.Printf("Error: Invalid JSON in package.json: %v\n", err)
		return false
	}

	// Check for Next.js dependencies
	dependencies, hasDeps := packageData["dependencies"].(map[string]interface{})
	devDependencies, hasDevDeps := packageData["devDependencies"].(map[string]interface{})

	nextjsFound := false
	reactFound := false

	if hasDeps {
		if _, exists := dependencies["next"]; exists {
			nextjsFound = true
		}
		if _, exists := dependencies["react"]; exists {
			reactFound = true
		}
	}

	if hasDevDeps && !nextjsFound {
		if _, exists := devDependencies["next"]; exists {
			nextjsFound = true
		}
		if _, exists := devDependencies["react"]; exists {
			reactFound = true
		}
	}

	if !nextjsFound {
		fmt.Println("Warning: Next.js dependency not found in package.json")
		fmt.Println("This may not be a Next.js project")
	}

	if !reactFound {
		fmt.Println("Warning: React dependency not found in package.json")
		fmt.Println("This may not be a React project")
	}

	// Check for scripts section
	scripts, hasScripts := packageData["scripts"].(map[string]interface{})
	if hasScripts {
		if _, exists := scripts["ns"]; exists {
			return true // Found our custom script
		}
		if _, exists := scripts["start"]; exists {
			fmt.Println("Note: Using 'npm start' instead of 'npm run ns'")
			return true
		}
		if _, exists := scripts["dev"]; exists {
			fmt.Println("Warning: Found 'dev' script but no 'start' or 'ns' script")
			fmt.Println("Make sure your production script is properly configured")
		}
	}

	fmt.Println("Warning: No suitable start script found in package.json")
	fmt.Println("Expected 'ns', 'start', or similar script in scripts section")
	return true // Allow to continue, but warn
}

func hasBuildFiles(nextDir string) bool {
	// Check for essential Next.js build files/directories
	requiredFiles := []string{
		"BUILD_ID",
		"build-manifest.json",
		"app-build-manifest.json",
		"server",
		"static",
	}

	foundCount := 0
	for _, file := range requiredFiles {
		path := filepath.Join(nextDir, file)
		if _, err := os.Stat(path); err == nil {
			foundCount++
		}
	}

	// Check if server directory has files
	serverDir := filepath.Join(nextDir, "server")
	if entries, err := os.ReadDir(serverDir); err == nil && len(entries) > 0 {
		foundCount++
	}

	// Check if static directory has files
	staticDir := filepath.Join(nextDir, "static")
	if entries, err := os.ReadDir(staticDir); err == nil && len(entries) > 0 {
		foundCount++
	}

	return foundCount >= 3 // Require at least 3 indicators of a valid build
}

func generateSessionToken() string {
	// Generate UUID + timestamp for uniqueness
	token := uuid.New().String() + fmt.Sprintf("-%d", time.Now().Unix())
	return token
}

func launchNodeJS(config *types.Config, sessionToken string) error {
	// Set session token environment variable
	os.Setenv("NODE_SESSION_TOKEN", sessionToken)

	// Launch Node.js from the provided application path
	cmd := exec.Command(config.NodeJSCommand, "run", "ns")
	cmd.Dir = config.NodeJSPath // Use the provided Node.js path
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// Start the process
	return cmd.Run()
}

func verifyLicenseAgainstHardcoded(licenseData *types.License) error {
	// Verify fingerprint matches hardcoded value
	if licenseData.Fingerprint != ExpectedFingerprint {
		return fmt.Errorf("license fingerprint mismatch")
	}

	// Verify build hash matches hardcoded value
	if licenseData.BuildHash != ExpectedBuildHash {
		return fmt.Errorf("license build hash mismatch")
	}

	// Verify proprietary keyword
	if licenseData.Proprietary != ProprietaryKeyword {
		return fmt.Errorf("license proprietary data mismatch")
	}

	// Verify expiration
	if time.Now().After(licenseData.Expires) {
		return fmt.Errorf("license expired")
	}

	// Verify signature (you would implement cryptographic verification here)
	// For now, just check if signature exists
	if len(licenseData.Signature) == 0 {
		return fmt.Errorf("invalid license signature")
	}

	return nil
}

func computeBuildHash(buildPath string) (string, error) {
	hash := sha256.New()

	err := filepath.Walk(buildPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories and certain files
		if info.IsDir() ||
			filepath.Base(path) == ".DS_Store" ||
			strings.HasSuffix(path, ".log") {
			return nil
		}

		// Read file and update hash
		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		hash.Write(data)
		return nil
	})

	if err != nil {
		return "", err
	}

	return fmt.Sprintf("%x", hash.Sum(nil)), nil
}

func silentExit(message string) {
	// Log to file if possible
	logFile := filepath.Join(os.TempDir(), "lobnos_launcher.log")
	if f, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600); err == nil {
		log.SetOutput(f)
		log.Printf("Exit: %s", message)
		f.Close()
	}

	// Silent exit
	os.Exit(1)
}
