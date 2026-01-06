// Lobnos LIMS Application Launcher
// Version: 1.0.0
// Description: Automated launcher for Lobnos Laboratory Information Management System
// This application performs the following legitimate operations:
// - License verification using hardware fingerprinting
// - Starting required services (Apache, MySQL)
// - Launching Next.js server and client applications
// - Health checking of services
//
// This is a legitimate business application for laboratory management.
// If flagged by antivirus, please add to exclusions or submit for analysis.

package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type HealthResponse struct {
	Message string `json:"message"`
}

func getWmicValue(command string) string {
	cmd := exec.Command("wmic", strings.Split(command, " ")...)
	output, err := cmd.Output()
	if err != nil {
		return ""
	}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "=") {
			parts := strings.Split(line, "=")
			if len(parts) == 2 {
				return strings.TrimSpace(parts[1])
			}
		}
	}
	return ""
}

func logError(message string) {
	file, err := os.OpenFile("debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		fmt.Println("Error creating debug.log:", err)
		return
	}
	defer file.Close()
	logger := log.New(file, "", log.LstdFlags)
	logger.Println(message)
}

func isPortOpen(host string, port int) bool {
	address := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.DialTimeout("tcp", address, 1*time.Second)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}

func waitForService(name string, host string, port int, maxWait time.Duration) error {
	timeout := time.After(maxWait)
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-timeout:
			return fmt.Errorf("%s did not start within %v", name, maxWait)
		case <-ticker.C:
			if name == "Server" {
				url := os.Getenv("HEALTH_URL")
				if url == "" {
					return fmt.Errorf("HEALTH_URL not set in .env")
				}
				resp, err := http.Get(url)
				if err != nil {
					continue
				}
				defer resp.Body.Close()
				if resp.StatusCode == 200 {
					body, err := io.ReadAll(resp.Body)
					if err != nil {
						continue
					}
					var healthResp HealthResponse
					if err := json.Unmarshal(body, &healthResp); err != nil {
						continue
					}
					if healthResp.Message == "success" {
						fmt.Printf("%s is healthy: %s\n", name, string(body))
						return nil
					}
				}
			} else {
				// For other services, check port
				if isPortOpen(host, port) {
					fmt.Printf("%s is now running on %s:%d\n", name, host, port)
					return nil
				}
			}
		}
	}
}

func isNetworkAvailable() bool {
	// Simple network check by trying to connect to a reliable host
	conn, err := net.DialTimeout("tcp", "8.8.8.8:53", 5*time.Second)
	if err != nil {
		return false
	}
	conn.Close()
	return true
}

func waitForNetwork(maxWait time.Duration) error {
	timeout := time.After(maxWait)
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	fmt.Println("Waiting for network connectivity...")
	for {
		select {
		case <-timeout:
			return fmt.Errorf("network not available within %v", maxWait)
		case <-ticker.C:
			if isNetworkAvailable() {
				fmt.Println("Network is available")
				return nil
			}
		}
	}
}

func waitForServiceWithRetry(name string, host string, port int, maxWait time.Duration, maxRetries int) error {
	var lastErr error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		fmt.Printf("Attempt %d/%d: Waiting for %s...\n", attempt, maxRetries, name)

		err := waitForService(name, host, port, maxWait)
		if err == nil {
			return nil
		}

		lastErr = err
		fmt.Printf("%s attempt %d failed: %v\n", name, attempt, err)

		if attempt < maxRetries {
			// Exponential backoff: 5s, 10s, 20s...
			backoff := time.Duration(5*attempt) * time.Second
			fmt.Printf("Retrying %s in %v...\n", name, backoff)
			time.Sleep(backoff)
		}
	}

	return fmt.Errorf("%s failed after %d attempts: %v", name, maxRetries, lastErr)
}

