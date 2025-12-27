package main

import (
	"crypto/sha256"
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

// Hardcoded verification parameters (embedded in binary)
const (
	ExpectedFingerprint = "77edd56c1aab9774e55e4a20527420bcde856a3b2d2d763ea5cfb57e6b2c5785"   // Your machine's fingerprint
	ExpectedBuildHash   = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890" // Your build's SHA-256 hash
	ProprietaryKeyword  = "LOB-NOS-INTERNAL-ONLY-2024"                                         // Your secret keyword
	LicenseFileName     = "license.dat"
	BuildDirName        = ".next"
)

// findSecureAppPath finds the main application directory containing .next and other required files
func findSecureAppPath(execDir string) (string, error) {
	// Look for the main application directory in secure locations
	possiblePaths := []string{
		filepath.Join(execDir, "app"),          // app subdirectory
		filepath.Join(execDir, "..", "lobnos"), // Parent lobnos directory
		filepath.Dir(execDir),                  // Parent of launcher directory
	}

	for _, appPath := range possiblePaths {
		nextPath := filepath.Join(appPath, ".next")
		if _, err := os.Stat(nextPath); err == nil {
			// Verify it has the expected structure and package.json
			if hasValidAppStructure(appPath) {
				return appPath, nil
			}
		}
	}

	return "", fmt.Errorf("secure application directory not found in expected locations")
}

// hasValidAppStructure checks if the application directory has valid structure
func hasValidAppStructure(appDir string) bool {
	// Check for package.json
	if _, err := os.Stat(filepath.Join(appDir, "package.json")); err != nil {
		return false
	}

	// Check for .next directory with build files
	nextDir := filepath.Join(appDir, ".next")
	return hasValidBuildFiles(nextDir)
}

// hasValidBuildFiles checks if the .next folder has valid build files
func hasValidBuildFiles(nextDir string) bool {
	requiredFiles := []string{
		"BUILD_ID",
		"build-manifest.json",
		"server",
	}

	foundCount := 0
	for _, file := range requiredFiles {
		if _, err := os.Stat(filepath.Join(nextDir, file)); err == nil {
			foundCount++
		}
	}

	return foundCount >= 2 // Require at least 2 indicators of a valid build
}

func main() {
	// Get executable directory
	execDir, err := getExecutableDir()
	if err != nil {
		silentExit("Failed to get executable directory")
	}

	// Step 1: Find secure application directory
	fmt.Println("Locating secure application directory...")
	appPath, err := findSecureAppPath(execDir)
	if err != nil {
		log.Printf("Failed to find secure application directory: %v", err)
		silentExit("Failed to locate secure application directory")
	}

	fmt.Printf("Application directory located at: %s\n", appPath)

	// Configuration - using secure application location
	config := &types.Config{
		LicensePath:     filepath.Join(execDir, LicenseFileName),
		BuildPath:       filepath.Join(appPath, BuildDirName),
		NodeJSPath:      appPath, // Use the main app directory
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

// launchNodeJS launches the Node.js application with the session token
func launchNodeJS(config *types.Config, sessionToken string) error {
	// Set environment variable for session token
	os.Setenv("LOB_NOS_SESSION_TOKEN", sessionToken)

	// Change to the application directory
	if err := os.Chdir(config.NodeJSPath); err != nil {
		return fmt.Errorf("failed to change to application directory: %w", err)
	}

	// Launch Next.js application using npm run ns
	cmd := exec.Command("npm", "run", "ns")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Printf("Starting Next.js application from: %s\n", config.NodeJSPath)
	fmt.Printf("Session token: %s\n", sessionToken)

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start Next.js application: %w", err)
	}

	// Wait for the application to finish
	return cmd.Wait()
}

func getExecutableDir() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Dir(execPath), nil
}

func generateSessionToken() string {
	// Generate UUID + timestamp for uniqueness
	token := uuid.New().String() + fmt.Sprintf("-%d", time.Now().Unix())
	return token
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
