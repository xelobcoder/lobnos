package fingerprint

import (
	"fmt"
	"io/ioutil"
	"os/exec"
	"runtime"
	"strings"

	"golang.org/x/crypto/sha3"
)

// GenerateFingerprint creates a unique machine fingerprint
func GenerateFingerprint() (string, error) {
	var identifiers []string

	switch runtime.GOOS {
	case "windows":
		// Get Windows machine GUID
		if guid, err := getWindowsMachineGUID(); err == nil {
			identifiers = append(identifiers, guid)
		}
		// Get disk serial
		if serial, err := getWindowsDiskSerial(); err == nil {
			identifiers = append(identifiers, serial)
		}
	case "linux":
		// Get machine ID
		if id, err := ioutil.ReadFile("/etc/machine-id"); err == nil {
			identifiers = append(identifiers, strings.TrimSpace(string(id)))
		}
		// Get disk serial
		if serial, err := getLinuxDiskSerial(); err == nil {
			identifiers = append(identifiers, serial)
		}
	case "darwin":
		// Get macOS platform UUID
		if uuid, err := getMacPlatformUUID(); err == nil {
			identifiers = append(identifiers, uuid)
		}
	}

	if len(identifiers) == 0 {
		return "", fmt.Errorf("no machine identifiers found")
	}

	// Combine all identifiers
	combined := strings.Join(identifiers, "|")

	// Hash with SHA3-256
	hash := sha3.Sum256([]byte(combined))
	return fmt.Sprintf("%x", hash), nil
}

func getWindowsMachineGUID() (string, error) {
	cmd := exec.Command("reg", "query", "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography", "/v", "MachineGuid")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "MachineGuid") {
			parts := strings.Fields(line)
			if len(parts) >= 3 {
				return parts[2], nil
			}
		}
	}
	return "", fmt.Errorf("MachineGuid not found")
}

func getWindowsDiskSerial() (string, error) {
	cmd := exec.Command("wmic", "diskdrive", "get", "serialnumber")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(output), "\n")
	if len(lines) > 1 {
		return strings.TrimSpace(lines[1]), nil
	}
	return "", fmt.Errorf("disk serial not found")
}

func getLinuxDiskSerial() (string, error) {
	// Try to get serial from /sys/block/sda/device/serial
	serial, err := ioutil.ReadFile("/sys/block/sda/device/serial")
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(serial)), nil
}

func getMacPlatformUUID() (string, error) {
	cmd := exec.Command("ioreg", "-rd1", "-c", "IOPlatformExpertDevice")
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "IOPlatformUUID") {
			parts := strings.Split(line, "\"")
			if len(parts) >= 4 {
				return parts[3], nil
			}
		}
	}
	return "", fmt.Errorf("IOPlatformUUID not found")
}
