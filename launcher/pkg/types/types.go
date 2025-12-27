package types

import "time"

// License represents the license file structure
type License struct {
	Fingerprint string    `json:"fingerprint"`
	Expires     time.Time `json:"expires"`
	BuildHash   string    `json:"build_hash"`
	Signature   []byte    `json:"signature"`
	Proprietary string    `json:"proprietary"`
	Features    []string  `json:"features,omitempty"`
}

// VerificationResult holds the result of verification checks
type VerificationResult struct {
	Valid         bool
	FingerprintOK bool
	LicenseOK     bool
	IntegrityOK   bool
	Error         string
}

// Config holds launcher configuration
type Config struct {
	LicensePath     string
	BuildPath       string
	NodeJSPath      string
	NodeJSCommand   string
	SessionTokenTTL time.Duration
}
