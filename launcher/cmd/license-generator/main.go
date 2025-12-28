package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"os"
	"strings"
	"time"

	"github.com/lobnos/launcher/pkg/types"
)

const (
	LicenseFileName     = "license.dat"
	BuildDirName        = ".next"
	ExpectedFingerprint = "77edd56c1aab9774e55e4a20527420bcde856a3b2d2d763ea5cfb57e6b2c5785"   // Launcher expects this
	ExpectedBuildHash   = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890" // Launcher expects this
	ProprietaryKeyword  = "LOB-NOS-INTERNAL-ONLY-2024"                                         // Launcher expects this
	aesKey              = "12345678901234567890123456789012"                                   // 32-byte AES key
)

// Hardcoded ECDSA private key for license signing
// This key is embedded in the license generator binary
// NEVER distribute this binary - it contains your private signing key
var hardcodedPrivateKey = &ecdsa.PrivateKey{
	PublicKey: ecdsa.PublicKey{
		Curve: elliptic.P256(),
		X:     fromHex("f21eb0cfada141fcfedc22ecdb001d1a6cc86ad3148829578d0c117ee4eda52c"),
		Y:     fromHex("37e4bf1e6036ca82085de7a317ec7567755f609006aa4bd305a2a4d663873002"),
	},
	D: fromHex("60f80c5fe5c72896a5a8543c4f29f026771afa31caebea75e6a9333641b8db1c"),
}

// fromHex converts a hex string to big.Int for ECDSA key components
func fromHex(s string) *big.Int {
	data, err := hex.DecodeString(s)
	if err != nil {
		log.Fatalf("Failed to decode hex string: %v", err)
	}
	result := new(big.Int)
	result.SetBytes(data)
	return result
}

// encryptAES encrypts plaintext using AES
func encryptAES(plaintext string) (string, error) {
	block, err := aes.NewCipher([]byte(aesKey))
	if err != nil {
		return "", err
	}
	plaintextBytes := []byte(plaintext)
	ciphertext := make([]byte, aes.BlockSize+len(plaintextBytes))
	iv := ciphertext[:aes.BlockSize]
	if _, err := rand.Read(iv); err != nil {
		return "", err
	}
	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(ciphertext[aes.BlockSize:], plaintextBytes)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// getPrivateKey returns the hardcoded private key for license signing
func getPrivateKey() *ecdsa.PrivateKey {
	fmt.Println("Using hardcoded private key for license signing...")
	return hardcodedPrivateKey
}

func main() {
	fmt.Println("Lobnos License Generator")
	fmt.Println("========================")

	// Step 1: Use hardcoded machine fingerprint (must match launcher)
	fmt.Println("Using hardcoded machine fingerprint...")
	machineFingerprint := ExpectedFingerprint
	fmt.Printf("Machine fingerprint: %s\n", machineFingerprint)

	// Step 2: Use hardcoded proprietary data (must match launcher)
	fmt.Println("Using hardcoded proprietary data...")
	proprietaryData := ProprietaryKeyword
	fmt.Printf("Proprietary data: %s\n", proprietaryData)

	// Step 3: Use hardcoded build hash (must match launcher)
	fmt.Println("Using hardcoded build integrity hash...")
	buildHash := ExpectedBuildHash
	fmt.Printf("Build hash: %s\n", buildHash)

	// Step 4: Create license data
	fmt.Println("Creating license data...")
	license := &types.License{
		Fingerprint: machineFingerprint,
		Expires:     calculateExpiry(),
		BuildHash:   buildHash,
		Proprietary: proprietaryData,
		Features:    []string{"full-access", "analytics", "laboratory", "imaging"},
	}

	// Step 5: Sign license
	fmt.Println("Signing license...")
	privateKey := getPrivateKey()

	signature, err := signLicense(license, privateKey)
	if err != nil {
		log.Fatalf("License signing failed: %v", err)
	}
	license.Signature = signature
	fmt.Println("License signed successfully")

	// Step 6: Save license
	fmt.Println("Saving license file...")
	if err := saveLicense(license, LicenseFileName); err != nil {
		log.Fatalf("License saving failed: %v", err)
	}

	fmt.Printf("\n✅ License generated successfully!\n")
	fmt.Printf("📄 File: %s\n", LicenseFileName)
	fmt.Printf("🔐 Fingerprint: %s\n", machineFingerprint)
	fmt.Printf("📅 Expires: %s\n", license.Expires.Format("2006-01-02 15:04:05"))
	fmt.Printf("🔒 Build Hash: %s\n", buildHash[:16]+"...")
	fmt.Println("\n⚠️  IMPORTANT: This license is bound to the hardcoded values in the launcher!")
	fmt.Println("⚠️  The license generator binary contains your private signing key - keep it secure!")

	// Encrypt the app path from .env for the config
	envData, err := os.ReadFile(".env")
	if err != nil {
		log.Fatalf("Failed to read .env file: %v", err)
	}
	envContent := string(envData)
	var appPath string
	for _, line := range strings.Split(envContent, "\n") {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "APP_PATH=") {
			appPath = strings.TrimPrefix(line, "APP_PATH=")
			break
		}
	}
	if appPath == "" {
		log.Fatalf("APP_PATH not found in .env")
	}
	appPath = strings.Replace(appPath, "%USERNAME%", os.Getenv("USERNAME"), -1)
	encryptedPath, err := encryptAES(appPath)
	if err != nil {
		log.Fatalf("Failed to encrypt app path: %v", err)
	}

	// Write to launcher.config
	configContent := fmt.Sprintf("appPath=%s\nexpectedBuildHash=%s\n", encryptedPath, buildHash)
	if err := os.WriteFile("launcher.config", []byte(configContent), 0644); err != nil {
		log.Fatalf("Failed to write launcher.config: %v", err)
	}
	fmt.Println("\n✅ launcher.config updated successfully!")
	fmt.Printf("🔐 Encrypted appPath: %s\n", encryptedPath)
	fmt.Printf("🔒 Build Hash: %s\n", buildHash)
}

// getProprietaryData returns developer-controlled secret data
// calculateExpiry sets license expiry (1 year from now)
func calculateExpiry() time.Time {
	return time.Now().AddDate(1, 0, 0) // 1 year
}
func signLicense(license *types.License, privateKey *ecdsa.PrivateKey) ([]byte, error) {
	// Create message to sign (fingerprint + expiry + build hash + proprietary)
	message := license.Fingerprint + license.Expires.Format(time.RFC3339) + license.BuildHash + license.Proprietary

	// Hash the message
	hash := sha256.Sum256([]byte(message))

	// Sign the hash
	signature, err := ecdsa.SignASN1(rand.Reader, privateKey, hash[:])
	if err != nil {
		return nil, fmt.Errorf("failed to sign license: %v", err)
	}

	return signature, nil
}

// saveLicense saves the license to a JSON file
func saveLicense(license *types.License, filename string) error {
	// Create a copy with hex-encoded signature for JSON
	licenseCopy := *license
	licenseCopy.Signature = []byte(hex.EncodeToString(license.Signature))

	data, err := json.MarshalIndent(licenseCopy, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal license: %v", err)
	}

	return os.WriteFile(filename, data, 0644)
}