func getPort(envVar string, defaultPort int) int {
	portStr := os.Getenv(envVar)
	if portStr == "" {
		return defaultPort
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		logError(fmt.Sprintf("Invalid %s: %s, using default %d", envVar, portStr, defaultPort))
		return defaultPort
	}
	return port
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			logError(fmt.Sprintf("Application failed with panic: %v", r))
		}
	}()

	// Initial startup delay for Windows boot
	fmt.Println("Lobnos Launcher starting up...")
	fmt.Printf("Current time: %s\n", time.Now().Format("2006-01-02 15:04:05"))
	fmt.Println("Waiting 30 seconds for Windows to fully boot...")
	time.Sleep(30 * time.Second)
	fmt.Printf("Boot delay complete at: %s\n", time.Now().Format("2006-01-02 15:04:05"))

	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		logError("Error loading .env file: " + err.Error())
		// Continue without .env, use defaults
	}

	// Wait for network availability (non-blocking for basic operation)
	err = waitForNetwork(30 * time.Second)
	if err != nil {
		fmt.Println("Warning: Network not available, continuing with offline operation")
		logError("Network availability check failed: " + err.Error())
		// Continue without network - many operations can work offline
	} else {
		fmt.Println("Network connectivity confirmed")
	}

	systemDrive := os.Getenv("SystemDrive")
	// Known folder path
	folderPath := systemDrive + "\\advanced\\prime-lab-system"
	licenseFilePath := folderPath + "\\license.dat"

	// Read license.dat from the known folder
	file, err := os.Open(licenseFilePath)
	if err != nil {
		fmt.Println("Error opening license file")
		logError("Error opening license.dat: " + err.Error())
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err = scanner.Err(); err != nil {
		fmt.Println("Error reading license file")
		logError("Error reading license.dat: " + err.Error())
		return
	}
	if len(lines) < 4 {
		fmt.Println("Invalid license file format")
		logError("Invalid license.dat format")
		return
	}

	storedHardware := lines[0]
	storedHashedPath := lines[1]
	storedHashedAppPath := lines[2]
	storedExpiryDate := lines[3]

	// Try multiple date formats to handle different license file formats
	var expiryTime time.Time

	dateFormats := []string{
		"2006-1-2",   // 2026-4-30
		"2006-01-02", // 2026-04-30
		"2006/1/2",   // 2026/4/30
		"2006/01/02", // 2026/04/30
		"01/02/2006", // 04/30/2026
		"1/2/2006",   // 4/30/2026
	}

	for _, format := range dateFormats {
		expiryTime, err = time.Parse(format, storedExpiryDate)
		if err == nil {
			break
		}
	}

	if err != nil {
		fmt.Println("Error parsing expiry date - tried multiple formats")
		logError("Error parsing expiry date '" + storedExpiryDate + "': " + err.Error())
		return
	}
	now := time.Now()
	if now.After(expiryTime) {
		fmt.Println("License has expired")
		logError("License has expired")
		return
	}

	// Compute current hardware fingerprint
	cpuId := getWmicValue("cpu get ProcessorId /value")
	diskSerial := getWmicValue("diskdrive get SerialNumber /value")
	motherboardSerial := getWmicValue("baseboard get SerialNumber /value")

	currentHardware := cpuId + diskSerial + motherboardSerial

	fmt.Printf("License verification:\n")
	fmt.Printf("  Stored hardware: %s\n", storedHardware)
	fmt.Printf("  Current hardware: %s\n", currentHardware)

	currentHash := sha256.Sum256([]byte(folderPath + storedExpiryDate))
	currentHashedPath := hex.EncodeToString(currentHash[:])

	fmt.Printf("  Stored path hash: %s\n", storedHashedPath)
	fmt.Printf("  Current path hash: %s\n", currentHashedPath)

	appPath := systemDrive + "\\microsoft-security\\targets\\multi\\runner"
	currentAppHash := sha256.Sum256([]byte(appPath + storedExpiryDate))
	currentHashedAppPath := hex.EncodeToString(currentAppHash[:])

	fmt.Printf("  Stored app path hash: %s\n", storedHashedAppPath)
	fmt.Printf("  Current app path hash: %s\n", currentHashedAppPath)

	// Verify
	if currentHardware != storedHardware {
		fmt.Println("❌ Hardware fingerprint mismatch")
		logError("Hardware fingerprint mismatch")
		return
	}
	fmt.Println("✅ Hardware fingerprint verified")

	if currentHashedPath != storedHashedPath {
		fmt.Println("❌ Installation path hash mismatch")
		logError("Installation path hash mismatch")
		return
	}
	fmt.Println("✅ Installation path verified")

	if currentHashedAppPath != storedHashedAppPath {
		fmt.Println("❌ Application path hash mismatch")
		logError("Application path hash mismatch")
		return
	}
	fmt.Println("✅ Application path verified")

	fmt.Println("✅ License verification completed successfully")

	fmt.Println("Starting XAMPP...")
	xamppCmd := exec.Command("C:\\xampp\\xampp_start.exe")
	err = xamppCmd.Start()
	if err != nil {
		fmt.Println("Error starting XAMPP")
		logError("Error starting XAMPP: " + err.Error())
		return
	}

	// Wait for XAMPP services to be ready with retry
	fmt.Println("Waiting for XAMPP (Apache and MySQL) to be ready...")
	err = waitForServiceWithRetry("Apache", "localhost", 80, 45*time.Second, 3)
	if err != nil {
		logError("Apache startup failed: " + err.Error())
		return
	}
	err = waitForServiceWithRetry("MySQL", "localhost", 3306, 45*time.Second, 3)
	if err != nil {
		logError("MySQL startup failed: " + err.Error())
		return
	}

	serverPath := appPath + "\\server"
	err = os.Chdir(serverPath)
	if err != nil {
		fmt.Println("Error accessing server directory")
		logError("Error changing directory to server: " + err.Error())
		return
	}

	fmt.Println("Starting server...")
	serverCmd := exec.Command("npm", "run", "start")
	serverCmd.Stdout = os.Stdout
	serverCmd.Stderr = os.Stderr
	err = serverCmd.Start()
	if err != nil {
		fmt.Println("Error starting server")
		logError("Error starting server: " + err.Error())
		return
	}

	// Wait for server to be ready with retry
	fmt.Println("Waiting for server to be ready...")
	serverPort := getPort("SERVER_PORT", 5000)
	err = waitForServiceWithRetry("Server", "localhost", serverPort, 90*time.Second, 3)
	if err != nil {
		logError("Server startup failed: " + err.Error())
		return
	}

	clientPath := appPath + "\\client"
	err = os.Chdir(clientPath)
	if err != nil {
		fmt.Println("Error accessing client directory")
		logError("Error changing directory to client: " + err.Error())
		return
	}

	fmt.Println("Starting client...")
	clientCmd := exec.Command("npm", "run", "ns")
	clientCmd.Stdout = os.Stdout
	clientCmd.Stderr = os.Stderr
	err = clientCmd.Start()
	if err != nil {
		fmt.Println("Error starting client")
		logError("Error starting client: " + err.Error())
		return
	}

	fmt.Println("XAMPP, server, and client started successfully")
}
