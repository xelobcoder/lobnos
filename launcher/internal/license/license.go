package license

import (
	"crypto/ecdsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"time"

	"github.com/lobnos/launcher/pkg/types"
)

// Embedded public key for license verification
// This should be replaced with the actual public key from your private key
// Run: openssl ec -in private_key.pem -pubout -out public_key.pem
// Then extract the key bytes and embed them here
var publicKey *ecdsa.PublicKey = loadPublicKey()

// loadPublicKey loads the public key from file (for development)
func loadPublicKey() *ecdsa.PublicKey {
	data, err := ioutil.ReadFile("public_key.pem")
	if err != nil {
		fmt.Println("Warning: No public key file found, signature verification disabled")
		return nil
	}

	block, _ := pem.Decode(data)
	if block == nil {
		fmt.Println("Warning: Failed to decode public key PEM")
		return nil
	}

	key, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		fmt.Println("Warning: Failed to parse public key:", err)
		return nil
	}

	ecdsaKey, ok := key.(*ecdsa.PublicKey)
	if !ok {
		fmt.Println("Warning: Public key is not ECDSA")
		return nil
	}

	return ecdsaKey
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

	// Verify signature
	if !verifySignature(license, license.Signature) {
		return fmt.Errorf("license signature is invalid")
	}

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
