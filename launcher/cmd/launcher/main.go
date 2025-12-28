package main

import (
	"archive/zip"
	"crypto/aes"
	"crypto/cipher"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
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
	ExpectedFingerprint = "77edd56c1aab9774e55e4a20527420bcde856a3b2d2d763ea5cfb57e6b2c5785"
	ExpectedBuildHash   = "D983BF72DD59DE1978B999CEA25DE5C8A3117CB8EF03098CF0EDE9A64E293898"
	ProprietaryKeyword  = "LOB-NOS-INTERNAL-ONLY-2024"
	LicenseFileName     = "license.dat"
	BuildDirName        = ".next"
	BuildPassword       = "LobnosSecure2025!"
	aesKey              = "12345678901234567890123456789012"
)

type LaunchConfig struct {
	AppPath           string
	ExpectedBuildHash string
}

func loadLaunchConfig(configPath string) (*LaunchConfig, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	config := &LaunchConfig{}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		switch key {
		case "appPath":
			decrypted, err := decryptAES(value)
			if err != nil {
				return nil, fmt.Errorf("failed to decrypt appPath: %w", err)
			}
			config.AppPath = strings.Replace(decrypted, "%USERNAME%", os.Getenv("USERNAME"), -1)
		case "expectedBuildHash":
			config.ExpectedBuildHash = value
		}
	}

	if config.AppPath == "" || config.ExpectedBuildHash == "" {
		return nil, fmt.Errorf("missing required config fields")
	}

	return config, nil
}

// decryptAES decrypts ciphertext using AES
func decryptAES(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher([]byte(aesKey))
	if err != nil {
		return "", err
	}
	if len(data) < aes.BlockSize {
		return "", fmt.Errorf("ciphertext too short")
	}
	iv := data[:aes.BlockSize]
	data = data[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(data, data)
	return string(data), nil
}

func findSecureAppPath(execDir string) (string, error) {
	// The app is in the target directory
	appPath := `C:\Program Files (x86)\Windows-Security-Profile`
	nextPath := filepath.Join(appPath, ".next")
	if _, err := os.Stat(nextPath); err == nil {
		if hasValidAppStructure(appPath) {
			return appPath, nil
		}
	}
	return "", fmt.Errorf("secure application directory not found at target location")
}

func hasValidAppStructure(appDir string) bool {
	if _, err := os.Stat(filepath.Join(appDir, "package.json")); err != nil {
		return false
	}

	nextDir := filepath.Join(appDir, ".next")
	return hasValidBuildFiles(nextDir)
}

func hasValidBuildFiles(nextDir string) bool {
	if _, err := os.Stat(nextDir); err == nil {
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

		if foundCount >= 2 {
			return true
		}
	}

	return false
}

func main() {
	execDir, err := getExecutableDir()
	if err != nil {
		silentExit("Failed to get executable directory")
	}

	// Load launch config
	configPath := filepath.Join(execDir, "launcher.config")
	launchConfig, err := loadLaunchConfig(configPath)
	if err != nil {
		silentExit(fmt.Sprintf("Failed to load launch config: %v", err))
	}

	appPath := launchConfig.AppPath

	// Verify license first
	config := &types.Config{
		LicensePath:     filepath.Join(execDir, LicenseFileName),
		BuildPath:       filepath.Join(appPath, BuildDirName),
		NodeJSPath:      appPath,
		NodeJSCommand:   "npm",
		SessionTokenTTL: 60 * time.Second,
	}

	actualFingerprint, err := fingerprint.GenerateFingerprint()
	if err != nil {
		fmt.Printf("Fingerprint error: %v\n", err)
		silentExit("Machine fingerprint generation failed")
	}

	licenseData, err := license.LoadLicense(config.LicensePath)
	if err != nil {
		silentExit(fmt.Sprintf("Failed to load license: %v", err))
	}

	if err := license.VerifyLicense(licenseData, actualFingerprint); err != nil {
		silentExit(fmt.Sprintf("License verification failed: %v", err))
	}

	if err := verifyLicenseAgainstHardcodedPartial(licenseData); err != nil {
		silentExit(fmt.Sprintf("License validation failed: %v", err))
	}


	sessionToken := generateSessionToken()
	fmt.Println("Starting application...")
	if err := launchNodeJS(config, sessionToken); err != nil {
		silentExit("Application launch failed")
	}
}

func launchNodeJS(config *types.Config, sessionToken string) error {
	os.Setenv("PRIME_SESSION_TOKEN", sessionToken)

	if err := os.Chdir(config.NodeJSPath); err != nil {
		return fmt.Errorf("failed to change to application directory: %w", err)
	}

	cmd := exec.Command("npm", "run", "ns")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start Next.js application: %w", err)
	}

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
	token := uuid.New().String() + fmt.Sprintf("-%d", time.Now().Unix())
	return token
}

func verifyLicenseAgainstHardcodedPartial(licenseData *types.License) error {
	if licenseData.Fingerprint != ExpectedFingerprint {
		return fmt.Errorf("license fingerprint mismatch")
	}

	if licenseData.Proprietary != ProprietaryKeyword {
		return fmt.Errorf("license proprietary data mismatch")
	}

	if time.Now().After(licenseData.Expires) {
		return fmt.Errorf("license expired")
	}

	if len(licenseData.Signature) == 0 {
		return fmt.Errorf("invalid license signature")
	}

	return nil
}

func verifyLicenseAgainstHardcoded(licenseData *types.License) error {
	if licenseData.Fingerprint != ExpectedFingerprint {
		return fmt.Errorf("license fingerprint mismatch")
	}

	if licenseData.BuildHash != ExpectedBuildHash {
		return fmt.Errorf("license build hash mismatch")
	}

	if licenseData.Proprietary != ProprietaryKeyword {
		return fmt.Errorf("license proprietary data mismatch")
	}

	if time.Now().After(licenseData.Expires) {
		return fmt.Errorf("license expired")
	}

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

		if info.IsDir() ||
			filepath.Base(path) == ".DS_Store" ||
			strings.HasSuffix(path, ".log") ||
			strings.HasSuffix(path, ".zip") ||
			strings.HasSuffix(path, ".zip.enc") ||
			strings.HasSuffix(path, ".enc") {
			return nil
		}

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
	logFile := filepath.Join(os.TempDir(), "lobnos_launcher.log")
	if f, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0600); err == nil {
		log.SetOutput(f)
		log.Printf("Exit: %s", message)
		f.Close()
	}

	os.Exit(1)
}

func unzip(zipPath, destDir string) error {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return err
	}
	defer reader.Close()

	for _, file := range reader.File {
		path := filepath.Join(destDir, file.Name)
		if file.FileInfo().IsDir() {
			os.MkdirAll(path, file.Mode())
			continue
		}

		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return err
		}

		outFile, err := os.Create(path)
		if err != nil {
			return err
		}
		defer outFile.Close()

		rc, err := file.Open()
		if err != nil {
			return err
		}
		defer rc.Close()

		_, err = io.Copy(outFile, rc)
		if err != nil {
			return err
		}

		outFile.Close()
		rc.Close()
	}

	return nil
}
