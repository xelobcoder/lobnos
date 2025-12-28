package license

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"time"

	"github.com/lobnos/launcher/pkg/types"
)

// Embedded public key for license verification
var publicKey *ecdsa.PublicKey = &ecdsa.PublicKey{
	Curve: elliptic.P256(),
	X:     fromHex("f21eb0cfada141fcfedc22ecdb001d1a6cc86ad3148829578d0c117ee4eda52c"),
	Y:     fromHex("37e4bf1e6036ca82085de7a317ec7567755f609006aa4bd305a2a4d663873002"),
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

// loadPublicKey loads the public key from file (for development)
func loadPublicKey() *ecdsa.PublicKey {
	// Try multiple possible locations for the public key
	possiblePaths := []string{
		"public_key.pem",              // Current directory
		"../public_key.pem",           // Parent directory
		"../../lobnos/public_key.pem", // Project root
		"./public_key.pem",            // Explicit current
	}

	for _, path := range possiblePaths {
		data, err := ioutil.ReadFile(path)
		if err == nil {
			block, _ := pem.Decode(data)
			if block == nil {
				continue
			}

			key, err := x509.ParsePKIXPublicKey(block.Bytes)
			if err != nil {
				continue
			}

			ecdsaKey, ok := key.(*ecdsa.PublicKey)
			if !ok {
				continue
			}

			return ecdsaKey
		}
	}

	fmt.Println("Warning: No public key file found in expected locations, signature verification disabled")
	return nil
}

// LoadLicense reads and parses the license file
func LoadLicense(path string) (*types.License, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read license file: %w", err)
	}

	var license types.License
	if err := json.Unmarshal(data, &license); err != nil {
		return nil, fmt.Errorf("failed to parse license JSON: %w", err)
	}

	// Decode hex signature back to bytes
	if license.Signature, err = hex.DecodeString(string(license.Signature)); err != nil {
		return nil, fmt.Errorf("failed to decode signature: %w", err)
	}

	return &license, nil
}

// VerifyLicense checks if the license is valid for the given fingerprint
func VerifyLicense(license *types.License, machineFingerprint string) error {
	// Check fingerprint match
	if license.Fingerprint != machineFingerprint {
		return fmt.Errorf("license fingerprint does not match machine")
	}

	// Check expiration
	if time.Now().After(license.Expires) {
		return fmt.Errorf("license has expired")
	}

	// No signature verification needed
	return nil
}

// verifySignature verifies the license signature using ECDSA
func verifySignature(license *types.License, signature []byte) bool {
	if publicKey == nil || publicKey.X == nil || publicKey.Y == nil {
		// If no public key is set, skip verification (for development)
		fmt.Println("Warning: No public key set, skipping signature verification")
		return true
	}

	// Create message to verify (same as in license generator)
	message := license.Fingerprint + license.Expires.Format(time.RFC3339) + license.BuildHash + license.Proprietary

	// Hash the message
	hash := sha256.Sum256([]byte(message))

	// Verify the signature
	return ecdsa.VerifyASN1(publicKey, hash[:], signature)
}

// IsExpired checks if the license is expired
func IsExpired(license *types.License) bool {
	return time.Now().After(license.Expires)
}
